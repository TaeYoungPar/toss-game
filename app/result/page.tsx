"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSalarySurvivalStore } from "@/store/useSalarySurvivalStore";

export default function ResultPage() {
  const router = useRouter();
  const { result, upgrades, resetGame } = useSalarySurvivalStore();

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result) return null;

  const totalUpgradeLevels = Object.values(upgrades).reduce((sum, cur) => sum + cur, 0);

  const handleRestart = () => {
    resetGame();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#F6F9FC] px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div
            className={`px-6 py-10 text-white sm:px-8 ${
              result.survived
                ? "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400"
                : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600"
            }`}
          >
            <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {result.survived ? "생존 성공" : "생존 실패"}
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              {result.survived
                ? "이번 달도 버텼다"
                : `${result.lastDay}일차에 무너졌다`}
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/90 sm:text-base">
              {result.survived
                ? "지출과 감정을 잘 관리했다. 하지만 다음 달은 더 만만하지 않을지도 모른다."
                : "돈, 체력, 스트레스 중 하나가 먼저 무너졌다. 다음 판에서는 더 냉정하게 선택해야 한다."}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-sm text-slate-500">최종 돈</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {result.finalMoney.toLocaleString()}원
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-sm text-slate-500">최종 점수</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {result.score.toLocaleString()}
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-sm text-slate-500">스트레스</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {result.finalStress}
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-sm text-slate-500">업그레이드 합계</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {totalUpgradeLevels}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              만족도 {result.finalSatisfaction}, 체력 {result.finalHealth} 기준으로 볼 때
              이번 판은{" "}
              {result.survived ? "꽤 안정적으로 운영한 편이다." : "지속 가능성이 낮았다."}
            </div>

            <button
              onClick={handleRestart}
              className="mt-8 w-full rounded-[24px] bg-slate-900 px-5 py-4 text-base font-bold text-white transition hover:opacity-90"
            >
              다시 시작
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}