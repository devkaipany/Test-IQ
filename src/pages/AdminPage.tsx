import { useEffect } from "react";
import { useQuiz } from "../context/QuizContext";
import { isAdmin } from "../context/QuizContext";
import { navigate } from "../App";

export default function AdminPage() {
  const { userInfo, clearQuiz } = useQuiz();

  // Guard: nếu không phải admin → về trang info
  useEffect(() => {
    if (!userInfo || !isAdmin(userInfo.email)) {
      navigate("info");
    }
  }, [userInfo]);

  function handleLogout() {
    clearQuiz();
    navigate("info");
  }

  if (!userInfo) return null;

  return (
    <div className="admin-page">
      <div className="admin-shell">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-logo">
            <span style={{ color: "#7c3aed", fontStyle: "italic", fontWeight: 800 }}>KAI</span>
            <span style={{ color: "#22c55e", fontStyle: "italic", fontWeight: 800 }}>pany</span>
            <span className="admin-badge">⚙️ Admin</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>🚪 Đăng xuất</button>
        </div>

        {/* Welcome card */}
        <div className="admin-welcome">
          <div className="admin-avatar">👑</div>
          <div>
            <div className="admin-welcome-title">Xin chào, {userInfo.name}!</div>
            <div className="admin-welcome-sub">{userInfo.email} · Quản trị viên hệ thống</div>
          </div>
        </div>

        {/* Info grid */}
        <div className="admin-grid">
          <div className="admin-info-card">
            <div className="admin-info-icon">🔓</div>
            <div className="admin-info-body">
              <div className="admin-info-title">Quyền truy cập</div>
              <div className="admin-info-desc">Full quyền — DevTools không bị chặn</div>
            </div>
          </div>
          <div className="admin-info-card">
            <div className="admin-info-icon">📊</div>
            <div className="admin-info-body">
              <div className="admin-info-title">Dữ liệu bài thi</div>
              <div className="admin-info-desc">Xem tại Firebase Console → quiz-results</div>
            </div>
          </div>
          <div className="admin-info-card">
            <div className="admin-info-icon">📎</div>
            <div className="admin-info-body">
              <div className="admin-info-title">CV ứng viên</div>
              <div className="admin-info-desc">Xem tại Firebase Console → cv-submissions</div>
            </div>
          </div>
          <div className="admin-info-card">
            <div className="admin-info-icon">🔔</div>
            <div className="admin-info-body">
              <div className="admin-info-title">Webhook LarkSuite</div>
              <div className="admin-info-desc">Nhận thông báo tự động khi có kết quả mới</div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="admin-links">
          <div className="admin-links-title">🔗 Truy cập nhanh</div>
          <div className="admin-links-row">
            <a
              className="btn btn-ghost admin-link-btn"
              href="https://console.firebase.google.com"
              target="_blank" rel="noreferrer"
            >
              🔥 Firebase Console
            </a>
          </div>
        </div>

        <div className="admin-footer">
          KAIpany Admin Panel · Chỉ dành cho quản trị viên
        </div>
      </div>
    </div>
  );
}
