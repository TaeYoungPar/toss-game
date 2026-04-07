type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
};

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}