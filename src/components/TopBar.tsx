import { useQuiz } from "../context/QuizContext";
import { QUESTION_COUNT } from "../data/questions";
import { navigate } from "../App";

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TopBar() {
  const { answers, submitQuiz, timeLeftMs } = useQuiz();
  const answered = Object.values(answers).filter(v => v !== null).length;
  const pct = (answered / QUESTION_COUNT) * 100;

  const totalSec = Math.ceil(timeLeftMs / 1000);
  const colorClass = totalSec <= 60 ? "danger" : totalSec <= 300 ? "warning" : "";

  function handleSubmit() {
    if (window.confirm(`Bạn đã trả lời ${answered}/40 câu. Xác nhận nộp bài?`)) {
      submitQuiz();
      navigate("result");
    }
  }

  return (
    <div className="topbar">
      <span className="topbar-brand">
        <span className="brand-kai">KAI</span><span className="brand-pany">pany</span>
      </span>


      <div className="topbar-progress topbar-progress-desktop">
        <div className="topbar-progress-text">{answered}/{QUESTION_COUNT}</div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="topbar-right">
        <span className={`timer-display ${colorClass}`}>⏱ {formatTime(timeLeftMs)}</span>
        <button className="btn btn-submit" onClick={handleSubmit}>Nộp bài</button>
      </div>
    </div>
  );
}
