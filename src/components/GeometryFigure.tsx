import React from "react";

export type GeoKey = "A" | "B" | "C" | "D" | "E" | "F";

const STROKE = "#0f172a";
const FILL_DARK = "#0f172a";
const STROKE_LIGHT = "#00000020";

// ─── Helpers ───────────────────────────────────────────────────────────────

function rotatePoint(px: number, py: number, cx: number, cy: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

function pts(points: { x: number; y: number }[]) {
  return points.map(p => `${p.x},${p.y}`).join(" ");
}

// ─── CircleNeedle ──────────────────────────────────────────────────────────
// dotPos: top | right | bottom | left
// angleDeg: needle angle (0=right, 90=down)

interface CircleNeedleProps {
  cx: number;
  cy: number;
  r: number;
  angleDeg: number;
  dotPos: "top" | "right" | "bottom" | "left";
  strokeW: number;   // circle stroke
  needleW: number;   // needle stroke
  dotR: number;      // dot radius
}

function CircleNeedle({ cx, cy, r, angleDeg, dotPos, strokeW, needleW, dotR }: CircleNeedleProps) {
  const dotPositions = {
    top: { x: cx, y: cy - r + 12 },
    right: { x: cx + r - 12, y: cy },
    bottom: { x: cx, y: cy + r - 12 },
    left: { x: cx - r + 12, y: cy },
  };
  const dot = dotPositions[dotPos];
  const rad = (angleDeg * Math.PI) / 180;
  const nx = cx + Math.cos(rad) * (r - 16);
  const ny = cy + Math.sin(rad) * (r - 16);

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={STROKE} strokeWidth={strokeW} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={STROKE} strokeWidth={needleW} strokeLinecap="round" />
      <circle cx={dot.x} cy={dot.y} r={dotR} fill={FILL_DARK} />
    </g>
  );
}

// ─── TriangleXorSquare ─────────────────────────────────────────────────────
// bits: [top, right, bottom, left]

interface TriXorProps {
  x0: number;
  y0: number;
  size: number;
  bits: [number, number, number, number];
  strokeW: number;
}

function TriangleXorSquare({ x0, y0, size, bits, strokeW }: TriXorProps) {
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;
  const [top, right, bottom, left] = bits;

  const tris = [
    top    ? `${x0},${y0} ${x0 + size},${y0} ${cx},${cy}` : null,
    right  ? `${x0 + size},${y0} ${x0 + size},${y0 + size} ${cx},${cy}` : null,
    bottom ? `${x0 + size},${y0 + size} ${x0},${y0 + size} ${cx},${cy}` : null,
    left   ? `${x0},${y0 + size} ${x0},${y0} ${cx},${cy}` : null,
  ];

  return (
    <g>
      <rect x={x0} y={y0} width={size} height={size} rx={22} fill={FILL_DARK} />
      {tris.map((t, i) => t && (
        <polygon key={i} points={t} fill="white" />
      ))}
      <rect x={x0} y={y0} width={size} height={size} rx={22} fill="none" stroke={STROKE} strokeWidth={strokeW} />
    </g>
  );
}

// ─── ArrowTile ─────────────────────────────────────────────────────────────

type Dir = "up" | "right" | "down" | "left";

interface ArrowTileProps {
  x0: number;
  y0: number;
  size: number;
  rx: number;
  dir: Dir;
  strokeW: number;
}

function ArrowTile({ x0, y0, size, rx, dir, strokeW }: ArrowTileProps) {
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;

  const degMap: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 };
  const deg = degMap[dir];

  // Base triangle pointing up
  const p1 = { x: cx, y: y0 + 16 };
  const p2 = { x: x0 + size - 18, y: y0 + size - 18 };
  const p3 = { x: x0 + 18, y: y0 + size - 18 };

  const r1 = rotatePoint(p1.x, p1.y, cx, cy, deg);
  const r2 = rotatePoint(p2.x, p2.y, cx, cy, deg);
  const r3 = rotatePoint(p3.x, p3.y, cx, cy, deg);

  return (
    <g>
      <rect x={x0} y={y0} width={size} height={size} rx={rx} fill="white" stroke={STROKE} strokeWidth={strokeW} />
      <polygon points={pts([r1, r2, r3])} fill={FILL_DARK} />
    </g>
  );
}

