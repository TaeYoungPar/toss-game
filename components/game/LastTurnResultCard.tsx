"use client";

import { CheckCircle2, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

type TurnSummary = {
  source: "action" | "event" | "upgrade";
  title: string;
  detail: string;
  dayBefore: number;
  dayAfter: number;
  moneyDelta: number;
  stressDelta: number;
  satisfactionDelta: number;
  healthDelta: number;
  resultingMoney: number;
  resultingStress: number;
  resultingSatisfaction: number;
  resultingHealth: number;
};

type Props = {
  summary: TurnSummary | null;
  goalJustCompleted?: boolean;
  lastComboNotice?: string | null;
};

function formatSigned(value: number, suffix = "") {
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}${suffix}`;
}

function getDeltaTone(
  value: number,
  positiveIsGood: boolean,
): {
  text: string;
  bg: string;
  ring: string;
  chip: string;
  icon: "up" | "down" | "flat";
} {
  if (value === 0) {
    return {
      text: "text-slate-500",
      bg: "bg-slate-50/90",
      ring: "ring-slate-200/80",
      chip: "bg-slate-100 text-slate-600",
      icon: "flat",
    };
  }

  const isGood = positiveIsGood ? value > 0 : value < 0;

  if (isGood) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50/80",
      ring: "ring-emerald-200/70",
      chip: "bg-emerald-100 text-emerald-700",
      icon: value > 0 ? "up" : "down",
    };
  }

  return {
    text: "text-rose-600",
    bg: "bg-rose-50/80",
    ring: "ring-rose-200/70",
    chip: "bg-rose-100 text-rose-700",
    icon: value > 0 ? "up" : "down",
  };
}

function DeltaIcon({ type }: { type: "up" | "down" | "flat" }) {
  if (type === "up") return <TrendingUp className="h-4 w-4" />;
  if (type === "down") return <TrendingDown className="h-4 w-4" />;
  return <div className="h-2 w-2 rounded-full bg-current opacity-60" />;
}

function StatDeltaCard({
  label,
  delta,
  currentValue,
  suffix = "",
  positiveIsGood,
}: {
  label: string;
  delta: number;
  currentValue: number;
  suffix?: string;
  positiveIsGood: boolean;
}) {
  const tone = getDeltaTone(delta, positiveIsGood);

  return (
    <div
      className={`rounded-[24px] px-4 py-4 ring-1 ${tone.bg} ${tone.ring} shadow-[0_8px_24px_rgba(15,23,42,0.04)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-[-0.01em] text-slate-500">
            {label}
          </p>
          <p
            className={`mt-2 text-xl font-extrabold tracking-[-0.03em] ${tone.text}`}
          >
            {formatSigned(delta, suffix)}
          </p>
        </div>

        <div
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}
        >
          <DeltaIcon type={tone.icon} />
          변화
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-black/5">
        <div className="text-[11px] font-medium text-slate-400">현재</div>
        <div className="mt-1 text-sm font-bold text-slate-800">
          {currentValue.toLocaleString()}
          {suffix}
        </div>
      </div>
    </div>
  );
}

export default function LastTurnResultCard({
  summary,
  goalJustCompleted = false,
  lastComboNotice = null,
}: Props) {
  if (!summary) return null;

  const isSameDay = summary.dayBefore === summary.dayAfter;

  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/96 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
      <div className="bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_52%,#f8fbff_100%)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                LAST TURN RESULT
              </div>

              <h2 className="mt-3 break-keep text-[25px] font-extrabold leading-[1.25] tracking-[-0.04em] text-slate-900 sm:text-[30px]">
                {summary.title}
              </h2>

              <p className="mt-2 break-keep text-[14px] leading-6 text-slate-600 sm:text-[15px]">
                {summary.detail}
              </p>

              {(goalJustCompleted || lastComboNotice) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {goalJustCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/70">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      목표 달성 보상 반영
                    </span>
                  ) : null}

                  {lastComboNotice ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200/70">
                      <Sparkles className="h-3.5 w-3.5" />
                      {lastComboNotice}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="shrink-0">
              <div className="rounded-[24px] bg-white/88 p-3 ring-1 ring-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Turn Flow
                </div>

                {isSameDay ? (
                  <div className="mt-2 rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white">
                    {summary.dayAfter}일차 유지
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center ring-1 ring-slate-200">
                      <div className="text-[10px] font-semibold text-slate-400">
                        이전
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-700">
                        {summary.dayBefore}일차
                      </div>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm">
                      →
                    </div>

                    <div className="rounded-2xl bg-sky-600 px-3 py-2 text-center text-white shadow-sm">
                      <div className="text-[10px] font-semibold text-white/70">
                        현재
                      </div>
                      <div className="mt-0.5 text-sm font-bold">
                        {summary.dayAfter}일차
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatDeltaCard
            label="돈 변화"
            delta={summary.moneyDelta}
            currentValue={summary.resultingMoney}
            suffix="원"
            positiveIsGood
          />

          <StatDeltaCard
            label="스트레스"
            delta={summary.stressDelta}
            currentValue={summary.resultingStress}
            positiveIsGood={false}
          />

          <StatDeltaCard
            label="만족도"
            delta={summary.satisfactionDelta}
            currentValue={summary.resultingSatisfaction}
            positiveIsGood
          />

          <StatDeltaCard
            label="체력"
            delta={summary.healthDelta}
            currentValue={summary.resultingHealth}
            positiveIsGood
          />
        </div>
      </div>
    </section>
  );
}
