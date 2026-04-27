import { useQuiz } from "../context/QuizContext";
import { navigate } from "../App";

const EXAM_META = [
  {
    id: 1 as const,
    name: "Bộ đề 1",
    subtitle: "Toán Logic Tổng Hợp",
    description: "Dãy số, suy luận, đố tư duy, hình học ma trận SVG, Dirichlet và toán thực tế.",
    dist: [
      { label: "Dễ", count: 10, color: "#10b981" },
      { label: "Trung bình", count: 22, color: "#0ea5e9" },
      { label: "Khó", count: 8, color: "#8b5cf6" },
    ],
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
    badge: "Classic",
  },
  {
    id: 2 as const,
    name: "Bộ đề 2",
    subtitle: "Logic IQ Chuyên Sâu",
    description: "Dãy số Fibonacci, tổ hợp xác suất, suy luận mệnh đề, nhận dạng & không gian hình học.",
    dist: [
      { label: "Dễ", count: 14, color: "#10b981" },
      { label: "Trung bình", count: 19, color: "#0ea5e9" },
      { label: "Khó", count: 7, color: "#8b5cf6" },
    ],
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    badge: "IQ Focus",
  },
];

export default function ExamSelectPage() {
  const { selectSet, selectedSet } = useQuiz();

  function handleSelect(id: 1 | 2) {
    selectSet(id);
    navigate("start");
  }

  return (
    <div className="exam-select-page">
      <div className="exam-select-header">
        <div className="exam-select-logo">KAIpany</div>
        <h1 className="exam-select-title">Chọn Bộ Đề Thi</h1>
        <p className="exam-select-sub">Mỗi bộ gồm 40 câu · Thời gian 30 phút</p>
      </div>

      <div className="exam-card-grid">
        {EXAM_META.map((exam) => {
          const isActive = selectedSet === exam.id;
          return (
            <div
              key={exam.id}
              className={`exam-card${isActive ? " exam-card--active" : ""}`}
              style={{ "--accent": exam.accent, "--glow": exam.glow } as React.CSSProperties}
            >
              <div className="exam-card-top">
                <span className="exam-card-badge">{exam.badge}</span>
                <span className="exam-card-num">{exam.name}</span>
              </div>
              <h2 className="exam-card-subtitle">{exam.subtitle}</h2>
              <p className="exam-card-desc">{exam.description}</p>

              <div className="exam-card-dist">
                {exam.dist.map((d) => (
                  <div key={d.label} className="exam-dist-item">
                    <span className="exam-dist-dot" style={{ background: d.color }} />
                    <span className="exam-dist-label">{d.label}</span>
                    <span className="exam-dist-count">{d.count} câu</span>
                  </div>
                ))}
              </div>

              <button
                className="exam-card-btn"
                onClick={() => handleSelect(exam.id)}
              >
                {isActive ? "✓ Đã chọn — Vào thi" : "Chọn bộ đề này"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="exam-select-note">
        * Kết quả được tính theo thang IQ riêng của từng bộ đề
      </p>
    </div>
  );
}
