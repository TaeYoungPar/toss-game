export type JobType = "office" | "freelancer" | "parttime";
export type TraitType = "planner" | "optimist" | "gambler";

export type PlayerAction = "eatSimple" | "delivery" | "sideJob" | "rest";

export type JobConfig = {
  id: JobType;
  label: string;
  description: string;
  monthlySalary: number;
  startingStress: number;
  startingSatisfaction: number;
  startingHealth: number;
};

export type TraitConfig = {
  id: TraitType;
  label: string;
  description: string;
};

export type EventChoiceEffect = {
  money?: number;
  stress?: number;
  satisfaction?: number;
  health?: number;
};

export type EventChoice = {
  id: string;
  label: string;
  effect: EventChoiceEffect;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  minDay?: number;
  maxDay?: number;
  choices: EventChoice[];
};

export type DailyLog = {
  day: number;
  message: string;
};

export type UpgradeKey =
  | "frugalMeal"
  | "couponMaster"
  | "mentalCare"
  | "staminaUp"
  | "sideJobBoost"
  | "luckyPocket"
  | "transportPass"
  | "selfControl"
  | "homeCafe"
  | "budgetHabit";

export type UpgradeConfig = {
  id: UpgradeKey;
  label: string;
  description: string;
  cost: number;
  statLabel: string;
};

export type UpgradeLevels = Record<UpgradeKey, number>;

export type GameResult = {
  survived: boolean;
  finalMoney: number;
  finalStress: number;
  finalSatisfaction: number;
  finalHealth: number;
  lastDay: number;
  score: number;
};

export type PlayerState = {
  day: number;
  money: number;
  stress: number;
  satisfaction: number;
  health: number;
  monthlySalary: number;
  fixedRent: number;
  dailyFoodBase: number;
  dailyTransportBase: number;
  job: JobType | null;
  trait: TraitType | null;
  logs: DailyLog[];
  currentEvent: GameEvent | null;
  gameOver: boolean;
  result: GameResult | null;
  upgrades: UpgradeLevels;
  upgradePointsSpent: number;
  isUpgradeModalOpen: boolean;
};
