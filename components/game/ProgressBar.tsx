type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  danger?: boolean;
  health?: boolean;
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  danger = false,
  health = false,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  const toneClass = danger
    ? "bg-rose-500"
    : health
      ? "bg-emerald-500"
      : "bg-sky-500";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${toneClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
