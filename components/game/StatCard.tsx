type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "bad";
};

function getToneStyle(tone: NonNullable<StatCardProps["tone"]>) {
  switch (tone) {
    case "good":
      return "bg-emerald-50 border-emerald-100";
    case "bad":
      return "bg-rose-50 border-rose-100";
    default:
      return "bg-white border-slate-200/80";
  }
}

export default function StatCard({ label, value, sub, tone = "neutral" }: StatCardProps) {
  return (
    <div className={`rounded-[24px] border p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] ${getToneStyle(tone)}`}>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}
