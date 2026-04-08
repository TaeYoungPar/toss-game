type ActionCardProps = {
  title: string;
  description: string;
  meta: string;
  onClick: () => void;
  accent?: "blue" | "purple" | "amber" | "emerald" | "slate";
  reward?: string;
  risk?: string;
  combo?: string;
  selected?: boolean;
};

function getAccentStyle(accent: NonNullable<ActionCardProps["accent"]>) {
  switch (accent) {
    case "blue":
      return {
        shell: "border-sky-100 bg-[linear-gradient(180deg,#f8fcff_0%,#ffffff_100%)]",
        top: "bg-sky-50 text-sky-700 ring-sky-100",
        meta: "bg-sky-600 text-white shadow-sky-100",
        reward: "bg-sky-50 text-sky-700",
        risk: "bg-slate-100 text-slate-600",
        combo: "bg-white text-sky-700 border border-sky-100",
      };
    case "purple":
      return {
        shell: "border-violet-100 bg-[linear-gradient(180deg,#fbf9ff_0%,#ffffff_100%)]",
        top: "bg-violet-50 text-violet-700 ring-violet-100",
        meta: "bg-violet-600 text-white shadow-violet-100",
        reward: "bg-fuchsia-50 text-fuchsia-700",
        risk: "bg-rose-50 text-rose-600",
        combo: "bg-white text-violet-700 border border-violet-100",
      };
    case "amber":
      return {
        shell: "border-amber-100 bg-[linear-gradient(180deg,#fffaf2_0%,#ffffff_100%)]",
        top: "bg-amber-50 text-amber-700 ring-amber-100",
        meta: "bg-amber-500 text-white shadow-amber-100",
        reward: "bg-amber-50 text-amber-700",
        risk: "bg-rose-50 text-rose-600",
        combo: "bg-white text-amber-700 border border-amber-100",
      };
    case "emerald":
      return {
        shell: "border-emerald-100 bg-[linear-gradient(180deg,#f6fefb_0%,#ffffff_100%)]",
        top: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        meta: "bg-emerald-600 text-white shadow-emerald-100",
        reward: "bg-emerald-50 text-emerald-700",
        risk: "bg-slate-100 text-slate-600",
        combo: "bg-white text-emerald-700 border border-emerald-100",
      };
    default:
      return {
        shell: "border-slate-200 bg-white",
        top: "bg-slate-100 text-slate-700 ring-slate-100",
        meta: "bg-slate-900 text-white shadow-slate-100",
        reward: "bg-slate-100 text-slate-700",
        risk: "bg-rose-50 text-rose-600",
        combo: "bg-white text-slate-700 border border-slate-200",
      };
  }
}

export default function ActionCard({
  title,
  description,
  meta,
  onClick,
  accent = "slate",
  reward,
  risk,
  combo,
  selected = false,
}: ActionCardProps) {
  const accentStyle = getAccentStyle(accent);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[28px] border p-4 text-left shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition duration-200 active:scale-[0.985] sm:p-5 ${accentStyle.shell} ${selected ? "ring-2 ring-sky-300" : "hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${accentStyle.top}`}>
          오늘 운영
        </div>
        <div className={`shrink-0 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm ${accentStyle.meta}`}>
          {meta}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-lg font-bold tracking-tight text-slate-900 sm:text-[19px]">{title}</div>
        <div className="mt-1.5 text-sm leading-6 text-slate-500">{description}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {reward ? (
          <div className={`rounded-2xl px-3 py-2.5 ${accentStyle.reward}`}>
            <div className="text-[11px] font-semibold opacity-70">기대효과</div>
            <div className="mt-1 text-sm font-bold">{reward}</div>
          </div>
        ) : null}
        {risk ? (
          <div className={`rounded-2xl px-3 py-2.5 ${accentStyle.risk}`}>
            <div className="text-[11px] font-semibold opacity-70">주의</div>
            <div className="mt-1 text-sm font-bold">{risk}</div>
          </div>
        ) : null}
      </div>

      {combo ? (
        <div className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${accentStyle.combo}`}>
          콤보 · {combo}
        </div>
      ) : null}
    </button>
  );
}
