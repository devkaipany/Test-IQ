import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { navigate } from "../App";
import { QUESTION_COUNT } from "../data/questions";

interface Props {
  /** 1-based position in the shuffled order */
  currentPos: number;
}

export default function NavGrid({ currentPos }: Props) {
  const { answers, questionOrder } = useQuiz();
  const [expanded, setExpanded] = useState(false);

  const answered = Object.values(answers).filter(v => v !== null).length;

  return (
    <>
      {/* Collapsed toggle button */}
      <button
        className="nav-sidebar-toggle"
        onClick={() => setExpanded(e => !e)}
        title={expanded ? "Đóng điều hướng" : "Mở điều hướng câu hỏi"}
        aria-label="Điều hướng câu hỏi"
      >
        <span className="nav-toggle-icon">{expanded ? "✕" : "≡"}</span>
        <span className="nav-toggle-count">{answered}/{QUESTION_COUNT}</span>
      </button>

      {/* Sidebar panel */}
      {expanded && (
        <div className="nav-sidebar" role="navigation" aria-label="Điều hướng câu hỏi">
          <div className="nav-sidebar-header">
            <span className="nav-sidebar-title">Câu hỏi</span>
            <button className="nav-sidebar-close" onClick={() => setExpanded(false)}>✕</button>
          </div>
          <div className="nav-sidebar-progress">
            {answered}/{QUESTION_COUNT} đã trả lời
          </div>
          <div className="nav-sidebar-grid">
            {Array.from({ length: QUESTION_COUNT }, (_, i) => {
              const pos = i + 1;
              const qId = questionOrder[i];
              const isAnswered = answers[qId] !== null && answers[qId] !== undefined;
              const isCurrent = pos === currentPos;
              let cls = "nav-cell";
              if (isCurrent) cls += " current";
              else if (isAnswered) cls += " answered";

              return (
                <a
                  key={pos}
                  className={cls}
                  href={`#q/${pos}`}
                  onClick={e => {
                    e.preventDefault();
                    navigate(`q/${pos}`);
                    setExpanded(false);
                  }}
                >
                  {pos}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay */}
      {expanded && (
        <div className="nav-sidebar-overlay" onClick={() => setExpanded(false)} />
      )}
    </>
  );
}
