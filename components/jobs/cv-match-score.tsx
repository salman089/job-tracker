"use client";

import * as React from "react";
import { GaugeIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { computeCvMatchScore, type MatchScoreResult } from "@/lib/jobs/match-score";

function scoreColor(score: number) {
  if (score >= 70) return "text-[var(--status-offer)]";
  if (score >= 40) return "text-[var(--status-interviewing)]";
  return "text-destructive";
}

export function CvMatchScore({
  jobId,
  hasCv,
  hasSkills,
}: {
  jobId: string;
  hasCv: boolean;
  hasSkills: boolean;
}) {
  const [result, setResult] = React.useState<MatchScoreResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!hasCv || !hasSkills) return null;

  async function handleCompute() {
    setLoading(true);
    const res = await computeCvMatchScore(jobId);
    setLoading(false);
    setResult(res);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleCompute}
        className="self-start"
      >
        <SparklesIcon />
        {loading ? "Scoring..." : "Score CV against this job"}
      </Button>

      {result?.status === "error" && <p className="text-xs text-destructive">{result.error}</p>}

      {result?.status === "ok" && (
        <div className="glass-surface flex flex-col gap-2 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <GaugeIcon className={`size-4 ${scoreColor(result.score ?? 0)}`} />
            <span className={`font-heading text-lg font-semibold ${scoreColor(result.score ?? 0)}`}>
              {result.score}% match
            </span>
          </div>
          {result.matchedSkills && result.matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.matchedSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          {result.missingSkills && result.missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-muted-foreground line-through">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
