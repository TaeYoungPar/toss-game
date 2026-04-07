import { EventChoice, GameEvent } from "@/lib/salary-survival/types";

type EventCardProps = {
  event: GameEvent;
  onChoose: (choice: EventChoice) => void;
};

function formatEffectLabel(choice: EventChoice) {
  const parts: string[] = [];

  const { money, stress, satisfaction, health } = choice.effect;

  if (typeof money === "number") {
    parts.push(`돈 ${money > 0 ? "+" : ""}${money.toLocaleString()}원`);
  }

  if (typeof stress === "number") {
    parts.push(`스트레스 ${stress > 0 ? "+" : ""}${stress}`);
  }

  if (typeof satisfaction === "number") {
    parts.push(`만족도 ${satisfaction > 0 ? "+" : ""}${satisfaction}`);
  }

  if (typeof health === "number") {
    parts.push(`체력 ${health > 0 ? "+" : ""}${health}`);
  }

  if (parts.length === 0) {
    return "변화 없음";
  }

  return parts.join(" · ");
}

export default function EventCard({ event, onChoose }: EventCardProps) {
  return (
    <div className="rounded-[32px] border border-sky-200 bg-white p-6 shadow-[0_16px_40px_rgba(14,165,233,0.10)]">
      <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
        오늘의 이벤트
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {event.title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {event.description}
      </p>

      <div className="mt-6 space-y-3">
        {event.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoose(choice)}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-sky-300 hover:bg-white"
          >
            <div className="text-sm font-semibold text-slate-900">
              {choice.label}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              {formatEffectLabel(choice)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
