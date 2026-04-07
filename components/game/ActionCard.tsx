type ActionCardProps = {
  title: string;
  description: string;
  meta: string;
  onClick: () => void;
};

export default function ActionCard({
  title,
  description,
  meta,
  onClick,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold tracking-tight text-slate-900">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{description}</div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {meta}
        </div>
      </div>
    </button>
  );
}