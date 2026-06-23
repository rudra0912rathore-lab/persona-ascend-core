import { XpBar } from "./XpBar";

export function LevelHeader({
  greeting,
  username,
  level,
  xp,
  rank,
  cls,
}: {
  greeting: string;
  username: string;
  level: number;
  xp: number;
  rank: string;
  cls: string;
}) {
  return (
    <div className="px-5 pt-7">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{greeting}</p>
          <h1 className="mt-1 truncate text-2xl font-semibold">{username}</h1>
        </div>
        <div className="shrink-0 rounded-2xl gradient-aurora px-3.5 py-2 text-center shadow-elegant">
          <div className="text-[10px] uppercase tracking-wider text-white/80">Level</div>
          <div className="text-lg font-bold leading-none text-white">{level}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl glass p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Rank · <span className="text-foreground font-medium">{rank}</span></span>
          <span>Class · <span className="text-foreground font-medium">{cls}</span></span>
        </div>
        <XpBar xp={xp} />
      </div>
    </div>
  );
}
