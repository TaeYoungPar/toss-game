type ChoiceButtonProps = {
  title: string;
  description: string;
  onClick: () => void;
};

export default function ChoiceButton({
  title,
  description,
  onClick,
}: ChoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:scale-[1.01] hover:border-slate-300"
    >
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </button>
  );
}