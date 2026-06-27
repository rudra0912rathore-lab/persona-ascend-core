// Renders a Growth Card to a PNG blob on canvas, then shares or downloads it.

export type GrowthCardData = {
  username: string;
  level: number;
  rank: string;
  cls: string;
  xp: number;
  streak: number;
  longestStreak: number;
  goal: string;
  futureIdentity: string;
};

const W = 1080;
const H = 1920;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxLines = 3,
) {
  const words = text.split(/\s+/);
  let line = "";
  let lines: string[] = [];
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + "…";
  }
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineH));
  return lines.length * lineH;
}

export async function renderGrowthCard(d: GrowthCardData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0D0D0D");
  bg.addColorStop(1, "#151515");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Aurora blobs
  const blob1 = ctx.createRadialGradient(180, 220, 0, 180, 220, 700);
  blob1.addColorStop(0, "rgba(123,97,255,0.55)");
  blob1.addColorStop(1, "rgba(123,97,255,0)");
  ctx.fillStyle = blob1;
  ctx.fillRect(0, 0, W, H);

  const blob2 = ctx.createRadialGradient(W - 100, H - 300, 0, W - 100, H - 300, 800);
  blob2.addColorStop(0, "rgba(90,141,255,0.45)");
  blob2.addColorStop(1, "rgba(90,141,255,0)");
  ctx.fillStyle = blob2;
  ctx.fillRect(0, 0, W, H);

  // Glass card
  const cx = 70, cy = 90, cw = W - 140, ch = H - 180;
  ctx.save();
  ctx.shadowColor = "rgba(123,97,255,0.35)";
  ctx.shadowBlur = 60;
  ctx.fillStyle = "rgba(28,28,28,0.78)";
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  roundRect(ctx, cx, cy, cw, ch, 56);
  ctx.stroke();

  // Brand
  ctx.fillStyle = "#A3A3A3";
  ctx.font = "600 28px Inter, system-ui, sans-serif";
  ctx.fillText("ASCEND  AI", cx + 60, cy + 90);

  // Avatar circle
  const avX = cx + 60, avY = cy + 150, avR = 90;
  const avG = ctx.createLinearGradient(avX, avY, avX + avR * 2, avY + avR * 2);
  avG.addColorStop(0, "#7B61FF");
  avG.addColorStop(1, "#5A8DFF");
  ctx.fillStyle = avG;
  ctx.beginPath();
  ctx.arc(avX + avR, avY + avR, avR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 86px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((d.username[0] ?? "A").toUpperCase(), avX + avR, avY + avR + 6);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  // Username
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 72px Inter, system-ui, sans-serif";
  ctx.fillText(d.username, cx + 60 + avR * 2 + 40, avY + avR - 10);
  ctx.fillStyle = "#A3A3A3";
  ctx.font = "500 32px Inter, system-ui, sans-serif";
  ctx.fillText(
    `Level ${d.level} · ${d.rank} · ${d.cls}`,
    cx + 60 + avR * 2 + 40,
    avY + avR + 40,
  );

  // Goal block
  let y = avY + avR * 2 + 90;
  ctx.fillStyle = "#A3A3A3";
  ctx.font = "600 26px Inter, system-ui, sans-serif";
  ctx.fillText("BUILDING TOWARD", cx + 60, y);
  y += 60;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 56px Inter, system-ui, sans-serif";
  const used = wrap(
    ctx,
    d.futureIdentity || d.goal || "My best self",
    cx + 60,
    y,
    cw - 120,
    72,
    3,
  );
  y += used + 80;

  // Stats row
  const stats = [
    { label: "XP", value: d.xp.toLocaleString() },
    { label: "STREAK", value: `${d.streak}d` },
    { label: "BEST", value: `${d.longestStreak}d` },
    { label: "LEVEL", value: `${d.level}` },
  ];
  const sW = (cw - 120 - 30 * (stats.length - 1)) / stats.length;
  const sH = 220;
  stats.forEach((s, i) => {
    const sx = cx + 60 + i * (sW + 30);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, sx, y, sW, sH, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    roundRect(ctx, sx, y, sW, sH, 32);
    ctx.stroke();

    ctx.fillStyle = "#A3A3A3";
    ctx.font = "600 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.label, sx + sW / 2, y + 60);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 72px Inter, system-ui, sans-serif";
    ctx.fillText(s.value, sx + sW / 2, y + 150);
    ctx.textAlign = "start";
  });
  y += sH + 90;

  // Goal text
  if (d.goal && d.goal !== d.futureIdentity) {
    ctx.fillStyle = "#A3A3A3";
    ctx.font = "600 26px Inter, system-ui, sans-serif";
    ctx.fillText("MAIN GOAL", cx + 60, y);
    y += 50;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "500 36px Inter, system-ui, sans-serif";
    wrap(ctx, d.goal, cx + 60, y, cw - 120, 48, 2);
  }

  // Footer
  const fy = cy + ch - 90;
  ctx.fillStyle = "#A3A3A3";
  ctx.font = "500 28px Inter, system-ui, sans-serif";
  ctx.fillText("ascend.ai · become who you want to be", cx + 60, fy);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      "image/png",
    );
  });
}

export async function shareGrowthCard(d: GrowthCardData): Promise<"shared" | "downloaded"> {
  const blob = await renderGrowthCard(d);
  const file = new File([blob], `ascend-growth-card.png`, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
  };
  const text = `I'm Level ${d.level} ${d.cls} on Ascend AI — ${d.streak}-day streak, ${d.xp} XP. Building toward: ${d.futureIdentity || d.goal || "my best self"}.`;
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "My Ascend Growth Card", text });
      return "shared";
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascend-growth-card.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
