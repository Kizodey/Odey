import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTipsterBySlug } from "@/lib/data";
import { formatRaceTime } from "@/lib/format";
import ConfidenceStars from "@/components/ConfidenceStars";
import CourseBadge from "@/components/CourseBadge";
import OddsPill from "@/components/OddsPill";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tipster = await getTipsterBySlug(slug);
  if (!tipster) return {};
  return {
    title: tipster.name,
    description: tipster.bio,
  };
}

export default async function TipsterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tipster = await getTipsterBySlug(slug);
  if (!tipster) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Link href="/tipsters" className="text-sm font-medium text-racing-700 hover:text-gold-600">
        &larr; Back to leaderboard
      </Link>

      <div className="mt-4 rounded-2xl border border-racing-900/10 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-600">{tipster.specialty}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-racing-950">{tipster.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/75">{tipster.bio}</p>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-racing-900/10 pt-5 sm:max-w-md">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Total Tips</p>
            <p className="font-display text-xl font-bold text-racing-950">{tipster.totalTips}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Win Rate</p>
            <p className="font-display text-xl font-bold text-racing-950">{tipster.winRate}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">ROI</p>
            <p className="font-display text-xl font-bold text-gold-600">+{tipster.roi}%</p>
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold text-racing-950">Latest Selections</h2>
      {tipster.tips.length === 0 ? (
        <p className="mt-4 text-ink/70">No tips posted yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {tipster.tips.map((tip) => (
            <Link
              key={tip.id}
              href={`/racecards/${tip.raceId}`}
              className="block rounded-xl border border-racing-900/10 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-racing-700/70">
                <CourseBadge country={tip.race.meeting.course.country} />
                <span>{tip.race.meeting.course.name}</span>
                <span aria-hidden>&middot;</span>
                <span>{formatRaceTime(tip.race.raceTime)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-racing-950">
                  {tip.runner.number}. {tip.runner.horseName}
                </p>
                <div className="flex items-center gap-3">
                  <OddsPill odds={tip.runner.odds} />
                  <ConfidenceStars confidence={tip.confidence} />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-ink/75">{tip.analysis}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
