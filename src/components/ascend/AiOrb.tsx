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
      {/* outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-70"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #7B61FF 0%, #5A8DFF 45%, transparent 70%)",
        }}
      />
      {/* spinning conic ring */}
      <div
        className={cn("absolute inset-1 rounded-full opacity-90", active && "animate-orbit")}
        style={{
          background:
            "conic-gradient(from 0deg, #7B61FF, #5A8DFF, #7B61FF, #c084fc, #7B61FF)",
          maskImage:
            "radial-gradient(circle, transparent 56%, black 58%, black 70%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 56%, black 58%, black 70%, transparent 72%)",
        }}
      />
      {/* inner core */}
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(123,97,255,0.7) 35%, rgba(20,20,40,0.95) 75%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.7), 0 0 30px rgba(123,97,255,0.4)",
        }}
      />
      {/* highlight */}
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
