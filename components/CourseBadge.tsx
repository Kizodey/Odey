export default function CourseBadge({ country }: { country: "UK" | "IRE" }) {
  const isIreland = country === "IRE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        isIreland
          ? "bg-emerald-100 text-emerald-800"
          : "bg-racing-100 text-racing-800"
      }`}
    >
      {isIreland ? "IRE" : "UK"}
    </span>
  );
}
