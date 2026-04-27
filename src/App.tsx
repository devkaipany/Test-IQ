import { QuizProvider } from "./context/QuizContext";
import { useEffect, useState } from "react";
import StartPage from "./pages/StartPage";
import QuestionPage from "./pages/QuestionPage";
import ResultPage from "./pages/ResultPage";
import InfoPage from "./pages/InfoPage";
import AdminPage from "./pages/AdminPage";
import ExamSelectPage from "./pages/ExamSelectPage";

type Route =
  | { name: "select" }
  | { name: "start" }
  | { name: "info" }
  | { name: "admin" }
  | { name: "question"; id: number }
  | { name: "result" };

function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, "");
  if (h === "" || h === "select") return { name: "select" };
  if (h === "start") return { name: "start" };
  if (h === "result") return { name: "result" };
  if (h === "info") return { name: "info" };
  if (h === "admin") return { name: "admin" };
  const m = h.match(/^q\/(\d+)$/);
  if (m) {
    const id = parseInt(m[1]);
    if (id >= 1 && id <= 140) return { name: "question", id };
  }
  return { name: "select" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

function Router() {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash)
  );

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (route.name === "result") return <ResultPage />;
  if (route.name === "info") return <InfoPage />;
  if (route.name === "admin") return <AdminPage />;
  if (route.name === "question") return <QuestionPage questionId={route.id} />;
  if (route.name === "start") return <StartPage />;
  return <ExamSelectPage />;
}

export default function App() {
  return (
    <QuizProvider>
      <Router />
    </QuizProvider>
  );
}
