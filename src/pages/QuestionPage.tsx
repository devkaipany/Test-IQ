import { useEffect, useRef } from "react";
import { useQuiz } from "../context/QuizContext";
import type { OptionKey } from "../data/questions";
import { navigate } from "../App";
import TopBar from "../components/TopBar";
import NavGrid from "../components/NavGrid";
import GeometryFigure, { GeometryOption } from "../components/GeometryFigure";
import type { GeoKey } from "../components/GeometryFigure";

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D", "E", "F"];

interface Props {
  questionId: number;
}

export default function QuestionPage({ questionId: pos }: Props) {
  const { status, answers, setAnswer, submitQuiz, userInfo, questionOrder, currentQuestions } = useQuiz();
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "idle" || !userInfo) navigate("");
    else if (status === "submitted") navigate("result");
  }, [status, userInfo]);

  const totalQ = currentQuestions.length;
  const actualId = questionOrder[pos - 1] ?? pos;
  const question = currentQuestions.find(q => q.id === actualId);
  if (!question) return null;

  const selected = answers[actualId] ?? null;
  const isFigure  = question.hasFigure === true;
  const isImage   = !!question.imageQuestion;
  const isVisual  = isFigure || isImage;
  const isLast    = pos === totalQ;
  const totalAnswered = Object.values(answers).filter(v => v !== null).length;

  function handleSelect(key: OptionKey) {
    if (selected === key) return;
    setAnswer(actualId, key);

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
          if (isLast) {
        if (window.confirm(`Bạn đã trả lời câu cuối! Nộp bài ngay?`)) {
          submitQuiz();
          navigate("result");
        }
      } else {
        navigate(`q/${pos + 1}`);
      }
    }, 450);
  }

  function goBack() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (pos > 1) navigate(`q/${pos - 1}`);
  }

  function goNext() {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (isLast) {
      if (window.confirm(`Bạn đã trả lời ${totalAnswered}/${totalQ} câu. Nộp bài ngay?`)) {
        submitQuiz();
        navigate("result");
      }
    } else {
      navigate(`q/${pos + 1}`);
    }
  }

  const diffLabel = ["", "Dễ", "Trung bình", "Khó"][question.difficulty];
  const diffColor = ["", "#10b981", "#f59e0b", "#ef4444"][question.difficulty];
  const progressPct = Math.round((totalAnswered / totalQ) * 100);

  return (
    <div className="app-shell">
      <TopBar />
      <div className="question-content">

        {/* Progress banner */}
        <div className="question-progress-banner">
          <div className="qpb-left">
            <span className="qpb-pos">Câu <strong>{pos}</strong>/{totalQ}</span>
            <span className="qpb-answered">{totalAnswered} đã trả lời</span>
          </div>
          <div className="qpb-bar-wrap">
            <div className="qpb-bar">
              <div className="qpb-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="qpb-pct">{progressPct}%</span>
          </div>
        </div>

        {/* Header */}
        <div className="question-header">
          <span className="question-number">Câu {pos}</span>
          <span className="question-section">{question.section}</span>
          <span className="diff-badge" style={{ background: diffColor + "22", color: diffColor, borderColor: diffColor + "55" }}>
            {diffLabel}
          </span>
        </div>

        {/* Question title */}
        <div className="question-title">{question.title}</div>

        {/* Figure — SVG (hasFigure) */}
        {isFigure && !isImage && (
          <div className="figure-area">
            <GeometryFigure questionId={question.id} variant="main" />
          </div>
        )}

        {/* Figure — Ảnh ngoài (imageQuestion) */}
        {isImage && (
          <div className="figure-area">
            <img
              src={question.imageQuestion}
              alt="Đề bài"
              style={{
                maxWidth: "100%",
                maxHeight: 420,
                objectFit: "contain",
                borderRadius: 16,
                background: "white",
                padding: 8,
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        )}

        <div className="options-label">
          {selected ? "✅ Đã chọn — tự động chuyển câu tiếp theo" : "👆 Chọn một đáp án bên dưới"}
        </div>

        {/* Answer cards */}
        <div
          className="options-grid"
          style={isVisual ? { gridTemplateColumns: "repeat(3, 1fr)" } : undefined}
        >
          {OPTION_KEYS.map(key => {
            const isSelected = selected === key;
            return (
              <div
                key={key}
                className={`option-card${
                  isFigure ? " figure-card" : ""
                }${isImage ? " figure-card" : ""}${isSelected ? " selected" : ""}`}
                onClick={() => handleSelect(key)}
              >
                {/* SVG option */}
                {isFigure && !isImage && (
                  <>
                    <div className="option-badge">{key}</div>
                    <GeometryOption questionId={question.id} optionKey={key as GeoKey} />
                  </>
                )}

                {/* Ảnh ngoài option */}
                {isImage && (
                  <>
                    <div className="option-badge">{key}</div>
                    {question.imageOptions?.[key] ? (
                      <img
                        src={question.imageOptions[key]}
                        alt={`Đáp án ${key}`}
                        style={{
                          width: "100%",
                          maxHeight: 120,
                          objectFit: "contain",
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "0.9rem", textAlign: "center" }}>
                        {question.options[key]}
                      </span>
                    )}
                  </>
                )}

                {/* Text option */}
                {!isFigure && !isImage && (
                  <>
                    <span className="option-badge">{key}</span>
                    {question.options[key]}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Nav Sidebar — floating button on right edge */}
        <NavGrid currentPos={pos} />

        {/* Navigation buttons */}
        <div className="question-nav">
          <button
            className="btn btn-ghost"
            onClick={goBack}
            disabled={pos <= 1}
            style={{ opacity: pos <= 1 ? 0.4 : 1 }}
          >
            ← Câu trước
          </button>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {pos} / {totalQ}
          </span>
          <button
            className="btn btn-ghost"
            onClick={goNext}
          >
            {isLast ? "🏁 Nộp bài" : "Câu tiếp →"}
          </button>
        </div>
      </div>
    </div>
  );
}
