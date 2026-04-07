import { GAME_EVENTS, INITIAL_UPGRADES, JOBS, UPGRADES } from "./data";
import {
  EventChoice,
  GameEvent,
  GameResult,
  JobType,
  PlayerAction,
  PlayerState,
  TraitType,
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

export function createInitialState(
  job: JobType,
  trait: TraitType,
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
    gameOver: false,
    result: null,
    upgrades: { ...INITIAL_UPGRADES },
    upgradePointsSpent: 0,
    isUpgradeModalOpen: false,
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
  const next = { ...state };
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
        { day: state.day, message: "소박하게 한 끼를 해결했다." },
      ];
      break;

    case "delivery":
      next.money -= preview.deliveryCost;
      next.stress -= 4;
      next.satisfaction += 6;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "배달음식을 시켜 먹었다." },
      ];
      break;

    case "sideJob":
      next.money += preview.sideJobIncome;
      next.stress += 6;
      next.health -= 5;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "퇴근 후 부업으로 돈을 벌었다." },
      ];
      break;

    case "rest":
      next.stress -= 5;
      next.health += preview.restHealthGain;
      next.logs = [
        ...state.logs,
        { day: state.day, message: "오늘은 쉬면서 회복했다." },
      ];
      break;
  }

  const mentalCare = getUpgradeLevel(state, "mentalCare");
  if (mentalCare > 0) next.stress -= mentalCare;

  if (state.trait === "optimist") {
    next.stress -= 1;
  }

  next.stress = clamp(next.stress, 0, 100);
  next.satisfaction = clamp(next.satisfaction, 0, 100);
  next.health = clamp(next.health, 0, 100);

  return next;
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
  const baseChance = 0.48 + luckyPocket * 0.01;

  if (Math.random() > Math.min(baseChance, 0.65)) return null;

  const available = GAME_EVENTS.filter((event) => {
    if (event.minDay && state.day < event.minDay) return false;
    if (event.maxDay && state.day > event.maxDay) return false;
    return true;
  });

  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
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
    state.currentEvent?.id.includes("snack")
  ) {
    if (satisfactionDelta > 0) {
      satisfactionDelta += homeCafe;
    }
  }

  if (state.trait === "gambler") {
    if (moneyDelta > 0) {
      moneyDelta = Math.round(moneyDelta * 1.2);
    } else if (moneyDelta < 0) {
      moneyDelta = Math.round(moneyDelta * 1.1);
    }
  }

  if (state.trait === "optimist" && stressDelta > 0) {
    stressDelta -= 1;
  }

  return {
    ...state,
    money: state.money + moneyDelta,
    stress: clamp(state.stress + stressDelta, 0, 100),
    satisfaction: clamp(state.satisfaction + satisfactionDelta, 0, 100),
    health: clamp(state.health + healthDelta, 0, 100),
    currentEvent: null,
    logs: [
      ...state.logs,
      {
        day: state.day,
        message: `${state.currentEvent?.title ?? "이벤트"}: ${choice.label}`,
      },
    ],
  };
}

export function advanceToNextDay(state: PlayerState): PlayerState {
  const nextDay = state.day + 1;
  const nextState: PlayerState = {
    ...state,
    day: nextDay,
  };
  return finalizeIfNeeded(nextState);
}

export function finalizeIfNeeded(state: PlayerState): PlayerState {
  const failed = state.money < 0 || state.health <= 0 || state.stress >= 100;

  if (failed) {
    return {
      ...state,
      gameOver: true,
      result: createResult(state, false),
    };
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

    return {
      ...withSalary,
      gameOver: true,
      result: createResult(withSalary, true),
    };
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

  return {
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
            ? "주기 보너스 없음"
            : `5일마다 +${(level * 6000).toLocaleString()}원`,
        next:
          level >= 3
            ? "최대 레벨"
            : `다음 Lv: 5일마다 +${((level + 1) * 6000).toLocaleString()}원`,
      };

    default:
      return {
        current: "효과 정보 없음",
        next: "효과 정보 없음",
      };
  }
}
