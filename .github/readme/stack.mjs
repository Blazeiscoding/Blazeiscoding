// "Tech I use" card for the profile README, light and dark, in the header's card style.
// Usage: node .github/readme/stack.mjs .github/readme/icons assets
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [iconDir, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const ROWS = [
  ["Languages", [["typescript", "TypeScript"], ["javascript", "JavaScript"], ["cplusplus", "C++"], ["c", "C"]]],
  ["Frontend", [["react", "React"], ["nextdotjs", "Next.js"], ["tailwindcss", "Tailwind CSS"], ["vite", "Vite"]]],
  ["Backend", [["nodedotjs", "Node.js"], ["express", "Express"], ["bun", "Bun"], ["prisma", "Prisma"]]],
  ["Data", [["postgresql", "PostgreSQL"], ["mongodb", "MongoDB"], ["redis", "Redis"]]],
  ["Ship", [["docker", "Docker"], ["amazonwebservices", "AWS"], ["vercel", "Vercel"], ["git", "Git"], ["postman", "Postman"]]],
];

// Simple Icons ship one 24x24 path per logo; take only its d attribute, and only path syntax.
const pathOf = (slug) => {
  const d = readFileSync(join(iconDir, `${slug}.svg`), "utf8").match(/<path[^>]*\sd="([^"]+)"/)?.[1];
  if (!d || !/^[MmLlHhVvCcSsQqTtAaZz0-9.,\-\s]+$/.test(d)) throw new Error(`bad icon ${slug}`);
  return d;
};

const THEMES = {
  dark: { card: "#0d1117", border: "#30363d", chip: "#151b23", chipBorder: "#262c36", icon: "#c9d1d9", label: "#e6edf3", muted: "#656c76", rule: "#21262d", accent: "#7aa2f7" },
  light: { card: "#ffffff", border: "#d1d9e0", chip: "#f6f8fa", chipBorder: "#d1d9e0", icon: "#1f2328", label: "#1f2328", muted: "#818b98", rule: "#eaeef2", accent: "#2f5bd3" },
};

const WIDTH = 880;
const TOP = 34;
const ROW_H = 54;
const HEIGHT = TOP + ROWS.length * ROW_H + 18;
const LEFT = 48;
const CHIPS_X = 200;
const CHIP_H = 34;
// Rough advance widths for a 15px medium sans, so each chip hugs its label.
const widthOf = (text) => [...text].reduce((sum, ch) => sum + (/[iljtfr.]/.test(ch) ? 4.6 : /[A-Z]/.test(ch) ? (/[MW]/.test(ch) ? 12.6 : /[DGOQ]/.test(ch) ? 10.6 : 9.4) : ch === " " ? 4.2 : ch === "+" ? 9 : /[mw]/.test(ch) ? 11.6 : 8.1), 0);
const sans = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
const mono = `ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;

for (const [name, t] of Object.entries(THEMES)) {
  const out = [];
  ROWS.forEach(([group, items], row) => {
    const cy = TOP + row * ROW_H + ROW_H / 2;
    if (row > 0) out.push(`<line x1="${LEFT}" x2="${WIDTH - LEFT}" y1="${TOP + row * ROW_H}" y2="${TOP + row * ROW_H}" stroke="${t.rule}"/>`);
    out.push(`<circle cx="${LEFT + 3}" cy="${cy}" r="3" fill="${t.accent}"/>`);
    out.push(`<text x="${LEFT + 16}" y="${cy + 4.5}" class="g">${group.toUpperCase()}</text>`);
    let x = CHIPS_X;
    for (const [slug, label] of items) {
      const w = Math.round(52 + widthOf(label));
      out.push(`<g transform="translate(${x} ${cy - CHIP_H / 2})"><rect width="${w}" height="${CHIP_H}" rx="8" fill="${t.chip}" stroke="${t.chipBorder}"/><path transform="translate(12 8) scale(0.75)" d="${pathOf(slug)}" fill="${t.icon}"/><text x="38" y="22" class="l">${label}</text></g>`);
      x += w + 10;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="Tech I use. ${ROWS.map(([g, items]) => `${g}: ${items.map(([, l]) => l).join(", ")}.`).join(" ")}">
<style>.g{font:500 13px ${mono};letter-spacing:.08em;fill:${t.muted}}.l{font:500 15px ${sans};fill:${t.label}}</style>
<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10" fill="${t.card}" stroke="${t.border}"/>
${out.join("\n")}
</svg>`;
  writeFileSync(join(outDir, `stack-${name}.svg`), svg);
  console.log("wrote stack", name, (svg.length / 1024).toFixed(1) + " KB");
}
