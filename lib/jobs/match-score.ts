"use server";

import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";

export interface MatchScoreResult {
  status: "ok" | "error";
  score?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  error?: string;
}

function normalize(skill: string) {
  return skill.toLowerCase().trim();
}

/**
 * Scores how well a job's uploaded CV covers the skills already extracted
 * from its job description (via parseJobDescription). Reuses the same Groq
 * model/pattern already used for JD parsing — no separate AI setup or cost
 * surface, just one extra call made on demand when the user asks for it.
 */
export async function computeCvMatchScore(jobId: string): Promise<MatchScoreResult> {
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("cv_url, extracted_skills")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return { status: "error", error: "Job not found." };
  }
  if (!job.cv_url) {
    return { status: "error", error: "Upload a CV first." };
  }
  const jobSkills = (job.extracted_skills as string[]) ?? [];
  if (jobSkills.length === 0) {
    return { status: "error", error: "Parse the job description with AI first to get required skills." };
  }
  if (!process.env.GROQ_API_KEY) {
    return { status: "error", error: "AI matching isn't configured (GROQ_API_KEY missing)." };
  }

  const { data: blob, error: downloadError } = await supabase.storage.from("cvs").download(job.cv_url);
  if (downloadError || !blob) {
    return { status: "error", error: "Could not read the uploaded CV." };
  }

  try {
    const buffer = Buffer.from(await blob.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const { text } = await parser.getText();
    await parser.destroy();

    if (!text.trim()) {
      return { status: "error", error: "Couldn't extract text from that CV." };
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "Extract the key technical skills, tools, and qualifications mentioned in this resume/CV. " +
            'Respond with strict JSON only: {"skills": string[]}. Keep each skill short (1-4 words). Max 30 skills.',
        },
        { role: "user", content: text.slice(0, 8000) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { skills?: unknown };
    const cvSkills = Array.isArray(parsed.skills)
      ? parsed.skills.filter((s): s is string => typeof s === "string")
      : [];

    const cvSkillSet = new Set(cvSkills.map(normalize));
    const matched: string[] = [];
    const missing: string[] = [];

    for (const skill of jobSkills) {
      const norm = normalize(skill);
      const hit =
        cvSkillSet.has(norm) ||
        [...cvSkillSet].some((cs) => cs.includes(norm) || norm.includes(cs));
      (hit ? matched : missing).push(skill);
    }

    const score = Math.round((matched.length / jobSkills.length) * 100);

    return { status: "ok", score, matchedSkills: matched, missingSkills: missing };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { status: "error", error: `Match scoring failed: ${detail}` };
  }
}
