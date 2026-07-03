import type { Metadata } from "next";
import { getAvailableMeetingDates, getTipsForDate } from "@/lib/data";
import { fromDateParam, formatDayLabel } from "@/lib/format";
import DateTabs from "@/components/DateTabs";
import TipCard from "@/components/TipCard";

export const metadata: Metadata = {
  title: "Today's Tips",
  description: "Confidence-rated horse racing tips for UK & Ireland meetings.",
};

export default async function TipsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const activeDate = fromDateParam(dateParam);

  const [dates, tips] = await Promise.all([
    getAvailableMeetingDates(),
    getTipsForDate(activeDate),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-racing-950">Tips</h1>
      <p className="mt-2 text-ink/70">{formatDayLabel(activeDate)}</p>

      <div className="mt-6">
        <DateTabs dates={dates} activeDate={activeDate} basePath="/tips" />
      </div>

      {tips.length === 0 ? (
        <p className="mt-10 rounded-xl border border-racing-900/10 bg-white p-6 text-ink/70">
          No tips posted for this date yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      )}
    </div>
  );
}
