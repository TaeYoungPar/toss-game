"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JOBS, TRAITS } from "@/lib/salary-survival/data";
import { JobType, TraitType } from "@/lib/salary-survival/types";
import { useSalarySurvivalStore } from "@/store/useSalarySurvivalStore";
import { JOB_LABEL_MAP, TRAIT_LABEL_MAP } from "@/lib/salary-survival/data";

export default function HomePage() {
  const router = useRouter();
  const startGame = useSalarySurvivalStore((s) => s.startGame);
  const resetGame = useSalarySurvivalStore((s) => s.resetGame);
  const bestRun = useSalarySurvivalStore((s) => s.bestRun);

  const [selectedJob, setSelectedJob] = useState<JobType>("office");
  const [selectedTrait, setSelectedTrait] = useState<TraitType>("planner");

  const selectedJobInfo = useMemo(
    () => JOBS.find((job) => job.id === selectedJob),
    [selectedJob]
  );

  const handleStart = () => {
    resetGame();
    startGame(selectedJob, selectedTrait);
    router.push("/play");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            토스용 미니게임 MVP
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">월급생존키우기</h1>
          <p className="mt-3 leading-7 text-slate-600">
            월급을 받고 한 달을 버텨라. 소비, 부업, 휴식, 랜덤 이벤트를 잘 선택해서
            월급날까지 살아남는 게임.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-sm text-slate-500">최고 점수</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {bestRun.bestScore.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-sm text-slate-500">최장 생존</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {bestRun.bestSurvivalDays}일
              </div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-sm text-slate-500">플레이 횟수</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {bestRun.totalRuns}회
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">직업 선택</h2>
            <div className="mt-4 grid gap-3">
              {JOBS.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedJob === job.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{job.label}</div>
                      <div className="mt-1 text-sm opacity-80">{job.description}</div>
                    </div>
                    <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-current">
                      월급 {job.monthlySalary.toLocaleString()}원
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">특성 선택</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {TRAITS.map((trait) => (
                <button
                  key={trait.id}
                  onClick={() => setSelectedTrait(trait.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedTrait === trait.id
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <div className="font-semibold">{trait.label}</div>
                  <div className="mt-1 text-sm opacity-80">{trait.description}</div>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-8 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
            <div>직업: {JOB_LABEL_MAP[selectedJob]}</div>
            <div>특성: {TRAIT_LABEL_MAP[selectedTrait]}</div>
            <div className="mt-2 text-slate-500">
              시작 월급: {selectedJobInfo?.monthlySalary.toLocaleString()}원
            </div>
          </div>

          <button
            onClick={handleStart}
            className="mt-8 w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:opacity-90"
          >
            게임 시작
          </button>
        </div>
      </div>
    </main>
  );
}
