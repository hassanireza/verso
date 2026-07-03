import { Link } from "react-router-dom";
import "./Avatar.css";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  username?: string;
  ring?: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Avatar({ src, name, size = 44, username, ring = false }: AvatarProps) {
  const content = src ? (
    <img src={src} alt="" width={size} height={size} className="avatar__img" />
  ) : (
    <span className="avatar__fallback" style={{ fontSize: size * 0.38 }}>
      {initials(name) || "?"}
    </span>
  );

  const style = {
    width: size,
    height: size,
    "--avatar-size": `${size}px`,
  } as React.CSSProperties;

  const cls = `avatar ${ring ? "avatar--ring" : ""}`;

  if (username) {
    return (
      <Link to={`/${username}`} className={cls} style={style} aria-label={name}>
        {content}
      </Link>
    );
  }
  return (
    <div className={cls} style={style}>
      {content}
    </div>
  );
}
