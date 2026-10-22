// Fig 1 for the profile README: how Better-learn grades a push.
// A bench test stand. Pushed commits wait as punched cards in a magazine (the job queue),
// one rides a carriage into a closed test cage (the isolated E2B sandbox), three probes read
// it (the test runner, 3 tests), a dial reads the score, and a flag on the far post shows the
// GitHub check. Usage: node .github/readme/fig1.mjs .github/readme <outDir>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [kitDir, outDir] = process.argv.slice(2);
const k = await import(pathToFileURL(join(kitDir, "kit/iso-kit.mjs")).href);
mkdirSync(outDir, { recursive: true });

// Truth: the numbers the figure shows, from better-learn.tech's own demo run.
const MODEL = { tests: 3, passed: 3, runtime: "1m 42s" };
const score = MODEL.passed / MODEL.tests;

const WIDTH = 760;
const HEIGHT = 380;

const PLATE = { x: -160, y: -58, w: 312, d: 116, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// Queue: card magazine.
const MAG = { x: -150, y: -26, w: 52, d: 52, r: 3 };
const CARD_W = 34;
const CARD_D = 32;
const STACK = 5;
const CARD_H = 1.6;

// Rails and carriage.
const RAILS = [-13, 9];
const RAIL_FROM = -98;
const RAIL_TO = 66;
const CAR = { x: -20, y: -19, w: 40, d: 38, r: 3 };
const CAR_Z = 3;
const CAR_TOP = 8;
const CARD = { x: -17, y: -16, w: CARD_W, d: CARD_D, r: 1.5 };
const CARD_TOP = CAR_TOP + CARD_H;

// Sandbox cage.
const POST_R = 2.4;
const POSTS = [[-33, -29], [33, -29], [-33, 29], [33, 29]];
const FRAME_Z = 64;
const FRAME_H = 5;
const BRIDGE = { x: -37, y: -4, w: 74, d: 8, r: 1.5 };
const BRIDGE_Z = FRAME_Z + FRAME_H;
const BRIDGE_H = 4;
const PROBES = [-11, 0, 11];

// Score dial.
const DIAL = [88, -8];
const DIAL_R = 17;
const DIAL_Z = 41;
const DIAL_H = 8;
const DIAL_TOP = DIAL_Z + DIAL_H;
const SWEEP_FROM = -Math.PI * 0.75;
const SWEEP = Math.PI * 1.5;

// GitHub check flag.
const FLAG = [128, 26];
const FLAG_TOP = 64;

function build(theme) {
  const P = k.fitProjection(
    [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, BRIDGE_Z + BRIDGE_H + 4], [FLAG[0], FLAG[1], FLAG_TOP + 2]],
    WIDTH,
    HEIGHT,
    { pad: 46, headroom: 26, azimuth: 57 },
  );
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const slab = (plan, z, h, steps = 3, bevel = 0.5) => k.slabOf(plan, z, h, P, steps, bevel);

  function base() {
    const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
    for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
      out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
      out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
    }
    out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
    out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
    const screws = k.corners(PLATE, 10);
    out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
    out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    // Ruler along the front edge, under the carriage's travel.
    const strip = { x: -92, y: PLATE.y + PLATE.d - 16, w: 200, d: 7, r: 1 };
    out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
    const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
    out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
    out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
    // Label plate, front left.
    const label = { x: -150, y: PLATE.y + PLATE.d - 24, w: 44, d: 15, r: 1.5 };
    out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
    out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 3), { tone: "faint" }));
    [[30, 4.6], [22, 7.6], [26, 10.6]].forEach(([w, y]) => out.push(L(k.lineOnTop([label.x + 6, label.y + y], [label.x + 6 + w, label.y + y], 0.8, P), { tone: "lo", free: true })));
    out.push(D([at([label.x + 3, label.y + label.d / 2, 0.8]), at([label.x + label.w - 3, label.y + label.d / 2, 0.8])], { size: 0.45 }));
    return out.join("");
  }

  function card(plan, z, { lit = false, holes = false } = {}) {
    const out = [S(slab(plan, z, CARD_H, 3, 0.3), { tone: "hi", crease: "lo", lit })];
    // The corner cut every punched card has, as a faint line across the top.
    out.push(L(k.lineOnTop([plan.x + plan.w - 5, plan.y], [plan.x + plan.w, plan.y + 5], z + CARD_H, P), { tone: "faint" }));
    if (holes) {
      const rows = [[0, 1, 1, 0, 1, 0, 1, 1], [1, 0, 1, 1, 0, 1, 0, 0], [0, 1, 0, 1, 1, 0, 1, 0], [1, 1, 0, 0, 1, 1, 0, 1]];
      const pts = [];
      rows.forEach((row, r) => row.forEach((on, c) => on && pts.push(at([plan.x + 5 + c * 3.4, plan.y + 7 + r * 5.4, z + CARD_H]))));
      out.push(D(pts, { size: 0.7, tone: "mid" }));
    }
    return out.join("");
  }

  function magazine() {
    const out = [`<path class="iso-halo" d="${k.haloOf(MAG, 0, 4, P)}" style="filter:blur(5px)"/>`];
    out.push(S(slab(MAG, 0, 4, 5, 0.6), { tone: "mid" }));
    out.push(D(k.corners(MAG, 3.5).map(([x, y]) => at([x, y, 4])), { size: 0.45 }));
    // Far cheek and back wall: the tall backdrop of the magazine.
    out.push(S(slab({ x: MAG.x, y: MAG.y, w: 5, d: MAG.d, r: 1.2 }, 4, 40), { tone: "mid" }));
    out.push(S(slab({ x: MAG.x + 5, y: MAG.y, w: 44, d: 5, r: 1.2 }, 4, 40), { tone: "mid", inner: L(k.sideSeam({ x: MAG.x + 5, y: MAG.y, w: 44, d: 5, r: 1.2 }, 24, P, 3), { tone: "faint" }) }));
    // The stack of queued cards, each resting on the one below.
    const plan = { x: MAG.x + 8, y: -17, w: CARD_W, d: CARD_D + 2, r: 1.5 };
    for (let i = 0; i < STACK; i++) out.push(card(plan, 4 + i * CARD_H, { holes: i === STACK - 1 }));
    // Follower weight with a knurled knob, pressing the stack down.
    const follower = { x: plan.x + 3, y: plan.y + 3, w: plan.w - 6, d: plan.d - 6, r: 2 };
    const fz = 4 + STACK * CARD_H;
    out.push(S(slab(follower, fz, 3, 4, 0.5), { tone: "mid" }));
    const knob = [follower.x + follower.w / 2, follower.y + follower.d / 2];
    out.push(S(k.cylinder(knob[0], knob[1], 2, fz + 3, 8, P, 18), { tone: "mid", crease: "none" }));
    out.push(S(k.cylinder(knob[0], knob[1], 5, fz + 11, 4, P, 32), { tone: "mid" }));
    out.push(L(k.knurl(knob[0], knob[1], 5, fz + 11, fz + 15, 32, P), { tone: "lo" }));
    out.push(D([at([knob[0], knob[1], fz + 15])], { size: 0.5, tone: "hi" }));
    // Near side: two posts and a top rail, so the stack stays in view.
    for (const x of [MAG.x + 8, MAG.x + MAG.w - 6]) out.push(S(k.cylinder(x, MAG.y + MAG.d - 3, 2, 4, 40, P, 18), { tone: "mid", crease: "none" }));
    out.push(S(slab({ x: MAG.x + 5, y: MAG.y + MAG.d - 5, w: MAG.w - 8, d: 5, r: 1.2 }, 40, 4), { tone: "mid" }));
    out.push(S(slab({ x: MAG.x + MAG.w - 8, y: MAG.y + 5, w: 5, d: MAG.d - 10, r: 1.2 }, 36, 8), { tone: "mid" }));
    out.push(D([at([MAG.x + 10, MAG.y + MAG.d - 2.5, 44]), at([MAG.x + MAG.w - 8, MAG.y + MAG.d - 2.5, 44])], { size: 0.45 }));
    return out.join("");
  }

  function rails() {
    const out = [];
    for (const y of RAILS) {
      out.push(S(slab({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 4, r: 1 }, 0, 3, 3, 0.4), { tone: "mid" }));
      out.push(D([RAIL_FROM + 4, -60, 50, RAIL_TO - 4].map((x) => at([x, y + 2, 3])), { size: 0.4 }));
    }
    out.push(S(slab({ x: RAIL_TO, y: -18, w: 5, d: 36, r: 1.2 }, 0, 7, 3, 0.5), { tone: "mid" }));
    out.push(D([at([RAIL_TO + 2.5, -13, 7]), at([RAIL_TO + 2.5, 13, 7])], { size: 0.45 }));
    return out.join("");
  }

  function carriage() {
    const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 3), CAR_Z, 0.1, P)}" style="filter:blur(4px)"/>`];
    out.push(S(slab(CAR, CAR_Z, CAR_TOP - CAR_Z, 5, 0.6), { tone: "mid" }));
    out.push(D([-14, -5, 5, 14].map((x) => at([x, CAR.y + CAR.d - 2.4, CAR_TOP])), { size: 0.4, tone: "lo" }));
    // Two clamp tabs hold the card's back edge.
    for (const y of [CARD.y - 1, CARD.y + CARD.d - 4]) out.push(S(slab({ x: CARD.x - 2.5, y, w: 5, d: 5, r: 1 }, CAR_TOP, 3.4, 2, 0.4), { tone: "mid" }));
    out.push(card(CARD, CAR_TOP, { lit: true, holes: true }));
    return out.join("");
  }

  const postOf = ([x, y]) => S(k.cylinder(x, y, 4, 0, 3, P, 24), { tone: "lo" }) + S(k.cylinder(x, y, POST_R, 3, FRAME_Z - 3, P, 20), { tone: "mid", crease: "none" }) + L(k.sideArc(x, y, POST_R, 32, P, 12), { tone: "faint" });

  function cageBack() {
    const out = [postOf(POSTS[0]), postOf(POSTS[1])];
    // Back panel between the back posts.
    const panel = { x: -31, y: -30.2, w: 62, d: 2, r: 0.6 };
    out.push(S(slab(panel, 3, 54, 2, 0.3), { tone: "mid", inner: [20, 38].map((z) => L(k.sideSeam(panel, z, P, 2), { tone: "faint" })).join("") }));
    // The gate the card came in through, shut behind it.
    const gate = { x: -34.6, y: -26.6, w: 2, d: 53.2, r: 0.6 };
    out.push(S(slab(gate, 13, 44, 2, 0.3), { tone: "mid", inner: L(k.sideSeam(gate, 35, P, 2), { tone: "faint" }) }));
    out.push(S(slab({ x: -32.6, y: -6, w: 2.2, d: 12, r: 0.8 }, 30, 3, 2, 0.3), { tone: "mid" }));
    out.push(D([at([-32.6, -26, 15]), at([-32.6, 26, 15])].map(([x, y]) => [x, y]), { size: 0.45 }));
    out.push(postOf(POSTS[2]));
    // Back and left top bars.
    out.push(S(slab({ x: -37, y: -33, w: 74, d: 8, r: 2 }, FRAME_Z, FRAME_H), { tone: "mid" }));
    out.push(S(slab({ x: -37, y: -25, w: 8, d: 50, r: 2 }, FRAME_Z, FRAME_H), { tone: "mid" }));
    return out.join("");
  }

  function probes() {
    const out = [];
    for (const x of PROBES) {
      out.push(S(k.cylinder(x, 0, 1.4, CARD_TOP, 2.4, P, 16), { tone: "hi" }));
      out.push(S(k.cylinder(x, 0, 0.9, CARD_TOP + 2.4, 38, P, 12), { tone: "mid", crease: "none" }));
      out.push(S(k.cylinder(x, 0, 3.8, 50, 2, P, 24), { tone: "mid" }));
      out.push(S(k.cylinder(x, 0, 3.2, 52, BRIDGE_Z - 52, P, 24), { tone: "mid", crease: "none" }));
      out.push(L(k.sideArc(x, 0, 3.2, 60, P, 14), { tone: "faint" }));
    }
    return out.join("");
  }

  function cageTop() {
    const out = [];
    out.push(S(slab({ x: 29, y: -25, w: 8, d: 50, r: 2 }, FRAME_Z, FRAME_H), { tone: "mid" }));
    out.push(S(slab(BRIDGE, BRIDGE_Z, BRIDGE_H, 3, 0.5), { tone: "mid" }));
    out.push(D([at([BRIDGE.x + 3.5, 0, BRIDGE_Z + BRIDGE_H]), at([BRIDGE.x + BRIDGE.w - 3.5, 0, BRIDGE_Z + BRIDGE_H])], { size: 0.45 }));
    // A test lamp over each probe, blinking in turn as each test runs.
    PROBES.forEach((x) => {
      out.push(S(k.cylinder(x, 0, 2.6, BRIDGE_Z + BRIDGE_H, 1.6, P, 20), { tone: "mid" }));
      out.push(S(k.cylinder(x, 0, 1.8, BRIDGE_Z + BRIDGE_H + 1.6, 1.6, P, 18), { tone: "hi", crease: "lo" }));
    });
    const lamps = PROBES.map((x) => at([x, 0, BRIDGE_Z + BRIDGE_H + 3.2]));
    out.push(`<g class="iso-dots bl-lamp">${lamps.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" data-pulse="" style="--pulse-at:${i * 260}ms"/>`).join("")}</g>`);
    // Terminal block at the bridge's right end, where the result cable leaves.
    out.push(S(slab({ x: BRIDGE.x + BRIDGE.w, y: -3, w: 4, d: 6, r: 1 }, BRIDGE_Z, 4, 2, 0.4), { tone: "mid" }));
    out.push(D(k.corners(k.insetPlan({ x: -37, y: -33, w: 74, d: 66, r: 2 }, 0), 3.8).map(([x, y]) => at([x, y, FRAME_Z + FRAME_H])), { size: 0.45 }));
    return out.join("");
  }

  function cageFront() {
    return postOf(POSTS[3]) + S(slab({ x: -37, y: 25, w: 74, d: 8, r: 2 }, FRAME_Z, FRAME_H), { tone: "mid" });
  }

  function dial() {
    const out = [];
    const [x, y] = DIAL;
    const foot = { x: x - 10, y: y - 10, w: 20, d: 20, r: 2.5 };
    out.push(`<path class="iso-halo" d="${k.haloOf(foot, 0, 5, P)}" style="filter:blur(4px)"/>`);
    out.push(S(slab(foot, 0, 5, 4, 0.6), { tone: "mid" }));
    out.push(D(k.corners(foot, 3).map(([px, py]) => at([px, py, 5])), { size: 0.45 }));
    out.push(S(k.cylinder(x, y, 3, 5, DIAL_Z - 5, P, 20), { tone: "mid", crease: "none" }));
    out.push(L(k.sideArc(x, y, 3, 20, P, 12), { tone: "faint" }));
    out.push(S(k.cylinder(x, y, 4.2, DIAL_Z - 3, 3, P, 24), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
    out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 84, P, 0.3), { tone: "lo" }));
    out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3.4, P, 40), { tone: "faint" }));
    out.push(L(k.ring(x, y, DIAL_R - 2.2, DIAL_TOP, P, 64), { tone: "lo" }));
    const ticks = k.radialTicks(x, y, DIAL_R - 3, 30, 10, DIAL_TOP, [1.3, 2.8], P, SWEEP_FROM, SWEEP);
    out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
    // Crown on the near side.
    out.push(S(slab({ x: x - 2.4, y: y + DIAL_R - 1, w: 4.8, d: 5, r: 1.2 }, DIAL_Z + 2, 4, 3), { tone: "mid" }));
    out.push(S(slab({ x: x - 3.2, y: y + DIAL_R + 3.6, w: 6.4, d: 2.6, r: 1.2 }, DIAL_Z + 1.2, 5.6, 3), { tone: "mid" }));
    out.push(L(k.ring(x, y, 1.6, DIAL_TOP, P, 16), { tone: "mid" }));
    const angle = SWEEP_FROM + SWEEP * score;
    out.push(`<path class="iso-line" data-tone="lit" data-free="start" d="${k.lineOnTop([x - Math.sin(angle) * 3.4, y + Math.cos(angle) * 3.4], [x + Math.sin(angle) * (DIAL_R - 4), y - Math.cos(angle) * (DIAL_R - 4)], DIAL_TOP + 0.2, P)}" style="stroke-width:1.1"/>`);
    return out.join("");
  }

  function cables() {
    // Result cable: from the bridge's terminal block down to the dial's rim.
    const from = at([BRIDGE.x + BRIDGE.w + 4, 0, BRIDGE_Z + 2]);
    const to = at([DIAL[0] - DIAL_R + 4, DIAL[1] - 6, DIAL_TOP]);
    const mid = at([60, -4, BRIDGE_Z - 6]);
    const upper = k.wireSvg(from, to, { via: [mid], tone: "mid", flow: true, size: 1.1 });
    return upper;
  }

  function floorCable() {
    // Check cable: along the floor from the dial's foot to the flag post.
    const pts = [[DIAL[0] + 10, DIAL[1] + 4, 2.5], [DIAL[0] + 14, DIAL[1] + 4, 0.3], [DIAL[0] + 24, DIAL[1] + 4, 0.3], [DIAL[0] + 30, FLAG[1] - 6, 0.3], [FLAG[0] - 5, FLAG[1], 1.5]].map(at);
    return k.wireSvg(pts[0], pts[pts.length - 1], { via: pts.slice(1, -1), tone: "mid", flow: true, size: 1.1 });
  }

  function flag() {
    const out = [];
    const [x, y] = FLAG;
    out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 7, y: y - 7, w: 14, d: 14, r: 7 }, 0, 3, P)}" style="filter:blur(4px)"/>`);
    out.push(S(k.cylinder(x, y, 7, 0, 3, P, 32, 0.5), { tone: "mid" }));
    out.push(D([0, 1, 2, 3].map((i) => { const a = Math.PI / 4 + (i * Math.PI) / 2; return at([x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3]); }), { size: 0.45 }));
    out.push(S(k.cylinder(x, y, 2.8, 3, 3, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 1.4, 6, FLAG_TOP - 6, P, 16), { tone: "mid", crease: "none" }));
    // The flag hangs off the post on two rings.
    const plate = { x: x + 2.2, y: y - 0.6, w: 26, d: 1.2, r: 0.4 };
    for (const z of [FLAG_TOP - 3, FLAG_TOP - 15]) out.push(S(k.cylinder(x, y, 2, z, 1.6, P, 16), { tone: "mid" }));
    out.push(S(slab(plate, FLAG_TOP - 17, 15, 2, 0.3), { tone: "hi", crease: "lo" }));
    // The check: two strokes printed on the flag's face.
    const fy = plate.y + plate.d;
    const tick = [[x + 10, fy, FLAG_TOP - 9.5], [x + 13.5, fy, FLAG_TOP - 13], [x + 21, fy, FLAG_TOP - 5]].map(at);
    out.push(`<path class="iso-line" data-tone="green" data-free="" d="M${tick.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join("L")}" style="stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round"/>`);
    out.push(S(k.cylinder(x, y, 2.2, FLAG_TOP, 1.8, P, 18), { tone: "mid" }));
    return out.join("");
  }

  const body = [base(), magazine(), rails(), cageBack(), carriage(), probes(), cageTop(), cageFront(), dial(), cables(), floorCable(), flag()].join("");
  return { P, body };
}

