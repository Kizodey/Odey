import type { Metadata } from "next";
import Link from "next/link";
import { getTipsters } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tipster Leaderboard",
  description: "Win rate and ROI leaderboard for every Silks & Stayers tipster.",
};

export default async function TipstersPage() {
  const tipsters = await getTipsters();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-racing-950">Tipster Leaderboard</h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        Every tipster&apos;s track record is published in full, ranked by return on
        investment (ROI) across their career selections.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-racing-900/10 bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-racing-900/10 text-left text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Tipster</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Tips</th>
              <th className="px-4 py-3">Win Rate</th>
              <th className="px-4 py-3">ROI</th>
            </tr>
          </thead>
          <tbody>
            {tipsters.map((t, i) => (
              <tr key={t.id} className="border-b border-racing-900/5 last:border-0">
                <td className="px-4 py-3 font-display font-bold text-racing-950">#{i + 1}</td>
                <td className="px-4 py-3">
                  <Link href={`/tipsters/${t.slug}`} className="font-semibold text-racing-950 hover:text-gold-600">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink/70">{t.specialty}</td>
                <td className="px-4 py-3 text-ink/70">{t.totalTips}</td>
                <td className="px-4 py-3 text-ink/70">{t.winRate}%</td>
                <td className="px-4 py-3 font-semibold text-gold-600">+{t.roi}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