// ─── CornerFillTile ────────────────────────────────────────────────────────

type Corner = "tl" | "tr" | "br" | "bl" | "none";

interface CornerFillTileProps {
  x0: number;
  y0: number;
  size: number;
  rx: number;
  corner: Corner;
  strokeW: number;
}

function CornerFillTile({ x0, y0, size, rx, corner, strokeW }: CornerFillTileProps) {
  const polyPoints: Record<string, string> = {
    tl: `${x0},${y0} ${x0 + size},${y0} ${x0},${y0 + size}`,
    tr: `${x0 + size},${y0} ${x0 + size},${y0 + size} ${x0},${y0}`,
    br: `${x0 + size},${y0 + size} ${x0},${y0 + size} ${x0 + size},${y0}`,
    bl: `${x0},${y0 + size} ${x0},${y0} ${x0 + size},${y0 + size}`,
  };

  return (
    <g>
      <rect x={x0} y={y0} width={size} height={size} rx={rx} fill="white" stroke={STROKE} strokeWidth={strokeW} />
      {corner !== "none" && (
        <polygon points={polyPoints[corner]} fill={FILL_DARK} opacity={0.95} />
      )}
    </g>
  );
}

// ─── Tile with dashed "?" ──────────────────────────────────────────────────

function QuestionTile({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="white"
        stroke="#94a3b8" strokeWidth={3} strokeDasharray="10 8" />
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle"
        fontSize={48} fontWeight={900} fill="#94a3b8">?</text>
    </g>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Q25 — CircleNeedle matrix
// ═══════════════════════════════════════════════════════════════════════════

type NeedleKind = "vertical" | "horiz" | "diag1" | "diag2";

const kindToAngle: Record<NeedleKind, number> = {
  vertical: 90,
  horiz: 0,
  diag1: 45,
  diag2: -45,
};

const Q25_MATRIX: (NeedleKind | "?")[][] = [
  ["vertical", "diag2", "horiz"],
  ["diag1", "vertical", "diag2"],
  ["horiz", "diag1", "?"],
];

const Q25_OPTIONS: Record<GeoKey, NeedleKind> = {
  A: "vertical",
  B: "horiz",
  C: "diag2",
  D: "diag1",
  E: "horiz",
  F: "diag2",
};

function Q25Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q25_MATRIX.map((row, r) =>
          row.map((cell, c) => {
            const x = c * 210, y = r * 175;
            const isQ = cell === "?";
            const ang = isQ ? 0 : kindToAngle[cell as NeedleKind];
            const scale = 0.78;
            const cx = x + TW / 2, cy = y + TH / 2;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={TW} height={TH} rx={18}
                  fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
                {isQ
                  ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                  : <CircleNeedle cx={cx} cy={cy} r={62 * scale}
                      angleDeg={ang} dotPos="top"
                      strokeW={5} needleW={10} dotR={9} />
                }
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

function Q25Option({ optionKey }: { optionKey: GeoKey }) {
  const kind = Q25_OPTIONS[optionKey];
  const ang = kindToAngle[kind];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <rect x={8} y={8} width={224} height={164} rx={18} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <CircleNeedle cx={120} cy={90} r={62 * 0.95} angleDeg={ang} dotPos="top"
        strokeW={4} needleW={7} dotR={8} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q26 — XOR triangle
// ═══════════════════════════════════════════════════════════════════════════

type Bits4 = [number, number, number, number];

function xorBits(a: Bits4, b: Bits4): Bits4 {
  return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
}

const R1A: Bits4 = [1, 0, 0, 0];
const R1B: Bits4 = [0, 0, 1, 0];
const R1C: Bits4 = xorBits(R1A, R1B);

const R2A: Bits4 = [0, 0, 0, 1];
const R2B: Bits4 = [0, 1, 0, 0];
const R2C: Bits4 = xorBits(R2A, R2B);

const R3A: Bits4 = [1, 0, 0, 1];
const R3B: Bits4 = [0, 1, 1, 0];
// R3C is the answer = [1,1,1,1]

const Q26_OPTIONS: Record<GeoKey, Bits4> = {
  A: [1, 0, 1, 0],
  B: [0, 0, 0, 0],
  C: [1, 0, 1, 0],
  D: [0, 1, 0, 1],
  E: [1, 1, 1, 1],
  F: [0, 0, 0, 0],
};

function SmallXorTile({ bits, x, y }: { bits: Bits4; x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width={160} height={105} rx={16} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <g transform="translate(12,0)">
        <TriangleXorSquare x0={10} y0={8} size={100} bits={bits} strokeW={3} />
      </g>
    </g>
  );
}

function XorRowLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fontSize={30} fontWeight={900} fill="#94a3b8"
      textAnchor="middle" dominantBaseline="middle">{text}</text>
  );
}

function Q26Main() {
  const rows = [
    { a: R1A, b: R1B, c: R1C },
    { a: R2A, b: R2B, c: R2C },
    { a: R3A, b: R3B, c: null },
  ];

  return (
    <svg viewBox="0 0 760 420" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(30,30)">
        {rows.map((row, idx) => {
          const y = idx * 125;
          return (
            <g key={idx}>
              <SmallXorTile bits={row.a} x={0} y={y} />
              <XorRowLabel x={185} y={y + 52} text="⊕" />
              <SmallXorTile bits={row.b} x={210} y={y} />
              <XorRowLabel x={395} y={y + 52} text="=" />
              {row.c !== null
                ? <SmallXorTile bits={row.c} x={420} y={y} />
                : (
                  <g transform={`translate(420,${y})`}>
                    <rect width={160} height={105} rx={16} fill="white"
                      stroke="#94a3b8" strokeWidth={3} strokeDasharray="10 8" />
                    <text x={80} y={62} textAnchor="middle" fontSize={46} fontWeight={900} fill="#94a3b8">?</text>
                  </g>
                )
              }
            </g>
          );
        })}

      </g>
    </svg>
  );
}

function Q26Option({ optionKey }: { optionKey: GeoKey }) {
  const bits = Q26_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <rect x={8} y={8} width={224} height={164} rx={18} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <g transform="translate(48,20)">
        <TriangleXorSquare x0={12} y0={8} size={120} bits={bits} strokeW={4} />
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q27 — Arrow matrix
// ═══════════════════════════════════════════════════════════════════════════

const Q27_MATRIX: (Dir | "?")[][] = [
  ["up", "right", "down"],
  ["left", "up", "right"],
  ["down", "left", "?"],
];

const Q27_OPTIONS: Record<GeoKey, Dir> = {
  A: "right",
  B: "down",
  C: "up",
  D: "left",
  E: "down",
  F: "right",
};

function Q27Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q27_MATRIX.map((row, r) =>
          row.map((cell, c) => {
            const x = c * 210, y = r * 175;
            const isQ = cell === "?";
            return (
              <g key={`${r}-${c}`}>
                {isQ
                  ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                  : <ArrowTile x0={x} y0={y} size={Math.min(TW, TH) - 10} rx={22}
                      dir={cell as Dir} strokeW={2} />
                }
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

function Q27Option({ optionKey }: { optionKey: GeoKey }) {
  const dir = Q27_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <ArrowTile x0={60} y0={22} size={120} rx={24} dir={dir} strokeW={2} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q28 — Corner fill matrix
// ═══════════════════════════════════════════════════════════════════════════

const Q28_MATRIX: (Corner | "?")[][] = [
  ["tl", "tr", "br"],
  ["bl", "tl", "tr"],
  ["br", "bl", "?"],
];

const Q28_OPTIONS: Record<GeoKey, Corner> = {
  A: "tr",
  B: "br",
  C: "bl",
  D: "tl",
  E: "none",
  F: "br",
};

function Q28Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q28_MATRIX.map((row, r) =>
          row.map((cell, c) => {
            const x = c * 210, y = r * 175;
            const isQ = cell === "?";
            return (
              <g key={`${r}-${c}`}>
                {isQ
                  ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                  : <CornerFillTile x0={x + 5} y0={y + 5}
                      size={Math.min(TW, TH) - 10} rx={22}
                      corner={cell as Corner} strokeW={2} />
                }
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

function Q28Option({ optionKey }: { optionKey: GeoKey }) {
  const corner = Q28_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <CornerFillTile x0={60} y0={22} size={120} rx={24} corner={corner} strokeW={2} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q29 — dotPos matrix (needle always horiz=0deg)
// ═══════════════════════════════════════════════════════════════════════════

const Q29_MATRIX: ("top" | "right" | "bottom" | "left" | "?")[][] = [
  ["top", "right", "bottom"],
  ["left", "top", "right"],
  ["bottom", "left", "?"],
];

const Q29_OPTIONS: Record<GeoKey, "top" | "right" | "bottom" | "left"> = {
  A: "left",
  B: "top",
  C: "right",
  D: "bottom",
  E: "right",
  F: "left",
};

function Q29Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q29_MATRIX.map((row, r) =>
          row.map((cell, c) => {
            const x = c * 210, y = r * 175;
            const isQ = cell === "?";
            const cx = x + TW / 2, cy = y + TH / 2;
            const scale = 0.78;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={TW} height={TH} rx={18}
                  fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
                {isQ
                  ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                  : <CircleNeedle cx={cx} cy={cy} r={62 * scale}
                      angleDeg={0} dotPos={cell as "top" | "right" | "bottom" | "left"}
                      strokeW={5} needleW={10} dotR={9} />
                }
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

function Q29Option({ optionKey }: { optionKey: GeoKey }) {
  const dotPos = Q29_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <rect x={8} y={8} width={224} height={164} rx={18} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <CircleNeedle cx={120} cy={90} r={62 * 0.95} angleDeg={0} dotPos={dotPos}
        strokeW={4} needleW={7} dotR={8} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q30 — needle angle matrix
// ═══════════════════════════════════════════════════════════════════════════

const Q30_MATRIX: (number | "?")[][] = [
  [0, 45, 90],
  [135, 180, 225],
  [270, 315, "?"],
];

const Q30_OPTIONS: Record<GeoKey, number> = {
  A: 90,
  B: 180,
  C: 225,
  D: 315,
  E: 135,
  F: 0,
};

function Q30Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q30_MATRIX.map((row, r) =>
          row.map((cell, c) => {
            const x = c * 210, y = r * 175;
            const isQ = cell === "?";
            const cx = x + TW / 2, cy = y + TH / 2;
            const scale = 0.78;
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={TW} height={TH} rx={18}
                  fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
                {isQ
                  ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                  : <CircleNeedle cx={cx} cy={cy} r={62 * scale}
                      angleDeg={cell as number} dotPos="top"
                      strokeW={5} needleW={10} dotR={9} />
                }
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

function Q30Option({ optionKey }: { optionKey: GeoKey }) {
  const ang = Q30_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <rect x={8} y={8} width={224} height={164} rx={18} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <CircleNeedle cx={120} cy={90} r={62 * 0.95} angleDeg={ang} dotPos="top"
        strokeW={4} needleW={7} dotR={8} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q31 — Symmetry (★ reflection)
// ═══════════════════════════════════════════════════════════════════════════

const Q31_OPTIONS: Record<GeoKey, "left" | "right"> = {
  A: "left",
  B: "right",
  C: "left",
  D: "right",
  E: "left",
  F: "right",
};

function Q31Main() {
  return (
    <svg viewBox="0 0 760 520" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(130,20)">
        <rect width={500} height={380} rx={34} fill="white" stroke={STROKE_LIGHT} strokeWidth={2} />
        {/* axis */}
        <line x1={250} y1={0} x2={250} y2={380}
          stroke="#94a3b8" strokeWidth={4} strokeDasharray="12 10" />
        {/* star left */}
        <text x={120} y={220} textAnchor="middle" fontSize={110} fontWeight={900} fill={STROKE}>★</text>
        {/* question mark right */}
        <text x={380} y={220} textAnchor="middle" fontSize={80} fontWeight={900} fill="#94a3b8">?</text>
      </g>
    </svg>
  );
}

function Q31Option({ optionKey }: { optionKey: GeoKey }) {
  const side = Q31_OPTIONS[optionKey];
  const starX = side === "right" ? 160 : 80;
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <rect x={8} y={8} width={224} height={164} rx={18} fill="white" stroke={STROKE_LIGHT} strokeWidth={1.5} />
      <line x1={120} y1={16} x2={120} y2={172}
        stroke="#94a3b8" strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={starX} y={110} textAnchor="middle" fontSize={60} fontWeight={900} fill={STROKE}>★</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q32 — Corner combination (2×2 tiling)
// ═══════════════════════════════════════════════════════════════════════════

const Q32_TILES: (Corner | "?")[] = ["tl", "tr", "br", "?"];

const Q32_OPTIONS: Record<GeoKey, Corner> = {
  A: "tl",
  B: "tr",
  C: "br",
  D: "bl",
  E: "none",
  F: "tr",
};

function Q32Main() {
  const TW = 220, TH = 180;
  return (
    <svg viewBox="0 0 760 520" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(170,20)">
        {Q32_TILES.map((corner, i) => {
          const c = i % 2, r = Math.floor(i / 2);
          const x = c * 240, y = r * 200;
          const isQ = corner === "?";
          return (
            <g key={i}>
              {isQ
                ? <QuestionTile x={x} y={y} w={TW} h={TH} />
                : <CornerFillTile x0={x + 5} y0={y + 5}
                    size={Math.min(TW, TH) - 10} rx={22}
                    corner={corner as Corner} strokeW={2} />
              }
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function Q32Option({ optionKey }: { optionKey: GeoKey }) {
  const corner = Q32_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <CornerFillTile x0={60} y0={22} size={120} rx={24} corner={corner} strokeW={2} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════

const MAIN_RENDERERS: Record<number, () => React.ReactElement> = {
  25: Q25Main,
  26: Q26Main,
  27: Q27Main,
  28: Q28Main,
  29: Q29Main,
  30: Q30Main,
  31: Q31Main,
  32: Q32Main,
};

const OPTION_RENDERERS: Record<number, (k: GeoKey) => React.ReactElement> = {
  25: (k) => <Q25Option optionKey={k} />,
  26: (k) => <Q26Option optionKey={k} />,
  27: (k) => <Q27Option optionKey={k} />,
  28: (k) => <Q28Option optionKey={k} />,
  29: (k) => <Q29Option optionKey={k} />,
  30: (k) => <Q30Option optionKey={k} />,
  31: (k) => <Q31Option optionKey={k} />,
  32: (k) => <Q32Option optionKey={k} />,
};

export function GeometryOption({ questionId, optionKey }: { questionId: number; optionKey: GeoKey }) {
  const render = OPTION_RENDERERS[questionId];
  if (!render) return null;
  return render(optionKey);
}

export default function GeometryFigure({
  questionId,
  variant,
  optionKey,
}: {
  questionId: number;
  variant: "main" | "option";
  optionKey?: GeoKey;
}): React.ReactElement | null {
  if (variant === "main") {
    const Comp = MAIN_RENDERERS[questionId];
    return Comp ? <Comp /> : null;
  }
  if (variant === "option" && optionKey) {
    return GeometryOption({ questionId, optionKey });
  }
  return null;
}
