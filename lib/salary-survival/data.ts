import {
  GameEvent,
  JobConfig,
  TraitConfig,
  UpgradeConfig,
  UpgradeLevels,
} from "./types";

export const JOBS: JobConfig[] = [
  {
    id: "office",
    label: "사무직 신입",
    description: "월급은 안정적이지만 스트레스가 조금 높다",
    monthlySalary: 2300000,
    startingStress: 22,
    startingSatisfaction: 50,
    startingHealth: 70,
  },
  {
    id: "freelancer",
    label: "프리랜서",
    description: "자유롭지만 수입과 감정 기복이 있다",
    monthlySalary: 2100000,
    startingStress: 18,
    startingSatisfaction: 56,
    startingHealth: 72,
  },
  {
    id: "parttime",
    label: "편의점 알바",
    description: "월급은 낮지만 멘탈은 비교적 편하다",
    monthlySalary: 1900000,
    startingStress: 14,
    startingSatisfaction: 52,
    startingHealth: 76,
  },
];

export const TRAITS: TraitConfig[] = [
  {
    id: "planner",
    label: "계획형",
    description: "고정지출과 생활 낭비를 조금 줄인다",
  },
  {
    id: "optimist",
    label: "낙천형",
    description: "스트레스 증가량이 조금 줄어든다",
  },
  {
    id: "gambler",
    label: "승부형",
    description: "좋은 일도 나쁜 일도 더 크게 들어온다",
  },
];

export const JOB_LABEL_MAP = {
  office: "사무직 신입",
  freelancer: "프리랜서",
  parttime: "편의점 알바",
} as const;

export const TRAIT_LABEL_MAP = {
  planner: "계획형",
  optimist: "낙천형",
  gambler: "승부형",
} as const;

export const INITIAL_UPGRADES: UpgradeLevels = {
  frugalMeal: 0,
  couponMaster: 0,
  mentalCare: 0,
  staminaUp: 0,
  sideJobBoost: 0,
  luckyPocket: 0,
  transportPass: 0,
  selfControl: 0,
  homeCafe: 0,
  budgetHabit: 0,
};

export const UPGRADES: UpgradeConfig[] = [
  {
    id: "frugalMeal",
    label: "절약 식단",
    description: "소박한 식사의 만족도 하락이 줄고 비용도 조금 절약",
    cost: 70000,
    statLabel: "식비 절감 / 만족도 방어",
  },
  {
    id: "couponMaster",
    label: "쿠폰 수집가",
    description: "배달과 소비 이벤트의 비용이 조금 줄어든다",
    cost: 90000,
    statLabel: "소비 비용 절감",
  },
  {
    id: "mentalCare",
    label: "멘탈 관리",
    description: "전반적인 스트레스 상승량 감소",
    cost: 120000,
    statLabel: "스트레스 저항",
  },
  {
    id: "staminaUp",
    label: "체력 보강",
    description: "휴식 효율과 기본 체력이 상승",
    cost: 100000,
    statLabel: "체력 회복",
  },
  {
    id: "sideJobBoost",
    label: "부업 숙련",
    description: "부업 수익 증가",
    cost: 130000,
    statLabel: "부업 수익",
  },
  {
    id: "luckyPocket",
    label: "행운의 주머니",
    description: "긍정적 이벤트의 돈 보상이 증가",
    cost: 150000,
    statLabel: "이벤트 보상",
  },
  {
    id: "transportPass",
    label: "정기권 사용",
    description: "일일 교통비 감소",
    cost: 110000,
    statLabel: "교통비 절감",
  },
  {
    id: "selfControl",
    label: "충동 억제",
    description: "배달/쇼핑류 행동의 비용 감소",
    cost: 95000,
    statLabel: "충동소비 절감",
  },
  {
    id: "homeCafe",
    label: "홈카페 세팅",
    description: "커피/소확행 이벤트의 만족 효율 증가",
    cost: 80000,
    statLabel: "만족도 증가",
  },
  {
    id: "budgetHabit",
    label: "가계부 습관",
    description: "매 5일마다 소소한 절약 보너스 획득",
    cost: 140000,
    statLabel: "주기 보너스",
  },
];

