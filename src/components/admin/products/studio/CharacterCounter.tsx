interface Props {
  current: number;
  max: number;
}

export default function CharacterCounter({ current, max }: Props) {
  const ratio = current / max;
  const color = ratio >= 1 ? "text-destructive" : ratio >= 0.8 ? "text-amber-600" : "text-stone-400";

  return (
    <p className={`text-xs font-medium transition-colors ${color}`}>
      {current}/{max} characters
    </p>
  );
}
