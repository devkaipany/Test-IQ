import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ── Layer 2: DevTools Protection ─────────────────────────────────────────────

// Block common keyboard shortcuts that open DevTools
document.addEventListener("keydown", (e) => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toLowerCase() === "u")
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => e.preventDefault());

// Detect DevTools open via window-size heuristic and overlay the page
const DEVTOOLS_THRESHOLD = 160;
let devtoolsOpen = false;

const ADMIN_EMAIL_DT = "natsu8621@gmail.com";

function getCurrentEmail(): string {
  try {
    const raw = localStorage.getItem("math_quiz_state_v3");
    if (raw) {
      const parsed = JSON.parse(raw);
      return (parsed?.userInfo?.email ?? "").toLowerCase().trim();
    }
  } catch { /* ignore */ }
  return "";
}

function checkDevTools() {
  // Admin is exempt from DevTools blocking
  if (getCurrentEmail() === ADMIN_EMAIL_DT) {
    document.getElementById("__dt_block")?.remove();
    devtoolsOpen = false;
    return;
  }

  const widthDiff  = window.outerWidth  - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;
  const isOpen     = widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD;

  if (isOpen && !devtoolsOpen) {
    devtoolsOpen = true;
    const overlay = document.createElement("div");
    overlay.id = "__dt_block";
    Object.assign(overlay.style, {
      position: "fixed", inset: "0", zIndex: "999999",
      background: "#0f172a", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
    });
    overlay.innerHTML = `
      <div style="font-size:3rem">🔒</div>
      <div style="color:#f1f5f9;font-size:1.2rem;font-weight:700">Vui lòng đóng DevTools để tiếp tục</div>
      <div style="color:#94a3b8;font-size:0.9rem">Bài kiểm tra bị tạm dừng khi công cụ phát triển đang mở.</div>
    `;
    document.body.appendChild(overlay);
  } else if (!isOpen && devtoolsOpen) {
    devtoolsOpen = false;
    document.getElementById("__dt_block")?.remove();
  }
}

setInterval(checkDevTools, 800);

// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
