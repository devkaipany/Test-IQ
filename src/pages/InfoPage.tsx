import { useState } from "react";
import { useQuiz } from "../context/QuizContext";
import type { UserInfo } from "../context/QuizContext";
import { navigate } from "../App";

function validatePhone(v: string) {
  return /^[0-9]{9,11}$/.test(v.replace(/\s/g, ""));
}
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function InfoPage() {
  const { saveUserInfo, userInfo } = useQuiz();

  const [form, setForm] = useState<UserInfo>({
    name: userInfo?.name ?? "",
    phone: userInfo?.phone ?? "",
    email: userInfo?.email ?? "",
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UserInfo, boolean>>>({});

  function validate(f: UserInfo) {
    const e: Partial<UserInfo> = {};
    if (!f.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!validatePhone(f.phone)) e.phone = "Số điện thoại không hợp lệ (9–11 chữ số)";
    if (!validateEmail(f.email)) e.email = "Email không hợp lệ";
    return e;
  }

  function handleBlur(field: keyof UserInfo) {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(form));
  }

  function handleChange(field: keyof UserInfo, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) setErrors(validate(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = { name: true, phone: true, email: true };
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      saveUserInfo(form);
      navigate("");
    }
  }

  return (
    <div className="info-page">
      <div className="info-card">
        <div className="info-header">
          <div className="start-badge">Bài kiểm tra · Toán Logic</div>
          <h1 className="info-title">Thông tin thí sinh</h1>
          <p className="info-subtitle">
            Vui lòng điền đầy đủ thông tin trước khi bắt đầu làm bài
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="info-name">
              👤 Họ tên <span className="req">*</span>
            </label>
            <input
              id="info-name"
              className={`form-input${touched.name && errors.name ? " error" : ""}`}
              type="text"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              autoComplete="name"
            />
            {touched.name && errors.name && (
              <span className="form-error">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="info-phone">
              📱 Số điện thoại <span className="req">*</span>
            </label>
            <input
              id="info-phone"
              className={`form-input${touched.phone && errors.phone ? " error" : ""}`}
              type="tel"
              placeholder="0912345678"
              value={form.phone}
              onChange={e => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              autoComplete="tel"
              inputMode="tel"
            />
            {touched.phone && errors.phone && (
              <span className="form-error">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="info-email">
              ✉️ Email <span className="req">*</span>
            </label>
            <input
              id="info-email"
              className={`form-input${touched.email && errors.email ? " error" : ""}`}
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              autoComplete="email"
              inputMode="email"
            />
            {touched.email && errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Tiếp tục →
          </button>
        </form>
      </div>
    </div>
  );
}
