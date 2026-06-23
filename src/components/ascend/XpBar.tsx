export function XpBar({
  xp,
  perLevel = 250,
}: {
  xp: number;
  perLevel?: number;
}) {
  const into = xp % perLevel;
  const pct = (into / perLevel) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{into} XP</span>
        <span>{perLevel} XP</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full gradient-aurora"
          style={{ width: `${pct}%`, transition: "width 600ms cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </div>
    </div>
  );
}
