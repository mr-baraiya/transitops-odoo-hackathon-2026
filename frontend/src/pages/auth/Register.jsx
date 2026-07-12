import RegisterForm from "../../components/auth/RegisterForm";
import "../../styles/auth.css";

function Register() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <span className="live-badge"><span className="live-dot" /> LIVE NETWORK</span>

        <div className="auth-illustration">
          <svg viewBox="0 0 320 190" width="100%" height="auto">
            <path
              d="M10,150 C 60,150 60,70 110,70 S 190,150 230,150 260,40 310,40"
              fill="none" stroke="#243654" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 12"
            />
            {[
              { x: 10, y: 150, label: "CENTRAL" },
              { x: 110, y: 70, label: "FAIRVIEW" },
              { x: 230, y: 150, label: "OAK ST" },
              { x: 310, y: 40, label: "TERMINAL" },
            ].map((s, i) => (
              <g key={i}>
                <circle cx={s.x} cy={s.y} r="6" fill="#0B1526" stroke="#F5A623" strokeWidth="2.5" />
                <text
                  x={s.x} y={s.y + (i % 2 === 0 ? 22 : -14)} textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#8291A8" letterSpacing="0.06em"
                >
                  {s.label}
                </text>
              </g>
            ))}
            <circle r="6" fill="#F5A623">
              <animateMotion dur="6s" repeatCount="indefinite"
                path="M10,150 C 60,150 60,70 110,70 S 190,150 230,150 260,40 310,40" />
            </circle>
          </svg>
        </div>

        <div>
          <h1>Every vehicle. <span>Every stop.</span><br />One dashboard.</h1>
          <p>TransitOps gives dispatchers live vehicle positions, route health and delay alerts the moment they happen.</p>
          <div className="auth-dots"><i className="active" /><i /><i /></div>
        </div>
      </div>

      <div className="auth-right">
        <RegisterForm />
      </div>
    </div>
  );
}

export default Register;