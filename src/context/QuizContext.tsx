import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { OptionKey } from "../data/questions";
import { QUESTION_COUNT, QUIZ_DURATION_MINUTES } from "../data/questions";

export interface UserInfo {
  name: string;
  phone: string;
  email: string;
  /** Số tài khoản ngân hàng */
  bank_number: string;
  /** Tên ngân hàng */
  bank_name: string;
  /** Tên chủ tài khoản */
  account_name: string;
}

export const ADMIN_EMAIL = "natsu8621@gmail.com";
export function isAdmin(email?: string) {
  return email?.toLowerCase().trim() === ADMIN_EMAIL;
}

export type QuizStatus = "idle" | "running" | "submitted";

export interface QuizState {
  status: QuizStatus;
  startedAt: number | null;
  endsAt: number | null;
  answers: Record<number, OptionKey | null>;
  userInfo: UserInfo | null;
  questionOrder: number[]; // shuffled question IDs for this session
}

interface QuizContextValue extends QuizState {
  startQuiz: () => void;
  submitQuiz: () => void;
  clearQuiz: () => void;
  setAnswer: (questionId: number, option: OptionKey) => void;
  saveUserInfo: (info: UserInfo) => void;
  timeLeftMs: number;
}

const STORAGE_KEY = "math_quiz_state_v3";

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOrder(): number[] {
  return shuffle(Array.from({ length: QUESTION_COUNT }, (_, i) => i + 1));
}

function loadState(): QuizState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as QuizState;
  } catch { /* ignore */ }
  return {
    status: "idle",
    startedAt: null,
    endsAt: null,
    answers: {},
    userInfo: null,
    questionOrder: makeOrder(),
  };
}

function saveState(s: QuizState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuizState>(loadState);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (state.status === "running" && state.endsAt) {
      setTimeLeftMs(Math.max(0, state.endsAt - Date.now()));
      timerRef.current = setInterval(() => {
        const left = state.endsAt! - Date.now();
        setTimeLeftMs(Math.max(0, left));
        if (left <= 0) {
          setState(prev => ({ ...prev, status: "submitted" }));
          clearInterval(timerRef.current!);
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status, state.endsAt]);

  const saveUserInfo = useCallback((info: UserInfo) => {
    setState(prev => ({ ...prev, userInfo: info }));
  }, []);

  const startQuiz = useCallback(() => {
    const now = Date.now();
    const endsAt = now + QUIZ_DURATION_MINUTES * 60 * 1000;
    const answers: Record<number, OptionKey | null> = {};
    for (let i = 1; i <= QUESTION_COUNT; i++) answers[i] = null;
    const questionOrder = makeOrder(); // new shuffle every quiz start
    setState(prev => ({ ...prev, status: "running", startedAt: now, endsAt, answers, questionOrder }));
  }, []);

  const submitQuiz = useCallback(() => {
    setState(prev => ({ ...prev, status: "submitted" }));
  }, []);

  const clearQuiz = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({
      status: "idle",
      startedAt: null,
      endsAt: null,
      answers: {},
      userInfo: prev.userInfo,
      questionOrder: makeOrder(), // new shuffle for next attempt
    }));
  }, []);

  const setAnswer = useCallback((questionId: number, option: OptionKey) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: option },
    }));
  }, []);

  return (
    <QuizContext.Provider value={{ ...state, startQuiz, submitQuiz, clearQuiz, setAnswer, saveUserInfo, timeLeftMs }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be inside QuizProvider");
  return ctx;
}
