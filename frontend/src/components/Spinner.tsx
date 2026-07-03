export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} role="status" aria-label="Loading">
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle
          cx="20" cy="20" r="16"
          fill="none" stroke="var(--vermillion)" strokeWidth="3"
          strokeDasharray="70 30" strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
