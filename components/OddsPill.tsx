export default function OddsPill({ odds }: { odds: string }) {
  const isFavourite = odds.includes("F");
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
        isFavourite
          ? "border-gold-500 bg-gold-500/10 text-gold-600"
          : "border-racing-800/15 bg-racing-50 text-racing-800"
      }`}
    >
      {odds}
    </span>
  );
}
