# 📐 Hướng dẫn cập nhật câu hỏi Toán Hình

File cần chỉnh: `src/components/GeometryFigure.tsx`

---

## Cấu trúc tổng quan

Mỗi câu hỏi toán hình (câu 25–32) gồm **2 phần**:
1. `QxxMain()` — hình minh họa chính (3×3 ma trận hoặc dạng khác)
2. `QxxOption()` — 6 hình đáp án (A–F)

Và một bảng dữ liệu `Qxx_MATRIX` / `Qxx_OPTIONS` (dạng data config, **không phải SVG trực tiếp**).

---

## Cách cập nhật từng loại câu

### 🔵 Câu 25 & 30 — Kim đồng hồ (CircleNeedle)

**Cấu trúc:** Ma trận 3×3, mỗi ô là một hình tròn có kim chỉ hướng.

**File:** `Q25_MATRIX` / `Q30_MATRIX`

```ts
// Câu 25: NeedleKind = "vertical" | "horiz" | "diag1" | "diag2"
const Q25_MATRIX: (NeedleKind | "?")[][] = [
  ["vertical", "diag2", "horiz"],
  ["diag1",    "vertical", "diag2"],
  ["horiz",    "diag1",    "?"],   // ← ô "?" là câu hỏi
];

// Câu 30: góc độ (số thực, 0=phải, 90=xuống, 180=trái, 270=lên)
const Q30_MATRIX: (number | "?")[][] = [
  [0, 45, 90],
  [135, 180, 225],
  [270, 315, "?"],
];
```

**Cách đổi đề:**
- Thay các giá trị trong `_MATRIX` (giữ nguyên `"?"` ở vị trí câu hỏi)
- Thay bảng `Q25_OPTIONS` / `Q30_OPTIONS` — mỗi key A–F là một đáp án hình:
```ts
const Q25_OPTIONS: Record<GeoKey, NeedleKind> = {
  A: "vertical",
  B: "horiz",
  C: "diag2",
  D: "diag1",   // ← D là đáp án đúng (khớp với _c trong questions.ts)
  E: "horiz",
  F: "diag2",
};
```
- Cập nhật `_c` trong `src/data/questions.ts` (câu 25/30) nếu đáp án thay đổi.

---

### 🔶 Câu 27 — Mũi tên (ArrowTile)

**Cấu trúc:** Ma trận 3×3, mỗi ô là hình vuông chứa mũi tên.

```ts
// Dir = "up" | "right" | "down" | "left"
const Q27_MATRIX: (Dir | "?")[][] = [
  ["up",   "right", "down"],
  ["left", "up",    "right"],
  ["down", "left",  "?"],
];

const Q27_OPTIONS: Record<GeoKey, Dir> = {
  A: "right", B: "down", C: "up",
  D: "left",  // ← đáp án đúng
  E: "down",  F: "right",
};
```

---

### 🟠 Câu 26 — XOR tam giác (TriangleXorSquare)

**Cấu trúc:** 3 hàng, mỗi hàng: `[hình A] ⊕ [hình B] = [hình C]`  
**Bits** = `[top, right, bottom, left]` — `1` = vùng tô đen, `0` = trắng.

```ts
type Bits4 = [number, number, number, number];

const R1A: Bits4 = [1, 0, 0, 0];  // tam giác tô góc trên
const R1B: Bits4 = [0, 0, 1, 0];  // tam giác tô góc dưới
// R1C tự tính = XOR(R1A, R1B) = [1,0,1,0]
const R1C = xorBits(R1A, R1B);
```

**Cách đổi đề:**
1. Đặt `R1A`, `R1B`, `R2A`, `R2B`, `R3A`, `R3B` theo ý muốn
2. Để hàm `xorBits` tự tính `R1C`, `R2C` — còn `R3C` chính là **đáp án ẩn**
3. Cập nhật `Q26_OPTIONS` — đặt đáp án đúng (bằng XOR(R3A, R3B)) vào 1 key

---

### 🟡 Câu 28 & 32 — Tô góc (CornerFillTile)

**Corner** = `"tl" | "tr" | "br" | "bl" | "none"`

```ts
const Q28_MATRIX: (Corner | "?")[][] = [
  ["tl", "tr", "br"],
  ["bl", "tl", "tr"],
  ["br", "bl", "?"],
];
```

---

### 🔴 Câu 29 — Vị trí chấm (CircleNeedle dotPos)

**dotPos** = `"top" | "right" | "bottom" | "left"` (kim luôn nằm ngang)

```ts
const Q29_MATRIX: ("top" | "right" | "bottom" | "left" | "?")[][] = [
  ["top",    "right",  "bottom"],
  ["left",   "top",    "right"],
  ["bottom", "left",   "?"],
];
```

---

### 🟣 Câu 31 — Đối xứng ngôi sao

Đơn giản nhất — chỉ có `"left"` hoặc `"right"`.

```ts
const Q31_OPTIONS: Record<GeoKey, "left" | "right"> = {
  A: "left", B: "right", C: "left",
  D: "right", E: "left", F: "right",  // ← F là đáp án đúng
};
```

---

## Quy trình cập nhật hoàn chỉnh

1. Mở `src/components/GeometryFigure.tsx`
2. Tìm block **`Qxx_MATRIX`** / **`Qxx_OPTIONS`** của câu muốn sửa
3. Thay giá trị data (không cần sửa SVG hay components)
4. Cập nhật `_c` trong `src/data/questions.ts` tại câu tương ứng nếu đáp án thay đổi

**Mã hóa đáp án `_c`:**
```ts
// Công thức encode:
_c = String.fromCharCode(answer.charCodeAt(0) ^ (id % 7 + 1))
// Ví dụ: câu 25 (id=25), đáp án "D":
// 25 % 7 + 1 = 26 % 7 + 1 = 4 + 1 = 5  → thực ra: 25 % 7 = 4, 4+1=5
// "D".charCodeAt(0) = 68, 68 ^ 5 = 73 → String.fromCharCode(73) = "I"
// Nên _c: "I"
```

Cách dễ hơn: dùng console Dev Tools:
```js
String.fromCharCode("D".charCodeAt(0) ^ (25 % 7 + 1))
// Hoặc dùng admin panel → thêm câu hỏi sẽ tự encode
```

---

## Thêm câu hỏi toán hình mới (câu 33+)

Nếu muốn thêm hẳn câu hỏi hình mới:
1. Tạo function `QxxMain()` và `QxxOption()` trong `GeometryFigure.tsx`
2. Đăng ký vào `MAIN_RENDERERS` và `OPTION_RENDERERS`
3. Thêm câu vào `questions.ts` với `hasFigure: true`
