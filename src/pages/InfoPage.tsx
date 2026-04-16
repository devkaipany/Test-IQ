import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import type { UserInfo } from "../context/QuizContext";
import { isAdmin } from "../context/QuizContext";
import { navigate } from "../App";

const BANKS = [
  "Vietcombank", "BIDV", "Agribank", "Techcombank", "MB Bank",
  "VPBank", "ACB", "SHB", "HDBank", "TPBank", "Sacombank",
  "VietinBank", "Eximbank", "OCB", "MSB", "SeABank", "Khác",
];

function validatePhone(v: string) {
  return /^[0-9]{9,11}$/.test(v.replace(/\s/g, ""));
}
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type FormFields = keyof UserInfo;
type FormErrors = Partial<Record<FormFields, string>>;

export default function InfoPage() {
  const { saveUserInfo, userInfo } = useQuiz();

  const [form, setForm] = useState<UserInfo>({
    name: userInfo?.name ?? "",
    phone: userInfo?.phone ?? "",
    email: userInfo?.email ?? "",
    bank_number: userInfo?.bank_number ?? "",
    bank_name: userInfo?.bank_name ?? "",
    account_name: userInfo?.account_name ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FormFields, boolean>>>({});

  function validate(f: UserInfo): FormErrors {
    const e: FormErrors = {};
    if (!f.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!validatePhone(f.phone)) e.phone = "Số điện thoại không hợp lệ (9–11 chữ số)";
    if (!validateEmail(f.email)) e.email = "Email không hợp lệ";
    // bank fields are all optional — only format-check bank_number if provided
    if (f.bank_number && !/^\d{6,20}$/.test(f.bank_number.trim()))
      e.bank_number = "STK phải là số (6–20 chữ số)";
    return e;
  }

  function handleBlur(field: FormFields) {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(form));
  }

  function handleChange(field: FormFields, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) setErrors(validate(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Partial<Record<FormFields, boolean>> = {
      name: true, phone: true, email: true,
    };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      saveUserInfo(form);
      navigate(isAdmin(form.email) ? "admin" : "");
    }
  }

  const field = (
    f: FormFields,
    label: string,
    el: React.ReactNode,
  ) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {el}
      {touched[f] && errors[f] && (
        <span className="form-error">{errors[f]}</span>
      )}
    </div>
  );

  return (
    <div className="info-page">
      {/* Neon background elements */}
      <div className="neon-grid" aria-hidden="true" />
      <div className="neon-orb neon-orb-1" aria-hidden="true" />
      <div className="neon-orb neon-orb-2" aria-hidden="true" />

      <div className="info-card">
        {/* Website link */}
        <div className="info-site-link">
          <a href="https://kaipany.com/" target="_blank" rel="noreferrer" className="site-link-btn">
            🌐 kaipany.com
          </a>
        </div>

        <div className="info-header">
          <div className="start-badge">Bài kiểm tra · Toán Logic</div>
          <h1 className="info-title">Thông tin thí sinh</h1>
          <p className="info-subtitle">
            Vui lòng điền đầy đủ thông tin trước khi bắt đầu làm bài
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Thông tin cá nhân ── */}
          <div className="form-section-title">👤 Thông tin cá nhân</div>

          {field("name", "Họ tên *",
            <input id="info-name" className={`form-input${touched.name && errors.name ? " error" : ""}`}
              type="text" placeholder="Nguyễn Văn A" value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")} autoComplete="name" />
          )}

          {field("phone", "📱 Số điện thoại *",
            <input id="info-phone" className={`form-input${touched.phone && errors.phone ? " error" : ""}`}
              type="tel" placeholder="0912345678" value={form.phone}
              onChange={e => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")} autoComplete="tel" inputMode="tel" />
          )}

          {field("email", "✉️ Email *",
            <input id="info-email" className={`form-input${touched.email && errors.email ? " error" : ""}`}
              type="email" placeholder="example@email.com" value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")} autoComplete="email" inputMode="email" />
          )}

          {/* ── Thông tin ngân hàng (tùy chọn) ── */}
          <div className="form-section-title" style={{ marginTop: "1.25rem" }}>🏦 Thông tin ngân hàng <span style={{ fontSize: "0.75rem", fontWeight: 400, opacity: 0.6 }}>(tùy chọn)</span></div>

          {field("bank_name", "Ngân hàng",
            <select id="info-bank-name"
              className="form-input"
              value={form.bank_name}
              onChange={e => handleChange("bank_name", e.target.value)}
            >
              <option value="">-- Chọn ngân hàng (không bắt buộc) --</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          {field("account_name", "Tên chủ tài khoản",
            <input id="info-account-name"
              className="form-input"
              type="text" placeholder="NGUYEN VAN A (in hoa, không bắt buộc)" value={form.account_name}
              onChange={e => handleChange("account_name", e.target.value.toUpperCase())}
              autoComplete="off" />
          )}

          {field("bank_number", "Số tài khoản",
            <input id="info-bank-number"
              className={`form-input${touched.bank_number && errors.bank_number ? " error" : ""}`}
              type="text" placeholder="1234567890 (không bắt buộc)" value={form.bank_number} inputMode="numeric"
              onChange={e => handleChange("bank_number", e.target.value.replace(/\D/g, ""))}
              onBlur={() => handleBlur("bank_number")} autoComplete="off" />
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "1.5rem" }}>
            Tiếp tục →
          </button>
        </form>
      </div>
    </div>
  );
}
