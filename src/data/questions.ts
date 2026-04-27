export type OptionKey = "A"|"B"|"C"|"D"|"E"|"F";

export interface QuizQuestion {
  id: number;
  /** Mã câu hỏi duy nhất, ví dụ: KAI-IQ101 */
  code?: string;
  section: string;
  title: string;
  options: Record<OptionKey, string>;
  /** XOR-encoded answer — do NOT compare directly. Use decodeAnswer(q). */
  _c: string;
  hasFigure?: boolean;
  difficulty: 1 | 2 | 3; // 1=dễ, 2=trung bình, 3=khó

  /**
   * Câu hỏi dạng ẢNH — thay thế cho hasFigure/SVG.
   * Đặt đường dẫn ảnh chính (hiển thị đề bài) tại đây.
   * Ảnh nên để trong thư mục: src/assets/questions/
   * Ví dụ: imageQuestion: new URL('../assets/questions/q42_main.png', import.meta.url).href
   */
  imageQuestion?: string;

  /**
   * Ảnh cho từng đáp án A–F (tuỳ chọn).
   * Nếu không có imageOptions, đáp án sẽ hiển thị dạng text bình thường.
   * Ví dụ: { A: urlA, B: urlB, C: urlC, D: urlD, E: urlE, F: urlF }
   */
  imageOptions?: Partial<Record<OptionKey, string>>;
}

export const QUIZ_DURATION_MINUTES = 30;

/**
 * Decode the obfuscated answer back to an OptionKey.
 * Uses XOR with (id % 7 + 1) as the key.
 */
export function decodeAnswer(q: QuizQuestion): OptionKey {
  return String.fromCharCode(q._c.charCodeAt(0) ^ (q.id % 7 + 1)) as OptionKey;
}

// IQ = 70 + Σ difficulty[i] for each correct answer i
// Max = 70 + (10×1 + 8×2 + 6×2 + 8×3 + 4×3 + 4×2) = 70 + 82 = 152

