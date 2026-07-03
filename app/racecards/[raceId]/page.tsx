import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRaceById } from "@/lib/data";
import { formatDayLabel, formatRaceTime } from "@/lib/format";
import CourseBadge from "@/components/CourseBadge";
import OddsPill from "@/components/OddsPill";
import ConfidenceStars from "@/components/ConfidenceStars";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ raceId: string }>;
}): Promise<Metadata> {
  const { raceId } = await params;
  const race = await getRaceById(raceId);
  if (!race) return {};
  return {
    title: `${race.name} | ${race.meeting.course.name}`,
    description: `Runners, riders and tips for the ${race.name} at ${race.meeting.course.name}.`,
  };
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = await getRaceById(raceId);
  if (!race) notFound();

  const course = race.meeting.course;
  const tippedRunnerIds = new Set(race.tips.map((t) => t.runnerId));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href={`/racecards?date=${race.meeting.date.toISOString().slice(0, 10)}`} className="text-sm font-medium text-racing-700 hover:text-gold-600">
        &larr; Back to {formatDayLabel(race.meeting.date)}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CourseBadge country={course.country} />
        <span className="text-sm font-medium text-ink/70">{course.name}</span>
        <span className="text-sm text-ink/50">&middot; {race.meeting.going}</span>
      </div>

      <h1 className="mt-2 font-display text-3xl font-bold text-racing-950">{race.name}</h1>
      <p className="mt-2 text-ink/70">
        {formatRaceTime(race.raceTime)} &middot; {race.distance} &middot; {race.raceClass} &middot; £{race.prizeMoney.toLocaleString()} added
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-racing-900/10 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-racing-900/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Jockey</th>
              <th className="px-4 py-3">Trainer</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Weight</th>
              <th className="px-4 py-3">Form</th>
              <th className="px-4 py-3">Odds</th>
            </tr>
          </thead>
          <tbody>
            {race.runners.map((runner) => (
              <tr
                key={runner.id}
                className={`border-b border-racing-900/5 last:border-0 ${
                  tippedRunnerIds.has(runner.id) ? "bg-gold-300/10" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-ink/70">{runner.number}</td>
                <td className="px-4 py-3 font-semibold text-racing-950">
                  {runner.horseName}
                  {tippedRunnerIds.has(runner.id) && (
                    <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-racing-950">
                      Tipped
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink/80">{runner.jockey}</td>
                <td className="px-4 py-3 text-ink/80">{runner.trainer}</td>
                <td className="px-4 py-3 text-ink/80">{runner.age}</td>
                <td className="px-4 py-3 text-ink/80">{runner.weight}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink/70">{runner.form}</td>
                <td className="px-4 py-3"><OddsPill odds={runner.odds} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {race.tips.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-bold text-racing-950">Tipster Analysis</h2>
          <div className="mt-4 space-y-4">
            {race.tips.map((tip) => (
              <div key={tip.id} className="rounded-xl border border-racing-900/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/tipsters/${tip.tipster.slug}`} className="font-display text-lg font-semibold text-racing-950 hover:text-gold-600">
                    {tip.tipster.name}
                  </Link>
                  <ConfidenceStars confidence={tip.confidence} />
                </div>
                <p className="mt-1 text-sm font-medium text-racing-700">
                  Selection: {tip.runner.number}. {tip.runner.horseName}
                </p>
                <p className="mt-2 text-sm leading-6 text-ink/80">{tip.analysis}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
