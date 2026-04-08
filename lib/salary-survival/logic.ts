import { GAME_EVENTS, INITIAL_UPGRADES, JOBS, UPGRADES } from "./data";
import {
  ActionCounts,
  BestRun,
  EventChoice,
  GameEvent,
  GameResult,
  GoalState,
  JobType,
  PlayerAction,
  PlayerState,
  TraitType,
  TurnSummary,
  UpgradeKey,
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getJobConfig(job: JobType) {
  return JOBS.find((item) => item.id === job)!;
}

function getUpgradeLevel(state: PlayerState, key: UpgradeKey) {
  return state.upgrades[key] ?? 0;
}

function formatSignedValue(value: number, suffix = "") {
  if (value === 0) return `0${suffix}`;
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}${suffix}`;
}

function createTurnSummary(params: {
  prev: PlayerState;
  next: PlayerState;
  source: TurnSummary["source"];
  title: string;
  detail: string;
}): TurnSummary {
  const { prev, next, source, title, detail } = params;

  return {
    source,
    title,
    detail,
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
  };
}
function createEmptyActionCounts(): ActionCounts {
  return {
    eatSimple: 0,
    delivery: 0,
    sideJob: 0,
    rest: 0,
  };
}

function getTraitLabel(trait: TraitType) {
  switch (trait) {
    case "planner":
      return "계획형";
    case "optimist":
      return "낙천형";
    case "gambler":
      return "승부형";
  }
}

function createGoal(job: JobType, trait: TraitType): GoalState {
  if (job === "office") {
    return {
      id: "office-stress",
      title: "이번 달 목표 · 멘탈 방어",
      description: "10일차까지 스트레스를 45 이하로 유지하면 보너스를 받는다.",
      rewardText: "보상 +50,000원 / 만족도 +4",
      type: "stress",
      target: 45,
      completed: false,
    };
  }

  if (job === "freelancer") {
    return {
      id: "freelancer-money",
      title: "이번 달 목표 · 비상금 마련",
      description: "12일차 전에 보유금 1,000,000원을 넘기면 보너스를 받는다.",
      rewardText: "보상 +70,000원 / 만족도 +3",
      type: "money",
      target: 1000000,
      completed: false,
    };
  }

  if (trait === "optimist") {
    return {
      id: "optimist-satisfaction",
      title: "이번 달 목표 · 기분 유지",
      description: "만족도 70을 넘기면 감정 회복 보너스를 받는다.",
      rewardText: "보상 스트레스 -6 / 만족도 +4",
      type: "satisfaction",
      target: 70,
      completed: false,
    };
  }

  return {
    id: "steady-rest",
    title: "이번 달 목표 · 회복 루틴",
    description: "휴식 3회를 달성하면 체력 운영 보너스를 받는다.",
    rewardText: "보상 체력 +10 / 스트레스 -5",
    type: "rest",
    target: 3,
    completed: false,
  };
}

function evaluateGoal(state: PlayerState): PlayerState {
  if (!state.currentGoal || state.currentGoal.completed) return state;

  const goal = state.currentGoal;
  let achieved = false;

  switch (goal.type) {
    case "money":
      achieved = state.money >= goal.target;
      break;
    case "stress":
      achieved = state.day >= 10 && state.stress <= goal.target;
      break;
    case "rest":
      achieved = state.actionCounts.rest >= goal.target;
      break;
    case "satisfaction":
      achieved = state.satisfaction >= goal.target;
      break;
    case "sideJob":
      achieved = state.actionCounts.sideJob >= goal.target;
      break;
  }

  if (!achieved) return state;

  const next = {
    ...state,
    currentGoal: { ...goal, completed: true },
    goalJustCompleted: true,
  };

  if (goal.type === "money") {
    next.money += 70000;
    next.satisfaction = clamp(next.satisfaction + 3, 0, 100);
  } else if (goal.type === "stress") {
    next.money += 50000;
    next.satisfaction = clamp(next.satisfaction + 4, 0, 100);
  } else if (goal.type === "rest") {
    next.health = clamp(next.health + 10, 0, 100);
    next.stress = clamp(next.stress - 5, 0, 100);
  } else if (goal.type === "satisfaction") {
    next.stress = clamp(next.stress - 6, 0, 100);
    next.satisfaction = clamp(next.satisfaction + 4, 0, 100);
  } else if (goal.type === "sideJob") {
    next.money += 80000;
    next.health = clamp(next.health - 4, 0, 100);
  }

  next.logs = [
    ...next.logs,
    {
      day: next.day,
      message: `목표 달성! ${goal.title} 보상을 획득했다.`,
    },
  ];

  return next;
}

function applyActionStreak(state: PlayerState, action: PlayerAction) {
  const nextStreak =
    state.streak.lastAction === action
      ? { lastAction: action, count: state.streak.count + 1 }
      : { lastAction: action, count: 1 };

  const nextCounts = {
    ...state.actionCounts,
    [action]: state.actionCounts[action] + 1,
  };

  let comboNotice: string | null = null;
  let money = state.money;
  let stress = state.stress;
  let satisfaction = state.satisfaction;
  let health = state.health;

  if (action === "eatSimple" && nextStreak.count >= 3) {
    money += 12000;
    satisfaction += 1;
    comboNotice = "절약 루틴 완성! 3연속 절약으로 캐시백을 받았다.";
  }

  if (action === "delivery" && nextStreak.count >= 2) {
    satisfaction += 2;
    money -= 4000;
    comboNotice = "소확행 콤보! 만족도는 올랐지만 지출도 커졌다.";
  }

  if (action === "sideJob" && nextStreak.count >= 2) {
    money += 18000;
    stress += 4;
    health -= 3;
    comboNotice = "야근 텐션 폭주! 수익은 늘었지만 번아웃 위험이 커졌다.";
  }

  if (action === "rest" && nextStreak.count >= 2) {
    health += 5;
    stress -= 3;
    comboNotice = "회복 루프 발동! 쉬는 흐름 덕분에 회복 효율이 올랐다.";
  }

  return {
    streak: nextStreak,
    actionCounts: nextCounts,
    money,
    stress,
    satisfaction,
    health,
    comboNotice,
  };
}

export function getActionSummaryTitle(action: PlayerAction) {
  switch (action) {
    case "eatSimple":
      return "소박하게 밥 먹기";
    case "delivery":
      return "배달음식 시키기";
    case "sideJob":
      return "부업 하기";
    case "rest":
      return "집에서 쉬기";
  }
}

export function getActionSummaryDetail(
  action: PlayerAction,
  next: PlayerState,
) {
  const maybeEventText = next.currentEvent
    ? ` 이후 이벤트 '${next.currentEvent.title}'가 발생했다.`
    : "";
  const nextDayText =
    next.day > 30 ? "월급날에 도착했다." : `${next.day}일차로 넘어갔다.`;

  switch (action) {
    case "eatSimple":
      return `생활비를 아끼며 하루를 버텼다. ${nextDayText}${maybeEventText}`;
    case "delivery":
      return `돈은 썼지만 기분을 회복했다. ${nextDayText}${maybeEventText}`;
    case "sideJob":
      return `돈을 더 벌었지만 피로가 쌓였다. ${nextDayText}${maybeEventText}`;
    case "rest":
      return `오늘은 회복에 집중했다. ${nextDayText}${maybeEventText}`;
  }
}

export function getEventChoiceSummary(choice: EventChoice, next: PlayerState) {
  const nextDayText =
    next.day > 30 ? "월급날에 도착했다." : `${next.day}일차로 넘어갔다.`;
  return `${choice.label} 선택을 반영했다. ${nextDayText}`;
}

export function createEmptyBestRun(): BestRun {
  return {
    bestScore: 0,
    bestSurvivalDays: 0,
    totalRuns: 0,
    lastJob: null,
    lastTrait: null,
  };
}

export function createInitialState(
  job: JobType,
  trait: TraitType,
  bestRun: BestRun = createEmptyBestRun(),
): PlayerState {
  const jobConfig = getJobConfig(job);

  let fixedRent = 550000;
  let dailyFoodBase = 12000;
  const dailyTransportBase = 3000;

  if (trait === "planner") {
    fixedRent -= 20000;
    dailyFoodBase -= 1000;
  }

  return {
    day: 1,
    money: jobConfig.monthlySalary - fixedRent,
    stress: jobConfig.startingStress,
    satisfaction: jobConfig.startingSatisfaction,
    health: jobConfig.startingHealth,
    monthlySalary: jobConfig.monthlySalary,
    fixedRent,
    dailyFoodBase,
    dailyTransportBase,
    job,
    trait,
    logs: [
      {
        day: 1,
        message: `월급 ${jobConfig.monthlySalary.toLocaleString()}원을 받았고 월세 ${fixedRent.toLocaleString()}원이 빠졌습니다.`,
      },
    ],
    currentEvent: null,
    seenEventIds: [],
    gameOver: false,
    result: null,
    upgrades: { ...INITIAL_UPGRADES },
    upgradePointsSpent: 0,
    isUpgradeModalOpen: false,
    bestRun: {
      ...bestRun,
      totalRuns: bestRun.totalRuns + 1,
      lastJob: job,
      lastTrait: trait,
    },
    currentGoal: createGoal(job, trait),
    streak: { lastAction: null, count: 0 },
    actionCounts: createEmptyActionCounts(),
    lastComboNotice: null,
    goalJustCompleted: false,
    lastTurnSummary: {
      source: "action",
      title: "게임 시작",
      detail: `${jobConfig.label} · ${getTraitLabel(trait)} 조합으로 월급 생존을 시작했다. 1일차부터 버텨보자.`,
      dayBefore: 1,
      dayAfter: 1,
      moneyDelta: jobConfig.monthlySalary - fixedRent,
      stressDelta: jobConfig.startingStress,
      satisfactionDelta: jobConfig.startingSatisfaction,
      healthDelta: jobConfig.startingHealth,
      resultingMoney: jobConfig.monthlySalary - fixedRent,
      resultingStress: jobConfig.startingStress,
      resultingSatisfaction: jobConfig.startingSatisfaction,
      resultingHealth: jobConfig.startingHealth,
    },
  };
}

export function createEmptyPlayerState(
  bestRun: BestRun = createEmptyBestRun(),
): PlayerState {
  return {
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
    seenEventIds: [],
    gameOver: false,
    result: null,
    upgrades: { ...INITIAL_UPGRADES },
    upgradePointsSpent: 0,
    isUpgradeModalOpen: false,
    bestRun,
    lastTurnSummary: null,
    currentGoal: null,
    streak: { lastAction: null, count: 0 },
    actionCounts: createEmptyActionCounts(),
    lastComboNotice: null,
    goalJustCompleted: false,
  };
}

export function getActionPreview(state: PlayerState) {
  const frugalMeal = getUpgradeLevel(state, "frugalMeal");
  const selfControl = getUpgradeLevel(state, "selfControl");
  const sideJobBoost = getUpgradeLevel(state, "sideJobBoost");
  const staminaUp = getUpgradeLevel(state, "staminaUp");

  return {
    eatSimpleCost: Math.max(
      2000,
      state.dailyFoodBase - 2000 - frugalMeal * 800,
    ),
    deliveryCost: Math.max(7000, 20000 - selfControl * 1200),
    sideJobIncome: 40000 + sideJobBoost * 9000,
    restHealthGain: 6 + staminaUp * 2,
  };
}

export function applyPlayerAction(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  const next = { ...state, goalJustCompleted: false };
  const preview = getActionPreview(state);

  switch (action) {
    case "eatSimple":
      next.money -= preview.eatSimpleCost;
      next.stress += 1;
      next.satisfaction -= Math.max(
        0,
        1 - getUpgradeLevel(state, "frugalMeal"),
      );
      next.logs = [
        ...state.logs,
        { day: state.day, message: "안전 루틴으로 지출을 최대한 눌렀다." },
      ];
      break;

    case "delivery":
      next.money -= preview.deliveryCost;
      next.stress -= 4;
      next.satisfaction += 6;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "소확행 소비로 기분을 끌어올렸다." },
      ];
      break;

    case "sideJob":
      next.money += preview.sideJobIncome;
      next.stress += 6;
      next.health -= 5;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "무리해서 한 번 더 벌었다." },
      ];
      break;

    case "rest":
      next.stress -= 5;
      next.health += preview.restHealthGain;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "오늘은 회복 턴으로 버텼다." },
      ];
      break;
  }

  const combo = applyActionStreak(next, action);
  next.streak = combo.streak;
  next.actionCounts = combo.actionCounts;
  next.money = combo.money;
  next.stress = combo.stress;
  next.satisfaction = combo.satisfaction;
  next.health = combo.health;
  next.lastComboNotice = combo.comboNotice;

  const mentalCare = getUpgradeLevel(state, "mentalCare");
  if (mentalCare > 0) next.stress -= mentalCare;

  if (state.trait === "optimist") {
    next.stress -= 1;
    if (action === "rest" || action === "delivery") next.satisfaction += 1;
  }

  if (state.trait === "planner" && action === "eatSimple") {
    next.money += 1500;
  }

  if (state.trait === "gambler" && action === "sideJob") {
    next.money += 8000;
    next.stress += 2;
  }

  next.stress = clamp(next.stress, 0, 100);
  next.satisfaction = clamp(next.satisfaction, 0, 100);
  next.health = clamp(next.health, 0, 100);

  return evaluateGoal(next);
}

export function applyDailyBaseCost(state: PlayerState): PlayerState {
  const next = { ...state };
  const transportPass = getUpgradeLevel(state, "transportPass");
  const budgetHabit = getUpgradeLevel(state, "budgetHabit");

  const transportCost = Math.max(
    500,
    state.dailyTransportBase - transportPass * 700,
  );
  const dailyLifeCost = state.day % 7 !== 0 ? 5000 : 0;

  next.money -= transportCost + dailyLifeCost;

  if (budgetHabit > 0 && state.day % 5 === 0) {
    const habitBonus = budgetHabit * 6000;
    next.money += habitBonus;
    next.logs = [
      ...next.logs,
      {
        day: state.day,
        message: `가계부 습관 덕분에 ${habitBonus.toLocaleString()}원을 아꼈다.`,
      },
    ];
  }

  next.logs = [
    ...next.logs,
    {
      day: state.day,
      message: `교통비와 생활비로 ${(transportCost + dailyLifeCost).toLocaleString()}원이 지출됐다.`,
    },
  ];

  return next;
}

export function maybePickRandomEvent(state: PlayerState): GameEvent | null {
  const luckyPocket = getUpgradeLevel(state, "luckyPocket");
  const baseChance = 0.5 + luckyPocket * 0.015;

  if (Math.random() > Math.min(baseChance, 0.62)) return null;

  const recentSeenIds = state.seenEventIds.slice(-6);
  const available = GAME_EVENTS.filter((event) => {
    if (event.minDay && state.day < event.minDay) return false;
    if (event.maxDay && state.day > event.maxDay) return false;
    if (event.jobs && state.job && !event.jobs.includes(state.job))
      return false;
    if (recentSeenIds.includes(event.id)) return false;
    return true;
  });

  const fallback = GAME_EVENTS.filter((event) => {
    if (event.minDay && state.day < event.minDay) return false;
    if (event.maxDay && state.day > event.maxDay) return false;
    if (event.jobs && state.job && !event.jobs.includes(state.job))
      return false;
    return true;
  });

  const pool = available.length > 0 ? available : fallback;
  if (pool.length === 0) return null;

  return pool[Math.floor(Math.random() * pool.length)];
}

export function applyEventChoice(
  state: PlayerState,
  choice: EventChoice,
): PlayerState {
  let moneyDelta = choice.effect.money ?? 0;
  let stressDelta = choice.effect.stress ?? 0;
  let satisfactionDelta = choice.effect.satisfaction ?? 0;
  const healthDelta = choice.effect.health ?? 0;

  const couponMaster = getUpgradeLevel(state, "couponMaster");
  const mentalCare = getUpgradeLevel(state, "mentalCare");
  const luckyPocket = getUpgradeLevel(state, "luckyPocket");
  const homeCafe = getUpgradeLevel(state, "homeCafe");

  if (moneyDelta < 0) {
    moneyDelta += couponMaster * 1200;
  }

  if (moneyDelta > 0) {
    moneyDelta += luckyPocket * 4000;
  }

  if (stressDelta > 0) {
    stressDelta -= mentalCare;
  }

  if (
    state.currentEvent?.id.includes("coffee") ||
    state.currentEvent?.id.includes("coupon") ||
    state.currentEvent?.id.includes("friends")
  ) {
    satisfactionDelta += homeCafe;
  }

  if (state.trait === "gambler") {
    moneyDelta = Math.round(moneyDelta * 1.15);
    satisfactionDelta = Math.round(satisfactionDelta * 1.1);
    stressDelta = Math.round(stressDelta * 1.1);
  }

  const next: PlayerState = {
    ...state,
    money: state.money + moneyDelta,
    stress: clamp(state.stress + stressDelta, 0, 100),
    satisfaction: clamp(state.satisfaction + satisfactionDelta, 0, 100),
    health: clamp(state.health + healthDelta, 0, 100),
    currentEvent: null,
    seenEventIds: [
      ...state.seenEventIds.slice(-19),
      state.currentEvent?.id ?? "unknown",
    ],
    logs: [
      ...state.logs,
      {
        day: state.day,
        message: `${state.currentEvent?.title ?? "이벤트"} → ${choice.label} (${[
          moneyDelta !== 0 ? `돈 ${formatSignedValue(moneyDelta, "원")}` : null,
          stressDelta !== 0
            ? `스트레스 ${formatSignedValue(stressDelta)}`
            : null,
          satisfactionDelta !== 0
            ? `만족도 ${formatSignedValue(satisfactionDelta)}`
            : null,
          healthDelta !== 0 ? `체력 ${formatSignedValue(healthDelta)}` : null,
        ]
          .filter(Boolean)
          .join(", ")})`,
      },
    ],
  };

  return next;
}

export function advanceToNextDay(state: PlayerState): PlayerState {
  return {
    ...state,
    day: state.day + 1,
  };
}

function getFailureReason(state: PlayerState): GameResult["endReason"] {
  if (state.money < 0) return "money";
  if (state.stress >= 100) return "stress";
  if (state.health <= 0) return "health";
  return "money";
}

export function finalizeIfNeeded(state: PlayerState): PlayerState {
  if (state.money < 0 || state.stress >= 100 || state.health <= 0) {
    return finishGame(state, false);
  }

  if (state.day > 30) {
    const withSalary = {
      ...state,
      money: state.money + state.monthlySalary,
      logs: [
        ...state.logs,
        {
          day: 30,
          message: `월급날 도착! ${state.monthlySalary.toLocaleString()}원이 입금됐다.`,
        },
      ],
    };

    return finishGame(withSalary, true);
  }

  return state;
}

export function createResult(
  state: PlayerState,
  survived: boolean,
): GameResult {
  const upgradeBonus =
    Object.values(state.upgrades).reduce((sum, cur) => sum + cur, 0) * 300;

  const score =
    state.money / 1000 +
    state.satisfaction * 20 +
    state.health * 15 -
    state.stress * 10 +
    upgradeBonus +
    (survived ? 10000 : 0);

  return {
    survived,
    finalMoney: state.money,
    finalStress: state.stress,
    finalSatisfaction: state.satisfaction,
    finalHealth: state.health,
    lastDay: Math.min(state.day, 30),
    score: Math.max(0, Math.round(score)),
    endReason: survived ? "survived" : getFailureReason(state),
  };
}

export function finishGame(state: PlayerState, survived: boolean): PlayerState {
  const result = createResult(state, survived);
  const bestRun = {
    ...state.bestRun,
    bestScore: Math.max(state.bestRun.bestScore, result.score),
    bestSurvivalDays: Math.max(state.bestRun.bestSurvivalDays, result.lastDay),
  };

  return {
    ...state,
    gameOver: true,
    result,
    currentEvent: null,
    isUpgradeModalOpen: false,
    bestRun,
  };
}

export function buyUpgrade(
  state: PlayerState,
  upgradeId: UpgradeKey,
): PlayerState {
  const upgrade = UPGRADES.find((item) => item.id === upgradeId);
  if (!upgrade) return state;

  const currentLevel = state.upgrades[upgradeId];
  const maxLevel = 3;

  if (currentLevel >= maxLevel) return state;

  const levelCost =
    upgrade.cost + currentLevel * Math.round(upgrade.cost * 0.4);
  if (state.money < levelCost) return state;

  const next = {
    ...state,
    money: state.money - levelCost,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: currentLevel + 1,
    },
    upgradePointsSpent: state.upgradePointsSpent + levelCost,
    logs: [
      ...state.logs,
      {
        day: state.day,
        message: `${upgrade.label} 업그레이드 Lv.${currentLevel + 1}`,
      },
    ],
  };

  return {
    ...next,
    lastTurnSummary: createTurnSummary({
      prev: state,
      next,
      source: "upgrade",
      title: `${upgrade.label} 강화 완료`,
      detail: `${levelCost.toLocaleString()}원을 써서 ${upgrade.label}을 Lv.${currentLevel + 1}로 올렸다.`,
    }),
  };
}

export function getUpgradeEffectText(upgradeId: UpgradeKey, level: number) {
  switch (upgradeId) {
    case "frugalMeal":
      return {
        current:
          level === 0
            ? "식비 절감 없음"
            : `소박한 식사 비용 -${(level * 800).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 소박한 식사 비용 -${((level + 1) * 800).toLocaleString()}원`,
      };

    case "couponMaster":
      return {
        current:
          level === 0
            ? "이벤트 소비 할인 없음"
            : `소비 이벤트 비용 -${(level * 1200).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 소비 이벤트 비용 -${((level + 1) * 1200).toLocaleString()}원`,
      };

    case "mentalCare":
      return {
        current:
          level === 0 ? "스트레스 저항 없음" : `스트레스 증가량 ${level} 감소`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 스트레스 증가량 ${level + 1} 감소`,
      };

    case "staminaUp":
      return {
        current:
          level === 0 ? "휴식 보너스 없음" : `휴식 시 체력 +${level * 2} 추가`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 휴식 시 체력 +${(level + 1) * 2} 추가`,
      };

    case "sideJobBoost":
      return {
        current:
          level === 0
            ? "부업 추가수익 없음"
            : `부업 수익 +${(level * 9000).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 부업 수익 +${((level + 1) * 9000).toLocaleString()}원`,
      };

    case "luckyPocket":
      return {
        current:
          level === 0
            ? "이벤트 추가보상 없음"
            : `긍정 이벤트 보상 +${(level * 4000).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 긍정 이벤트 보상 +${((level + 1) * 4000).toLocaleString()}원`,
      };

    case "transportPass":
      return {
        current:
          level === 0
            ? "교통비 할인 없음"
            : `일일 교통비 -${(level * 700).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 일일 교통비 -${((level + 1) * 700).toLocaleString()}원`,
      };

    case "selfControl":
      return {
        current:
          level === 0
            ? "충동소비 절감 없음"
            : `배달 비용 -${(level * 1200).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 배달 비용 -${((level + 1) * 1200).toLocaleString()}원`,
      };

    case "homeCafe":
      return {
        current:
          level === 0 ? "만족도 보너스 없음" : `소확행 이벤트 만족도 +${level}`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 소확행 이벤트 만족도 +${level + 1}`,
      };

    case "budgetHabit":
      return {
        current:
          level === 0
            ? "주기 절약 보너스 없음"
            : `5일마다 ${(level * 6000).toLocaleString()}원 절약`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 5일마다 ${((level + 1) * 6000).toLocaleString()}원 절약`,
      };
  }
}
