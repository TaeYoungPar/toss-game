"use client";

import { useEffect } from "react";
import { UPGRADES } from "@/lib/salary-survival/data";
import { getUpgradeEffectText } from "@/lib/salary-survival/logic";
import { UpgradeKey, UpgradeLevels } from "@/lib/salary-survival/types";

type UpgradeModalProps = {
  open: boolean;
  money: number;
  stress: number;
  health: number;
  satisfaction: number;
  upgrades: UpgradeLevels;
  onClose: () => void;
  onBuy: (upgradeId: UpgradeKey) => void;
};

function getUpgradeRecommendation(params: {
  upgradeId: UpgradeKey;
  money: number;
  stress: number;
  health: number;
  satisfaction: number;
  level: number;
}) {
  const { upgradeId, money, stress, health, satisfaction, level } = params;

  if (level >= 3) return null;

  if (money < 120000) {
    if (
      upgradeId === "frugalMeal" ||
      upgradeId === "couponMaster" ||
      upgradeId === "transportPass" ||
      upgradeId === "budgetHabit" ||
      upgradeId === "selfControl"
    ) {
      return "절약 추천";
    }
  }

  if (stress >= 65) {
    if (upgradeId === "mentalCare" || upgradeId === "homeCafe") {
      return "스트레스 높음";
    }
  }

  if (health <= 40) {
    if (upgradeId === "staminaUp") {
      return "체력 회복 추천";
    }
  }

  if (satisfaction <= 35) {
    if (upgradeId === "homeCafe") {
      return "기분 관리 추천";
    }
  }

  if (money >= 250000) {
    if (upgradeId === "sideJobBoost" || upgradeId === "luckyPocket") {
      return "성장 추천";
    }
  }

  return null;
}

function getTagStyle(tag: string) {
  switch (tag) {
    case "절약 추천":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "스트레스 높음":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "체력 회복 추천":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "기분 관리 추천":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "성장 추천":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function UpgradeModal({
  open,
  money,
  stress,
  health,
  satisfaction,
  upgrades,
  onClose,
  onBuy,
}: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center p-3 sm:items-center sm:p-4">
        <div
          className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-200 bg-white px-5 pb-4 pt-5">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-500">
                  성장 업그레이드
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                  이번 판 강화하기
                </h2>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                현재 보유금: {money.toLocaleString()}원
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                스트레스 {stress} · 체력 {health} · 만족도 {satisfaction}
              </div>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4"
            style={{
              WebkitOverflowScrolling: "touch",
              paddingBottom: "max(20px, env(safe-area-inset-bottom))",
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {UPGRADES.map((upgrade) => {
                const level = upgrades[upgrade.id];
                const cost =
                  upgrade.cost + level * Math.round(upgrade.cost * 0.4);
                const isMax = level >= 3;
                const affordable = money >= cost;
                const effectText = getUpgradeEffectText(upgrade.id, level);
                const recommendation = getUpgradeRecommendation({
                  upgradeId: upgrade.id,
                  money,
                  stress,
                  health,
                  satisfaction,
                  level,
                });

                return (
                  <div
                    key={upgrade.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-base font-bold text-slate-900">
                            {upgrade.label}
                          </div>

                          {recommendation ? (
                            <div
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getTagStyle(
                                recommendation,
                              )}`}
                            >
                              {recommendation}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-sky-600">
                          {upgrade.statLabel}
                        </div>

                        <div className="mt-2 text-sm leading-6 text-slate-500">
                          {upgrade.description}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Lv.{level}
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-500">
                        현재 효과
                      </div>
                      <div className="mt-1 text-sm text-slate-800">
                        {effectText.current}
                      </div>

                      <div className="mt-3 text-xs font-semibold text-slate-500">
                        다음 레벨
                      </div>
                      <div className="mt-1 text-sm text-slate-800">
                        {effectText.next}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-700">
                        {isMax ? "MAX" : `${cost.toLocaleString()}원`}
                      </div>

                      <button
                        onClick={() => onBuy(upgrade.id)}
                        disabled={isMax || !affordable}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          isMax || !affordable
                            ? "bg-slate-100 text-slate-400"
                            : "bg-slate-900 text-white hover:opacity-90"
                        }`}
                      >
                        {isMax ? "완료" : "구매"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
