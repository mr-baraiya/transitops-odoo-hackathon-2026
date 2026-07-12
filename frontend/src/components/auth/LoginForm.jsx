import { useState } from "react";

function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login payload:", form);
    // TODO: call your login API here
  };

  return (
    <div className="register-card">
      <div className="auth-logo"><i /> TransitOps</div>

      <h2>Sign in to your account</h2>
      <p>Enter your credentials to reach the ops dashboard.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="identifier">Username or email</label>
          <input
            id="identifier" name="identifier" type="text" placeholder="David Brooks"
            value={form.identifier} onChange={handleChange} required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password" name="password" type={showPass ? "text" : "password"}
            placeholder="••••••••" value={form.password} onChange={handleChange} required
          />
          <button type="button" className="toggle-visibility" onClick={() => setShowPass(!showPass)}>
            {showPass ? "HIDE" : "SHOW"}
          </button>
        </div>

        <div className="forgot-row">
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <button type="submit">Sign in</button>
      </form>

      <div className="divider">or</div>

      <button type="button" className="google-btn">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
        </svg>
        Sign in with Google
      </button>

      <p className="login-text">
        New to TransitOps?
        <a href="/register">Create account</a>
      </p>
    </div>
  );
}

export default LoginForm;