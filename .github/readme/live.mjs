// Daily README art: Fig 2 (a year of contributions as an isometric bench) and the stats card.
// The workflow in .github/workflows/readme-art.yml runs this every day.
// Usage: GITHUB_TOKEN=... node .github/readme/live.mjs <outDir> [--login name] [--save data.json | --data data.json]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as k from "./kit/iso-kit.mjs";
import { ISO_TOKENS, MONO, PALETTE, SANS, cardRect, corners, escapeXml } from "./theme.mjs";

const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const outDir = argv[0];
const login = flag("--login") || process.env.LOGIN || "Blazeiscoding";
mkdirSync(outDir, { recursive: true });

const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions totalIssueContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount weekday } } }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
    }
  }
}`;

async function fetchData() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { authorization: `bearer ${token}`, "content-type": "application/json", "user-agent": "readme-art" },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  const json = await response.json();
  if (!response.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data.user;
}

const user = flag("--data") ? JSON.parse(readFileSync(flag("--data"), "utf8")) : await fetchData();
if (flag("--save")) writeFileSync(flag("--save"), JSON.stringify(user));

// ---- The model: everything both images show comes from here.
const collection = user.contributionsCollection;
const weeks = collection.contributionCalendar.weeks.map((week) => week.contributionDays);
const days = weeks.flat();
const counts = days.map((day) => day.contributionCount);
const busiest = days.reduce((best, day) => (day.contributionCount > best.contributionCount ? day : best), days[0]);
const MAX = Math.max(1, busiest.contributionCount);

function streaks() {
  let longest = 0;
  let run = 0;
  for (const count of counts) {
    run = count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // Today may have no contributions yet; a streak that ran through yesterday still counts.
  let current = 0;
  let index = counts.length - 1;
  if (counts[index] === 0) index--;
  while (index >= 0 && counts[index] > 0) {
    current++;
    index--;
  }
  return { longest, current };
}

function languages() {
  const bytes = new Map();
  for (const repo of user.repositories.nodes)
    for (const { size, node } of repo.languages.edges) {
      const entry = bytes.get(node.name) || { size: 0, color: node.color || "#8b949e" };
      entry.size += size;
      bytes.set(node.name, entry);
    }
  const total = [...bytes.values()].reduce((sum, entry) => sum + entry.size, 0) || 1;
  const sorted = [...bytes.entries()].sort((a, b) => b[1].size - a[1].size);
  const top = sorted.slice(0, 6).map(([name, entry]) => ({ name, color: entry.color, share: entry.size / total }));
  const rest = 1 - top.reduce((sum, entry) => sum + entry.share, 0);
  if (rest > 0.0005) top.push({ name: "Other", color: "#6e7681", share: rest });
  return top;
}

const MODEL = {
  total: collection.contributionCalendar.totalContributions,
  commits: collection.totalCommitContributions,
  pulls: collection.totalPullRequestContributions,
  reviews: collection.totalPullRequestReviewContributions,
  stars: user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0),
  repos: user.repositories.totalCount,
  ...streaks(),
  languages: languages(),
  from: days[0].date,
  to: days[days.length - 1].date,
  busiest,
};

const fmt = (n) => n.toLocaleString("en-US");
const dateOf = (iso, withYear = true) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });

// ---- Fig 2: one pillar per day on a bench plate, as tall as that day's contributions.
const W2 = 1000;
const H2 = 360;
const PITCH = 7.6;
const CELL = 6;
const X0 = -(weeks.length * PITCH) / 2;
const Y0 = -(7 * PITCH) / 2;
const GRID = { x: X0 - 4, y: Y0 - 4, w: weeks.length * PITCH - PITCH + CELL + 8, d: 7 * PITCH - PITCH + CELL + 8, r: 2 };
const PLATE = { x: GRID.x - 16, y: GRID.y - 14, w: GRID.w + 32, d: GRID.d + 44, r: 8 };
const PLATE_H = 10;
const FOOT_H = 4;
const TRAY_H = 1.4;
const TALL = 44;
const heightOf = (count) => (count === 0 ? 0.6 : 2.4 + TALL * Math.sqrt(count / MAX));

function fig2(theme) {
  const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, TALL + 4]], W2, H2, { pad: 52, headroom: 26, azimuth: 78, elevation: 36 });
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 20).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 6.4, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // The tray the days stand in, with a groove round it.
  out.push(S(k.slabOf(GRID, 0, TRAY_H, P, 4, 0.5), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(GRID, 1.6), TRAY_H, P, 3), { tone: "faint" }));
  // A ruler along the front: a tick per week, a long one where a month begins.
  const strip = { x: X0 - 2, y: GRID.y + GRID.d + 6, w: GRID.w - 4, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const minor = [];
  const major = [];
  weeks.forEach((week, w) => {
    const x = X0 + w * PITCH + CELL / 2;
    const starts = week.some((day) => day.date.endsWith("-01"));
    (starts ? major : minor).push(k.lineOnTop([x, strip.y + 0.8], [x, strip.y + 0.8 + (starts ? 3.8 : 2)], 0.6, P));
  });
  out.push(L(minor.join(""), { tone: "lo" }), L(major.join(""), { tone: "mid" }));
  out.push(D([at([strip.x + 1.6, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 1.6, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // Label plate at the front left.
  const label = { x: PLATE.x + 12, y: strip.y + 10, w: 40, d: 12, r: 1.4 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.5), 0.8, P, 3), { tone: "faint" }));
  [[26, 4], [18, 6.6], [22, 9.2]].forEach(([w, y]) => out.push(L(k.lineOnTop([label.x + 6, label.y + y - 0.6], [label.x + 6 + w, label.y + y - 0.6], 0.8, P), { tone: "lo", free: true })));
  // The days, painted back to front.
  const cells = [];
  weeks.forEach((week, w) => week.forEach((day) => cells.push({ day, plan: { x: X0 + w * PITCH, y: Y0 + day.weekday * PITCH, w: CELL, d: CELL, r: 0.5 } })));
  cells.sort((a, b) => k.depthOf([a.plan.x + CELL / 2, a.plan.y + CELL / 2, 0], P) - k.depthOf([b.plan.x + CELL / 2, b.plan.y + CELL / 2, 0], P));
  // Empty days are outlined cells on the tray; days with work are pillars.
  out.push(L(cells.filter(({ day }) => !day.contributionCount).map(({ plan }) => k.planOutline(plan, TRAY_H, P, 1)).join(""), { tone: "faint" }));
  for (const { day, plan } of cells) {
    const count = day.contributionCount;
    if (!count) continue;
    const paths = k.slabOf(plan, TRAY_H, heightOf(count), P, 1, 0);
    const lit = day === MODEL.busiest;
    const level = Math.sqrt(count / MAX);
    out.push(`<g>${S(paths, { tone: lit ? "hi" : "mid", crease: "none", lit })}<path d="${paths.top}" fill="var(--anatomy-lit)" fill-opacity="${(0.12 + 0.62 * level).toFixed(2)}"/></g>`);
  }
  const label2 = `A year of GitHub contributions drawn as ${days.length} pillars on a bench plate, one per day, each as tall as that day's count. ${fmt(MODEL.total)} contributions from ${dateOf(MODEL.from)} to ${dateOf(MODEL.to)}; the busiest day, ${dateOf(MODEL.busiest.date)}, had ${MODEL.busiest.contributionCount}.`;
  const t = PALETTE[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso" data-theme="${theme}" viewBox="0 0 ${W2} ${H2}" width="${W2}" height="${H2}" role="img" aria-label="${escapeXml(label2)}"><style>${k.ISO_CSS}.iso[data-theme="${theme}"]{${ISO_TOKENS[theme]}}</style>${cardRect(W2, H2, t)}${corners(W2, H2, t, ["Fig 2", "A year on GitHub, one pillar a day", `${dateOf(MODEL.from)} → ${dateOf(MODEL.to)}`, `busiest ${dateOf(MODEL.busiest.date, false)} · ${MODEL.busiest.contributionCount} contributions`])}${out.join("")}</svg>`;
}

