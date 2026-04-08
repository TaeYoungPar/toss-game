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
  jobs?: JobType[];
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

export type GoalType = "money" | "stress" | "rest" | "satisfaction" | "sideJob";

export type GoalState = {
  id: string;
  title: string;
  description: string;
  rewardText: string;
  type: GoalType;
  target: number;
  completed: boolean;
};

export type ActionCounts = Record<PlayerAction, number>;

export type StreakState = {
  lastAction: PlayerAction | null;
  count: number;
};

export type GameResult = {
  survived: boolean;
  finalMoney: number;
  finalStress: number;
  finalSatisfaction: number;
  finalHealth: number;
  lastDay: number;
  score: number;
  endReason: "survived" | "money" | "stress" | "health";
};

export type BestRun = {
  bestScore: number;
  bestSurvivalDays: number;
  totalRuns: number;
  lastJob: JobType | null;
  lastTrait: TraitType | null;
};

export type TurnSummary = {
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
  seenEventIds: string[];
  gameOver: boolean;
  result: GameResult | null;
  upgrades: UpgradeLevels;
  upgradePointsSpent: number;
  isUpgradeModalOpen: boolean;
  bestRun: BestRun;
  lastTurnSummary: TurnSummary | null;
  currentGoal: GoalState | null;
  streak: StreakState;
  actionCounts: ActionCounts;
  lastComboNotice: string | null;
  goalJustCompleted: boolean;
};
