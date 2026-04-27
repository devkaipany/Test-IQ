import { useEffect } from "react";
import { useQuiz } from "../context/QuizContext";
import { navigate } from "../App";
import { isAdmin } from "../context/QuizContext";

export default function StartPage() {
  const { status, userInfo, clearQuiz, startQuiz, selectedSet } = useQuiz();

  useEffect(() => {
    if (!userInfo) { navigate("info"); return; }
    if (status === "running") navigate("q/1");
    if (status === "submitted") navigate("result");
  }, [status, userInfo]);

  function handleStart() {
    startQuiz();
    const firstId = selectedSet === 1 ? 1 : 101;
    navigate(`q/${firstId}`);
  }

  function handleChangeInfo() {
    navigate("info");
  }

  return (
    <div className="start-page">
      {/* Neon background */}
      <div className="neon-grid" aria-hidden="true" />
      <div className="neon-orb neon-orb-1" aria-hidden="true" />
      <div className="neon-orb neon-orb-2" aria-hidden="true" />
      <div className="neon-orb neon-orb-3" aria-hidden="true" />

      {/* Top nav */}
      <div className="start-topnav">
        <a href="https://kaipany.com/" target="_blank" rel="noreferrer" className="start-topnav-link">
          🌐 kaipany.com
        </a>
        {userInfo && isAdmin(userInfo.email) && (
          <button className="start-topnav-link" onClick={() => navigate("admin")}>
            ⚙️ Admin Panel
          </button>
        )}
      </div>

      <div className="start-card">
        <div className="start-badge">KAIpany · Kiểm tra năng lực</div>
        <h1 className="start-title">
          <span style={{ color: "#7c3aed", fontStyle: "italic" }}>KAI</span><span style={{ color: "#22c55e", fontStyle: "italic" }}>pany</span>
          <span style={{ fontSize: "1.6rem", color: "var(--text-dim)", fontStyle: "normal" }}> Toán Logic</span>
        </h1>
        <p className="start-subtitle">
          {selectedSet === 1
            ? "Kiểm tra tư duy logic qua 40 câu hỏi đa dạng: dãy số, suy luận, đố tư duy, toán hình và toán thực tế."
            : "40 câu Logic IQ chuyên sâu: dãy số, tổ hợp xác suất, suy luận mệnh đề và nhận dạng hình học."}
        </p>

        {/* User greeting */}
        {userInfo && (
          <div className="user-greeting">
            <span className="user-avatar">👤</span>
            <div className="user-info">
              <div className="user-name">{userInfo.name}</div>
              <div className="user-contact">{userInfo.phone} · {userInfo.email}</div>
            </div>
            <button className="btn-icon-ghost" onClick={handleChangeInfo} title="Sửa thông tin">✏️</button>
          </div>
        )}

        <div className="start-meta">
          <div className="start-meta-item">
            <span className="start-meta-value">40</span>
            <span className="start-meta-label">Câu hỏi</span>
          </div>
          <div className="start-meta-item">
            <span className="start-meta-value">30</span>
            <span className="start-meta-label">Phút</span>
          </div>
          <div className="start-meta-item">
            <span className="start-meta-value" style={{ fontSize: "1rem" }}>
              {selectedSet === 1 ? "Bộ đề 1" : "Bộ đề 2"}
            </span>
            <span className="start-meta-label">Bộ đề</span>
          </div>
        </div>

        <div className="start-actions">
          <button className="btn btn-primary btn-full btn-lg" onClick={handleStart}>
            🚀 Bắt đầu làm bài
          </button>
          <div className="start-actions-row">
            <button className="btn btn-ghost" onClick={() => navigate("select")}>
              🔄 Đổi bộ đề
            </button>
            <button className="btn btn-danger" onClick={clearQuiz}>
              🗑️ Xóa phiên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
