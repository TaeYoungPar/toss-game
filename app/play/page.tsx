"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ActionCard from "@/components/game/ActionCard";
import EventCard from "@/components/game/EventCard";
import ProgressBar from "@/components/game/ProgressBar";
import UpgradeModal from "@/components/game/UpgradeModal";
import { JOB_LABEL_MAP, TRAIT_LABEL_MAP } from "@/lib/salary-survival/data";
import { getActionPreview } from "@/lib/salary-survival/logic";
import { PlayerAction } from "@/lib/salary-survival/types";
import { useSalarySurvivalStore } from "@/store/useSalarySurvivalStore";

type SheetTab = "status" | "goal" | "logs" | null;

function formatSigned(value: number, unit = "") {
  if (value === 0) return `0${unit}`;
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}${unit}`;
}

function getMoneyTone(money: number) {
  if (money >= 600000) return "여유 있음";
  if (money >= 250000) return "버틸만함";
  if (money >= 80000) return "빠듯함";
  return "위험 구간";
}

function getBuildLabel(counts: Record<PlayerAction, number>) {
  const entries = Object.entries(counts) as [PlayerAction, number][];
  const [topAction, topCount] = entries.sort((a, b) => b[1] - a[1])[0];
  if (topCount === 0) return "아직 빌드 없음";

  switch (topAction) {
    case "eatSimple":
      return "절약 운영";
    case "delivery":
      return "소확행 회복";
    case "sideJob":
      return "수익 몰빵";
    case "rest":
      return "회복 루프";
  }
}

function getGoalProgressText(store: {
  currentGoal: { type: string; target: number; completed: boolean } | null;
  money: number;
  stress: number;
  satisfaction: number;
  actionCounts: Record<PlayerAction, number>;
}) {
  const goal = store.currentGoal;
  if (!goal) return "-";
  if (goal.completed) return "달성 완료";

  switch (goal.type) {
    case "money":
      return `${store.money.toLocaleString()} / ${goal.target.toLocaleString()}원`;
    case "stress":
      return `현재 ${store.stress} / 목표 ${goal.target} 이하`;
    case "rest":
      return `${store.actionCounts.rest} / ${goal.target}회`;
    case "satisfaction":
      return `${store.satisfaction} / ${goal.target}`;
    case "sideJob":
      return `${store.actionCounts.sideJob} / ${goal.target}회`;
    default:
      return "진행 중";
  }
}

export default function PlayPage() {
  const router = useRouter();
  const store = useSalarySurvivalStore();
  const {
    job,
    trait,
    day,
    money,
    stress,
    satisfaction,
    health,
    logs,
    currentEvent,
    gameOver,
    upgrades,
    isUpgradeModalOpen,
    lastTurnSummary,
    bestRun,
    currentGoal,
    streak,
    actionCounts,
    lastComboNotice,
    goalJustCompleted,
    doAction,
    chooseEvent,
    openUpgradeModal,
    closeUpgradeModal,
    purchaseUpgrade,
  } = store;

  const [activeAction, setActiveAction] = useState<PlayerAction | null>(null);
  const [floatBursts, setFloatBursts] = useState<string[]>([]);
  const [openSheet, setOpenSheet] = useState<SheetTab>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const eventSectionRef = useRef<HTMLElement | null>(null);
  const choiceSectionRef = useRef<HTMLElement | null>(null);
  const summarySectionRef = useRef<HTMLElement | null>(null);
  const prevEventRef = useRef<typeof currentEvent>(null);
  const skipNextSummaryScrollRef = useRef(false);

  const scrollToSection = (element: HTMLElement | null, extraOffset = 12) => {
    if (!element) return;
    const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
    const absoluteTop = window.scrollY + element.getBoundingClientRect().top;
    const targetTop = Math.max(0, absoluteTop - headerHeight - extraOffset);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  useEffect(() => {
    if (!job || !trait) {
      router.replace("/");
      return;
    }

    if (gameOver) {
      router.replace("/result");
    }
  }, [job, trait, gameOver, router]);

  useEffect(() => {
    if (!lastTurnSummary) return;

    const bursts = [
      lastTurnSummary.moneyDelta !== 0 ? `돈 ${formatSigned(lastTurnSummary.moneyDelta, "원")}` : null,
      lastTurnSummary.stressDelta !== 0 ? `스트레스 ${formatSigned(lastTurnSummary.stressDelta)}` : null,
      lastTurnSummary.satisfactionDelta !== 0 ? `만족도 ${formatSigned(lastTurnSummary.satisfactionDelta)}` : null,
      lastTurnSummary.healthDelta !== 0 ? `체력 ${formatSigned(lastTurnSummary.healthDelta)}` : null,
      goalJustCompleted ? "목표 달성!" : null,
      lastComboNotice ? "콤보 발동!" : null,
    ].filter(Boolean) as string[];

    setFloatBursts(bursts);
    setActiveAction(null);
    const timer = setTimeout(() => setFloatBursts([]), 1800);
    return () => clearTimeout(timer);
  }, [lastTurnSummary, goalJustCompleted, lastComboNotice]);

  useEffect(() => {
    if (!currentEvent) return;

    const timer = window.setTimeout(() => {
      scrollToSection(eventSectionRef.current, 16);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [currentEvent]);

  useEffect(() => {
    if (!lastTurnSummary) return;
    if (skipNextSummaryScrollRef.current) {
      skipNextSummaryScrollRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      scrollToSection(summarySectionRef.current, 16);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [lastTurnSummary]);

  useEffect(() => {
    const hadEvent = Boolean(prevEventRef.current);
    const hasEventNow = Boolean(currentEvent);

    if (hadEvent && !hasEventNow) {
      const timer = window.setTimeout(() => {
        scrollToSection(choiceSectionRef.current, 16);
      }, 120);

      prevEventRef.current = currentEvent;
      return () => window.clearTimeout(timer);
    }

    prevEventRef.current = currentEvent;
  }, [currentEvent]);

  if (!job || !trait) return null;

  const preview = getActionPreview(store);
  const totalUpgradeCount = Object.values(upgrades).reduce((a, b) => a + b, 0);
  const moneyTone = getMoneyTone(money);
  const recentLogs = logs.slice(-8).reverse();
  const buildLabel = getBuildLabel(actionCounts);
  const goalProgressText = getGoalProgressText(store);
  const streakLabel = streak.lastAction
    ? `${streak.count}연속 ${
        {
          eatSimple: "안전 루틴",
          delivery: "소확행 소비",
          sideJob: "무리해서 벌기",
          rest: "회복 턴",
        }[streak.lastAction]
      }`
    : "아직 흐름 없음";

  const actionConfigs = useMemo(
    () => [
      {
        id: "eatSimple" as const,
        title: "안전 루틴",
        description: "가장 안정적인 선택. 오늘 쓸 돈을 줄이고 무난하게 넘긴다.",
        meta: `지출 ${preview.eatSimpleCost.toLocaleString()}원`,
        reward: "지출 최소화",
        risk: "만족도 소폭 하락",
        combo: "3연속 시 캐시백",
        accent: "blue" as const,
      },
      {
        id: "delivery" as const,
        title: "소확행 소비",
        description: "기분 전환용 소비. 멘탈은 풀리지만 현금이 빠르게 줄어든다.",
        meta: `소비 ${preview.deliveryCost.toLocaleString()}원`,
        reward: "스트레스 완화",
        risk: "지출 큼",
        combo: "2연속 시 만족도 추가",
        accent: "purple" as const,
      },
      {
        id: "sideJob" as const,
        title: "무리해서 벌기",
        description: "오늘 현금을 크게 당기는 선택. 대신 체력과 멘탈 부담이 크다.",
        meta: `수입 ${preview.sideJobIncome.toLocaleString()}원`,
        reward: "현금 확보",
        risk: "체력·스트레스 악화",
        combo: "2연속 시 추가 수익",
        accent: "amber" as const,
      },
      {
        id: "rest" as const,
        title: "회복 턴",
        description: "오늘은 버는 것보다 회복이 우선. 다음 턴을 위한 정비 시간이다.",
        meta: `회복 +${preview.restHealthGain}`,
        reward: "체력 회복",
        risk: "수입 없음",
        combo: "2연속 시 회복 보너스",
        accent: "emerald" as const,
      },
    ],
    [preview],
  );

  return (
    <main className="min-h-screen bg-[#EEF3F8] px-4 py-4 pb-32 sm:px-5 sm:py-6 sm:pb-36">
      <div className="mx-auto max-w-2xl">
        <section ref={headerRef} className="sticky top-0 z-20 -mx-1 rounded-b-[28px] border-x border-b border-white/70 bg-white/90 px-5 py-4 shadow-[0_14px_36px_rgba(148,163,184,0.14)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-sky-600 uppercase">salary survival</div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Day {day}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {JOB_LABEL_MAP[job]} · {TRAIT_LABEL_MAP[trait]}
              </p>
            </div>
            <div className="rounded-[20px] bg-slate-900 px-4 py-3 text-right text-white">
              <div className="text-[11px] text-white/60">월급날까지</div>
              <div className="mt-1 text-xl font-bold">D-{Math.max(0, 31 - day)}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center">
              <div className="text-[11px] text-slate-500">돈</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{money.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center">
              <div className="text-[11px] text-slate-500">스트레스</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{stress}</div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center">
              <div className="text-[11px] text-slate-500">만족도</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{satisfaction}</div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center">
              <div className="text-[11px] text-slate-500">체력</div>
              <div className="mt-1 text-sm font-bold text-slate-900">{health}</div>
            </div>
          </div>
        </section>

        <div className="mt-4 space-y-4">
          <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#0f172a_100%)] px-5 py-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white/60">오늘 운영 포인트</div>
                <div className="mt-2 text-xl font-bold">{moneyTone} · {buildLabel}</div>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {currentGoal?.completed
                    ? "이번 목표를 달성했다. 지금은 생존 점수를 더 끌어올릴 타이밍이다."
                    : currentGoal?.description ?? "이번 달 목표를 확인하고 운영 흐름을 잡아보자."}
                </p>
              </div>
              <button
                onClick={openUpgradeModal}
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:opacity-90"
              >
                업그레이드
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-3 py-1">목표 {goalProgressText}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">흐름 {streakLabel}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">업글 {totalUpgradeCount}개</span>
              <span className="rounded-full bg-white/10 px-3 py-1">최고점수 {bestRun.bestScore.toLocaleString()}</span>
            </div>
          </section>

          <section ref={eventSectionRef} className="relative scroll-mt-32 overflow-hidden rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_16px_48px_rgba(148,163,184,0.15)] sm:p-6">

            {currentEvent ? (
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  ● 이벤트 발생
                </div>
                <EventCard event={currentEvent} onChoose={(optionIndex) => {
                    skipNextSummaryScrollRef.current = true;
                    chooseEvent(optionIndex);
                  }} />
              </div>
            ) : (
              <>
                <div ref={choiceSectionRef} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-sky-600">턴 진행</div>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">오늘의 선택</h2>
                    <p className="mt-1 text-sm text-slate-500">지금은 여기에만 집중하면 된다.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {actionConfigs.map((action) => (
                    <ActionCard
                      key={action.id}
                      title={action.title}
                      description={action.description}
                      meta={action.meta}
                      accent={action.accent}
                      reward={action.reward}
                      risk={action.risk}
                      combo={action.combo}
                      selected={activeAction === action.id}
                      onClick={() => {
                        setActiveAction(action.id);
                        doAction(action.id);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          {lastTurnSummary ? (
            <section ref={summarySectionRef} className="scroll-mt-32 rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_16px_44px_rgba(148,163,184,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-sky-600">방금 결과</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{lastTurnSummary.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{lastTurnSummary.detail}</p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFD] px-3 py-2 text-right">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">turn</div>
                  <div className="mt-1 text-sm font-bold text-slate-700">
                    {lastTurnSummary.dayBefore === lastTurnSummary.dayAfter
                      ? `${day}일차`
                      : `${lastTurnSummary.dayBefore}일차 → ${lastTurnSummary.dayAfter}일차`}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[22px] bg-emerald-50/70 px-4 py-3">
                  <div className="text-[11px] font-semibold text-emerald-700/70">돈 변화</div>
                  <div className={`mt-1 text-base font-bold ${lastTurnSummary.moneyDelta >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {formatSigned(lastTurnSummary.moneyDelta, "원")}
                  </div>
                </div>
                <div className="rounded-[22px] bg-rose-50/70 px-4 py-3">
                  <div className="text-[11px] font-semibold text-rose-700/70">스트레스</div>
                  <div className={`mt-1 text-base font-bold ${lastTurnSummary.stressDelta <= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {formatSigned(lastTurnSummary.stressDelta)}
                  </div>
                </div>
                <div className="rounded-[22px] bg-violet-50/70 px-4 py-3">
                  <div className="text-[11px] font-semibold text-violet-700/70">만족도</div>
                  <div className={`mt-1 text-base font-bold ${lastTurnSummary.satisfactionDelta >= 0 ? "text-violet-700" : "text-slate-700"}`}>
                    {formatSigned(lastTurnSummary.satisfactionDelta)}
                  </div>
                </div>
                <div className="rounded-[22px] bg-sky-50/70 px-4 py-3">
                  <div className="text-[11px] font-semibold text-sky-700/70">체력</div>
                  <div className={`mt-1 text-base font-bold ${lastTurnSummary.healthDelta >= 0 ? "text-sky-700" : "text-rose-600"}`}>
                    {formatSigned(lastTurnSummary.healthDelta)}
                  </div>
                </div>
              </div>

              {goalJustCompleted || lastComboNotice ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {goalJustCompleted ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">목표 달성 보상 반영</span>
                  ) : null}
                  {lastComboNotice ? (
                    <span className="rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-700">{lastComboNotice}</span>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>


      {floatBursts.length > 0 ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md flex-wrap justify-center gap-2 sm:bottom-28">
          {floatBursts.map((burst, index) => (
            <div
              key={`${burst}-${index}`}
              className="animate-[floatUp_1.6s_ease-out_forwards] rounded-full bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.24)]"
            >
              {burst}
            </div>
          ))}
        </div>
      ) : null}

      <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl rounded-[24px] border border-slate-200 bg-white/95 px-3 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => setOpenSheet("status")} className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center text-sm font-semibold text-slate-900">상태</button>
          <button onClick={() => setOpenSheet("goal")} className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center text-sm font-semibold text-slate-900">목표</button>
          <button onClick={() => setOpenSheet("logs")} className="rounded-2xl bg-[#F8FAFD] px-3 py-3 text-center text-sm font-semibold text-slate-900">기록</button>
          <button onClick={openUpgradeModal} className="rounded-2xl bg-slate-900 px-3 py-3 text-center text-sm font-semibold text-white">업글</button>
        </div>
      </div>

      {openSheet ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]" onClick={() => setOpenSheet(null)}>
          <div
            className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl rounded-t-[32px] bg-white px-5 pb-8 pt-4 shadow-[0_-20px_60px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-sky-600">
                  {openSheet === "status" ? "현재 상태" : openSheet === "goal" ? "이번 달 목표" : "최근 기록"}
                </div>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {openSheet === "status" ? "생존 현황" : openSheet === "goal" ? "운영 목표 확인" : "최근 로그"}
                </h3>
              </div>
              <button onClick={() => setOpenSheet(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                닫기
              </button>
            </div>

            {openSheet === "status" ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[24px] bg-[#F8FAFD] p-4"><div className="text-sm text-slate-500">현재 자금</div><div className="mt-1 text-2xl font-bold text-slate-900">{money.toLocaleString()}원</div><div className="mt-1 text-xs text-slate-500">{moneyTone}</div></div>
                  <div className="rounded-[24px] bg-[#F8FAFD] p-4"><div className="text-sm text-slate-500">현재 빌드</div><div className="mt-1 text-2xl font-bold text-slate-900">{buildLabel}</div><div className="mt-1 text-xs text-slate-500">반복 선택으로 변화</div></div>
                </div>
                <div className="rounded-[24px] bg-[#F8FAFD] p-4">
                  <div className="text-sm font-semibold text-slate-900">핵심 수치</div>
                  <div className="mt-4 grid gap-4">
                    <ProgressBar label="스트레스" value={stress} danger />
                    <ProgressBar label="만족도" value={satisfaction} />
                    <ProgressBar label="체력" value={health} health />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[24px] bg-[#F8FAFD] p-4"><div className="text-sm text-slate-500">흐름</div><div className="mt-1 text-lg font-bold text-slate-900">{streakLabel}</div></div>
                  <div className="rounded-[24px] bg-[#F8FAFD] p-4"><div className="text-sm text-slate-500">성장</div><div className="mt-1 text-lg font-bold text-slate-900">업글 {totalUpgradeCount}개</div></div>
                </div>
              </div>
            ) : null}

            {openSheet === "goal" ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] bg-slate-900 p-5 text-white">
                  <div className="text-xs font-semibold text-white/60">이번 달 목표</div>
                  <div className="mt-2 text-xl font-bold">{currentGoal?.title ?? "목표 없음"}</div>
                  <p className="mt-2 text-sm leading-6 text-white/75">{currentGoal?.description ?? "이번 판에는 아직 목표가 없다."}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/10 px-3 py-1">진행 {goalProgressText}</span>
                    {currentGoal?.rewardText ? <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-100">{currentGoal.rewardText}</span> : null}
                    {currentGoal?.completed ? <span className="rounded-full bg-sky-400/20 px-3 py-1 text-sky-100">달성 완료</span> : null}
                  </div>
                </div>
                <div className="rounded-[24px] bg-[#F8FAFD] p-4">
                  <div className="text-sm font-semibold text-slate-900">행동 분포</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><div className="text-xs text-slate-500">안전 루틴</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.eatSimple}</div></div>
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><div className="text-xs text-slate-500">소확행</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.delivery}</div></div>
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><div className="text-xs text-slate-500">무리해서 벌기</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.sideJob}</div></div>
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm"><div className="text-xs text-slate-500">회복 턴</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.rest}</div></div>
                  </div>
                </div>
              </div>
            ) : null}

            {openSheet === "logs" ? (
              <div className="mt-5 max-h-[58vh] space-y-2 overflow-y-auto pr-1">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, index) => (
                    <div key={`${log.day}-${index}`} className="rounded-[20px] border border-slate-100 bg-[#F8FAFD] px-4 py-3 text-sm leading-6 text-slate-700">
                      <span className="mr-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-900 shadow-sm">Day {log.day}</span>
                      {log.message}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] bg-[#F8FAFD] px-4 py-5 text-sm text-slate-500">아직 기록이 없다.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <UpgradeModal
        open={isUpgradeModalOpen}
        money={money}
        stress={stress}
        health={health}
        satisfaction={satisfaction}
        upgrades={upgrades}
        onClose={closeUpgradeModal}
        onBuy={purchaseUpgrade}
      />
    </main>
  );
}
