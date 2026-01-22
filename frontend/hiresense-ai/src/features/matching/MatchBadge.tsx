export function MatchBadge({ score }: { score?: number }) {
  if (score === undefined) return null;

  let colorClass = "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  let label = "Low Match";

  if (score >= 70) {
    colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
    label = "High Match";
  } else if (score >= 40) {
    colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    label = "Medium Match";
  }

  return (
    <div className={`flex flex-col items-end`}>
      <div className={`px-3 py-1 rounded-full border ${colorClass} font-bold text-sm backdrop-blur-sm`}>
        {score}%
      </div>
      <span className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
