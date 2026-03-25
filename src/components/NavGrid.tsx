import { useQuiz } from "../context/QuizContext";
import { navigate } from "../App";
import { QUESTION_COUNT } from "../data/questions";

interface Props {
  /** 1-based position in the shuffled order */
  currentPos: number;
}

export default function NavGrid({ currentPos }: Props) {
  const { answers, questionOrder } = useQuiz();

  return (
    <div className="nav-section">
      <div className="nav-section-title">Điều hướng nhanh</div>
      <div className="nav-grid">
        {Array.from({ length: QUESTION_COUNT }, (_, i) => {
          const pos = i + 1;            // position 1..40
          const qId = questionOrder[i]; // actual question ID at this position
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
              }}
            >
              {pos}
            </a>
          );
        })}
      </div>
    </div>
  );
}
