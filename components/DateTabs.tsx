import Link from "next/link";
import { formatShortDay, toDateParam } from "@/lib/format";

export default function DateTabs({
  dates,
  activeDate,
  basePath,
}: {
  dates: Date[];
  activeDate: Date;
  basePath: string;
}) {
  const activeParam = toDateParam(activeDate);

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((date) => {
        const param = toDateParam(date);
        const isActive = param === activeParam;
        return (
          <Link
            key={param}
            href={`${basePath}?date=${param}`}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-racing-900 bg-racing-900 text-cream"
                : "border-racing-900/15 bg-white text-racing-800 hover:border-racing-900/40"
            }`}
          >
            {formatShortDay(date)}
          </Link>
        );
      })}
    </div>
  );
}