export const GAME_EVENTS: GameEvent[] = [
  {
    id: "coffee_with_coworker",
    title: "동료가 커피 사러 가자고 한다",
    description: "같이 가면 기분은 좋아지지만 돈이 든다.",
    choices: [
      { id: "go", label: "같이 간다", effect: { money: -5000, satisfaction: 4, stress: -2 } },
      { id: "skip", label: "물 마시며 참는다", effect: { stress: 2, satisfaction: -1 } },
    ],
  },
  {
    id: "delivery_coupon",
    title: "배달앱 할인 쿠폰이 도착했다",
    description: "오늘은 그냥 편하게 먹고 싶은 날이다.",
    choices: [
      { id: "use", label: "배달 시킨다", effect: { money: -14000, satisfaction: 6, stress: -4 } },
      { id: "ignore", label: "쿠폰을 참는다", effect: { satisfaction: -1 } },
    ],
  },
  {
    id: "wedding_invite",
    title: "친구 청첩장이 왔다",
    description: "축의금은 얼마를 낼까.",
    minDay: 5,
    choices: [
      { id: "fifty", label: "5만원 낸다", effect: { money: -50000, satisfaction: 1 } },
      { id: "hundred", label: "10만원 낸다", effect: { money: -100000, satisfaction: 4, stress: -1 } },
      { id: "decline", label: "못 간다고 한다", effect: { satisfaction: -5, stress: 3 } },
    ],
  },
  {
    id: "used_market_success",
    title: "중고거래가 성공했다",
    description: "안 쓰던 물건이 생각보다 잘 팔렸다.",
    choices: [{ id: "ok", label: "좋다", effect: { money: 35000, satisfaction: 3 } }],
  },
  {
    id: "sudden_hospital",
    title: "몸이 안 좋아 병원에 갔다",
    description: "예상치 못한 지출이 생겼다.",
    minDay: 8,
    choices: [
      { id: "pay", label: "진료 받는다", effect: { money: -30000, health: 8, stress: -2 } },
      { id: "endure", label: "그냥 버틴다", effect: { health: -8, stress: 5 } },
    ],
  },
  {
    id: "bonus",
    title: "작은 보너스를 받았다",
    description: "생각지 못한 추가 수입이다.",
    minDay: 10,
    choices: [{ id: "yay", label: "행복하다", effect: { money: 70000, satisfaction: 5, stress: -3 } }],
  },
  {
    id: "friends_meetup",
    title: "친구들이 주말에 보자고 한다",
    description: "나가면 즐겁지만 돈이 든다.",
    choices: [
      { id: "join", label: "나간다", effect: { money: -30000, satisfaction: 8, stress: -4 } },
      { id: "stay", label: "집에서 쉰다", effect: { health: 4, satisfaction: -2 } },
    ],
  },
  {
    id: "snack_impulse",
    title: "편의점 신상 간식이 눈에 들어온다",
    description: "하나쯤은 괜찮을까.",
    choices: [
      { id: "buy", label: "산다", effect: { money: -4500, satisfaction: 3 } },
      { id: "pass", label: "참는다", effect: { stress: 1 } },
    ],
  },
  {
    id: "overtime",
    title: "갑자기 야근 요청이 들어왔다",
    description: "수당은 있지만 피곤하다.",
    choices: [
      { id: "do", label: "야근한다", effect: { money: 25000, stress: 6, health: -4 } },
      { id: "avoid", label: "정중히 거절한다", effect: { satisfaction: 2, stress: -1 } },
    ],
  },
  {
    id: "family_call",
    title: "부모님이 밥 먹으러 오라고 한다",
    description: "돈은 아끼지만 시간이 든다.",
    choices: [
      { id: "visit", label: "간다", effect: { money: 10000, satisfaction: 6, stress: -3, health: 2 } },
      { id: "later", label: "다음에 간다", effect: { satisfaction: -2 } },
    ],
  },
  {
    id: "phone_broken",
    title: "핸드폰 필름이 깨졌다",
    description: "고칠까 그냥 쓸까.",
    choices: [
      { id: "repair", label: "바로 교체한다", effect: { money: -18000, stress: -1 } },
      { id: "ignore", label: "그냥 쓴다", effect: { stress: 3 } },
    ],
  },
  {
    id: "lunch_treat",
    title: "선배가 점심을 사줬다",
    description: "뜻밖의 절약이다.",
    choices: [{ id: "nice", label: "감사히 먹는다", effect: { money: 12000, satisfaction: 3 } }],
  },

  {
    id: "office_report_fix",
    title: "팀장이 급한 보고서 수정을 요청했다",
    description: "사무직다운 순간이다. 빠르게 처리하면 평판은 오른다.",
    minDay: 4,
    jobs: ["office"],
    choices: [
      { id: "handle", label: "야무지게 처리한다", effect: { money: 18000, stress: 5, satisfaction: 2 } },
      { id: "delay", label: "내일로 미룬다", effect: { stress: 2, satisfaction: -2 } },
    ],
  },
  {
    id: "freelancer_client_revision",
    title: "클라이언트가 수정 요청을 추가했다",
    description: "수정 범위를 두고 밀당이 필요하다.",
    minDay: 6,
    jobs: ["freelancer"],
    choices: [
      { id: "accept", label: "추가 수정까지 받는다", effect: { money: 40000, stress: 7, health: -3 } },
      { id: "negotiate", label: "추가 금액을 협의한다", effect: { money: 22000, stress: 2, satisfaction: 3 } },
    ],
  },
  {
    id: "parttime_shift_swap",
    title: "동료가 근무 교대를 부탁한다",
    description: "대신 들어가면 돈은 벌지만 몸은 힘들다.",
    minDay: 3,
    jobs: ["parttime"],
    choices: [
      { id: "cover", label: "대신 근무해준다", effect: { money: 30000, stress: 4, health: -4 } },
      { id: "decline", label: "정중히 거절한다", effect: { satisfaction: 1, stress: -1 } },
    ],
  },
  {
    id: "subscription",
    title: "구독 서비스 결제일이다",
    description: "계속 쓸지 끊을지 정해야 한다.",
    choices: [
      { id: "keep", label: "유지한다", effect: { money: -9900, satisfaction: 3 } },
      { id: "cancel", label: "해지한다", effect: { satisfaction: -2, money: 3000 } },
    ],
  },
  {
    id: "rain_taxi",
    title: "비가 엄청 온다",
    description: "버스를 탈까 택시를 탈까.",
    choices: [
      { id: "taxi", label: "택시 탄다", effect: { money: -18000, stress: -4 } },
      { id: "bus", label: "버틴다", effect: { stress: 3, health: -2 } },
    ],
  },
  {
    id: "coupon_lottery",
    title: "앱 이벤트에 당첨됐다",
    description: "소소한 상품권을 받았다.",
    choices: [{ id: "claim", label: "받는다", effect: { money: 15000, satisfaction: 4 } }],
  },
  {
    id: "late_night_hunger",
    title: "밤에 갑자기 배가 고파진다",
    description: "야식을 먹을까 고민된다.",
    choices: [
      { id: "eat", label: "야식 먹는다", effect: { money: -9000, satisfaction: 5, health: -1 } },
      { id: "sleep", label: "그냥 잔다", effect: { health: 2, stress: 1 } },
    ],
  },
  {
    id: "unexpected_refund",
    title: "예전 결제가 환불됐다",
    description: "생각 못 한 돈이 돌아왔다.",
    choices: [{ id: "wow", label: "좋다", effect: { money: 22000, satisfaction: 2 } }],
  },
  {
    id: "office_party",
    title: "회식 공지가 떴다",
    description: "가면 피곤하고 안 가면 애매하다.",
    choices: [
      { id: "join", label: "참석한다", effect: { money: -15000, stress: 2, satisfaction: 3, health: -2 } },
      { id: "skip", label: "불참한다", effect: { satisfaction: -2, stress: -1 } },
    ],
  },
  {
    id: "cheap_market",
    title: "동네 마트 특가 세일을 발견했다",
    description: "지금 사두면 며칠은 편하다.",
    choices: [
      { id: "buy", label: "장 본다", effect: { money: -20000, satisfaction: 4, stress: -1 } },
      { id: "pass", label: "그냥 지나친다", effect: { satisfaction: -1 } },
    ],
  },
  {
    id: "freelance_offer",
    title: "짧은 외주 제안이 들어왔다",
    description: "돈은 되지만 꽤 피곤할 것 같다.",
    minDay: 7,
    choices: [
      { id: "accept", label: "받는다", effect: { money: 60000, stress: 7, health: -5 } },
      { id: "reject", label: "거절한다", effect: { stress: -1, satisfaction: 1 } },
    ],
  },
  {
    id: "gaming_night",
    title: "오랜만에 게임이 너무 하고 싶다",
    description: "조금 놀면 스트레스가 풀릴지도 모른다.",
    choices: [
      { id: "play", label: "한 판 한다", effect: { satisfaction: 5, stress: -3, health: -1 } },
      { id: "hold", label: "참고 잔다", effect: { health: 3 } },
    ],
  },
  {
    id: "laundry",
    title: "빨래를 미뤄둔 게 터졌다",
    description: "코인세탁소를 가야 할까.",
    choices: [
      { id: "wash", label: "당장 한다", effect: { money: -6000, satisfaction: 2, stress: -2 } },
      { id: "delay", label: "조금 더 미룬다", effect: { stress: 3 } },
    ],
  },
];