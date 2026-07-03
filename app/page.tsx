import Link from "next/link";
import { getMeetingsForDate, getTipsForDate, getTipsters } from "@/lib/data";
import { formatDayLabel, formatRaceTime } from "@/lib/format";
import TipCard from "@/components/TipCard";
import CourseBadge from "@/components/CourseBadge";

export default async function HomePage() {
  const today = new Date();
  const [meetings, tips, tipsters] = await Promise.all([
    getMeetingsForDate(today),
    getTipsForDate(today),
    getTipsters(),
  ]);

  const totalRaces = meetings.reduce((sum, m) => sum + m.races.length, 0);
  const featuredTips = tips.slice(0, 6);
  const topTipsters = tipsters.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-noise relative overflow-hidden bg-racing-950 text-cream">
        <div className="absolute inset-0 bg-gradient-to-br from-racing-900/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
            {formatDayLabel(today)}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Smarter tips for UK &amp; Ireland horse racing
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-racing-100/85">
            Daily racecards, tipster analysis and confidence-rated selections
            from Newmarket to the Curragh &mdash; built for punters who want the
            reasoning behind every tip, not just the name of a horse.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/tips"
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-racing-950 hover:bg-gold-400"
            >
              View Today&apos;s Tips
            </Link>
            <Link
              href="/racecards"
              className="rounded-full border border-gold-400/50 px-6 py-3 text-sm font-semibold text-cream hover:border-gold-300 hover:text-gold-300"
            >
              Browse Racecards
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-cream/10 pt-8 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-racing-100/60">Meetings today</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-gold-400">{meetings.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-racing-100/60">Races today</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-gold-400">{totalRaces}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-racing-100/60">Tipsters tracked</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-gold-400">{tipsters.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-racing-100/60">Tips posted today</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-gold-400">{tips.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Today's meetings */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-racing-950">Today&apos;s Meetings</h2>
          <Link href="/racecards" className="text-sm font-semibold text-racing-700 hover:text-gold-600">
            All racecards &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/racecards?date=${today.toISOString().slice(0, 10)}#${meeting.course.slug}`}
              className="rounded-xl border border-racing-900/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <CourseBadge country={meeting.course.country} />
                <span className="text-xs text-racing-700/60">{meeting.going}</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-racing-950">
                {meeting.course.name}
              </h3>
              <p className="mt-1 text-xs text-racing-700/70">
                {meeting.races.length} races &middot; first off {formatRaceTime(meeting.races[0].raceTime)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured tips */}
      <section className="bg-racing-50/60 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-racing-950">Today&apos;s Top Tips</h2>
            <Link href="/tips" className="text-sm font-semibold text-racing-700 hover:text-gold-600">
              See all tips &rarr;
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-2xl font-bold text-racing-950">
          Built for punters who want the reasoning
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Full UK & Ireland coverage",
              body: "Every card from Ascot and Newmarket to the Curragh and Leopardstown, updated daily.",
            },
            {
              title: "Confidence-rated selections",
              body: "Every tip is scored out of five so you can gauge conviction, not just direction.",
            },
            {
              title: "Transparent tipster stats",
              body: "Win rate and ROI published for every tipster — no cherry-picked highlight reels.",
            },
            {
              title: "Analysis, not just names",
              body: "Each tip explains the form, going and trip reasoning behind the selection.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-racing-900/10 bg-white p-5">
              <h3 className="font-display text-base font-semibold text-racing-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tipsters preview */}
      <section className="bg-racing-950 py-14 text-cream">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold">Meet the Tipsters</h2>
            <Link href="/tipsters" className="text-sm font-semibold text-gold-400 hover:text-gold-300">
              View leaderboard &rarr;
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {topTipsters.map((t) => (
              <Link
                key={t.id}
                href={`/tipsters/${t.slug}`}
                className="rounded-xl border border-cream/10 bg-racing-900/60 p-5 transition-colors hover:border-gold-400/40"
              >
                <h3 className="font-display text-lg font-semibold text-gold-400">{t.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-racing-100/60">{t.specialty}</p>
                <div className="mt-4 flex gap-6 text-sm">
                  <div>
                    <p className="text-racing-100/60">Win Rate</p>
                    <p className="font-display text-lg font-bold">{t.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-racing-100/60">ROI</p>
                    <p className="font-display text-lg font-bold text-gold-400">+{t.roi}%</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
