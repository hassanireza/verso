type IconName =
  | "home"
  | "explore"
  | "bell"
  | "mail"
  | "user"
  | "heart"
  | "heart-fill"
  | "reply"
  | "repost"
  | "image"
  | "close"
  | "send"
  | "logout"
  | "sun"
  | "moon"
  | "trash"
  | "back"
  | "search";

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M4 11.5 12 4l8 7.5M6 10v9h5v-6h2v6h5v-9" />,
  explore: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4.3-4.3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4.3-4.3" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" /></>,
  heart: <path d="M12 20s-7-4.4-9.3-8.7C1.2 8 2.6 5 5.7 5c1.9 0 3.4 1 4.3 2.5C10.9 6 12.4 5 14.3 5c3.1 0 4.5 3 3 6.3C19 15.6 12 20 12 20Z" />,
  "heart-fill": <path d="M12 20s-7-4.4-9.3-8.7C1.2 8 2.6 5 5.7 5c1.9 0 3.4 1 4.3 2.5C10.9 6 12.4 5 14.3 5c3.1 0 4.5 3 3 6.3C19 15.6 12 20 12 20Z" fill="currentColor" />,
  reply: <path d="M9 8 4 12l5 4M4 12h9c3 0 5.5 2 5.5 5.5" />,
  repost: <><path d="M6 7h9a3 3 0 0 1 3 3v2" /><path d="m17 5 3 5-3 2" /><path d="M18 17H9a3 3 0 0 1-3-3v-2" /><path d="m7 19-3-5 3-2" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 17 4.5-5 3.5 4 2.5-3 4.5 4" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  send: <path d="M4 12 20 4l-6.5 16-2.7-7.3L4 12Z" />,
  logout: <><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" /><path d="M10 8l-4 4 4 4" /><path d="M6 12h12" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  trash: <><path d="M5 7h14" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" /></>,
  back: <path d="m14 6-6 6 6 6" />,
};

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.7,
  className = "",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
