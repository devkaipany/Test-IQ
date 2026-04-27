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
    top ? `${x0},${y0} ${x0 + size},${y0} ${cx},${cy}` : null,
    right ? `${x0 + size},${y0} ${x0 + size},${y0 + size} ${cx},${cy}` : null,
    bottom ? `${x0 + size},${y0 + size} ${x0},${y0 + size} ${cx},${cy}` : null,
    left ? `${x0},${y0 + size} ${x0},${y0} ${cx},${cy}` : null,
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
// Q41 — [TEMPLATE] Thay bằng loại hình bạn muốn (id phải khớp questions.ts)
// ═══════════════════════════════════════════════════════════════════════════
// Ví dụ dưới dùng CornerFillTile (tô góc). Bạn có thể thay bằng:
//   - ArrowTile         → đổi kiểu data: Dir ("up"|"right"|"down"|"left")
//   - CircleNeedle      → đổi kiểu data: NeedleKind hoặc number (góc độ)
//   - TriangleXorSquare → đổi kiểu data: Bits4
// ─────────────────────────────────────────────────────────────────────────
//
// BƯỚC 1: Đặt ma trận 3×3, ô cuối là "?"
//         Đáp án đúng tương ứng sẽ đặt vào Q41_OPTIONS bên dưới.
//
const Q41_MATRIX: (Corner | "?")[][] = [
  ["tl", "tr", "br"],
  ["bl", "tl", "tr"],
  ["br", "bl", "?"],   // ← ô "?" là câu hỏi
];

//
// BƯỚC 2: Đặt 6 đáp án A–F, 1 trong số đó là đáp án đúng
//         (khớp với _c trong questions.ts)
//         id=41, đáp án="A" → _c = String.fromCharCode(65 ^ (41%7+1)) = "F"
//
const Q41_OPTIONS: Record<GeoKey, Corner> = {
  A: "bl",   // ← đây là đáp án đúng (ví dụ)
  B: "tr",
  C: "tl",
  D: "br",
  E: "none",
  F: "tr",
};

