import { useEffect, useRef, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { calcIQ, iqLabel, decodeAnswer } from "../data/questions";
import { navigate } from "../App";
import { sendQuizResult } from "../utils/webhook";

// Mã đề theo setId
const EXAM_CODES: Record<1 | 2, string> = { 1: "KAI-IQ101", 2: "KAI-IQ102" };
const EXAM_NAMES: Record<1 | 2, string> = { 1: "Toán Logic", 2: "Logic IQ" };

// ── AI Evaluation Engine ──────────────────────────────────────────────────────

import type { QuizQuestion } from "../data/questions";

function buildSectionStats(answers: Record<number, string | null>, questions: QuizQuestion[]) {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const key = q.section.split(" · ")[0];
    if (!map[key]) map[key] = { correct: 0, total: 0 };
    map[key].total++;
    if (answers[q.id] === decodeAnswer(q)) map[key].correct++;
  }
  return Object.entries(map).map(([name, { correct, total }]) => ({
    name, correct, total, pct: Math.round((correct / total) * 100),
  }));
}

function generateAIFeedback(
  answers: Record<number, string | null>,
  correctCount: number,
  iq: number,
  questions: QuizQuestion[],
  selectedSet: 1 | 2,
  userName?: string
): string[] {
  const sections = buildSectionStats(answers, questions);
  const total = questions.length;
  const pct = Math.round((correctCount / total) * 100);
  const examName = EXAM_NAMES[selectedSet];
  const skipped = Object.values(answers).filter(v => v === null).length;
  const name = userName ?? "Bạn";
  const strong = sections.filter(s => s.pct >= 70);
  const weak = sections.filter(s => s.pct < 50);
  const soSo = sections.filter(s => s.pct >= 50 && s.pct < 70);
  const lines: string[] = [];

  // ─── Đánh giá tổng quan ───
  if (pct >= 85) lines.push(`${name} đã xuất sắc hoàn thành bài kiểm tra ${examName} (Mã đề: ${EXAM_CODES[selectedSet]}) với ${correctCount}/${total} câu đúng (${pct}%). IQ ước tính ${iq} cho thấy năng lực phân tích và xử lý thông tin ở mức rất cao so với mặt bằng chung.`);
  else if (pct >= 70) lines.push(`${name} hoàn thành bài ${examName} với ${correctCount}/${total} câu đúng (${pct}%) — kết quả khá tốt. IQ ước tính ${iq} phản ánh nền tảng tư duy logic vững chắc, với khả năng nhận diện quy luật và suy luận có hệ thống.`);
  else if (pct >= 50) lines.push(`${name} trả lời đúng ${correctCount}/${total} câu (${pct}%) trong bài ${examName} — ở mức trung bình. IQ ước tính ${iq} cho thấy tư duy logic đang phát triển, có tiềm năng cải thiện đáng kể qua luyện tập.`);
  else lines.push(`${name} trả lời đúng ${correctCount}/${total} câu (${pct}%) trong bài ${examName}. Đây là điểm khởi đầu — với luyện tập thêm, kết quả sẽ cải thiện rõ rệt.`);

  // ─── Phân tích điểm mạnh ───
  if (strong.length > 0) {
    const sn = strong.map(s => `${s.name} (${s.pct}%)`).join(", ");
    const tip = strong.some(s => s.name.includes("Hình")) ? "Tư duy không gian và nhận dạng hình học là thế mạnh đặc biệt."
      : strong.some(s => s.name.includes("Xác suất") || s.name.includes("Tổ hợp")) ? "Tư duy tổ hợp-xác suất là lợi thế trong phân tích định lượng."
      : strong.some(s => s.name.includes("Logic")) ? "Tư duy phân tích và suy luận logic chặt chẽ — rất có giá trị trong môi trường làm việc."
      : "Khả năng nhận diện quy luật số học và tư duy có hệ thống.";
    lines.push(`✅ Điểm mạnh nổi bật: ${sn}. ${tip}`);
  }

  // ─── Điểm cần cải thiện ───
  if (weak.length > 0) {
    const wn = weak.map(s => `${s.name} (${s.pct}%)`).join(", ");
    const tip = weak.some(s => s.name.includes("Hình")) ? "Luyện tập nhận dạng hình học và tư duy không gian qua các bài IQ trực quan."
      : weak.some(s => s.name.includes("Xác suất")) ? "Ôn lại công thức xác suất cơ bản và kỹ thuật đếm tổ hợp."
      : weak.some(s => s.name.includes("Logic")) ? "Thực hành các bài suy luận logic — chú ý phân biệt điều kiện cần và điều kiện đủ."
      : "Ôn lại và thử luyện thêm các dạng câu hỏi tương tự.";
    lines.push(`📌 Cần cải thiện: ${wn}. ${tip}`);
  } else if (soSo.length > 0) {
    const sn = soSo.map(s => `${s.name} (${s.pct}%)`).join(", ");
    lines.push(`📊 Các phần ${sn} đang ở mức ổn định — tập trung đọc kỹ đề và tránh bẫy suy luận để nâng cao hơn nữa.`);
  }

  // ─── Gợi ý nghề nghiệp ───
  const careerMap = [
    { cond: iq >= 125, text: "Với chỉ số IQ cao, bạn có tiềm năng xuất sắc ở các vị trí đòi hỏi tư duy phân tích chuyên sâu: kỹ thuật phần mềm, khoa học dữ liệu, nghiên cứu, hoặc tài chính định lượng." },
    { cond: iq >= 110 && strong.some(s => s.name.includes("Logic")), text: "Tư duy logic mạnh kết hợp IQ tốt phù hợp với: phân tích dữ liệu, quản lý dự án công nghệ, tư vấn chiến lược hoặc kiểm toán." },
    { cond: iq >= 110 && strong.some(s => s.name.includes("Hình")), text: "Khả năng tư duy không gian tốt phù hợp với: thiết kế kỹ thuật, kiến trúc, đồ họa hoặc các ngành kỹ thuật cơ học." },
    { cond: iq >= 95, text: "Với năng lực tư duy tốt, bạn phù hợp với các vị trí đòi hỏi kỹ năng phân tích: kế toán, marketing data, quản lý vận hành hoặc hành chính cấp cao." },
  ];
  const career = careerMap.find(c => c.cond);
  if (career) lines.push(`💼 Gợi ý định hướng: ${career.text}`);

  // ─── Quản lý thời gian ───
  if (skipped > 5) lines.push(`⏱️ ${name} bỏ qua ${skipped} câu — quản lý thời gian là điểm cần chú ý. Luyện kỹ thuật "đánh nhanh rồi quay lại" để không bỏ trống câu nào.`);
  else if (skipped > 0) lines.push(`💡 Có ${skipped} câu bị bỏ qua — lần tới hãy đoán có cơ sở thay vì để trống, vì mỗi câu trả lời đều có thể tạo thêm điểm.`);
  else lines.push(`⏱️ ${name} trả lời đầy đủ tất cả ${total} câu — kỹ năng quản lý thời gian tốt là lợi thế lớn khi thi thật.`);

  return lines;
}

