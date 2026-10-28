// Profile README header, light and dark, in the same card style as Fig 1.
// A typographic left side and a small stack of punched cards (the commits from Fig 1) on the right.
// Usage: node .github/readme/header.mjs .github/readme assets
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [kitDir, outDir] = process.argv.slice(2);
const k = await import(pathToFileURL(join(kitDir, "kit/iso-kit.mjs")).href);
mkdirSync(outDir, { recursive: true });

const WIDTH = 1000;
const HEIGHT = 260;

const THEMES = {
  dark: {
    tokens: `--anatomy-card:#0d1117;--anatomy-paper:#0d1117;--anatomy-face:#18202c;--anatomy-top:#151b24;--anatomy-lit-top:#1f2a3b;--anatomy-lit-shade:#172131;--anatomy-shade-0:#0a0e14;--anatomy-shade-1:#0d1219;--anatomy-shade-2:#10161e;--anatomy-shade-3:#131a23;--anatomy-lit:#7aa2f7;--anatomy-green:#3fb950;--anatomy-hi:#c9d1d9;--anatomy-mid:#5d6b7c;--anatomy-lo:#38424f;--anatomy-faint:#232b36;--anatomy-dot:#c9d1d9;--anatomy-halo:#010409;`,
    strong: "#e6edf3", text: "#9198a1", muted: "#656c76", grid: "#30363d", border: "#30363d", accent: "#7aa2f7", green: "#3fb950",
  },
  light: {
    tokens: `--anatomy-card:#ffffff;--anatomy-paper:#ffffff;--anatomy-lit:#2f5bd3;--anatomy-green:#1a7f37;`,
    strong: "#1f2328", text: "#59636e", muted: "#818b98", grid: "#d1d9e0", border: "#d1d9e0", accent: "#2f5bd3", green: "#1a7f37",
  },
};

function cards() {
  // Five queued cards and a lit one on top, set in the right third of the header.
  const CARD = { x: -24, y: -17, w: 48, d: 34, r: 2 };
  const H = 2.2;
  const COUNT = 6;
  const P = k.fitProjection(k.boxCorners(k.insetPlan(CARD, -10), -6, COUNT * (H + 1.2) + 10), 250, 210, { pad: 6, azimuth: 52 });
  P.origin = [P.origin[0] + 715, P.origin[1] + 25];
  const at = (p) => k.iso(p, P);
  const out = [`<path class="iso-halo" d="${k.haloOf(CARD, 0, 2, P)}"/>`];
  const tray = k.insetPlan(CARD, -6);
  out.push(k.solidSvg(k.slabOf(tray, -4, 4, P, 6, 0.8), { tone: "mid" }));
  out.push(k.lineSvg(k.planOutline(k.insetPlan(tray, 2.5), 0, P, 4), { tone: "faint" }));
  out.push(k.dotsSvg(k.corners(tray, 2.4).map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const rows = [[0, 1, 1, 0, 1, 0, 1, 1, 0, 1], [1, 0, 1, 1, 0, 1, 0, 0, 1, 1], [0, 1, 0, 1, 1, 0, 1, 0, 1, 0], [1, 1, 0, 0, 1, 1, 0, 1, 0, 0]];
  for (let i = 0; i < COUNT; i++) {
    const z = i * (H + 1.2);
    const lit = i === COUNT - 1;
    const plan = { ...CARD, x: CARD.x + (i % 2 ? 1.2 : -0.6), y: CARD.y + (i % 3) * 0.6 };
    out.push(k.solidSvg(k.slabOf(plan, z, H, P, 3, 0.4), { tone: "hi", crease: "lo", lit }));
    out.push(k.lineSvg(k.lineOnTop([plan.x + plan.w - 6, plan.y], [plan.x + plan.w, plan.y + 6], z + H, P), { tone: "faint" }));
    if (lit) {
      const pts = [];
      rows.forEach((row, r) => row.forEach((on, c) => on && pts.push(at([plan.x + 6 + c * 3.9, plan.y + 7 + r * 5.6, z + H]))));
      out.push(k.dotsSvg(pts, { size: 1.1, tone: "mid" }));
    }
  }
  return out.join("");
}

for (const [name, t] of Object.entries(THEMES)) {
  const sans = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
  const mono = `ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;
  const css = `${k.ISO_CSS}.iso[data-theme="${name}"]{${t.tokens}}
.h-name{font:650 64px ${sans};fill:${t.strong};letter-spacing:-.02em}
.h-role{font:400 22px ${sans};fill:${t.text}}
.h-mono{font:400 15px ${mono};fill:${t.muted}}
.h-status{font:400 15px ${mono};fill:${t.text}}
.h-accent{fill:${t.accent}}
.h-cursor{fill:${t.accent};animation:h-blink 1.1s steps(1,end) infinite}
.h-live{fill:${t.green};animation:h-pulse 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes h-blink{50%{opacity:0}}
@keyframes h-pulse{0%,100%{opacity:1}50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){.h-cursor,.h-live{animation:none}}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso" data-theme="${name}" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="Nikhil Rathore. Full stack developer in New Delhi. Software Engineer at Bug0, building OwnBase.">
<style>${css}</style>
<defs>
<pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1" fill="${t.grid}"/></pattern>
<radialGradient id="fade" cx="78%" cy="50%" r="62%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="gridMask"><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/></mask>
</defs>
<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10" fill="var(--anatomy-card)" stroke="${t.border}"/>
<rect x="1" y="1" width="${WIDTH - 2}" height="${HEIGHT - 2}" rx="10" fill="url(#grid)" mask="url(#gridMask)"/>
<text class="h-mono" x="52" y="62"><tspan class="h-accent">$</tspan> whoami</text>
<rect class="h-cursor" x="123" y="49" width="9" height="17" rx="1"/>
<text class="h-name" x="48" y="134">Nikhil Rathore</text>
<text class="h-role" x="52" y="174">Full stack developer in New Delhi. TypeScript, React, Next.js, Node.</text>
<circle class="h-live" cx="58" cy="212" r="4.5"/>
<text class="h-status" x="72" y="217">Software Engineer at Bug0 <tspan fill="${t.muted}">·</tspan> building OwnBase</text>
${cards()}
</svg>`;
  writeFileSync(join(outDir, `header-${name}.svg`), svg);
  console.log("wrote header", name, (svg.length / 1024).toFixed(1) + " KB");
}
