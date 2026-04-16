import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { isAdmin } from "../context/QuizContext";
import { navigate } from "../App";
import { QUESTIONS } from "../data/questions";
import type { QuizQuestion, OptionKey } from "../data/questions";

// ── Question state manager (localStorage) ────────────────────────────────────
const QM_KEY = "kaipany_question_manager_v1";

interface QMState {
  inactive: number[]; // IDs of disabled questions
  custom: QuizQuestion[]; // admin-added questions
}

function loadQM(): QMState {
  try {
    const raw = localStorage.getItem(QM_KEY);
    if (raw) return JSON.parse(raw) as QMState;
  } catch { /* ignore */ }
  return { inactive: [], custom: [] };
}

function saveQM(s: QMState) {
  localStorage.setItem(QM_KEY, JSON.stringify(s));
}

export function getActiveQuestions(): QuizQuestion[] {
  const qm = loadQM();
  const base = QUESTIONS.filter(q => !qm.inactive.includes(q.id));
  return [...base, ...qm.custom.filter(q => !qm.inactive.includes(q.id))];
}

// ── Encode answer for custom questions ───────────────────────────────────────
function encodeAnswer(id: number, answer: OptionKey): string {
  return String.fromCharCode(answer.charCodeAt(0) ^ (id % 7 + 1));
}

// ── Stat helpers ─────────────────────────────────────────────────────────────
function getDiffLabel(d: 1 | 2 | 3) {
  return [, "Dễ", "Vừa", "Khó"][d] as string;
}
function getDiffColor(d: 1 | 2 | 3) {
  return [, "#10b981", "#f59e0b", "#ef4444"][d] as string;
}

// ── Empty form ────────────────────────────────────────────────────────────────
interface NewQ {
  section: string;
  title: string;
  A: string; B: string; C: string; D: string; E: string; F: string;
  answer: OptionKey;
  difficulty: 1 | 2 | 3;
}
const EMPTY_Q: NewQ = {
  section: "", title: "",
  A: "", B: "", C: "", D: "", E: "", F: "",
  answer: "A", difficulty: 2,
};

// ── Admin Tab type ────────────────────────────────────────────────────────────
type AdminTab = "dashboard" | "questions" | "add";

