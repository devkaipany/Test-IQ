// ─────────────────────────────────────────────────────────────────────────────
// Webhook endpoints
// ─────────────────────────────────────────────────────────────────────────────

const QUIZ_WEBHOOK =
  "https://open-sg.larksuite.com/anycross/trigger/callback/MDQ0NTAyODEyNTkzMzI2NDJlNjEzMDY5ZWQ4Mzg2MTlm";

const CV_WEBHOOK =
  "https://open-sg.larksuite.com/anycross/trigger/callback/MDg5NzhiY2E2OTBjYWFkN2I3MWNlMzM3MDNiYjBiM2E5";

/**
 * Send JSON to a LarkSuite webhook.
 *
 * Uses `Content-Type: text/plain` + `mode: no-cors` so the browser sends the
 * request without a preflight (LarkSuite webhooks parse the body regardless of
 * the declared content-type). The response is opaque, so we always return true
 * once the request is dispatched.
 */
async function post(url: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    await fetch(url, {
      method: "POST",
      // text/plain avoids CORS preflight while still delivering the JSON body
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      mode: "no-cors", // response will be opaque — that's OK, we just need delivery
    });
    return true; // request dispatched (no-cors response is always status 0)
  } catch {
    return false;
  }
}

// ── Quiz result ───────────────────────────────────────────────────────────────

export interface QuizResultPayload {
  ho_ten: string;
  so_dien_thoai: string;
  email: string;
  so_diem: string;
  iq_uoc_tinh: number;
  danh_gia_ai: string;
}

export async function sendQuizResult(p: QuizResultPayload): Promise<boolean> {
  return post(QUIZ_WEBHOOK, { type: "quiz_result", ...p });
}

// ── CV Submission (link + ảnh URL + SĐT) ─────────────────────────────────────

export interface CVPayload {
  ho_ten: string;
  so_dien_thoai: string;
  email: string;
  link_cv: string;
  anh_url?: string;
  ghi_chu?: string;
}

export async function sendCV(p: CVPayload): Promise<boolean> {
  return post(CV_WEBHOOK, { type: "cv_submission", ...p });
}
