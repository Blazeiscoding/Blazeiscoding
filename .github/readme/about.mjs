// "About me" card, light and dark: facts on the left, what I'm building now on the right.
// Usage: node .github/readme/about.mjs assets
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { MONO, PALETTE, SANS, cardRect, escapeXml } from "./theme.mjs";

const outDir = process.argv[2];

const FACTS = [
  ["Role", "Software Engineer & Forward Deployed Engineer at Bug0"],
  ["Based in", "New Delhi, India"],
  ["Freelance", "Full-stack web apps since 2024"],
  ["Studied", "BSc Computer Science, University of Delhi"],
  ["Works in", "TypeScript, React, Next.js, Node.js, PostgreSQL"],
  ["Learning", "Docker, cloud and DevOps"],
];

const NOW = {
  title: "Tandem",
  lines: ["Open-source team chat you host yourself.", "Run the server on a VPS, or host a", "workspace from your own PC, the way you'd", "open a Minecraft world to LAN."],
  foot: "TypeScript · MIT",
};

const W = 1000;
const TOP = 30;
const ROW = 40;
const H = TOP * 2 + FACTS.length * ROW;
const LEFT = 36;
const KEY_W = 118;
const PANEL = { x: 616, y: 22, w: W - 616 - 22, h: H - 44 };

for (const [name, t] of Object.entries(PALETTE)) {
  const out = [cardRect(W, H, t)];
  FACTS.forEach(([key, value], i) => {
    const y = TOP + i * ROW;
    if (i > 0) out.push(`<line x1="${LEFT}" x2="${PANEL.x - 28}" y1="${y}" y2="${y}" stroke="${t.rule}"/>`);
    out.push(`<text x="${LEFT}" y="${y + ROW / 2 + 4.5}" fill="${t.muted}" style="font:500 12.5px ${MONO};letter-spacing:.08em">${escapeXml(key.toUpperCase())}</text>`);
    out.push(`<text x="${LEFT + KEY_W}" y="${y + ROW / 2 + 5.5}" fill="${t.strong}" style="font:400 16px ${SANS}">${escapeXml(value)}</text>`);
  });
  // The "now" panel.
  out.push(`<rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="8" fill="${t.chip}" stroke="${t.chipBorder}"/>`);
  out.push(`<circle class="live" cx="${PANEL.x + 26}" cy="${PANEL.y + 31}" r="4.5" fill="${t.green}"/>`);
  out.push(`<text x="${PANEL.x + 40}" y="${PANEL.y + 35.5}" fill="${t.muted}" style="font:500 12.5px ${MONO};letter-spacing:.08em">NOW BUILDING</text>`);
  out.push(`<text x="${PANEL.x + 20}" y="${PANEL.y + 80}" fill="${t.strong}" style="font:650 32px ${SANS};letter-spacing:-.01em">${escapeXml(NOW.title)}</text>`);
  NOW.lines.forEach((line, i) => out.push(`<text x="${PANEL.x + 20}" y="${PANEL.y + 114 + i * 23}" fill="${t.text}" style="font:400 15.5px ${SANS}">${escapeXml(line)}</text>`));
  out.push(`<line x1="${PANEL.x + 20}" x2="${PANEL.x + PANEL.w - 20}" y1="${PANEL.y + PANEL.h - 42}" y2="${PANEL.y + PANEL.h - 42}" stroke="${t.chipBorder}"/>`);
  out.push(`<text x="${PANEL.x + 20}" y="${PANEL.y + PANEL.h - 17}" fill="${t.muted}" style="font:400 13px ${MONO}">${escapeXml(NOW.foot)}</text>`);
  const label = `About me. ${FACTS.map(([k, v]) => `${k}: ${v}.`).join(" ")} Now building ${NOW.title}: ${NOW.lines.join(" ")}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(label)}">
<style>.live{animation:pulse 2.4s ease-in-out infinite}@keyframes pulse{50%{opacity:.35}}@media (prefers-reduced-motion:reduce){.live{animation:none}}</style>
${out.join("\n")}
</svg>`;
  writeFileSync(join(outDir, `about-${name}.svg`), svg);
  console.log("wrote about", name);
}
