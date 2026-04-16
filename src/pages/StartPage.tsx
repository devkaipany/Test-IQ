import { useEffect } from "react";
import { useQuiz } from "../context/QuizContext";
import { navigate } from "../App";
import { isAdmin } from "../context/QuizContext";

export default function StartPage() {
  const { status, userInfo, clearQuiz, startQuiz } = useQuiz();

  useEffect(() => {
    if (!userInfo) { navigate("info"); return; }
    if (status === "running") navigate("q/1");
    if (status === "submitted") navigate("result");
  }, [status, userInfo]);

  function handleStart() {
    startQuiz();
    navigate("q/1");
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
          Kiểm tra tư duy logic qua 40 câu hỏi đa dạng: dãy số, suy luận,
          đố tư duy, toán hình và toán thực tế.
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
        </div>

        <div className="start-actions">
          <button className="btn btn-primary btn-full btn-lg" onClick={handleStart}>
            🚀 Bắt đầu làm bài
          </button>
          <button className="btn btn-danger" onClick={clearQuiz}>
            🗑️ Xóa phiên làm bài
          </button>
        </div>
      </div>
    </div>
  );
}
