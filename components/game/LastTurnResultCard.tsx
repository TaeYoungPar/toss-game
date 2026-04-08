"use client";

type LastTurnSummary = {
  title: string;
  description: string;
  dayBefore: number;
  dayAfter: number;
  moneyDelta: number;
  stressDelta: number;
  satisfactionDelta: number;
  healthDelta: number;
};

type Props = {
  summary: LastTurnSummary | null;
};

function formatSigned(value: number, suffix = "") {
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}${suffix}`;
}

function StatChangeCard({
  label,
  value,
  positiveColor,
  negativeColor,
  neutralColor = "text-slate-500",
  bgClass,
}: {
  label: string;
  value: number;
  positiveColor: string;
  negativeColor: string;
  neutralColor?: string;
  bgClass: string;
}) {
  const valueClass =
    value > 0 ? positiveColor : value < 0 ? negativeColor : neutralColor;

  return (
    <div
      className={`rounded-3xl px-4 py-4 shadow-sm ring-1 ring-black/5 ${bgClass}`}
    >
      <p className="text-xs font-semibold tracking-[-0.01em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-extrabold tracking-[-0.03em] ${valueClass}`}
      >
        {formatSigned(value, label === "돈 변화" ? "원" : "")}
      </p>
    </div>
  );
}

export default function LastTurnResultCard({ summary }: Props) {
  if (!summary) return null;

  return (
    <section className="rounded-[28px] bg-white/95 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-4">
        {/* 상단 헤더 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
              방금 결과
            </div>

            <h2 className="mt-3 break-keep text-[28px] font-extrabold leading-[1.28] tracking-[-0.04em] text-slate-900 sm:text-[30px]">
              {summary.title}
            </h2>

            <p className="mt-2 break-keep text-[15px] leading-6 text-slate-500 sm:text-base">
              {summary.description}
            </p>
          </div>

          {/* 턴 변화 */}
          <div className="shrink-0">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Turn
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                  {summary.dayBefore}일차
                </span>

                <span className="text-base font-bold text-slate-300">→</span>

                <span className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                  {summary.dayAfter}일차
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* 변화 카드 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatChangeCard
            label="돈 변화"
            value={summary.moneyDelta}
            positiveColor="text-emerald-600"
            negativeColor="text-rose-600"
            bgClass="bg-emerald-50/70"
          />

          <StatChangeCard
            label="스트레스"
            value={summary.stressDelta}
            positiveColor="text-rose-600"
            negativeColor="text-emerald-600"
            bgClass="bg-rose-50/70"
          />

          <StatChangeCard
            label="만족도"
            value={summary.satisfactionDelta}
            positiveColor="text-violet-600"
            negativeColor="text-slate-500"
            bgClass="bg-violet-50/70"
          />

          <StatChangeCard
            label="체력"
            value={summary.healthDelta}
            positiveColor="text-sky-600"
            negativeColor="text-rose-600"
            bgClass="bg-sky-50/70"
          />
        </div>
      </div>
    </section>
  );
}
