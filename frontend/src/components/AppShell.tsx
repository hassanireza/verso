import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { fetchUnreadCount } from "../api/endpoints";
import { TrendsAside } from "./TrendsAside";

const NAV_ITEMS = [
  { to: "/", icon: "home" as const, label: "Home", end: true },
  { to: "/explore", icon: "explore" as const, label: "Explore", end: false },
  { to: "/notifications", icon: "bell" as const, label: "Notifications", end: false },
  { to: "/messages", icon: "mail" as const, label: "Messages", end: false },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const { data: unread } = useQuery({
    queryKey: ["unread-count"],
    queryFn: fetchUnreadCount,
    enabled: !!user,
    refetchInterval: 20000,
  });

  return (
    <div className="shell">
      <nav className="shell__rail" aria-label="Primary">
        <NavLink to="/" className="shell__mark" aria-label="Verso home">
          <svg width="30" height="30" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="var(--vermillion)" />
            <circle cx="32" cy="32" r="20" fill="none" stroke="var(--sumi)" strokeWidth="3" />
            <text x="32" y="41" fontFamily="Fraunces, serif" fontSize="26" fill="var(--sumi)" textAnchor="middle">V</text>
          </svg>
        </NavLink>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `shell__link ${isActive ? "shell__link--active" : ""}`}
          >
            <span className="shell__icon-wrap">
              <Icon name={item.icon} size={24} />
              {item.to === "/notifications" && !!unread?.count && (
                <span className="shell__badge">{unread.count > 9 ? "9+" : unread.count}</span>
              )}
            </span>
            <span className="shell__label">{item.label}</span>
          </NavLink>
        ))}
        {user && (
          <NavLink
            to={`/${user.username}`}
            className={({ isActive }) => `shell__link ${isActive ? "shell__link--active" : ""}`}
          >
            <span className="shell__icon-wrap">
              <Icon name="user" size={24} />
            </span>
            <span className="shell__label">Profile</span>
          </NavLink>
        )}

        <div className="shell__rail-footer">
          <button className="shell__theme-toggle" onClick={toggle} aria-label="Toggle theme">
            <Icon name={theme === "dark" ? "sun" : "moon"} size={20} />
          </button>
          {user && (
            <button
              className="shell__account"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <Avatar src={user.avatar} name={user.name} size={36} ring />
              <span className="shell__label shell__account-name">{user.name}</span>
              <Icon name="logout" size={17} className="shell__logout-icon" />
            </button>
          )}
        </div>
      </nav>

      <main className="shell__main">
        <Outlet />
      </main>

      <aside className="shell__aside">
        <TrendsAside />
      </aside>

      <nav className="shell__tabbar" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `shell__tab ${isActive ? "shell__tab--active" : ""}`}
          >
            <span className="shell__icon-wrap">
              <Icon name={item.icon} size={23} />
              {item.to === "/notifications" && !!unread?.count && (
                <span className="shell__badge shell__badge--tab">{unread.count > 9 ? "9+" : unread.count}</span>
              )}
            </span>
          </NavLink>
        ))}
        {user && (
          <NavLink to={`/${user.username}`} className={({ isActive }) => `shell__tab ${isActive ? "shell__tab--active" : ""}`}>
            <Avatar src={user.avatar} name={user.name} size={24} />
          </NavLink>
        )}
      </nav>
    </div>
  );
}
