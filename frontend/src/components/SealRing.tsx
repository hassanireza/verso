import "./SealRing.css";

interface SealRingProps {
  value: number;
  max: number;
  size?: number;
}

/**
 * The seal ring is Verso's signature mark: a hanko-style stamp that fills
 * clockwise in vermillion ink as a verse approaches its 160-character limit,
 * closing into a solid stamped circle at the limit. The same ring geometry
 * frames avatars throughout the app, tying the identity together.
 */
export function SealRing({ value, max, size = 34 }: SealRingProps) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(value / max, 1);
  const offset = circumference * (1 - ratio);
  const isOver = value > max;
  const isFull = value === max;

  return (
    <div
      className="seal-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value} of ${max} characters used`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={isFull ? "var(--vermillion)" : "none"}
          stroke={isOver ? "#e05a3f" : "var(--vermillion)"}
          strokeWidth={isFull ? radius : 2.5}
          strokeDasharray={circumference}
          strokeDashoffset={isFull ? 0 : offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.15s ease, stroke 0.15s ease" }}
        />
      </svg>
      {!isFull && (
        <span className={`seal-ring__count ${isOver ? "seal-ring__count--over" : ""}`}>
          {max - value}
        </span>
      )}
    </div>
  );
}