// ── Result Page ────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const { status, answers, userInfo, clearQuiz, currentQuestions, selectedSet } = useQuiz();
  const sentRef = useRef(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  useEffect(() => {
    if (status === "idle") navigate("");
    if (status === "running") navigate("q/1");
  }, [status]);

  const correctCount = currentQuestions.reduce((acc, q) => answers[q.id] === decodeAnswer(q) ? acc + 1 : acc, 0);
  const total = currentQuestions.length;
  const percent = Math.round((correctCount / total) * 100);
  const score10 = ((correctCount / total) * 10).toFixed(2);
  const iq = calcIQ(answers, currentQuestions);
  const { label: iqLabelText, color: iqColor } = iqLabel(iq);
  const emoji = percent >= 80 ? "🎉" : percent >= 60 ? "👍" : "📚";
  const examCode = EXAM_CODES[selectedSet];
  const aiFeedback = generateAIFeedback(answers, correctCount, iq, currentQuestions, selectedSet, userInfo?.name);

  // Section stats for radar-style breakdown
  const sectionStats = buildSectionStats(answers, currentQuestions);

  // Auto-send to Lark webhook only (no Firebase)
  useEffect(() => {
    if (status !== "submitted" || sentRef.current || !userInfo) return;
    sentRef.current = true;
    setSendStatus("sending");

    const aiText = aiFeedback.join("\n\n");

    function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
      return Promise.race([p, new Promise<T>(res => setTimeout(() => res(fallback), ms))]);
    }

    withTimeout(
      sendQuizResult({
        ho_ten: userInfo.name,
        so_dien_thoai: userInfo.phone,
        email: userInfo.email,
        stk: userInfo.bank_number || "—",
        ten_ngan_hang: userInfo.bank_name || "—",
        ten_tai_khoan: userInfo.account_name || "—",
        so_diem: `${score10}/10 (${correctCount}/${total} câu đúng)`,
        iq_uoc_tinh: iq,
        danh_gia_ai: aiText,
        ma_de: examCode,
      }),
      5000,
      false,
    ).then(ok => setSendStatus(ok ? "ok" : "error"));

  }, [status, userInfo]); // eslint-disable-line

  function handleRestart() { clearQuiz(); navigate(""); }
  function handleGoBack() { navigate("q/1"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── Result TopBar ── */}
      <div className="result-topbar">
        <div className="result-topbar-left">
          <span style={{ fontSize: "1.4rem" }}>&#127942;</span>
          {userInfo && (
            <div className="result-topbar-user">
              <span className="result-topbar-name">&#128100; {userInfo.name}</span>
              <span className="result-topbar-contact">{userInfo.phone} &middot; {userInfo.email}</span>
            </div>
          )}
        </div>
        <div className="result-topbar-right">
          <button className="result-topbar-btn" onClick={handleGoBack}>
            &larr; Làm lại bài
          </button>
          <a
            className="result-topbar-btn primary"
            href="https://kaipany.com/"
            target="_blank"
            rel="noreferrer"
          >
            &#127760; KAIpany.com
          </a>
        </div>
      </div>
      <div className="result-page">
        <div className="result-content">
          {/* Hero */}
          <div className="result-hero">
            <div className="result-icon">{emoji}</div>
            <h1 className="result-title">Kết quả bài kiểm tra</h1>
            {userInfo && (
              <div className="result-candidate">
                👤 <strong>{userInfo.name}</strong> · {userInfo.phone} · {userInfo.email}
              </div>
            )}
            <p className="result-subtitle">{EXAM_NAMES[selectedSet]} · {total} câu · 30 phút · <strong style={{color:"var(--accent)"}}>{examCode}</strong></p>
            <div className="send-status">
              {sendStatus === "sending" && <span className="tag-sending">⏳ Đang gửi kết quả đến KAIpany...</span>}
              {sendStatus === "ok" && <span className="tag-sent">✅ Kết quả đã được ghi nhận</span>}
              {sendStatus === "error" && <span className="tag-send-error">⚠️ Gửi thất bại — kiểm tra kết nối</span>}
            </div>
          </div>

          {/* Score cards */}
          <div className="score-cards">
            <div className="score-card">
              <div className="score-card-value">{correctCount}/{total}</div>
              <div className="score-card-label">Số câu đúng</div>
            </div>
            <div className="score-card">
              <div className="score-card-value">{percent}%</div>
              <div className="score-card-label">Phần trăm</div>
            </div>
            <div className="score-card">
              <div className="score-card-value">{score10}</div>
              <div className="score-card-label">Điểm / 10</div>
            </div>
          </div>

          {/* IQ card */}
          <div className="iq-card" style={{ borderColor: iqColor + "55" }}>
            <div className="iq-card-left">
              <div className="iq-label">Chỉ số IQ ước tính</div>
            </div>
            <div className="iq-right">
              <div className="iq-value" style={{ color: iqColor }}>{iq}</div>
              <div className="iq-assess" style={{ color: iqColor }}>{iqLabelText}</div>
            </div>
          </div>

          {/* IQ scale */}
          <div className="iq-scale">
            {[
              { range: "70–79", label: "Trung bình thấp", active: iq < 80 },
              { range: "80–94", label: "Trung bình", active: iq >= 80 && iq < 95 },
              { range: "95–109", label: "Trên TB", active: iq >= 95 && iq < 110 },
              { range: "110–124", label: "Cao", active: iq >= 110 && iq < 125 },
              { range: "125–134", label: "Rất cao", active: iq >= 125 && iq < 135 },
              { range: "135+", label: "Xuất sắc", active: iq >= 135 },
            ].map(s => (
              <div key={s.range} className={`iq-scale-item${s.active ? " active" : ""}`}>
                <div className="iq-scale-range">{s.range}</div>
                <div className="iq-scale-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section breakdown dashboard */}
          <div className="section-breakdown-card">
            <div className="section-breakdown-header">
              <span className="section-breakdown-icon">📊</span>
              <div>
                <div className="section-breakdown-title">Kết quả theo phần thi</div>
                <div className="section-breakdown-sub">Phân tích chi tiết từng nhóm câu hỏi</div>
              </div>
            </div>
            <div className="section-breakdown-list">
              {sectionStats.map(s => (
                <div key={s.name} className="section-breakdown-item">
                  <div className="section-breakdown-name">{s.name}</div>
                  <div className="section-breakdown-bar-wrap">
                    <div className="section-breakdown-bar-track">
                      <div
                        className="section-breakdown-bar-fill"
                        style={{
                          width: `${s.pct}%`,
                          background: s.pct >= 70 ? "#22c55e" : s.pct >= 45 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="section-breakdown-stat">{s.correct}/{s.total}</span>
                    <span
                      className="section-breakdown-pct"
                      style={{ color: s.pct >= 70 ? "#22c55e" : s.pct >= 45 ? "#f59e0b" : "#ef4444" }}
                    >
                      {s.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Evaluation */}
          <div className="ai-eval-card">
            <div className="ai-eval-header">
              <span className="ai-eval-icon">🤖</span>
              <div>
                <div className="ai-eval-title">Đánh giá của AI</div>
                <div className="ai-eval-sub">Phân tích dựa trên kết quả bài làm</div>
              </div>
            </div>
            <div className="ai-eval-body">
              {aiFeedback.map((para, i) => <p key={i} className="ai-eval-para">{para}</p>)}
            </div>
            <div className="ai-eval-footer">
              <span className="ai-eval-disclaimer">⚠️ Đây là đánh giá tự động, không phải chẩn đoán IQ chính thức.</span>
            </div>
          </div>

          {/* Answer table */}
          <div className="answer-table-wrap">
            <table className="answer-table">
              <thead>
                <tr><th>#</th><th>Phần</th><th>Đã chọn</th><th>Kết quả</th></tr>
              </thead>
              <tbody>
                {currentQuestions.map(q => {
                  const chosen = answers[q.id] ?? null;
                  const isCorrect = chosen === decodeAnswer(q);
                  const isSkipped = chosen === null;
                  return (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 700, color: "var(--accent)" }}>{q.id}</td>
                      <td style={{ color: "var(--text-dim)", fontSize: "0.78rem" }}>{q.section}</td>
                      <td style={{ fontWeight: 600 }}>{chosen ?? "—"}</td>
                      <td>
                        {isSkipped ? <span className="tag-skipped">— Bỏ qua</span>
                          : isCorrect ? <span className="tag-correct">✓ Đúng</span>
                            : <span className="tag-wrong">✗ Sai</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Actions — NO CV button */}
          <div className="result-actions">
            <a className="btn btn-ghost" href="https://kaipany.com/" target="_blank" rel="noreferrer">
              🌐 Về trang chủ KAIpany
            </a>
            <button className="btn btn-primary" onClick={handleRestart}>🔄 Làm lại</button>
          </div>

        </div>
      </div>
    </div>
  );
}
