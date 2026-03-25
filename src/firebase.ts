// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration
// HƯỚNG DẪN: Vào https://console.firebase.google.com → Tạo project → Thêm Web App
// → Copy config vào bên dưới (thay thế các giá trị placeholder)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── Collections ──────────────────────────────────────────────────────────────

export interface QuizResultDoc {
  ho_ten: string;
  so_dien_thoai: string;
  email: string;
  so_cau_dung: number;
  tong_cau: number;
  phan_tram: number;
  diem_10: string;
  iq_uoc_tinh: number;
  danh_gia_ai: string;
  question_order: number[];       // shuffled order stored for audit
  answers: Record<string, string>;
  submitted_at: ReturnType<typeof serverTimestamp>;
}

export async function saveQuizResult(data: Omit<QuizResultDoc, "submitted_at">): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, "quiz-results"), {
      ...data,
      submitted_at: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error("Firebase save error:", err);
    return null;
  }
}

export interface CVDoc {
  ho_ten: string;
  so_dien_thoai: string;
  email: string;
  link_cv: string;
  anh_url?: string;
  ghi_chu?: string;
  submitted_at: ReturnType<typeof serverTimestamp>;
}

export async function saveCVSubmission(data: Omit<CVDoc, "submitted_at">): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, "cv-submissions"), {
      ...data,
      submitted_at: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error("Firebase CV save error:", err);
    return null;
  }
}
