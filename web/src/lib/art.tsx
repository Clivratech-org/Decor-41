/* Product illustration engine — ported from decor41-site-v5 prototype */

const D = "#0b0f1a";

const car = (c: string, s = 1, x = 0, y = 0) =>
  `<g transform="translate(${200 * (1 - s) + x} ${240 * (1 - s) + y}) scale(${s})"><path d="M52 252Q54 222 100 214L150 186Q200 162 252 184L296 208Q352 214 350 252Q350 262 340 262L62 262Q52 262 52 252Z" fill="${c}"/><path d="M160 192Q200 175 244 190L272 208L142 208Z" fill="#bfe3ff" opacity=".9"/><path d="M200 182V208M158 214V252" stroke="${c}" stroke-width="4" opacity=".8"/><path d="M60 240H340" stroke="#fff" stroke-opacity=".35" stroke-width="3"/><rect x="326" y="226" width="20" height="9" rx="4" fill="#fff6b0"/><rect x="54" y="226" width="14" height="9" rx="4" fill="#ff4d5e"/><g fill="#0d1020"><circle cx="118" cy="262" r="30"/><circle cx="288" cy="262" r="30"/></g><g fill="#aab4d6"><circle cx="118" cy="262" r="15"/><circle cx="288" cy="262" r="15"/></g><g fill="#0d1020"><circle cx="118" cy="262" r="5"/><circle cx="288" cy="262" r="5"/></g></g>`;

const petals = (n: number, cy: number, rx: number, ry: number, fill: string, off = 0, extra = "") =>
  Array.from({ length: n }, (_, k) =>
    `<ellipse cx="200" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra} transform="rotate(${(k * 360) / n + off} 200 200)"/>`,
  ).join("");

