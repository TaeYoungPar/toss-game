"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_UPGRADES } from "@/lib/salary-survival/data";
import {
  applyDailyBaseCost,
  applyEventChoice,
  applyPlayerAction,
  advanceToNextDay,
  buyUpgrade,
  createInitialState,
  finalizeIfNeeded,
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

const emptyState: PlayerState = {
  day: 1,
  money: 0,
  stress: 0,
  satisfaction: 0,
  health: 0,
  monthlySalary: 0,
  fixedRent: 0,
  dailyFoodBase: 0,
  dailyTransportBase: 0,
  job: null,
  trait: null,
  logs: [],
  currentEvent: null,
  gameOver: false,
  result: null,
  upgrades: { ...INITIAL_UPGRADES },
  upgradePointsSpent: 0,
  isUpgradeModalOpen: false,
};

export const useSalarySurvivalStore = create<SalarySurvivalStore>()(
  persist(
    (set, get) => ({
      ...emptyState,

      startGame: (job, trait) => {
        set(createInitialState(job, trait));
      },

      doAction: (action) => {
        const state = get();
        if (!state.job || !state.trait || state.gameOver || state.currentEvent) return;

        let next = applyPlayerAction(state, action);
        next = applyDailyBaseCost(next);

        const randomEvent = maybePickRandomEvent(next);

        if (randomEvent) {
          next.currentEvent = randomEvent;
          next = finalizeIfNeeded(next);
          set(next);
          return;
        }

        next = advanceToNextDay(next);
        set(next);
      },

      chooseEvent: (choice) => {
        const state = get();
        if (!state.currentEvent || state.gameOver) return;

        let next = applyEventChoice(state, choice);
        next = advanceToNextDay(next);
        set(next);
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get();
        if (state.gameOver) return;
        const next = buyUpgrade(state, upgradeId);
        set(next);
      },

      openUpgradeModal: () => {
        set({ isUpgradeModalOpen: true });
      },

      closeUpgradeModal: () => {
        set({ isUpgradeModalOpen: false });
      },

      resetGame: () => set(emptyState),
    }),
    {
      name: "salary-survival-game-v2",
    }
  )
);