export const QUESTIONS_SET1: QuizQuestion[] = [
  { id: 1,  section: "Toán Số · Dãy số",    title: "2, 5, 8, 11, 14, ?",                                                                                                                                                                                                     options: { A: "15", B: "16", C: "17", D: "18", E: "19", F: "20" },                                                                                                                                                                                                                             _c: "A", difficulty: 1 },
  { id: 2,  section: "Toán Số · Dãy số",    title: "1, 4, 9, 16, 25, ?",                                                                                                                                                                                                     options: { A: "30", B: "36", C: "40", D: "45", E: "49", F: "64" },                                                                                                                                                                                                                             _c: "A", difficulty: 1 },
  { id: 3,  section: "Toán Số · Dãy số",    title: "3, 6, 12, 24, 48, ?",                                                                                                                                                                                                    options: { A: "60", B: "72", C: "84", D: "96", E: "102", F: "120" },                                                                                                                                                                                                                           _c: "H", difficulty: 1 },
  { id: 4,  section: "Toán Số · Dãy số",    title: "10, 7, 11, 8, 12, 9, ?",                                                                                                                                                                                                 options: { A: "10", B: "11", C: "13", D: "14", E: "15", F: "16" },                                                                                                                                                                                                                             _c: "F", difficulty: 1 },
  { id: 5,  section: "Toán Số · Dãy số",    title: "2, 4, 7, 11, 16, ?",                                                                                                                                                                                                     options: { A: "20", B: "21", C: "22", D: "23", E: "24", F: "25" },                                                                                                                                                                                                                             _c: "E", difficulty: 1 },
  { id: 6,  section: "Toán Số · Dãy số",    title: "40, 20, 22, 11, 13, ?",                                                                                                                                                                                                  options: { A: "5", B: "6,5", C: "7", D: "8", E: "15", F: "26" },                                                                                                                                                                                                                               _c: "E", difficulty: 1 },
  { id: 7,  section: "Toán Số · Dãy số",    title: "5, 9, 8, 12, 11, 15, ?",                                                                                                                                                                                                 options: { A: "14", B: "13", C: "12", D: "16", E: "17", F: "18" },                                                                                                                                                                                                                             _c: "@", difficulty: 1 },
  { id: 8,  section: "Toán Số · Dãy số",    title: "1, 2, 6, 7, 21, 22, ?",                                                                                                                                                                                                  options: { A: "43", B: "44", C: "66", D: "67", E: "68", F: "69" },                                                                                                                                                                                                                             _c: "F", difficulty: 1 },
  { id: 9,  section: "Toán Số · Dãy số",    title: "18, 15, 30, 27, 54, 51, ?",                                                                                                                                                                                              options: { A: "102", B: "103", C: "104", D: "105", E: "106", F: "108" },                                                                                                                                                                                                                        _c: "B", difficulty: 1 },
  { id: 10, section: "Toán Số · Dãy số",    title: "4, 7, 13, 25, 49, ?",                                                                                                                                                                                                    options: { A: "73", B: "85", C: "97", D: "98", E: "99", F: "101" },                                                                                                                                                                                                                            _c: "G", difficulty: 1 },

  { id: 11, section: "Toán Số · Suy luận",  title: "Có 4 bạn An, Bình, Châu, Dũng. Biết: (1) An cao hơn Bình. (2) Châu cao hơn An. (3) Dũng thấp hơn Châu nhưng cao hơn Bình. Ai cao nhất?",                                                                               options: { A: "An", B: "Bình", C: "Châu", D: "Dũng", E: "Không xác định", F: "Cả 4 bằng nhau" },                                                                                                                                                                                               _c: "F", difficulty: 2 },
  { id: 12, section: "Toán Số · Suy luận",  title: "Có 4 người A, B, C, D ngồi trên một hàng ghế (từ trái sang phải). Biết: D ngồi ngoài cùng bên phải; A ngồi ngay bên trái B; C ngồi bên trái A. Ai ngồi ngoài cùng bên trái?",                                          options: { A: "A", B: "B", C: "C", D: "D", E: "Không xác định được", F: "Có thể là A hoặc C" },                                                                                                                                                                                                _c: "E", difficulty: 2 },
  { id: 13, section: "Toán Số · Suy luận",  title: "5 bạn Huy, Lan, Minh, Ngọc, Phúc ngồi trên 1 hàng 5 ghế. Biết: Minh ngay bên phải Lan; Huy không ở 2 đầu; Phúc ngồi ở 1 đầu; Ngọc ngồi bên trái Huy. Ai ngồi ở đầu còn lại (đầu không có Phúc)?",                   options: { A: "Huy", B: "Lan", C: "Minh", D: "Ngọc", E: "Phúc", F: "Không xác định" },                                                                                                                                                                                                        _c: "D", difficulty: 2 },
  { id: 14, section: "Toán Số · Suy luận",  title: "Có 3 công tắc (1,2,3) điều khiển 3 đèn (A,B,C) nhưng bị tráo nhãn. Biết: bật công tắc 1 thì đèn A sáng; bật công tắc 2 thì đèn B sáng; bật công tắc 3 thì đèn C sáng. Khẳng định nào chắc chắn đúng?",                options: { A: "Công tắc 1 điều khiển đèn A", B: "Công tắc 2 điều khiển đèn B", C: "Công tắc 3 điều khiển đèn C", D: "Không thể kết luận công tắc nào điều khiển đèn nào", E: "Có ít nhất 2 nhãn đúng", F: "Có đúng 1 nhãn đúng" },                                                        _c: "E", difficulty: 2 },
  { id: 15, section: "Toán Số · Suy luận",  title: "Xét mệnh đề: 'Nếu hôm nay mưa thì đường ướt'. Biết đường không ướt. Kết luận hợp lý nhất là:",                                                                                                                         options: { A: "Hôm nay chắc chắn mưa", B: "Hôm nay chắc chắn không mưa", C: "Không thể biết hôm nay có mưa hay không", D: "Đường không ướt nên mệnh đề ban đầu sai", E: "Đường không ướt nên hôm nay chắc chắn nắng", F: "Có thể mưa nhưng đường vẫn không ướt" },          _c: "@", difficulty: 2 },
  { id: 16, section: "Toán Số · Suy luận",  title: "Có 4 hộp: Đỏ, Xanh, Vàng, Trắng. Mỗi hộp có đúng 1 bi: đỏ, xanh, vàng, trắng. Biết: bi đỏ không ở hộp Đỏ; bi xanh không ở hộp Xanh; bi vàng ở hộp Trắng; bi trắng không ở hộp Xanh. Bi trắng ở hộp nào?",         options: { A: "Đỏ", B: "Xanh", C: "Vàng", D: "Trắng", E: "Không xác định", F: "Có thể ở Đỏ hoặc Vàng" },                                                                                                                                                                                       _c: "B", difficulty: 2 },
  { id: 17, section: "Toán Số · Suy luận",  title: "Có 4 bạn K, L, M, N. Biết: nếu K đi thì L đi; nếu L đi thì M không đi; M đi. Suy ra điều nào chắc chắn đúng?",                                                                                                        options: { A: "K đi", B: "L không đi", C: "L đi", D: "K không đi", E: "N không đi", F: "N đi" },                                                                                                                                                                                              _c: "F", difficulty: 2 },
  { id: 18, section: "Toán Số · Suy luận",  title: "Có 5 kiện hàng: 1 kiện nặng nhất, 1 kiện nhẹ nhất, 3 kiện còn lại bằng nhau. Được cân 1 lần (2 kiện với 2 kiện). Nếu cân bằng, điều nào chắc chắn đúng?",                                                              options: { A: "Kiện còn lại là nặng nhất", B: "Kiện còn lại là nhẹ nhất", C: "4 kiện đã cân đều bằng nhau", D: "Không thể kết luận kiện còn lại là nặng hay nhẹ nhất", E: "Kiện còn lại chắc chắn thuộc nhóm 3 kiện bằng nhau", F: "Kiện còn lại chắc chắn không thuộc nhóm 3 kiện bằng nhau" }, _c: "I", difficulty: 2 },

  { id: 19, section: "Toán Số · Đố tư duy", title: "Ốc sên leo cột cao 10m: ban ngày leo 3m, ban đêm tụt 2m. Sau bao nhiêu ngày lên tới đỉnh?",                                                                                                                              options: { A: "7", B: "8", C: "9", D: "10", E: "11", F: "12" },                                                                                                                                                                                                                                _c: "D", difficulty: 2 },
  { id: 20, section: "Toán Số · Đố tư duy", title: "Có 12 đồng xu, 1 đồng giả nhẹ hơn. Cần ít nhất bao nhiêu lần cân đĩa để chắc chắn tìm ra đồng giả?",                                                                                                                   options: { A: "1", B: "2", C: "3", D: "4", E: "5", F: "6" },                                                                                                                                                                                                                                   _c: "D", difficulty: 2 },
  { id: 21, section: "Toán Số · Đố tư duy", title: "Có 3 can 8L, 5L, 3L. Ban đầu can 8L đầy, 2 can kia rỗng. Chỉ được rót giữa các can (không đổ đi). Có thể tạo đúng 4L trong can 8L không?",                                                                             options: { A: "Không thể", B: "Có thể", C: "Chỉ khi có thêm can 1L", D: "Chỉ khi can 5L ban đầu có nước", E: "Chỉ khi được phép đổ đi một ít nước", F: "Chỉ khi đổi can 3L thành 4L" },                                                                                               _c: "C", difficulty: 2 },
  { id: 22, section: "Toán Số · Đố tư duy", title: "5 con mèo ăn hết 5 con cá trong 5 phút (tốc độ như nhau). 100 con mèo ăn hết 100 con cá trong bao lâu?",                                                                                                                options: { A: "1 phút", B: "5 phút", C: "10 phút", D: "20 phút", E: "50 phút", F: "100 phút" },                                                                                                                                                                                               _c: "@", difficulty: 2 },
  { id: 23, section: "Toán Số · Đố tư duy", title: "Thang 10 bậc, đứng ở bậc 1. Mỗi bước lên 1 bậc hoặc 2 bậc. Có bao nhiêu cách đi từ bậc 1 lên bậc 10?",                                                                                                                options: { A: "34", B: "55", C: "56", D: "64", E: "89", F: "144" },                                                                                                                                                                                                                            _c: "A", difficulty: 2 },
  { id: 24, section: "Toán Số · Đố tư duy", title: "Trong cuộc đua, bạn vượt qua người đứng thứ 2. Lúc đó bạn đang đứng thứ mấy?",                                                                                                                                          options: { A: "Thứ 1", B: "Thứ 2", C: "Thứ 3", D: "Thứ 4", E: "Thứ 5", F: "Không xác định" },                                                                                                                                                                                               _c: "F", difficulty: 2 },

  { id: 25, section: "Toán Hình · Ma trận hình",    title: "Tìm hình điền vào ô (3,3):",                                options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "D", hasFigure: true, difficulty: 3 },
  { id: 26, section: "Toán Hình · XOR tam giác",    title: "Áp dụng phép XOR trên mảng tam giác đen trắng. Tìm kết quả hàng 3:", options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "K", hasFigure: true, difficulty: 3 },
  { id: 27, section: "Toán Hình · Ma trận mũi tên", title: "Tìm hình điền vào ô (3,3):",                                options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "D", hasFigure: true, difficulty: 3 },
  { id: 28, section: "Toán Hình · Quy tắc tô góc",  title: "Tìm hình còn thiếu theo quy luật (ô cuối cùng):",          options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "E", hasFigure: true, difficulty: 3 },
  { id: 29, section: "Toán Hình · Quy tắc quay",    title: "Tìm hình còn thiếu theo quy luật (ô cuối cùng):",          options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "@", hasFigure: true, difficulty: 3 },
  { id: 30, section: "Toán Hình · Dịch chuyển điểm",title: "Tìm hình điền vào ô (3,3):",                                options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "E", hasFigure: true, difficulty: 3 },
  { id: 31, section: "Toán Hình · Đối xứng",         title: "Chọn đáp án sao cho đúng quy luật đối xứng:",             options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "F", hasFigure: true, difficulty: 3 },
  { id: 32, section: "Toán Hình · Quy tắc kết hợp", title: "Tìm hình còn thiếu theo quy luật (ô cuối cùng):",          options: { A: "Hình A", B: "Hình B", C: "Hình C", D: "Hình D", E: "Hình E", F: "Hình F" }, _c: "F", hasFigure: true, difficulty: 3 },

  { id: 33, section: "Chuyên đề · Dirichlet", title: "Ngăn kéo có tất: 4 đỏ, 5 xanh, 6 đen. Trời tối rút ngẫu nhiên. Rút ít nhất bao nhiêu chiếc để chắc chắn có 1 đôi cùng màu?",                                                                                        options: { A: "2", B: "3", C: "4", D: "5", E: "6", F: "7" },                                                                                                                                                                                                                                   _c: "E", difficulty: 3 },
  { id: 34, section: "Chuyên đề · Dirichlet", title: "Trong lớp có 31 học sinh. Chắc chắn có ít nhất bao nhiêu học sinh sinh cùng 1 tháng?",                                                                                                                                options: { A: "2", B: "3", C: "4", D: "5", E: "6", F: "7" },                                                                                                                                                                                                                                   _c: "E", difficulty: 3 },
  { id: 35, section: "Chuyên đề · Dirichlet", title: "Chọn ngẫu nhiên 5 số nguyên khác nhau từ {1,…,10}. Khẳng định nào chắc chắn đúng?",                                                                                                                                  options: { A: "Chắc chắn có 2 số có cùng số dư khi chia cho 4", B: "Chắc chắn có 2 số liên tiếp", C: "Chắc chắn có ít nhất 3 số chẵn", D: "Chắc chắn có ít nhất 2 số chia hết cho 3", E: "Chắc chắn tổng 5 số là số chẵn", F: "Chắc chắn có đúng 2 số lẻ" },                    _c: "@", difficulty: 3 },
  { id: 36, section: "Chuyên đề · Dirichlet", title: "Hộp có bi 3 màu: đỏ, xanh, vàng. Không nhìn, rút bi. Rút ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?",                                                                                                   options: { A: "2", B: "4", C: "5", D: "6", E: "7", F: "8" },                                                                                                                                                                                                                                   _c: "@", difficulty: 3 },

  { id: 37, section: "Toán Thực tế", title: "Giảm 15% cho áo niêm yết 320.000đ, sau đó cộng 8% VAT trên giá đã giảm. Giá phải trả (làm tròn nghìn) gần nhất là:", options: { A: "276.000đ", B: "294.000đ", C: "303.000đ", D: "312.000đ", E: "318.000đ", F: "320.000đ" }, _c: "A", difficulty: 2 },
  { id: 38, section: "Toán Thực tế", title: "Quãng đường 72km: 30km đầu đi 40km/h, còn lại đi 48km/h. Thời gian đi hết (làm tròn 5 phút gần nhất) là:",             options: { A: "1 giờ 30 phút", B: "1 giờ 35 phút", C: "1 giờ 40 phút", D: "1 giờ 45 phút", E: "1 giờ 50 phút", F: "2 giờ" }, _c: "G", difficulty: 2 },
  { id: 39, section: "Toán Thực tế", title: "Chia thưởng 18.000.000đ theo tỉ lệ 2 : 3 : 4. Nhóm nhận nhiều nhất được:",                                              options: { A: "6.000.000đ", B: "7.200.000đ", C: "8.000.000đ", D: "8.100.000đ", E: "9.000.000đ", F: "10.000.000đ" }, _c: "F", difficulty: 2 },
  { id: 40, section: "Toán Thực tế", title: "Bể nước: vòi 1 đầy trong 6h, vòi 2 đầy trong 9h. Mở cả hai cùng lúc thì sau bao lâu đầy?",                             options: { A: "3 giờ", B: "3 giờ 36 phút", C: "4 giờ", D: "4 giờ 30 phút", E: "5 giờ", F: "5 giờ 24 phút" }, _c: "D", difficulty: 2 },
];




