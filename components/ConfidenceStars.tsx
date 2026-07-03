export default function ConfidenceStars({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confidence ${confidence} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill={i < confidence ? "var(--color-gold-500)" : "none"}
          stroke="var(--color-gold-500)"
          strokeWidth="1"
        >
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}
