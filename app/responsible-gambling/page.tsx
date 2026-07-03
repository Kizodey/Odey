import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Gambling",
  description: "Responsible gambling guidance and support resources for UK & Ireland punters.",
};

export default function ResponsibleGamblingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-racing-950">Responsible Gambling</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-ink/80">
        <p>
          Silks &amp; Stayers publishes racing analysis and tips for
          entertainment and informational purposes. Nothing on this site is
          financial advice, and no tip guarantees a winning outcome. Betting
          should always be enjoyed within your means.
        </p>
        <p>
          This site, and betting generally, is intended for adults aged 18 and
          over. If you are based in Great Britain and have concerns about your
          gambling, or that of someone close to you, free and confidential
          support is available.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="https://www.begambleaware.org"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-racing-900/10 bg-white p-5 hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-racing-950">BeGambleAware</h2>
            <p className="mt-1 text-sm text-ink/70">
              Free advice and support for anyone affected by gambling harm.
            </p>
          </a>
          <a
            href="https://www.gamcare.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-racing-900/10 bg-white p-5 hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-racing-950">GamCare</h2>
            <p className="mt-1 text-sm text-ink/70">
              National Gambling Helpline: 0808 8020 133, free and confidential.
            </p>
          </a>
          <a
            href="https://www.gamstop.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-racing-900/10 bg-white p-5 hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-racing-950">GAMSTOP</h2>
            <p className="mt-1 text-sm text-ink/70">
              Free self-exclusion scheme for online gambling in Great Britain.
            </p>
          </a>
          <a
            href="https://www.gamblingcare.ie"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-racing-900/10 bg-white p-5 hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-racing-950">GamblingCare.ie</h2>
            <p className="mt-1 text-sm text-ink/70">
              Support and treatment services for problem gambling in Ireland.
            </p>
          </a>
        </div>

        <p>
          A few habits worth building into how you follow racing: set a staking
          budget before the day starts and stick to it, never chase losses, take
          regular breaks from betting apps, and treat every tip &mdash; ours
          included &mdash; as one input into your own decision, not a
          certainty.
        </p>
      </div>
    </div>
  );
}