// ═══════════════════════════════════════════════════════════════════════
// BỘ ĐỀ 2 — 40 câu Logic IQ (Tổ hợp / Xác suất / Suy luận / Nhận dạng hình)
// XOR key: id % 7 + 1
// ═══════════════════════════════════════════════════════════════════════
export const QUESTIONS_SET2: QuizQuestion[] = [
  // ─── Dãy số & Quy luật (id 101–110) ─── XOR key = id%7+1
  // Q101 key=4: ans=C(21). 67^4=71='G'
  { id: 101, section: "Dãy số & Quy luật", title: "1, 1, 2, 3, 5, 8, 13, ?", options: { A: "18", B: "20", C: "21", D: "23", E: "24", F: "26" }, _c: "G", difficulty: 1 },
  // Q102 key=5: ans=B(42). 66^5=67='C'
  { id: 102, section: "Dãy số & Quy luật", title: "2, 6, 12, 20, 30, ?", options: { A: "40", B: "42", C: "44", D: "46", E: "48", F: "50" }, _c: "C", difficulty: 1 },
  // Q103 key=6: ans=C(65). 67^6=69='E'
  { id: 103, section: "Dãy số & Quy luật", title: "100, 91, 83, 76, 70, ?", options: { A: "60", B: "63", C: "65", D: "67", E: "68", F: "69" }, _c: "E", difficulty: 1 },
  // Q104 key=7: ans=D(243). 68^7=75='K'
  { id: 104, section: "Dãy số & Quy luật", title: "3, 9, 27, 81, ?", options: { A: "162", B: "210", C: "240", D: "243", E: "270", F: "324" }, _c: "K", difficulty: 1 },
  // Q105 key=1: ans=D(28). 68^1=69='E'
  { id: 105, section: "Dãy số & Quy luật", title: "1, 3, 6, 10, 15, 21, ?", options: { A: "25", B: "26", C: "27", D: "28", E: "29", F: "30" }, _c: "E", difficulty: 1 },
  // Q106 key=2: ans=D(112). 68^2=70='F'
  { id: 106, section: "Dãy số & Quy luật", title: "7, 14, 28, 56, ?", options: { A: "84", B: "96", C: "100", D: "112", E: "120", F: "128" }, _c: "F", difficulty: 1 },
  // Q107 key=3: ans=D(25). 68^3=71='G'
  { id: 107, section: "Dãy số & Quy luật", title: "50, 43, 37, 32, 28, ?", options: { A: "22", B: "23", C: "24", D: "25", E: "26", F: "27" }, _c: "G", difficulty: 1 },
  // Q108 key=4: ans=C(17). 67^4=71='G'
  { id: 108, section: "Dãy số & Quy luật", title: "2, 3, 5, 7, 11, 13, ?", options: { A: "15", B: "16", C: "17", D: "18", E: "19", F: "21" }, _c: "G", difficulty: 1 },
  // Q109 key=5: ans=D(94). 68^5=65='A'
  { id: 109, section: "Dãy số & Quy luật", title: "1, 4, 10, 22, 46, ?", options: { A: "88", B: "90", C: "92", D: "94", E: "96", F: "100" }, _c: "A", difficulty: 2 },
  // Q110 key=6: ans=C(95). 67^6=69='E'
  { id: 110, section: "Dãy số & Quy luật", title: "Cho dãy: 2, 5, 11, 23, 47, ? (quy luật: nhân 2 rồi cộng 1)", options: { A: "90", B: "93", C: "95", D: "97", E: "99", F: "101" }, _c: "E", difficulty: 2 },

  // ─── Tổ hợp & Xác suất (id 111–120) ───
  // Q111 key=7: ans=B(10). 66^7=69='E'
  { id: 111, section: "Tổ hợp & Xác suất", title: "Chọn 2 học sinh từ nhóm 5 người. Có bao nhiêu cách?", options: { A: "8", B: "10", C: "12", D: "15", E: "20", F: "25" }, _c: "E", difficulty: 2 },
  // Q112 key=1: ans=B(1/2). 66^1=67='C'
  { id: 112, section: "Tổ hợp & Xác suất", title: "Tung đồng xu 3 lần. Xác suất ra ít nhất 2 mặt ngửa là bao nhiêu?", options: { A: "1/4", B: "1/2", C: "3/8", D: "5/8", E: "3/4", F: "7/8" }, _c: "C", difficulty: 2 },
  // Q113 key=2: ans=B(2/5). 66^2=64='@'
  { id: 113, section: "Tổ hợp & Xác suất", title: "Hộp có 4 bi đỏ, 6 bi xanh. Rút ngẫu nhiên 1 bi. Xác suất rút bi đỏ là:", options: { A: "1/5", B: "2/5", C: "3/5", D: "4/5", E: "1/2", F: "1/3" }, _c: "@", difficulty: 1 },
  // Q114 key=3: ans=D(20). 68^3=71='G'
  { id: 114, section: "Tổ hợp & Xác suất", title: "Có 5 cửa vào và 4 cửa ra. Có bao nhiêu cách đi vào rồi đi ra?", options: { A: "9", B: "16", C: "18", D: "20", E: "24", F: "25" }, _c: "G", difficulty: 1 },
  // Q115 key=4: ans=B(1/3). 66^4=70='F'
  { id: 115, section: "Tổ hợp & Xác suất", title: "Gieo súc sắc 1 lần. Xác suất ra số lẻ lớn hơn 2 là:", options: { A: "1/6", B: "1/3", C: "1/2", D: "2/3", E: "3/4", F: "5/6" }, _c: "F", difficulty: 1 },
  // Q116 key=5: ans=D(24). 68^5=65='A'
  { id: 116, section: "Tổ hợp & Xác suất", title: "Xếp 4 người vào 4 ghế khác nhau. Có bao nhiêu cách xếp?", options: { A: "12", B: "16", C: "20", D: "24", E: "32", F: "48" }, _c: "A", difficulty: 2 },
  // Q117 key=6: ans=C(90). 67^6=69='E'
  { id: 117, section: "Tổ hợp & Xác suất", title: "Từ 10 học sinh chọn ban cán sự: 1 lớp trưởng và 1 lớp phó (2 vị trí khác nhau). Có bao nhiêu cách?", options: { A: "45", B: "80", C: "90", D: "100", E: "110", F: "120" }, _c: "E", difficulty: 2 },
  // Q118 key=7: ans=B(1/221). 66^7=69='E'
  { id: 118, section: "Tổ hợp & Xác suất", title: "Rút liên tiếp 2 lá bài từ bộ 52 lá (không hoàn lại). Xác suất cả 2 đều là át (Ace) là:", options: { A: "1/169", B: "1/221", C: "1/208", D: "4/663", E: "2/51", F: "1/13" }, _c: "E", difficulty: 3 },
  // Q119 key=1: ans=D(136). 68^1=69='E'
  { id: 119, section: "Tổ hợp & Xác suất", title: "Có bao nhiêu số tự nhiên có 3 chữ số khác nhau và chia hết cho 5?", options: { A: "100", B: "112", C: "120", D: "136", E: "144", F: "160" }, _c: "E", difficulty: 3 },
  // Q120 key=2: ans=D(80). 68^2=70='F'
  { id: 120, section: "Tổ hợp & Xác suất", title: "Lớp 10 nam, 8 nữ. Cần chọn 1 nam và 1 nữ để tham gia cuộc thi. Có bao nhiêu cách?", options: { A: "18", B: "36", C: "72", D: "80", E: "90", F: "100" }, _c: "F", difficulty: 1 },

  // ─── Suy luận Logic (id 121–130) ───
  // Q121 key=3: ans=E(Không thể kết luận). 69^3=70='F'
  { id: 121, section: "Suy luận Logic", title: "Tất cả A đều là B. Một số B là C. Kết luận nào CHẮC CHẮN đúng?", options: { A: "Tất cả A đều là C", B: "Một số A là C", C: "Không có A nào là C", D: "Một số C là A", E: "Không thể kết luận về mối liên hệ A-C", F: "Tất cả C đều là A" }, _c: "F", difficulty: 2 },
  // Q122 key=4: ans=B(P→R). 66^4=70='F'
  { id: 122, section: "Suy luận Logic", title: "Nếu P → Q và Q → R, thì:", options: { A: "R → P", B: "P → R", C: "¬P → ¬R", D: "R → Q", E: "¬Q → P", F: "P ↔ R" }, _c: "F", difficulty: 2 },
  // Q123 key=5: ans=B(B nói thật). 66^5=67='C'
  { id: 123, section: "Suy luận Logic", title: "Ba người A, B, C. A nói: 'B nói dối'. B nói: 'C nói dối'. C nói: 'A và B đều nói dối'. Ai nói thật?", options: { A: "A", B: "B", C: "C", D: "A và B", E: "Không ai", F: "Không xác định được" }, _c: "C", difficulty: 3 },
  // Q124 key=6: ans=C(Không thể kết luận). 67^6=69='E'
  { id: 124, section: "Suy luận Logic", title: "Biết: Mọi thứ bằng vàng đều sáng; Không phải mọi thứ sáng đều quý giá; Kim cương sáng. Kết luận nào CHẮC CHẮN đúng?", options: { A: "Kim cương quý giá", B: "Kim cương bằng vàng", C: "Không thể kết luận kim cương có quý giá không", D: "Thứ bằng vàng luôn quý giá", E: "Kim cương không quý giá", F: "Mọi thứ bằng vàng đều quý giá" }, _c: "E", difficulty: 2 },
  // Q125 key=7: ans=C(Không biết — C có thể đen hoặc trắng). 67^7=68='D'
  { id: 125, section: "Suy luận Logic", title: "Có 5 chiếc mũ: 3 đen, 2 trắng. Ba người A, B, C đội mũ; C (đứng cuối) thấy A đội đen, B đội đen. C đội mũ màu gì?", options: { A: "Đen", B: "Trắng", C: "Không thể xác định", D: "Chắc chắn đen", E: "Chắc chắn trắng", F: "Phụ thuộc vào thứ tự" }, _c: "D", difficulty: 2 },
  // Q126 key=1: ans=E(Cả B và D đều đúng). 69^1=68='D'
  { id: 126, section: "Suy luận Logic", title: "Tất cả học sinh giỏi đều học chăm. Một số học sinh học chăm nhưng không giỏi. Kết luận nào đúng?", options: { A: "Học chăm là điều kiện đủ để giỏi", B: "Học chăm là điều kiện cần để giỏi", C: "Học chăm là điều kiện cần và đủ để giỏi", D: "Không học chăm thì không giỏi", E: "Cả B và D đều đúng", F: "Không thể kết luận gì" }, _c: "D", difficulty: 3 },
  // Q127 key=2: ans=B(Đối diện B). 66^2=64='@'
  { id: 127, section: "Suy luận Logic", title: "4 người A, B, C, D ngồi xung quanh bàn tròn. A đối diện C. B ngồi bên phải A. D ngồi đâu?", options: { A: "Bên phải B", B: "Đối diện B", C: "Bên trái A", D: "Bên phải C", E: "Đối diện A", F: "Không xác định" }, _c: "@", difficulty: 2 },
  // Q128 key=3: ans=A(Bậc 4 — tàu nổi theo nước). 65^3=66='B'
  { id: 128, section: "Suy luận Logic", title: "Thang tàu có 10 bậc, mực nước ngập bậc thứ 4. Nước lên 1 bậc/giờ. Sau 3 giờ, bậc thứ mấy bị ngập?", options: { A: "Bậc 4", B: "Bậc 5", C: "Bậc 6", D: "Bậc 7", E: "Bậc 8", F: "Bậc 9" }, _c: "B", difficulty: 3 },
  // Q129 key=4: ans=B(Thứ Ba). 66^4=70='F'
  { id: 129, section: "Suy luận Logic", title: "Nếu ngày kia là thứ Sáu, thì hôm qua là thứ mấy?", options: { A: "Thứ Hai", B: "Thứ Ba", C: "Thứ Tư", D: "Thứ Năm", E: "Thứ Sáu", F: "Thứ Bảy" }, _c: "F", difficulty: 1 },
  // Q130 key=5: ans=C(Không mâu thuẫn). 67^5=70='F'
  { id: 130, section: "Suy luận Logic", title: "An nói: 'Mẹ của con trai duy nhất của tôi là vợ tôi'. Câu nói này có mâu thuẫn không?", options: { A: "Có, An có thể có nhiều con", B: "Có, không ai tự mô tả như vậy", C: "Không, câu nói hoàn toàn logic", D: "Không thể xác định", E: "Có, An có thể chưa có vợ", F: "Có, mẹ không thể là vợ" }, _c: "F", difficulty: 2 },

  // ─── Nhận dạng hình & Không gian (id 131–140) ─── 7 câu có hình SVG
  // Q131 key=6: ans=B(34). 66^6=68='D'. hasFigure
  { id: 131, section: "Nhận dạng hình", title: "Một hình vuông cạnh 6cm. Cắt 4 góc thành tam giác vuông cân (cạnh góc vuông 1cm). Diện tích còn lại?", options: { A: "32 cm²", B: "34 cm²", C: "36 cm²", D: "38 cm²", E: "40 cm²", F: "42 cm²" }, _c: "D", hasFigure: true, difficulty: 2 },
  // Q132 key=7: ans=C(Hình thoi). 67^7=68='D'
  { id: 132, section: "Nhận dạng hình", title: "Hình nào KHÔNG phải đa giác đều?", options: { A: "Tam giác đều", B: "Hình vuông", C: "Hình thoi", D: "Lục giác đều", E: "Ngũ giác đều", F: "Hình chữ nhật" }, _c: "D", difficulty: 1 },
  // Q133 key=1: ans=A(16-4π). 65^1=64='@'. hasFigure
  { id: 133, section: "Nhận dạng hình", title: "Hình tròn nội tiếp hình vuông cạnh 4cm. Diện tích phần hình vuông ngoài hình tròn là:", options: { A: "16 - 4π", B: "16 - 2π", C: "16 - π", D: "4 - π", E: "8 - π", F: "4(4-π)" }, _c: "@", hasFigure: true, difficulty: 2 },
  // Q134 key=2: ans=C(Hình thoi). 67^2=65='A'. hasFigure
  { id: 134, section: "Nhận dạng hình", title: "Gấp tờ giấy hình vuông theo đường chéo rồi cắt góc đỉnh. Khi mở ra, lỗ có hình gì?", options: { A: "Tam giác", B: "Hình vuông", C: "Hình thoi", D: "Hình tròn", E: "Lục giác", F: "Ngũ giác" }, _c: "A", hasFigure: true, difficulty: 2 },
  // Q135 key=3: ans=D(12). 68^3=71='G'. hasFigure
  { id: 135, section: "Nhận dạng hình", title: "Khối lập phương cạnh 3 được sơn toàn bộ bề mặt, rồi cắt thành 27 khối nhỏ. Bao nhiêu khối có ĐÚNG 2 mặt sơn?", options: { A: "6", B: "8", C: "10", D: "12", E: "14", F: "16" }, _c: "G", hasFigure: true, difficulty: 3 },
  // Q136 key=4: ans=C(Hình vuông, 4 trục). 67^4=71='G'. hasFigure
  { id: 136, section: "Nhận dạng hình", title: "Trong các hình sau, hình nào có số trục đối xứng nhiều nhất?", options: { A: "Hình chữ nhật (2)", B: "Hình thoi (2)", C: "Hình vuông (4)", D: "Tam giác đều (3)", E: "Hình thang cân (1)", F: "Hình bình hành (0)" }, _c: "G", hasFigure: true, difficulty: 1 },
  // Q137 key=5: ans=B(8cm). 66^5=67='C'
  { id: 137, section: "Nhận dạng hình", title: "Tờ giấy chữ nhật 12×8cm. Gấp lại (không cắt) thành hình vuông. Cạnh hình vuông lớn nhất tạo được?", options: { A: "6cm", B: "8cm", C: "9cm", D: "10cm", E: "12cm", F: "Không thể tạo được" }, _c: "C", difficulty: 2 },
  // Q138 key=6: ans=C(Khối nón). 67^6=69='E'. hasFigure
  { id: 138, section: "Nhận dạng hình", title: "Nhìn từ trên xuống: hình tròn. Nhìn từ bên phải: hình tam giác. Vật thể đó là:", options: { A: "Khối cầu", B: "Khối trụ", C: "Khối nón", D: "Khối lập phương", E: "Hình tháp vuông", F: "Hình bán cầu" }, _c: "E", hasFigure: true, difficulty: 2 },
  // Q139 key=7: ans=B(5). 66^7=69='E'. hasFigure
  { id: 139, section: "Nhận dạng hình", title: "Một tam giác lớn được chia thành 4 tam giác nhỏ bằng cách nối trung điểm 3 cạnh. Tổng số tam giác (mọi kích thước) là:", options: { A: "4", B: "5", C: "6", D: "7", E: "8", F: "9" }, _c: "E", hasFigure: true, difficulty: 2 },
  // Q140 key=1: ans=C(6). 67^1=66='B'
  { id: 140, section: "Nhận dạng hình", title: "Một đường thẳng cắt 3 đường thẳng song song nhau. Tổng số góc nhọn tạo thành là:", options: { A: "3", B: "4", C: "6", D: "8", E: "12", F: "16" }, _c: "B", difficulty: 2 },
];