const ART: Record<number, (c: string, u: string, vi: number) => string> = {
  1: (c) =>
    `<circle cx="200" cy="200" r="150" fill="#ffffff08"/>${petals(12, 112, 15, 50, c)}${petals(12, 150, 7, 22, D, 15, 'opacity=".4"')}<circle cx="200" cy="200" r="62" fill="none" stroke="${c}" stroke-width="4"/>${Array.from({ length: 24 }, (_, k) => `<circle cx="${200 + 80 * Math.cos((k * Math.PI) / 12)}" cy="${200 + 80 * Math.sin((k * Math.PI) / 12)}" r="3.5" fill="${D}" opacity=".6"/>`).join("")}<circle cx="200" cy="200" r="30" fill="${c}"/><circle cx="200" cy="200" r="12" fill="${D}"/>`,
  2: (c) =>
    `<rect x="66" y="136" width="268" height="128" rx="16" fill="${c}" filter="url(#bl)" opacity=".55"/><rect x="70" y="140" width="260" height="120" rx="14" fill="${c}"/><rect x="70" y="140" width="260" height="120" rx="14" fill="none" stroke="#ffffff55" stroke-width="2"/><text x="200" y="204" text-anchor="middle" font-size="50" font-weight="800" fill="${D}" font-family="Sora,system-ui">Sharma</text><text x="200" y="238" text-anchor="middle" font-size="13" letter-spacing="5" fill="${D}" font-family="DM Sans,system-ui">FAMILY · EST 2024</text><g fill="${D}" opacity=".6"><circle cx="86" cy="156" r="4"/><circle cx="314" cy="156" r="4"/><circle cx="86" cy="244" r="4"/><circle cx="314" cy="244" r="4"/></g><path d="M170 140l30-28 30 28" fill="none" stroke="#ffffff55" stroke-width="2"/>`,
  3: (c, u) =>
    `<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#ffe2a8"/></linearGradient></defs><rect x="100" y="56" width="200" height="288" rx="4" fill="#f4efe6" stroke="#ffffff33"/><rect x="116" y="72" width="168" height="228" fill="url(#${u}s)"/><circle cx="200" cy="200" r="34" fill="#fff6cf"/><path d="M116 300L168 196L204 256L240 184L284 300Z" fill="#2d3a5e"/><path d="M116 300L152 248L200 300Z" fill="#1b2440"/><path d="M168 196l10 18-10-6-8 8z" fill="#e8ecff" opacity=".8"/><text x="200" y="324" text-anchor="middle" font-size="12" letter-spacing="6" fill="#2d3a5e" font-family="Sora,system-ui" font-weight="700">SUNRISE</text>`,
  4: (c, _u, vi) =>
    `<rect x="100" y="56" width="200" height="288" rx="4" fill="#f2e3c6" ${vi ? `stroke="#6b4423" stroke-width="10"` : ""}/><rect x="116" y="72" width="168" height="228" fill="#1c1f3a"/><circle cx="200" cy="230" r="64" fill="${c}"/><g fill="#1c1f3a"><rect x="130" y="206" width="140" height="5"/><rect x="130" y="218" width="140" height="7"/><rect x="130" y="232" width="140" height="9"/></g>${car("#ff3d5a", 0.42, 0, 26)}<rect x="116" y="258" width="168" height="42" fill="#1c1f3a"/><rect x="116" y="266" width="168" height="3" fill="${c}"/><text x="200" y="104" text-anchor="middle" font-size="21" font-weight="800" fill="${c}" font-family="Sora,system-ui" letter-spacing="2">GRAND PRIX</text><text x="200" y="124" text-anchor="middle" font-size="12" fill="#f2e3c6" letter-spacing="8" font-family="DM Sans">MONZA · 1974</text><text x="200" y="326" text-anchor="middle" font-size="11" letter-spacing="5" fill="#6b4423" font-family="Sora" font-weight="700">RETRO SERIES</text>`,
  5: (c, u, vi) =>
    `<defs><pattern id="${u}c" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${c}"/><path d="M0 0h4v4H0zM4 4h4v4H4z" fill="#ffffff22"/></pattern></defs><path d="M80 304V238Q84 200 128 190H272Q316 200 320 238V304Z" fill="#c9d2f0"/><path d="M132 198H268L290 236H110Z" fill="#1a2240"/><path d="M140 204H262" stroke="#ffffff55" stroke-width="3"/><rect x="92" y="246" width="40" height="16" rx="5" fill="#ff3d5a"/><rect x="268" y="246" width="40" height="16" rx="5" fill="#ff3d5a"/><rect x="168" y="262" width="64" height="24" rx="4" fill="#f4f4f4"/><text x="200" y="279" text-anchor="middle" font-size="12" font-weight="700" fill="#1a2240" font-family="Sora">TN 41</text><rect x="94" y="296" width="32" height="38" rx="6" fill="#0d1020"/><rect x="274" y="296" width="32" height="38" rx="6" fill="#0d1020"/><rect x="128" y="172" width="12" height="22" fill="#8b94b3"/><rect x="260" y="172" width="12" height="22" fill="#8b94b3"/><rect x="72" y="156" width="256" height="20" rx="8" fill="${vi === 1 ? `url(#${u}c)` : c}" stroke="#ffffff44"/><rect x="66" y="146" width="10" height="38" rx="3" fill="${c}"/><rect x="324" y="146" width="10" height="38" rx="3" fill="${c}"/><path d="M84 162H316" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`,
  6: (c) => {
    const ring = (n: number, off: number, rx: number, ry: number, col: string, rot: number) =>
      Array.from({ length: n }, (_, k) =>
        `<ellipse cx="200" cy="${238 - off}" rx="${rx}" ry="${ry}" fill="${col}" transform="rotate(${(k * 360) / n + rot} 200 238)"/>`,
      ).join("");
    return `<g transform="translate(200 238) scale(1 .82) translate(-200 -238)">${ring(9, 42, 17, 40, "#2b8f61", 0)}${ring(7, 30, 15, 32, "#3fbf81", 20)}${ring(5, 18, 12, 24, "#7be0a6", 10)}<circle cx="200" cy="238" r="8" fill="#b8f5d0"/></g><path d="M142 268H258L242 346H158Z" fill="${c}"/><rect x="136" y="258" width="128" height="20" rx="8" fill="${c}"/><rect x="136" y="258" width="128" height="20" rx="8" fill="#fff" opacity=".14"/><path d="M160 290L168 340" stroke="#fff" stroke-opacity=".18" stroke-width="6" stroke-linecap="round"/>`;
  },
  7: (c, u) =>
    `<defs><pattern id="${u}w" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M22 4L40 22L22 40L4 22Z" fill="none" stroke="${c}" stroke-width="2.5"/><path d="M22 14L30 22L22 30L14 22Z" fill="${c}" opacity=".55"/><circle cx="0" cy="0" r="4" fill="${c}"/><circle cx="44" cy="44" r="4" fill="${c}"/></pattern></defs><rect x="52" y="44" width="296" height="250" rx="10" fill="${c}" opacity=".16"/><rect x="52" y="44" width="296" height="250" rx="10" fill="url(#${u}w)"/><rect x="52" y="44" width="296" height="250" rx="10" fill="none" stroke="#ffffff22"/><ellipse cx="108" cy="338" rx="18" ry="24" fill="${c}" opacity=".7"/><rect x="108" y="314" width="180" height="48" fill="url(#${u}w)"/><rect x="108" y="314" width="180" height="48" fill="${c}" opacity=".22"/><ellipse cx="288" cy="338" rx="18" ry="24" fill="${c}"/><ellipse cx="288" cy="338" rx="8" ry="11" fill="${D}" opacity=".5"/>`,
  8: (c) =>
    `<polygon points="200,36 112,300 288,300" fill="#fff" opacity=".07"/><rect x="76" y="116" width="248" height="212" rx="16" fill="#ffffff08" stroke="#ffffff33" stroke-width="2"/><path d="M118 304L150 270H250L282 304Z" fill="${c}" opacity=".9"/>${car("#ff3d5a", 0.74, 0, -8)}<rect x="88" y="302" width="224" height="22" rx="8" fill="${c}" stroke="#ffffff44"/><path d="M96 128L130 128" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/><text x="200" y="318" text-anchor="middle" font-size="10" letter-spacing="4" fill="${D}" font-family="Sora" font-weight="700" opacity=".7">MODEL SHOWCASE</text>`,
  9: (c) =>
    `<ellipse cx="200" cy="304" rx="150" ry="14" fill="#000" opacity=".4"/>${car(c, 1.12, 0, 6)}<path d="M96 232Q200 214 304 232" stroke="#fff" stroke-opacity=".28" stroke-width="3" fill="none"/><g style="fill:var(--at)"><rect x="40" y="70" width="86" height="26" rx="13"/></g><text x="83" y="88" text-anchor="middle" font-size="13" font-weight="800" fill="${D}" font-family="Sora">DIECAST</text>`,
};

const BGS = [
  (u: string) =>
    `<defs><radialGradient id="${u}b" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2a3566"/><stop offset="1" stop-color="#0f1424"/></radialGradient></defs><rect width="400" height="400" fill="url(#${u}b)"/><ellipse cx="200" cy="352" rx="150" ry="12" fill="#000" opacity=".35"/>`,
  (u: string) =>
    `<defs><linearGradient id="${u}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a4d"/><stop offset="1" stop-color="#101a30"/></linearGradient></defs><rect width="400" height="400" fill="url(#${u}b)"/><g stroke="#ffffff0d" stroke-width="2">${Array.from({ length: 14 }, (_, k) => `<path d="M${k * 40 - 100} 400L${k * 40 + 100} 0"/>`).join("")}</g>`,
  (u: string) =>
    `<defs><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#352c52"/><stop offset="1" stop-color="#1c1733"/></linearGradient></defs><rect width="400" height="400" fill="url(#${u}b)"/><rect y="352" width="400" height="48" fill="#120f22"/><rect y="350" width="400" height="3" fill="#ffffff18"/><circle cx="352" cy="58" r="30" fill="#ffd98a" opacity=".16"/>`,
];

export function productArtSvg(
  artKey: number,
  color: string,
  variantIndex = 0,
  view = 0,
  label = "Product",
) {
  const u = `a${artKey}_${variantIndex}_${view}_${color.replace(/\W/g, "")}`;
  const fn = ART[artKey] || ART[1];
  let inner = fn(color, u, variantIndex);
  if (view === 1) inner = `<g transform="translate(200 200) scale(1.45) translate(-200 -205)">${inner}</g>`;
  if (view === 2) inner = `<g transform="translate(200 188) scale(.86) translate(-200 -200)">${inner}</g>`;
  return `<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}"><defs><filter id="bl"><feGaussianBlur stdDeviation="12"/></filter></defs>${BGS[view % 3](u)}${inner}</svg>`;
}

export function ProductArt({
  artKey,
  color,
  variantIndex = 0,
  view = 0,
  label = "Product",
  className,
}: {
  artKey: number;
  color: string;
  variantIndex?: number;
  view?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%" }}
      dangerouslySetInnerHTML={{ __html: productArtSvg(artKey, color, variantIndex, view, label) }}
    />
  );
}

export function laserArtSvg() {
  let d = "";
  for (let k = 0; k <= 240; k++) {
    const a = (k / 240) * Math.PI * 2;
    const r = 96 + 26 * Math.sin(a * 8);
    d += (k ? "L" : "M") + (160 + r * Math.cos(a)).toFixed(1) + " " + (160 + r * Math.sin(a)).toFixed(1);
  }
  return `<svg viewBox="0 0 320 320" width="100%" style="max-width:340px" role="img" aria-label="Laser cutting a flower pattern"><circle cx="160" cy="160" r="140" fill="none" style="stroke:var(--ln)" stroke-dasharray="4 8"/><path d="${d}Z" fill="none" style="stroke:var(--ln)" stroke-width="3"/><path class="lp" pathLength="1" d="${d}Z"/><circle r="7" style="fill:var(--ink)"><animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.7;1" calcMode="linear" path="${d}Z"/></circle><circle r="16" style="fill:var(--sa)" opacity=".5"><animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.7;1" calcMode="linear" path="${d}Z"/></circle></svg>`;
}
