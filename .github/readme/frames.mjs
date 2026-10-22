// Browser-window frames around the project screenshots, light and dark.
// Usage: node .github/readme/frames.mjs assets  (reads <name>.jpg, writes <name>-frame-<theme>.svg)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MONO, PALETTE, escapeXml } from "./theme.mjs";

const assets = process.argv[2];
const SHOTS = [
  ["better-learn", "better-learn.tech"],
  ["sketchschema", "sketchema.vercel.app"],
  ["coding-shastra", "codingshastra.nikhilrathore.com"],
  ["note-master", "notemaster-app.vercel.app"],
];

const W = 960;
const IMG_H = 540;
const BAR = 38;
const H = BAR + IMG_H;

for (const [name, host] of SHOTS) {
  const data = readFileSync(join(assets, `${name}.jpg`)).toString("base64");
  for (const [theme, t] of Object.entries(PALETTE)) {
    const dots = [0, 1, 2].map((i) => `<circle cx="${22 + i * 18}" cy="${BAR / 2}" r="5.5" fill="none" stroke="${t.muted}" stroke-width="1.2"/>`).join("");
    const pill = { w: 26 + host.length * 9.6, h: 22 };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Screenshot of ${escapeXml(host)}">
<defs><clipPath id="shot"><path d="M1 ${BAR}H${W - 1}V${H - 11}a10 10 0 0 1-10 10H11a10 10 0 0 1-10-10Z"/></clipPath></defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${t.chip}" stroke="${t.border}"/>
${dots}
<rect x="${(W - pill.w) / 2}" y="${(BAR - pill.h) / 2}" width="${pill.w}" height="${pill.h}" rx="6" fill="${t.card}" stroke="${t.chipBorder}"/>
<text x="${W / 2}" y="${BAR / 2 + 5}" text-anchor="middle" fill="${t.text}" style="font:400 15px ${MONO}">${escapeXml(host)}</text>
<image clip-path="url(#shot)" x="1" y="${BAR}" width="${W - 2}" height="${IMG_H}" preserveAspectRatio="xMidYMin slice" href="data:image/jpeg;base64,${data}"/>
<line x1="1" x2="${W - 1}" y1="${BAR}" y2="${BAR}" stroke="${t.border}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${t.border}"/>
</svg>`;
    writeFileSync(join(assets, `${name}-frame-${theme}.svg`), svg);
  }
  console.log("framed", name);
}
