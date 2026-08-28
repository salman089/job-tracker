"use server";

import Groq from "groq-sdk";
import type { JdParseResult } from "@/lib/types";

/**
 * Extracts a skills list from a pasted job description. Runs behind a
 * server action so GROQ_API_KEY never reaches the client.
 */
export async function parseJobDescription(jdText: string): Promise<JdParseResult> {
  const text = jdText.trim();
  if (!text) {
    return { status: "error", error: "Paste a job description first." };
  }

  if (!process.env.GROQ_API_KEY) {
    return { status: "error", error: "AI parsing isn't configured (GROQ_API_KEY missing)." };
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "Extract the key technical skills, tools, and qualifications required by this job description. " +
            'Respond with strict JSON only: {"skills": string[]}. Keep each skill short (1-4 words). Max 15 skills.',
        },
        { role: "user", content: text.slice(0, 8000) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { skills?: unknown };
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.filter((s): s is string => typeof s === "string").slice(0, 15)
      : [];

    if (skills.length === 0) {
      return { status: "error", error: "Couldn't extract any skills from that text." };
    }

    return { status: "parsed", skills };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { status: "error", error: `AI parsing failed: ${detail}` };
  }
}
