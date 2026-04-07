type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  danger?: boolean;
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  danger = false,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200">
        <div
          className={`h-2.5 rounded-full transition-all ${
            danger ? "bg-slate-900" : "bg-sky-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}