// One palette for every README image, matched to GitHub's own light and dark canvas.
export const PALETTE = {
  dark: { card: "#0d1117", border: "#30363d", chip: "#151b23", chipBorder: "#262c36", rule: "#21262d", grid: "#30363d", strong: "#e6edf3", text: "#9198a1", muted: "#656c76", icon: "#c9d1d9", accent: "#7aa2f7", green: "#3fb950" },
  light: { card: "#ffffff", border: "#d1d9e0", chip: "#f6f8fa", chipBorder: "#d1d9e0", rule: "#eaeef2", grid: "#d1d9e0", strong: "#1f2328", text: "#59636e", muted: "#818b98", icon: "#1f2328", accent: "#2f5bd3", green: "#1a7f37" },
};

// Overrides for the Anatomy kit's tokens, so isometric figures sit on the same canvas.
export const ISO_TOKENS = {
  dark: `--anatomy-card:#0d1117;--anatomy-paper:#0d1117;--anatomy-page:#0d1117;--anatomy-face:#18202c;--anatomy-top:#151b24;--anatomy-lit-top:#1f2a3b;--anatomy-lit-shade:#172131;--anatomy-shade-0:#0a0e14;--anatomy-shade-1:#0d1219;--anatomy-shade-2:#10161e;--anatomy-shade-3:#131a23;--anatomy-lit:#7aa2f7;--anatomy-green:#3fb950;--anatomy-hi:#c9d1d9;--anatomy-mid:#5d6b7c;--anatomy-lo:#38424f;--anatomy-faint:#232b36;--anatomy-dot:#c9d1d9;--anatomy-halo:#010409;--anatomy-text:#9198a1;--anatomy-muted:#656c76;`,
  light: `--anatomy-card:#ffffff;--anatomy-paper:#ffffff;--anatomy-page:#ffffff;--anatomy-lit:#2f5bd3;--anatomy-green:#1a7f37;--anatomy-text:#59636e;--anatomy-muted:#818b98;`,
};

export const SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;
export const MONO = `ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace`;

export const escapeXml = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The thin-bordered card every image sits in.
export const cardRect = (width, height, t) => `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${t.card}" stroke="${t.border}"/>`;

// Fig-style corner labels: [top-left, top-right, bottom-left, bottom-right]; the right-hand ones are brighter.
export const corners = (width, height, t, [tl, tr, bl, br]) =>
  [[18, 26, "start", tl, t.muted], [width - 18, 26, "end", tr, t.text], [18, height - 16, "start", bl, t.muted], [width - 18, height - 16, "end", br, t.text]]
    .filter(([, , , text]) => text)
    .map(([x, y, anchor, text, fill]) => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="font:400 12.5px ${MONO};letter-spacing:.04em">${escapeXml(text)}</text>`)
    .join("");
