"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { JOB_LABEL_MAP, TRAIT_LABEL_MAP } from "@/lib/salary-survival/data";
import { PlayerAction } from "@/lib/salary-survival/types";
import { useSalarySurvivalStore } from "@/store/useSalarySurvivalStore";

function getEndingHeadline(endReason: string, survived: boolean, lastDay: number) {
  if (survived) return "이번 달도 버텼다";
  if (endReason === "money") return `${lastDay}일차, 통장이 먼저 무너졌다`;
  if (endReason === "stress") return `${lastDay}일차, 멘탈이 먼저 한계에 닿았다`;
  if (endReason === "health") return `${lastDay}일차, 체력이 먼저 바닥났다`;
  return `${lastDay}일차에 무너졌다`;
}

function getEndingSummary(endReason: string, survived: boolean) {
  if (survived) {
    return "이번 판은 선택의 흐름을 잘 만들었다. 목표, 콤보, 업그레이드를 더 빨리 굴리면 다음 판은 더 점수가 높아진다.";
  }

  switch (endReason) {
    case "money":
      return "소비와 고정지출 관리가 흔들렸다. 안전 루틴과 회복 턴 비중을 올리면 훨씬 오래 버틸 수 있다.";
    case "stress":
      return "돈보다 멘탈이 먼저 무너졌다. 소확행 소비와 회복 루틴을 적절히 섞어야 한다.";
    case "health":
      return "수익 욕심이 체력을 이겼다. 무리해서 벌기 콤보는 강하지만 연속 사용은 위험하다.";
    default:
      return "돈, 체력, 스트레스 중 하나가 먼저 무너졌다. 다음 판에서는 빌드 방향을 더 분명하게 잡자.";
  }
}

function getBuildLabel(counts: Record<PlayerAction, number>) {
  const entries = Object.entries(counts) as [PlayerAction, number][];
  const [topAction, topCount] = entries.sort((a, b) => b[1] - a[1])[0];
  if (topCount === 0) return "기본 운영 빌드";
  if (topAction === "eatSimple") return "절약 운영 빌드";
  if (topAction === "delivery") return "소확행 회복 빌드";
  if (topAction === "sideJob") return "하이리스크 수익 빌드";
  return "회복 루프 빌드";
}

function getEndingStyle(endReason: string, survived: boolean, counts: Record<PlayerAction, number>) {
  if (survived && counts.eatSimple >= 5) return "짠테크 생존 엔딩";
  if (survived && counts.rest >= 4) return "회복 루프 완주 엔딩";
  if (survived) return "월급 방어 성공 엔딩";
  if (endReason === "money") return "통장 파산 엔딩";
  if (endReason === "stress") return "번아웃 퇴사 엔딩";
  return "체력 붕괴 엔딩";
}

export default function ResultPage() {
  const router = useRouter();
  const { result, upgrades, resetGame, bestRun, job, trait, day, money, logs, actionCounts, currentGoal } =
    useSalarySurvivalStore();

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  const totalUpgradeLevels = useMemo(
    () => Object.values(upgrades).reduce((sum, cur) => sum + cur, 0),
    [upgrades],
  );

  if (!result) return null;

  const handleRestart = () => {
    resetGame();
    router.push("/");
  };

  const summary = getEndingSummary(result.endReason, result.survived);
  const headline = getEndingHeadline(result.endReason, result.survived, result.lastDay);
  const recentLogs = logs.slice(-5).reverse();
  const buildLabel = getBuildLabel(actionCounts);
  const endingStyle = getEndingStyle(result.endReason, result.survived, actionCounts);

  return (
    <main className="min-h-screen bg-[#EEF3F8] px-4 py-6 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[36px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.1)]">
          <div
            className={`px-6 py-8 text-white sm:px-8 sm:py-10 ${
              result.survived
                ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),linear-gradient(135deg,#10b981_0%,#14b8a6_45%,#38bdf8_100%)]"
                : "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#475569_100%)]"
            }`}
          >
            <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {result.survived ? "생존 성공" : "생존 실패"}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{headline}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90 sm:text-base">{summary}</p>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/90">
              <div className="rounded-full bg-white/15 px-3 py-1">{endingStyle}</div>
              {job ? <div className="rounded-full bg-white/15 px-3 py-1">직업 {JOB_LABEL_MAP[job]}</div> : null}
              {trait ? <div className="rounded-full bg-white/15 px-3 py-1">특성 {TRAIT_LABEL_MAP[trait]}</div> : null}
              <div className="rounded-full bg-white/15 px-3 py-1">빌드 {buildLabel}</div>
              <div className="rounded-full bg-white/15 px-3 py-1">플레이 {day}일차 종료</div>
              <div className="rounded-full bg-white/15 px-3 py-1">보유금 {money.toLocaleString()}원</div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] bg-slate-50 p-4"><div className="text-sm text-slate-500">최종 돈</div><div className="mt-2 text-2xl font-bold text-slate-900">{result.finalMoney.toLocaleString()}원</div></div>
              <div className="rounded-[24px] bg-slate-50 p-4"><div className="text-sm text-slate-500">최종 점수</div><div className="mt-2 text-2xl font-bold text-slate-900">{result.score.toLocaleString()}</div></div>
              <div className="rounded-[24px] bg-slate-50 p-4"><div className="text-sm text-slate-500">최고 점수</div><div className="mt-2 text-2xl font-bold text-slate-900">{bestRun.bestScore.toLocaleString()}</div></div>
              <div className="rounded-[24px] bg-slate-50 p-4"><div className="text-sm text-slate-500">업그레이드 합계</div><div className="mt-2 text-2xl font-bold text-slate-900">{totalUpgradeLevels}</div></div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] bg-[#F8FAFD] p-5">
                <div className="text-sm font-semibold text-sky-600">이번 판 분석</div>
                <div className="mt-2 text-xl font-bold tracking-tight text-slate-900">선택 흐름 요약</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
                <div className="mt-4 rounded-[20px] bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                  이번 판의 핵심 빌드는 <span className="font-bold text-slate-900">{buildLabel}</span>이었다.
                  {currentGoal ? (
                    <>
                      <br />
                      목표는 <span className="font-bold text-slate-900">{currentGoal.title}</span>였고,
                      상태는 <span className="font-bold text-slate-900">{currentGoal.completed ? "달성 완료" : "미완료"}</span>다.
                    </>
                  ) : null}
                </div>
                <div className="mt-4 rounded-[20px] bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                  최장 생존 기록은 <span className="font-bold text-slate-900">{bestRun.bestSurvivalDays}일</span>, 누적 플레이는 <span className="font-bold text-slate-900">{bestRun.totalRuns}회</span>다.
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-[24px] border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">행동 통계</div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">안전 루틴</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.eatSimple}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">소확행</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.delivery}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">무리해서 벌기</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.sideJob}</div></div>
                    <div className="rounded-2xl bg-slate-50 p-3"><div className="text-xs text-slate-500">회복 턴</div><div className="mt-1 text-xl font-bold text-slate-900">{actionCounts.rest}</div></div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-5">
                  <div className="text-sm font-semibold text-slate-900">마지막 로그</div>
                  <div className="mt-3 space-y-2">
                    {recentLogs.map((log, index) => (
                      <div key={`${log.day}-${index}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <span className="mr-2 font-bold text-slate-900">Day {log.day}</span>
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleRestart} className="mt-8 w-full rounded-[24px] bg-slate-900 px-5 py-4 text-base font-bold text-white transition hover:opacity-90">
              다시 시작
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
