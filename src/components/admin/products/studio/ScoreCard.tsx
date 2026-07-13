interface Props {
  icon: React.ElementType;
  label: string;
  score: number;
}

// Stone/amber only, per DESIGN_SYSTEM.md — no green "good" or red "bad"
// states. A higher score simply gets the brand accent color; lower scores
// stay muted, the same neutral tone the pre-scoring placeholder used.
function tier(score: number): { valueClass: string; hint: string } {
  if (score === 0) return { valueClass: "text-stone-300", hint: "Not started" };
  if (score < 50) return { valueClass: "text-stone-400", hint: "Needs work" };
  if (score < 80) return { valueClass: "text-stone-600", hint: "Could be stronger" };
  return { valueClass: "text-amber-600", hint: "Looking good" };
}

export default function ScoreCard({ icon: Icon, label, score }: Props) {
  const { valueClass, hint } = tier(score);

  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-stone-400">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className={`text-2xl font-semibold ${valueClass}`}>{score}</p>
      <p className="mt-1 text-[11px] text-stone-400">{hint}</p>
    </div>
  );
}
