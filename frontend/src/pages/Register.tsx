import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", display_name: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username: form.username.trim().toLowerCase(),
        email: form.email.trim(),
        password: form.password,
        display_name: form.display_name.trim() || form.username.trim(),
      });
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[]>;
        const firstError = Object.values(data).flat()[0];
        setError(firstError ?? "Couldn't create that account.");
      } else {
        setError("Couldn't create that account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join Verso" subtitle="Claim a handle and start posting.">
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Name</span>
          <input
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
            placeholder="How should people see you?"
            autoFocus
          />
        </label>
        <label className="field">
          <span>Handle</span>
          <input
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="letters, numbers, underscores"
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            minLength={8}
            required
          />
        </label>
        {error && <p className="auth-form__error">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="auth-form__switch">
        Already here? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
