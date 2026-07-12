import { useState } from "react";

function RegisterForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Dispatcher",
    password: "",
    confirm: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register payload:", form);
    // TODO: call your register API here
  };

  return (
    <div className="register-card">
      <div className="auth-logo"><i /> TransitOps</div>

      <h2>Create your operator account</h2>
      <p>Set up access to dispatch, fleet and route tools.</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name" name="name" type="text" placeholder="David Brooks"
            value={form.name} onChange={handleChange} required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Work email</label>
          <input
            id="email" name="email" type="email" placeholder="you@transitops.com"
            value={form.email} onChange={handleChange} required
          />
        </div>

        <div className="field">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option>Dispatcher</option>
            <option>Driver</option>
            <option>Fleet Admin</option>
            <option>Route Planner</option>
          </select>
        </div>

        <div className="row-2">
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

          <div className="field">
            <label htmlFor="confirm">Confirm</label>
            <input
              id="confirm" name="confirm" type={showConfirm ? "text" : "password"}
              placeholder="••••••••" value={form.confirm} onChange={handleChange} required
            />
            <button type="button" className="toggle-visibility" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        <button type="submit">Create account</button>
      </form>

      <div className="divider">or</div>

      <button type="button" className="google-btn">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
        </svg>
        Sign up with Google
      </button>

      <p className="login-text">
        Already have an account?
        <a href="/login">Sign in</a>
      </p>
    </div>
  );
}

export default RegisterForm;