// ---- The stats card.
const W3 = 1000;
const H3 = 232;

function stats(theme) {
  const t = PALETTE[theme];
  const tiles = [
    [fmt(MODEL.total), "contributions"],
    [fmt(MODEL.commits), "commits"],
    [fmt(MODEL.pulls), "pull requests"],
    [`${MODEL.current}d`, "current streak"],
    [`${MODEL.longest}d`, "longest streak"],
    [fmt(MODEL.stars), "stars earned"],
  ];
  const LEFT = 36;
  const GAP = 12;
  const TW = (W3 - LEFT * 2 - GAP * (tiles.length - 1)) / tiles.length;
  const out = [cardRect(W3, H3, t)];
  out.push(corners(W3, H3, t, ["Last 12 months", `updated ${dateOf(new Date().toISOString().slice(0, 10))}`]));
  tiles.forEach(([value, label], i) => {
    const x = LEFT + i * (TW + GAP);
    out.push(`<rect x="${x}" y="46" width="${TW}" height="84" rx="8" fill="${t.chip}" stroke="${t.chipBorder}"/>`);
    out.push(`<text x="${x + 16}" y="90" fill="${i === 3 ? t.accent : t.strong}" style="font:650 30px ${SANS};letter-spacing:-.01em">${escapeXml(value)}</text>`);
    out.push(`<text x="${x + 16}" y="114" fill="${t.muted}" style="font:400 12px ${MONO};letter-spacing:.06em">${escapeXml(label.toUpperCase())}</text>`);
  });
  // Languages across public repositories, by bytes.
  const BAR = { x: LEFT, y: 152, w: W3 - LEFT * 2, h: 10 };
  out.push(`<defs><clipPath id="bar"><rect x="${BAR.x}" y="${BAR.y}" width="${BAR.w}" height="${BAR.h}" rx="5"/></clipPath></defs><g clip-path="url(#bar)">`);
  let x = BAR.x;
  for (const language of MODEL.languages) {
    const w = language.share * BAR.w;
    out.push(`<rect x="${x.toFixed(1)}" y="${BAR.y}" width="${(w + 0.5).toFixed(1)}" height="${BAR.h}" fill="${language.color}"/>`);
    x += w;
  }
  out.push(`</g>`);
  let lx = BAR.x;
  for (const language of MODEL.languages) {
    const text = `${language.name} ${(language.share * 100).toFixed(language.share < 0.1 ? 1 : 0)}%`;
    out.push(`<circle cx="${lx + 5}" cy="${BAR.y + 37}" r="4.5" fill="${language.color}"/><text x="${lx + 16}" y="${BAR.y + 41.5}" fill="${t.text}" style="font:400 13px ${SANS}">${escapeXml(text)}</text>`);
    lx += 30 + text.length * 7.3;
  }
  const label3 = `GitHub stats for the last 12 months: ${tiles.map(([v, l]) => `${v} ${l}`).join(", ")}. Languages in public repositories: ${MODEL.languages.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(", ")}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W3} ${H3}" width="${W3}" height="${H3}" role="img" aria-label="${escapeXml(label3)}">${out.join("")}</svg>`;
}

for (const theme of ["dark", "light"]) {
  writeFileSync(join(outDir, `contributions-${theme}.svg`), fig2(theme));
  writeFileSync(join(outDir, `stats-${theme}.svg`), stats(theme));
}
console.log(`${fmt(MODEL.total)} contributions, streak ${MODEL.current}/${MODEL.longest}, busiest ${MODEL.busiest.date} (${MODEL.busiest.contributionCount}), ${MODEL.languages.length} languages`);
