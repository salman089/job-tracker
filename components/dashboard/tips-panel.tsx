const TIPS = [
  "Tailor your resume's top third to the exact keywords in the job description. Most ATS filters weigh that section heaviest.",
  "Follow up within 3 to 5 business days after an interview. A short, specific thank-you note keeps you top of mind.",
  "Track why an application stalled (no reply, rejected after screen, ghosted after onsite). Patterns in your own data help more than generic advice.",
];

export function TipsPanel() {
  return (
    <div className="glass-surface flex flex-col gap-3 rounded-2xl p-4">
      <p className="font-heading text-sm font-semibold text-foreground">Tips</p>
      <div className="flex flex-col gap-2">
        {TIPS.map((tip) => (
          <div
            key={tip}
            className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground"
          >
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