/** Lookup bộ câu hỏi theo setId */
export const ALL_QUESTION_SETS: Record<1 | 2, QuizQuestion[]> = {
  1: QUESTIONS_SET1,
  2: QUESTIONS_SET2,
};

/** Backward-compat: mặc định dùng SET1 */
export const QUESTIONS = QUESTIONS_SET1;

export const QUESTION_COUNT = QUESTIONS_SET1.length;

// IQ helpers
export function calcIQ(
  answers: Record<number, OptionKey | null>,
  questions: QuizQuestion[] = QUESTIONS_SET1
): number {
  let bonus = 0;
  for (const q of questions) {
    if (answers[q.id] === decodeAnswer(q)) bonus += q.difficulty;
  }
  return 70 + bonus;
}

export function iqLabel(iq: number): { label: string; color: string } {
  if (iq < 80)  return { label: "Trung bình thấp", color: "#64748b" };
  if (iq < 95)  return { label: "Trung bình", color: "#0ea5e9" };
  if (iq < 110) return { label: "Trên trung bình", color: "#10b981" };
  if (iq < 125) return { label: "Cao", color: "#6366f1" };
  if (iq < 135) return { label: "Rất cao", color: "#8b5cf6" };
  return { label: "Xuất sắc 🏆", color: "#f59e0b" };
}