export default function AdminPage() {
  const { userInfo, clearQuiz, startQuiz } = useQuiz();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [qm, setQm] = useState<QMState>(loadQM);
  const [newQ, setNewQ] = useState<NewQ>(EMPTY_Q);
  const [addMsg, setAddMsg] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!userInfo || !isAdmin(userInfo.email)) {
      navigate("info");
    }
  }, [userInfo]);

  function handleLogout() {
    clearQuiz();
    navigate("info");
  }

  function handleGoQuiz() {
    startQuiz();
    navigate("q/1");
  }

  function toggleQuestion(id: number) {
    setQm(prev => {
      const next = prev.inactive.includes(id)
        ? { ...prev, inactive: prev.inactive.filter(x => x !== id) }
        : { ...prev, inactive: [...prev.inactive, id] };
      saveQM(next);
      return next;
    });
  }

  function deleteCustom(id: number) {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    setQm(prev => {
      const next = { ...prev, custom: prev.custom.filter(q => q.id !== id) };
      saveQM(next);
      return next;
    });
  }

  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQ.section.trim() || !newQ.title.trim() || !newQ.A || !newQ.B || !newQ.C || !newQ.D) {
      setAddMsg("⚠️ Vui lòng điền đủ các trường bắt buộc (Section, Câu hỏi, A, B, C, D)");
      return;
    }
    const allQ = [...QUESTIONS, ...qm.custom];
    const maxId = Math.max(...allQ.map(q => q.id), 100);
    const newId = maxId + 1;
    const added: QuizQuestion = {
      id: newId,
      section: newQ.section,
      title: newQ.title,
      options: { A: newQ.A, B: newQ.B, C: newQ.C, D: newQ.D, E: newQ.E || "—", F: newQ.F || "—" },
      _c: encodeAnswer(newId, newQ.answer),
      difficulty: newQ.difficulty,
    };
    setQm(prev => {
      const next = { ...prev, custom: [...prev.custom, added] };
      saveQM(next);
      return next;
    });
    setNewQ(EMPTY_Q);
    setAddMsg(`✅ Đã thêm câu #${newId} thành công!`);
    setTab("questions");
  }

  if (!userInfo) return null;

  const allQ = [...QUESTIONS, ...qm.custom];
  const activeCount = allQ.filter(q => !qm.inactive.includes(q.id)).length;
  const inactiveCount = qm.inactive.length;
  const customCount = qm.custom.length;
  const diffCounts = [0, 0, 0, 0];
  allQ.forEach(q => diffCounts[q.difficulty]++);

  const filtered = allQ.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.section.toLowerCase().includes(search.toLowerCase()) ||
      String(q.id).includes(search);
    const matchDiff = filterDiff === 0 || q.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div className="admin-page">
      <div className="admin-shell">
        {/* ── Header ── */}
        <div className="admin-header">
          <div className="admin-logo">
            <span style={{ color: "#7c3aed", fontStyle: "italic", fontWeight: 800 }}>KAI</span>
            <span style={{ color: "#22c55e", fontStyle: "italic", fontWeight: 800 }}>pany</span>
            <span className="admin-badge">⚙️ Admin</span>
          </div>
          <div className="admin-header-actions">
            <button className="btn btn-quiz-test" onClick={handleGoQuiz}>
              📝 Vào bài thi
            </button>
            <button className="btn btn-ghost" onClick={handleLogout}>🚪 Đăng xuất</button>
          </div>
        </div>

        {/* ── Welcome card ── */}
        <div className="admin-welcome">
          <div className="admin-avatar">👑</div>
          <div style={{ flex: 1 }}>
            <div className="admin-welcome-title">Xin chào, {userInfo.name}!</div>
            <div className="admin-welcome-sub">{userInfo.email} · Quản trị viên hệ thống</div>
          </div>
          <div className="admin-online-badge">🟢 Online</div>
        </div>

        {/* ── Dashboard stats ── */}
        <div className="admin-stats-row">
          <div className="admin-stat-card stat-blue">
            <div className="admin-stat-icon">📋</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{allQ.length}</div>
              <div className="admin-stat-label">Tổng câu hỏi</div>
            </div>
          </div>
          <div className="admin-stat-card stat-green">
            <div className="admin-stat-icon">✅</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{activeCount}</div>
              <div className="admin-stat-label">Đang hoạt động</div>
            </div>
          </div>
          <div className="admin-stat-card stat-red">
            <div className="admin-stat-icon">⏸️</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{inactiveCount}</div>
              <div className="admin-stat-label">Đã tắt</div>
            </div>
          </div>
          <div className="admin-stat-card stat-purple">
            <div className="admin-stat-icon">✨</div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{customCount}</div>
              <div className="admin-stat-label">Câu tự thêm</div>
            </div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <div className="admin-tabs">
          <button
            className={`admin-tab${tab === "dashboard" ? " active" : ""}`}
            onClick={() => setTab("dashboard")}
          >📊 Dashboard</button>
          <button
            className={`admin-tab${tab === "questions" ? " active" : ""}`}
            onClick={() => setTab("questions")}
          >📝 Câu hỏi ({allQ.length})</button>
          <button
            className={`admin-tab${tab === "add" ? " active" : ""}`}
            onClick={() => setTab("add")}
          >➕ Thêm câu hỏi</button>
        </div>

        {/* ══════════════════════ TAB: DASHBOARD ══════════════════════ */}
        {tab === "dashboard" && (
          <div className="admin-tab-content">
            {/* Difficulty breakdown */}
            <div className="admin-section">
              <div className="admin-section-title">📈 Phân phối độ khó</div>
              <div className="diff-breakdown">
                {([1, 2, 3] as const).map(d => {
                  const count = diffCounts[d];
                  const pct = Math.round((count / allQ.length) * 100);
                  return (
                    <div key={d} className="diff-breakdown-item">
                      <div className="diff-breakdown-header">
                        <span className="diff-pill" style={{ background: getDiffColor(d) + "22", color: getDiffColor(d), borderColor: getDiffColor(d) + "55" }}>
                          {getDiffLabel(d)}
                        </span>
                        <span className="diff-breakdown-count">{count} câu</span>
                      </div>
                      <div className="diff-bar-track">
                        <div
                          className="diff-bar-fill"
                          style={{ width: `${pct}%`, background: getDiffColor(d) }}
                        />
                      </div>
                      <div className="diff-breakdown-pct">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Links & Info grid */}
            <div className="admin-info-grid">
              <a
                className="admin-info-card admin-info-card-link"
                href="https://kai-pany.sg.larksuite.com"
                target="_blank" rel="noreferrer"
              >
                <div className="admin-info-icon">📊</div>
                <div className="admin-info-body">
                  <div className="admin-info-title">Lark Base — Kết quả bài thi</div>
                  <div className="admin-info-desc">Xem toàn bộ kết quả thí sinh trên Lark Base →</div>
                </div>
                <div className="admin-info-arrow">↗</div>
              </a>
              <a
                className="admin-info-card admin-info-card-link"
                href="https://kaipany.com/"
                target="_blank" rel="noreferrer"
              >
                <div className="admin-info-icon">🌐</div>
                <div className="admin-info-body">
                  <div className="admin-info-title">KAIpany Website</div>
                  <div className="admin-info-desc">Truy cập trang chủ KAIpany →</div>
                </div>
                <div className="admin-info-arrow">↗</div>
              </a>
              <div className="admin-info-card">
                <div className="admin-info-icon">🔓</div>
                <div className="admin-info-body">
                  <div className="admin-info-title">Quyền truy cập</div>
                  <div className="admin-info-desc">Full quyền — F12 / DevTools không bị chặn</div>
                </div>
              </div>
              <div className="admin-info-card">
                <div className="admin-info-icon">🔔</div>
                <div className="admin-info-body">
                  <div className="admin-info-title">Webhook Lark Base</div>
                  <div className="admin-info-desc">Kết quả được đẩy tự động qua Lark webhook</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="admin-section">
              <div className="admin-section-title">⚡ Thao tác nhanh</div>
              <div className="admin-quick-actions">
                <button className="btn btn-primary" onClick={handleGoQuiz}>
                  📝 Vào thi thử
                </button>
                <button className="btn btn-ghost" onClick={() => setTab("add")}>
                  ➕ Thêm câu hỏi mới
                </button>
                <button className="btn btn-ghost" onClick={() => setTab("questions")}>
                  📋 Quản lý câu hỏi
                </button>
                <a
                  className="btn btn-ghost"
                  href="https://open-sg.larksuite.com"
                  target="_blank" rel="noreferrer"
                >
                  🔗 Lark Suite
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════ TAB: QUESTIONS ══════════════════════ */}
        {tab === "questions" && (
          <div className="admin-tab-content">
            {/* Filters */}
            <div className="qm-filters">
              <input
                className="qm-search"
                placeholder="🔍 Tìm theo câu hỏi, phần, ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="qm-diff-filters">
                {([0, 1, 2, 3] as const).map(d => (
                  <button
                    key={d}
                    className={`qm-diff-btn${filterDiff === d ? " active" : ""}`}
                    onClick={() => setFilterDiff(d)}
                    style={d > 0 ? {
                      borderColor: filterDiff === d ? getDiffColor(d) : undefined,
                      color: filterDiff === d ? getDiffColor(d) : undefined,
                    } : undefined}
                  >
                    {d === 0 ? "Tất cả" : getDiffLabel(d)}
                  </button>
                ))}
              </div>
            </div>

            <div className="qm-count">Hiển thị {filtered.length}/{allQ.length} câu hỏi</div>

            <div className="qm-list">
              {filtered.map(q => {
                const isInactive = qm.inactive.includes(q.id);
                const isCustom = qm.custom.some(c => c.id === q.id);
                return (
                  <div key={q.id} className={`qm-item${isInactive ? " inactive" : ""}`}>
                    <div className="qm-item-left">
                      <div className="qm-item-id">#{q.id}</div>
                      <div className="qm-item-body">
                        <div className="qm-item-section">
                          {q.section}
                          {isCustom && <span className="qm-custom-tag">Tự thêm</span>}
                        </div>
                        <div className="qm-item-title">{q.title}</div>
                        <div className="qm-item-options">
                          {(["A", "B", "C", "D"] as OptionKey[]).map(k => (
                            <span key={k} className="qm-option-chip">
                              <strong>{k}.</strong> {q.options[k]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="qm-item-right">
                      <span
                        className="diff-pill"
                        style={{
                          background: getDiffColor(q.difficulty) + "22",
                          color: getDiffColor(q.difficulty),
                          borderColor: getDiffColor(q.difficulty) + "55",
                        }}
                      >
                        {getDiffLabel(q.difficulty)}
                      </span>
                      <label className="qm-toggle" title={isInactive ? "Bật lại câu hỏi" : "Tắt câu hỏi"}>
                        <input
                          type="checkbox"
                          checked={!isInactive}
                          onChange={() => toggleQuestion(q.id)}
                        />
                        <span className="qm-toggle-track" />
                      </label>
                      <span className="qm-status-text">{isInactive ? "Tắt" : "Bật"}</span>
                      {isCustom && (
                        <button
                          className="qm-delete-btn"
                          onClick={() => deleteCustom(q.id)}
                          title="Xóa câu hỏi"
                        >🗑️</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="qm-empty">Không tìm thấy câu hỏi phù hợp.</div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ TAB: ADD QUESTION ══════════════════════ */}
        {tab === "add" && (
          <div className="admin-tab-content">
            <div className="addq-card">
              <div className="addq-header">
                <div className="addq-icon">➕</div>
                <div>
                  <div className="addq-title">Thêm câu hỏi mới</div>
                  <div className="addq-sub">Câu hỏi sẽ được thêm ngay vào bộ đề và lưu trên thiết bị này</div>
                </div>
              </div>
              {addMsg && (
                <div className={`addq-msg${addMsg.startsWith("✅") ? " success" : " error"}`}>
                  {addMsg}
                </div>
              )}
              <form onSubmit={handleAddQuestion} className="addq-form">
                <div className="addq-row">
                  <div className="addq-field">
                    <label>Phần (Section) *</label>
                    <input
                      className="form-input"
                      placeholder="VD: Toán Số · Dãy số"
                      value={newQ.section}
                      onChange={e => setNewQ(p => ({ ...p, section: e.target.value }))}
                    />
                  </div>
                  <div className="addq-field">
                    <label>Độ khó *</label>
                    <select
                      className="form-input"
                      value={newQ.difficulty}
                      onChange={e => setNewQ(p => ({ ...p, difficulty: +e.target.value as 1 | 2 | 3 }))}
                    >
                      <option value={1}>Dễ</option>
                      <option value={2}>Vừa</option>
                      <option value={3}>Khó</option>
                    </select>
                  </div>
                </div>

                <div className="addq-field">
                  <label>Câu hỏi *</label>
                  <textarea
                    className="form-input addq-textarea"
                    placeholder="Nhập nội dung câu hỏi..."
                    value={newQ.title}
                    onChange={e => setNewQ(p => ({ ...p, title: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="addq-section-title">📝 Đáp án (A–D bắt buộc, E–F tùy chọn)</div>
                <div className="addq-options-grid">
                  {(["A", "B", "C", "D", "E", "F"] as OptionKey[]).map(k => (
                    <div key={k} className="addq-field">
                      <label>Đáp án {k}{["A", "B", "C", "D"].includes(k) ? " *" : ""}</label>
                      <input
                        className="form-input"
                        placeholder={`Nhập đáp án ${k}`}
                        value={newQ[k as keyof NewQ] as string}
                        onChange={e => setNewQ(p => ({ ...p, [k]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                <div className="addq-field">
                  <label>✅ Đáp án đúng *</label>
                  <div className="addq-answer-picker">
                    {(["A", "B", "C", "D", "E", "F"] as OptionKey[]).map(k => (
                      <button
                        key={k}
                        type="button"
                        className={`addq-answer-btn${newQ.answer === k ? " selected" : ""}`}
                        onClick={() => setNewQ(p => ({ ...p, answer: k }))}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="addq-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => { setNewQ(EMPTY_Q); setAddMsg(""); }}>
                    🔄 Reset
                  </button>
                  <button type="submit" className="btn btn-primary">
                    ✅ Thêm câu hỏi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-footer">
          KAIpany Admin Panel · Chỉ dành cho quản trị viên
        </div>
      </div>
    </div>
  );
}