function Q41Main() {
  const TW = 200, TH = 160;
  return (
    <svg viewBox="0 0 760 580" width="100%" style={{ maxWidth: 760 }}>
      <g transform="translate(80,40)">
        {Q41_MATRIX.map((row, r) =>
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

function Q41Option({ optionKey }: { optionKey: GeoKey }) {
  const corner = Q41_OPTIONS[optionKey];
  return (
    <svg viewBox="0 0 240 180" width="100%" style={{ maxWidth: 240 }}>
      <CornerFillTile x0={60} y0={22} size={120} rx={24} corner={corner} strokeW={2} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q131 — Square 6cm, cut 4 corners (right isosceles, leg=1cm)
// Shows the octagon result; options are text, so no option renderer needed
// ═══════════════════════════════════════════════════════════════════════════

function Q131Main() {
  // Square 6cm → octagon after cutting 4 corners (leg=1cm)
  // Scale: 1cm = 50px, square = 300px
  const S = 300, leg = 50, cx = 30, cy = 30;
  const pts2 = [
    [cx + leg, cy], [cx + S - leg, cy],
    [cx + S, cy + leg], [cx + S, cy + S - leg],
    [cx + S - leg, cy + S], [cx + leg, cy + S],
    [cx, cy + S - leg], [cx, cy + leg],
  ].map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 380 380" width="100%" style={{ maxWidth: 380, background: "white", borderRadius: 18 }}>
      {/* Original square outline */}
      <rect x={30} y={30} width={300} height={300} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 6" />
      {/* Cut triangles (highlighted) */}
      {[
        `${cx},${cy} ${cx + leg},${cy} ${cx},${cy + leg}`,
        `${cx + S - leg},${cy} ${cx + S},${cy} ${cx + S},${cy + leg}`,
        `${cx + S},${cy + S - leg} ${cx + S},${cy + S} ${cx + S - leg},${cy + S}`,
        `${cx},${cy + S - leg} ${cx + leg},${cy + S} ${cx},${cy + S}`,
      ].map((p, i) => <polygon key={i} points={p} fill="#fca5a5" opacity={0.6} />)}
      {/* Octagon */}
      <polygon points={pts2} fill="#dbeafe" stroke="#3b82f6" strokeWidth={3} />
      {/* Dimension labels */}
      <text x={180} y={22} textAnchor="middle" fontSize={14} fill="#64748b">6cm</text>
      <text x={370} y={185} textAnchor="middle" fontSize={14} fill="#64748b">6cm</text>
      <text x={60} y={20} textAnchor="middle" fontSize={12} fill="#ef4444">1</text>
      <text x={17} y={60} textAnchor="middle" fontSize={12} fill="#ef4444">1</text>
      <text x={180} y={200} textAnchor="middle" fontSize={16} fontWeight={700} fill="#1e40af">?</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q133 — Circle inscribed in square (side 4cm)
// ═══════════════════════════════════════════════════════════════════════════

function Q133Main() {
  return (
    <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 320, background: "white", borderRadius: 18 }}>
      <rect x={30} y={30} width={260} height={260} fill="#fef9c3" stroke="#92400e" strokeWidth={3} />
      <circle cx={160} cy={160} r={130} fill="#bfdbfe" stroke="#1d4ed8" strokeWidth={3} />
      {/* Shaded corners */}
      <rect x={30} y={30} width={260} height={260} fill="#fca5a5" opacity={0.35} />
      <circle cx={160} cy={160} r={130} fill="white" opacity={0.9} />
      <circle cx={160} cy={160} r={130} fill="#bfdbfe" opacity={0.5} stroke="#1d4ed8" strokeWidth={3} />
      {/* Labels */}
      <text x={160} y={27} textAnchor="middle" fontSize={16} fill="#78350f" fontWeight={700}>4cm</text>
      <text x={17} y={165} textAnchor="middle" fontSize={16} fill="#78350f" fontWeight={700}>4cm</text>
      <text x={160} y={168} textAnchor="middle" fontSize={14} fill="#1d4ed8">r = 2cm</text>
      <text x={55} y={75} textAnchor="middle" fontSize={16} fill="#ef4444" fontWeight={700}>?</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q134 — Paper folding: square → fold along diagonal → cut apex → unfold
// ═══════════════════════════════════════════════════════════════════════════

function Q134Main() {
  return (
    <svg viewBox="0 0 760 280" width="100%" style={{ maxWidth: 760 }}>
      {/* Step 1: Original square */}
      <g transform="translate(20,30)">
        <rect width={180} height={180} fill="#fef9c3" stroke="#92400e" strokeWidth={3} />
        <text x={90} y={200} textAnchor="middle" fontSize={14} fill="#64748b">Hình vuông</text>
      </g>
      {/* Arrow 1 */}
      <text x={220} y={125} fontSize={28} fill="#6366f1">→</text>
      {/* Step 2: Folded triangle */}
      <g transform="translate(255,30)">
        <polygon points="0,180 180,180 180,0" fill="#dbeafe" stroke="#1d4ed8" strokeWidth={3} />
        <line x1={0} y1={180} x2={180} y2={0} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 5" />
        {/* Cut mark at apex */}
        <polygon points="180,0 148,0 180,32" fill="#fca5a5" stroke="#ef4444" strokeWidth={2} />
        <text x={80} y={200} textAnchor="middle" fontSize={14} fill="#64748b">Gấp đôi & cắt</text>
      </g>
      {/* Arrow 2 */}
      <text x={455} y={125} fontSize={28} fill="#6366f1">→</text>
      {/* Step 3: Unfolded with rhombus hole */}
      <g transform="translate(490,30)">
        <rect width={180} height={180} fill="#fef9c3" stroke="#92400e" strokeWidth={3} />
        {/* Rhombus hole at center */}
        <polygon points="90,55 125,90 90,125 55,90" fill="white" stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6 4" />
        <text x={90} y={200} textAnchor="middle" fontSize={14} fill="#64748b">Mở ra — lỗ = ?</text>
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q135 — 3×3×3 cube painting: show which pieces have 2 painted faces
// ═══════════════════════════════════════════════════════════════════════════

function Q135Main() {
  const S = 60, gap = 4;
  const colors = { corner: "#f87171", edge: "#4ade80", face: "#60a5fa", inner: "#e2e8f0" };
  return (
    <svg viewBox="0 0 540 260" width="100%" style={{ maxWidth: 540 }}>
      {/* Top view grid */}
      <text x={90} y={20} textAnchor="middle" fontSize={13} fill="#64748b" fontWeight={600}>Nhìn từ trên</text>
      {[0, 1, 2].map(r => [0, 1, 2].map(c => {
        const isCorner = (r === 0 || r === 2) && (c === 0 || c === 2);
        const isEdge = !isCorner && (r === 0 || r === 2 || c === 0 || c === 2);
        const fill = isCorner ? colors.corner : isEdge ? colors.edge : colors.face;
        return <rect key={`${r}-${c}`} x={20 + c * (S + gap)} y={30 + r * (S + gap)} width={S} height={S} rx={8} fill={fill} stroke="#fff" strokeWidth={2} />;
      }))}
      {/* Legend */}
      <g transform="translate(220,30)">
        {[
          { c: colors.corner, label: "3 mặt sơn (góc): 8 khối", y: 0 },
          { c: colors.edge, label: "2 mặt sơn (cạnh): 12 khối ✓", y: 40 },
          { c: colors.face, label: "1 mặt sơn (mặt): 6 khối", y: 80 },
          { c: colors.inner, label: "0 mặt sơn (trong): 1 khối", y: 120 },
        ].map(({ c, label, y }) => (
          <g key={y} transform={`translate(0,${y})`}>
            <rect width={28} height={28} rx={6} fill={c} />
            <text x={36} y={19} fontSize={13} fill="#334155">{label}</text>
          </g>
        ))}
        <text x={0} y={185} fontSize={14} fontWeight={800} fill="#4ade80">→ Đáp án: 12 khối có 2 mặt sơn</text>
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q136 — Symmetry axes: show 6 shapes with axis counts
// ═══════════════════════════════════════════════════════════════════════════

function Q136Main() {
  const shapes = [
    { label: "Chữ nhật", axes: 2 },
    { label: "Hình thoi", axes: 2 },
    { label: "Hình vuông", axes: 4 },
    { label: "Tam giác đều", axes: 3 },
    { label: "Thang cân", axes: 1 },
    { label: "Bình hành", axes: 0 },
  ];
  return (
    <svg viewBox="0 0 750 220" width="100%" style={{ maxWidth: 750 }}>
      {shapes.map(({ label, axes }, i) => {
        const x = 15 + i * 122, y = 10;
        const isMax = axes === 4;
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect width={110} height={140} rx={14} fill={isMax ? "#f0fdf4" : "white"}
              stroke={isMax ? "#22c55e" : "#e2e8f0"} strokeWidth={isMax ? 3 : 1.5} />
            {/* Simple shape silhouette */}
            {i === 0 && <rect x={15} y={15} width={80} height={60} fill="#bfdbfe" rx={4} />}
            {i === 1 && <polygon points="55,10 95,50 55,90 15,50" fill="#fde68a" />}
            {i === 2 && <rect x={15} y={10} width={80} height={80} fill="#c4b5fd" rx={4} />}
            {i === 3 && <polygon points="55,10 95,90 15,90" fill="#6ee7b7" />}
            {i === 4 && <polygon points="20,90 90,90 70,10 40,10" fill="#fed7aa" />}
            {i === 5 && <polygon points="5,90 85,90 105,10 25,10" fill="#e2e8f0" />}
            {/* Axis lines */}
            {axes > 0 && Array.from({ length: axes }).map((_, j) => {
              const ang = (j * 180 / axes) * Math.PI / 180;
              const cx2 = 55, cy2 = 50, len = 40;
              return <line key={j}
                x1={cx2 - Math.cos(ang) * len} y1={cy2 - Math.sin(ang) * len}
                x2={cx2 + Math.cos(ang) * len} y2={cy2 + Math.sin(ang) * len}
                stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3" />;
            })}
            <text x={55} y={115} textAnchor="middle" fontSize={11} fill="#334155">{label}</text>
            <text x={55} y={133} textAnchor="middle" fontSize={13} fontWeight={800}
              fill={isMax ? "#16a34a" : "#64748b"}>{axes} trục{isMax ? " ✓" : ""}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q138 — 3D projections: top=circle, side=triangle → cone
// ═══════════════════════════════════════════════════════════════════════════

function Q138Main() {
  return (
    <svg viewBox="0 0 600 260" width="100%" style={{ maxWidth: 600 }}>
      {/* Top view */}
      <g transform="translate(30,20)">
        <rect width={200} height={200} rx={16} fill="white" stroke="#e2e8f0" strokeWidth={2} />
        <text x={100} y={22} textAnchor="middle" fontSize={14} fill="#64748b" fontWeight={600}>Nhìn từ trên ↓</text>
        <circle cx={100} cy={115} r={70} fill="#bfdbfe" stroke="#1d4ed8" strokeWidth={3} />
      </g>
      {/* Side view */}
      <g transform="translate(270,20)">
        <rect width={200} height={200} rx={16} fill="white" stroke="#e2e8f0" strokeWidth={2} />
        <text x={100} y={22} textAnchor="middle" fontSize={14} fill="#64748b" fontWeight={600}>Nhìn từ bên →</text>
        <polygon points="100,35 175,175 25,175" fill="#fde68a" stroke="#92400e" strokeWidth={3} />
      </g>
      {/* Result */}
      <text x={510} y={115} textAnchor="middle" fontSize={36} fill="#6366f1">?</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Q139 — Count triangles: big triangle divided by midpoints into 4 small ones
// ═══════════════════════════════════════════════════════════════════════════

function Q139Main() {
  // Big triangle vertices
  const A = { x: 380, y: 30 }, B = { x: 60, y: 350 }, C = { x: 700, y: 350 };
  // Midpoints
  const MAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const MBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  const MAC = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const colors = ["#bfdbfe", "#fde68a", "#6ee7b7", "#fca5a5"];
  const tris = [
    [A, MAB, MAC], [MAB, B, MBC], [MAB, MBC, MAC], [MAC, MBC, C]
  ];
  function tp(pts: { x: number; y: number }[]) { return pts.map(p => `${p.x},${p.y}`).join(" "); }
  return (
    <svg viewBox="0 0 760 400" width="100%" style={{ maxWidth: 760 }}>
      {tris.map((t, i) => (
        <polygon key={i} points={tp(t)} fill={colors[i]} stroke="#334155" strokeWidth={2.5} opacity={0.85} />
      ))}
      {/* Big triangle outline */}
      <polygon points={tp([A, B, C])} fill="none" stroke="#1e293b" strokeWidth={3.5} />
      {/* Label each small triangle */}
      {tris.map((t, i) => {
        const cx = (t[0].x + t[1].x + t[2].x) / 3, cy = (t[0].y + t[1].y + t[2].y) / 3;
        return <text key={i} x={cx} y={cy + 6} textAnchor="middle" fontSize={22} fontWeight={700} fill="#1e293b">△</text>;
      })}
      {/* Big triangle label */}
      <text x={380} y={390} textAnchor="middle" fontSize={15} fill="#64748b">4 tam giác nhỏ + 1 tam giác lớn = ?</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════

const MAIN_RENDERERS: Record<number, () => React.ReactElement> = {
  25: Q25Main, 26: Q26Main, 27: Q27Main, 28: Q28Main,
  29: Q29Main, 30: Q30Main, 31: Q31Main, 32: Q32Main,
  // SET2 geometry
  131: Q131Main, 133: Q133Main, 134: Q134Main,
  135: Q135Main, 136: Q136Main, 138: Q138Main, 139: Q139Main,
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
  // SET2 questions — options are text, no image renderer needed
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