const LABEL = `A test stand on a bench plate. Pushed commits wait as punched cards in a magazine on the left. One card has ridden a carriage along two rails into a closed test cage, where three probes rest on it and a lamp over each blinks as its test runs. A cable carries the result to a dial reading ${MODEL.passed} of ${MODEL.tests}, and a second cable runs along the floor to a flag post whose flag shows a green check.`;

const README_TOKENS = {
  dark: `--anatomy-card:#0d1117;--anatomy-paper:#0d1117;--anatomy-page:#0d1117;--anatomy-face:#18202c;--anatomy-top:#151b24;--anatomy-lit-top:#1f2a3b;--anatomy-lit-shade:#172131;--anatomy-shade-0:#0a0e14;--anatomy-shade-1:#0d1219;--anatomy-shade-2:#10161e;--anatomy-shade-3:#131a23;--anatomy-lit:#7aa2f7;--anatomy-green:#3fb950;--anatomy-hi:#c9d1d9;--anatomy-mid:#5d6b7c;--anatomy-lo:#38424f;--anatomy-faint:#232b36;--anatomy-dot:#c9d1d9;--anatomy-halo:#010409;`,
  light: `--anatomy-card:#ffffff;--anatomy-paper:#ffffff;--anatomy-page:#ffffff;--anatomy-lit:#2f5bd3;--anatomy-green:#1a7f37;`,
};
const EXTRA_CSS = `.bl-lamp circle{fill:var(--anatomy-green);opacity:.18}.bl-card{fill:var(--anatomy-card);stroke:var(--anatomy-faint);stroke-width:1}.bl-corner{font-family:var(--anatomy-mono);font-size:12.5px;letter-spacing:.04em;fill:var(--anatomy-muted)}.bl-corner[data-strong]{fill:var(--anatomy-text)}`;

