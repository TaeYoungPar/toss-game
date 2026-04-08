"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  advanceToNextDay,
  applyDailyBaseCost,
  applyEventChoice,
  applyPlayerAction,
  buyUpgrade,
  createEmptyBestRun,
  createEmptyPlayerState,
  createInitialState,
  finalizeIfNeeded,
  getActionSummaryDetail,
  getActionSummaryTitle,
  getEventChoiceSummary,
  maybePickRandomEvent,
} from "@/lib/salary-survival/logic";
import {
  EventChoice,
  JobType,
  PlayerAction,
  PlayerState,
  TraitType,
  UpgradeKey,
} from "@/lib/salary-survival/types";

type SalarySurvivalStore = PlayerState & {
  startGame: (job: JobType, trait: TraitType) => void;
  doAction: (action: PlayerAction) => void;
  chooseEvent: (choice: EventChoice) => void;
  purchaseUpgrade: (upgradeId: UpgradeKey) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  resetGame: () => void;
};

export const useSalarySurvivalStore = create<SalarySurvivalStore>()(
  persist(
    (set, get) => ({
      ...createEmptyPlayerState(createEmptyBestRun()),

      startGame: (job, trait) => {
        const bestRun = get().bestRun;
        set(createInitialState(job, trait, bestRun));
      },

      doAction: (action) => {
        const state = get();
        if (!state.job || !state.trait || state.gameOver || state.currentEvent) return;

        const prev = state;
        let next = applyPlayerAction(state, action);
        next = applyDailyBaseCost(next);
        next = finalizeIfNeeded(next);

        if (next.gameOver) {
          set({
            ...next,
            lastTurnSummary: {
              source: "action",
              title: getActionSummaryTitle(action),
              detail: `${getActionSummaryDetail(action, next)} 게임이 종료됐다.`,
              dayBefore: prev.day,
              dayAfter: next.day,
              moneyDelta: next.money - prev.money,
              stressDelta: next.stress - prev.stress,
              satisfactionDelta: next.satisfaction - prev.satisfaction,
              healthDelta: next.health - prev.health,
              resultingMoney: next.money,
              resultingStress: next.stress,
              resultingSatisfaction: next.satisfaction,
              resultingHealth: next.health,
            },
          });
          return;
        }

        const randomEvent = maybePickRandomEvent(next);

        if (randomEvent) {
          next.currentEvent = randomEvent;
          set({
            ...next,
            lastTurnSummary: {
              source: "action",
              title: getActionSummaryTitle(action),
              detail: getActionSummaryDetail(action, next),
              dayBefore: prev.day,
              dayAfter: next.day,
              moneyDelta: next.money - prev.money,
              stressDelta: next.stress - prev.stress,
              satisfactionDelta: next.satisfaction - prev.satisfaction,
              healthDelta: next.health - prev.health,
              resultingMoney: next.money,
              resultingStress: next.stress,
              resultingSatisfaction: next.satisfaction,
              resultingHealth: next.health,
            },
          });
          return;
        }

        next = advanceToNextDay(next);
        next = finalizeIfNeeded(next);

        set({
          ...next,
          lastTurnSummary: {
            source: "action",
            title: getActionSummaryTitle(action),
            detail: getActionSummaryDetail(action, next),
            dayBefore: prev.day,
            dayAfter: next.day,
            moneyDelta: next.money - prev.money,
            stressDelta: next.stress - prev.stress,
            satisfactionDelta: next.satisfaction - prev.satisfaction,
            healthDelta: next.health - prev.health,
            resultingMoney: next.money,
            resultingStress: next.stress,
            resultingSatisfaction: next.satisfaction,
            resultingHealth: next.health,
          },
        });
      },

      chooseEvent: (choice) => {
        const state = get();
        if (!state.currentEvent || state.gameOver) return;

        const prev = state;
        let next = applyEventChoice(state, choice);
        next = finalizeIfNeeded(next);

        if (!next.gameOver) {
          next = advanceToNextDay(next);
          next = finalizeIfNeeded(next);
        }

        set({
          ...next,
          lastTurnSummary: {
            source: "event",
            title: state.currentEvent.title,
            detail: getEventChoiceSummary(choice, next),
            dayBefore: prev.day,
            dayAfter: next.day,
            moneyDelta: next.money - prev.money,
            stressDelta: next.stress - prev.stress,
            satisfactionDelta: next.satisfaction - prev.satisfaction,
            healthDelta: next.health - prev.health,
            resultingMoney: next.money,
            resultingStress: next.stress,
            resultingSatisfaction: next.satisfaction,
            resultingHealth: next.health,
          },
        });
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get();
        if (state.gameOver || state.currentEvent) return;
        const next = buyUpgrade(state, upgradeId);
        set(next);
      },

      openUpgradeModal: () => {
        const state = get();
        if (state.currentEvent || state.gameOver) return;
        set({ isUpgradeModalOpen: true });
      },

      closeUpgradeModal: () => {
        set({ isUpgradeModalOpen: false });
      },

      resetGame: () => set((state) => createEmptyPlayerState(state.bestRun)),
    }),
    {
      name: "salary-survival-game-v4",
      partialize: (state) => ({
        day: state.day,
        money: state.money,
        stress: state.stress,
        satisfaction: state.satisfaction,
        health: state.health,
        monthlySalary: state.monthlySalary,
        fixedRent: state.fixedRent,
        dailyFoodBase: state.dailyFoodBase,
        dailyTransportBase: state.dailyTransportBase,
        job: state.job,
        trait: state.trait,
        logs: state.logs,
        currentEvent: state.currentEvent,
        seenEventIds: state.seenEventIds,
        gameOver: state.gameOver,
        result: state.result,
        upgrades: state.upgrades,
        upgradePointsSpent: state.upgradePointsSpent,
        isUpgradeModalOpen: false,
        bestRun: state.bestRun,
        lastTurnSummary: state.lastTurnSummary,
        currentGoal: state.currentGoal,
        streak: state.streak,
        actionCounts: state.actionCounts,
        lastComboNotice: state.lastComboNotice,
        goalJustCompleted: state.goalJustCompleted,
      }),
    },
  ),
);
