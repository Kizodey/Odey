import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Disclaimer",
  description: "Terms of use and editorial disclaimer for Silks & Stayers.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-racing-950">Terms &amp; Disclaimer</h1>
      <div className="mt-6 space-y-5 text-sm leading-7 text-ink/80">
        <h2 className="font-display text-lg font-semibold text-racing-950">Editorial content, not advice</h2>
        <p>
          All racecards, odds, form figures and tips published on Silks &amp;
          Stayers are provided for general information and entertainment
          purposes only. They represent the opinion of the named tipster at
          the time of writing and do not constitute financial, betting or
          investment advice of any kind.
        </p>

        <h2 className="font-display text-lg font-semibold text-racing-950">No guaranteed outcomes</h2>
        <p>
          Horse racing results are inherently uncertain. Past tipster
          performance, win rates and return on investment (ROI) figures are
          historical and are not a guarantee of future results. You should
          never stake more than you can afford to lose.
        </p>

        <h2 className="font-display text-lg font-semibold text-racing-950">Accuracy of information</h2>
        <p>
          We aim to keep racecards, runners and odds accurate and up to date,
          but prices, going descriptions and declared runners can change close
          to a race. Always confirm official racecards and prices with your
          bookmaker or the relevant racecourse before betting.
        </p>

        <h2 className="font-display text-lg font-semibold text-racing-950">Age restriction</h2>
        <p>
          This site and the content on it are intended for adults aged 18 and
          over. If you are concerned about your gambling, see our{" "}
          <a className="font-semibold text-racing-800 underline" href="/responsible-gambling">
            Responsible Gambling
          </a>{" "}
          page for support resources.
        </p>

        <h2 className="font-display text-lg font-semibold text-racing-950">Demo content notice</h2>
        <p>
          This build of the site is populated with illustrative demo data —
          course names are real, but meetings, races, runners, odds and
          tipster commentary shown here are placeholders used to demonstrate
          the site&apos;s design and functionality ahead of a live data
          integration.
        </p>
      </div>
    </div>
  );
}