for (const theme of ["dark", "light"]) {
  const { body } = build(theme);
  const corners = [
    [18, 26, "start", "Fig 1", false],
    [WIDTH - 18, 26, "end", "How Better-learn grades a push", true],
    [18, HEIGHT - 16, "start", "queue · sandbox · tests · check", false],
    [WIDTH - 18, HEIGHT - 16, "end", `${MODEL.passed} / ${MODEL.tests} passed · ${MODEL.runtime}`, true],
  ].map(([x, y, anchor, text, strong]) => `<text class="bl-corner"${strong ? ' data-strong=""' : ""} x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso" data-theme="${theme}" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${LABEL}"><style>${k.ISO_CSS}.iso[data-theme="${theme}"]{${README_TOKENS[theme]}}${EXTRA_CSS}</style><rect class="bl-card" x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="10"/>${corners}${body}</svg>`;
  writeFileSync(join(outDir, `better-learn-fig-${theme}.svg`), svg);
  // A plain page around the same SVG, for the line check and screenshots.
  writeFileSync(join(outDir, `fig-${theme}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:24px;background:${theme === "dark" ? "#0d1117" : "#fff"}}.iso-plate{width:${WIDTH}px}</style></head><body class="iso" data-theme="${theme}"><div class="iso-plate">${svg}</div></body></html>`);
  console.log("wrote", theme, (svg.length / 1024).toFixed(1) + " KB");
}
