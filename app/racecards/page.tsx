import type { Metadata } from "next";
import Link from "next/link";
import { getAvailableMeetingDates, getMeetingsForDate } from "@/lib/data";
import { fromDateParam, formatDayLabel, formatRaceTime } from "@/lib/format";
import DateTabs from "@/components/DateTabs";
import CourseBadge from "@/components/CourseBadge";

export const metadata: Metadata = {
  title: "Racecards",
  description: "UK & Ireland racecards with runners, riders and tipster selections.",
};

export default async function RacecardsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const activeDate = fromDateParam(dateParam);

  const [dates, meetings] = await Promise.all([
    getAvailableMeetingDates(),
    getMeetingsForDate(activeDate),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-racing-950">Racecards</h1>
      <p className="mt-2 text-ink/70">{formatDayLabel(activeDate)}</p>

      <div className="mt-6">
        <DateTabs dates={dates} activeDate={activeDate} basePath="/racecards" />
      </div>

      {meetings.length === 0 ? (
        <p className="mt-10 rounded-xl border border-racing-900/10 bg-white p-6 text-ink/70">
          No meetings scheduled for this date.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {meetings.map((meeting) => (
            <section key={meeting.id} id={meeting.course.slug}>
              <div className="flex flex-wrap items-center gap-3">
                <CourseBadge country={meeting.course.country} />
                <h2 className="font-display text-2xl font-semibold text-racing-950">
                  {meeting.course.name}
                </h2>
                <span className="text-sm text-ink/60">
                  {meeting.course.region} &middot; {meeting.going}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {meeting.races.map((race) => (
                  <Link
                    key={race.id}
                    href={`/racecards/${race.id}`}
                    className="rounded-xl border border-racing-900/10 bg-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-lg font-semibold text-racing-950">
                        {formatRaceTime(race.raceTime)}
                      </span>
                      <span className="text-xs font-medium text-gold-600">{race.raceClass}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink/85">{race.name}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      {race.distance} &middot; {race.tips.length > 0 ? `${race.tips.length} tip${race.tips.length > 1 ? "s" : ""}` : "No tips yet"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
