import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="auth">
      <div className="auth__brand">
        <svg width="52" height="52" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="var(--vermillion)" />
          <circle cx="32" cy="32" r="20" fill="none" stroke="var(--sumi)" strokeWidth="3" />
          <text x="32" y="41" fontFamily="Fraunces, serif" fontSize="26" fill="var(--sumi)" textAnchor="middle">V</text>
        </svg>
        <h1 className="auth__headline">Short verses,<br />stamped and sent.</h1>
        <p className="auth__copy">
          Every post fits in 160 characters, the length of a telegram, a
          proverb, a single held breath. Say the true thing and stop there.
        </p>
        <ul className="auth__points">
          <li>Follow the voices you want to hear from</li>
          <li>Reply, restamp, and keep threads alive</li>
          <li>Message people directly, one to one</li>
        </ul>
      </div>
      <div className="auth__panel">
        <div className="auth__panel-inner">
          <h2>{title}</h2>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
