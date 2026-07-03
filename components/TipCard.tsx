import Link from "next/link";
import ConfidenceStars from "@/components/ConfidenceStars";
import CourseBadge from "@/components/CourseBadge";
import OddsPill from "@/components/OddsPill";
import { formatRaceTime } from "@/lib/format";
import type { getTipsForDate } from "@/lib/data";

type Tip = Awaited<ReturnType<typeof getTipsForDate>>[number];

export default function TipCard({ tip }: { tip: Tip }) {
  const { race, runner, tipster } = tip;
  const course = race.meeting.course;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-racing-900/10 bg-white p-5 shadow-sm shadow-racing-950/5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-racing-700/70">
            <CourseBadge country={course.country} />
            <span>{course.name}</span>
            <span aria-hidden>&middot;</span>
            <span>{formatRaceTime(race.raceTime)}</span>
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold text-racing-950">
            <Link href={`/racecards/${race.id}`} className="hover:text-racing-700">
              {race.name}
            </Link>
          </h3>
        </div>
        <OddsPill odds={runner.odds} />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-racing-50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-racing-700/60">Selection</p>
          <p className="font-display text-lg font-semibold text-racing-900">
            {runner.number}. {runner.horseName}
          </p>
          <p className="text-xs text-racing-700/70">
            {runner.jockey} &middot; {runner.trainer}
          </p>
        </div>
        <ConfidenceStars confidence={tip.confidence} />
      </div>

      <p className="text-sm leading-6 text-ink/80">{tip.analysis}</p>

      <div className="flex items-center justify-between border-t border-racing-900/10 pt-3">
        <Link
          href={`/tipsters/${tipster.slug}`}
          className="text-sm font-semibold text-racing-800 hover:text-gold-600"
        >
          {tipster.name}
        </Link>
        <span className="text-xs text-racing-700/60">{tipster.specialty}</span>
      </div>
    </article>
  );
}
