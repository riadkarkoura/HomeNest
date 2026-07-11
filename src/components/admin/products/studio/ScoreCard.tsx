interface Props {
  icon: React.ElementType;
  label: string;
}

// Placeholder only — no scoring logic exists yet. Real values arrive with
// the AI Assistant (Sprint 9); until then this always renders the neutral state.
export default function ScoreCard({ icon: Icon, label }: Props) {
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-stone-400">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-stone-300">—</p>
      <p className="mt-1 text-[11px] text-stone-400">Not yet scored</p>
    </div>
  );
}
