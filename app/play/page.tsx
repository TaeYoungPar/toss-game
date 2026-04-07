"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ActionCard from "@/components/game/ActionCard";
import EventCard from "@/components/game/EventCard";
import ProgressBar from "@/components/game/ProgressBar";
import StatCard from "@/components/game/StatCard";
import UpgradeModal from "@/components/game/UpgradeModal";
import { JOB_LABEL_MAP, TRAIT_LABEL_MAP } from "@/lib/salary-survival/data";
import { getActionPreview } from "@/lib/salary-survival/logic";
import { useSalarySurvivalStore } from "@/store/useSalarySurvivalStore";

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
    doAction,
    chooseEvent,
    openUpgradeModal,
    closeUpgradeModal,
    purchaseUpgrade,
  } = store;

  useEffect(() => {
    if (!job || !trait) {
      router.replace("/");
      return;
    }

    if (gameOver) {
      router.replace("/result");
    }
  }, [job, trait, gameOver, router]);

  if (!job || !trait) return null;

  const preview = getActionPreview(store);

  return (
    <main className="min-h-screen bg-[#F6F9FC] px-4 py-5 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-6 text-white sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white/70">플레이 중</div>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight">
                      Day {day} / 30
                    </h1>
                  </div>
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                    월급날까지 D-{Math.max(0, 31 - day)}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] bg-white/10 p-4">
                  <div className="mb-2 text-sm text-white/80">생존 진행도</div>
                  <div className="h-2.5 rounded-full bg-white/20">
                    <div
                      className="h-2.5 rounded-full bg-white transition-all"
                      style={{ width: `${Math.min((day / 30) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="남은 돈"
                    value={`${money.toLocaleString()}원`}
                  />
                  <StatCard
                    label="직업 / 특성"
                    value={`${JOB_LABEL_MAP[job]} · ${TRAIT_LABEL_MAP[trait]}`}
                  />
                  <StatCard
                    label="업그레이드 수"
                    value={`${Object.values(upgrades).reduce((a, b) => a + b, 0)}개`}
                  />
                  <StatCard
                    label="오늘 상태"
                    value={money >= 300000 ? "버틸만함" : "빠듯함"}
                  />
                </div>

                <div className="mt-5 grid gap-4 rounded-[28px] bg-slate-50 p-5">
                  <ProgressBar label="스트레스" value={stress} danger />
                  <ProgressBar label="만족도" value={satisfaction} />
                  <ProgressBar label="체력" value={health} />
                </div>

                {currentEvent ? (
                  <div className="mt-6">
                    <EventCard event={currentEvent} onChoose={chooseEvent} />
                  </div>
                ) : (
                  <>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        오늘의 선택
                      </h2>
                      <button
                        onClick={openUpgradeModal}
                        className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        업그레이드
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ActionCard
                        title="소박하게 밥 먹기"
                        description="오늘은 절약 모드. 비용은 적지만 만족도는 조금 떨어진다."
                        meta={`-${preview.eatSimpleCost.toLocaleString()}원`}
                        onClick={() => doAction("eatSimple")}
                      />
                      <ActionCard
                        title="배달음식 시키기"
                        description="기분은 좋아지지만 지출이 크다. 스트레스 회복용."
                        meta={`-${preview.deliveryCost.toLocaleString()}원`}
                        onClick={() => doAction("delivery")}
                      />
                      <ActionCard
                        title="부업 하기"
                        description="돈은 확실히 벌지만 체력과 멘탈이 깎인다."
                        meta={`+${preview.sideJobIncome.toLocaleString()}원`}
                        onClick={() => doAction("sideJob")}
                      />
                      <ActionCard
                        title="집에서 쉬기"
                        description="하루를 정비한다. 회복 중심 선택."
                        meta={`체력 +${preview.restHealthGain}`}
                        onClick={() => doAction("rest")}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
              <div>
                <div className="text-sm font-medium text-slate-500">
                  최근 기록
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  생존 로그
                </div>
              </div>

              <div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto">
                {logs
                  .slice(-14)
                  .reverse()
                  .map((log, index) => (
                    <div
                      key={`${log.day}-${index}`}
                      className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      <span className="mr-2 font-bold text-slate-900">
                        Day {log.day}
                      </span>
                      {log.message}
                    </div>
                  ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

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
