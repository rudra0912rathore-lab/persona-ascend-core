import { cn } from "@/lib/utils";

export function AiOrb({
  size = 120,
  active = true,
  className,
}: {
  size?: number;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #E8745C 0%, #F09684 45%, transparent 70%)",
        }}
      />
      <div
        className={cn("absolute inset-1 rounded-full opacity-90", active && "animate-orbit")}
        style={{
          background:
            "conic-gradient(from 0deg, #E8745C, #F09684, #E8745C, #FBC4B0, #E8745C)",
          maskImage:
            "radial-gradient(circle, transparent 56%, black 58%, black 70%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 56%, black 58%, black 70%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(232,116,92,0.7) 35%, rgba(40,20,15,0.95) 75%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), 0 0 30px rgba(232,116,92,0.4)",
        }}
      />
      <div
        className="absolute inset-[26%] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.9), transparent 50%)",
        }}
      />
    </div>
  );
}
