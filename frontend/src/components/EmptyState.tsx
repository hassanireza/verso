export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state__ring" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="none" stroke="var(--hairline-strong)" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="17" fill="none" stroke="var(--vermillion)" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" />
        </svg>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
