import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story and approach behind Silks & Stayers.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-3xl font-bold text-racing-950">About Silks &amp; Stayers</h1>
      <div className="prose-content mt-6 space-y-5 text-sm leading-7 text-ink/80">
        <p>
          Silks &amp; Stayers was built for one reason: to bring the reasoning
          behind horse racing tips out into the open. Too many tipping sites hand
          you a horse&apos;s name and little else. We publish the going, the pace
          shape, the trip and the trainer form that led every one of our
          tipsters to their selection &mdash; and we track every tip&apos;s
          result in public.
        </p>
        <p>
          We cover flat and jumps racing across Britain and Ireland, from the
          big Group 1 stages at Ascot and the Curragh to competitive handicaps
          at Naas, Gowran Park and Haydock. Our racecards are updated daily and
          our tipster leaderboard is never edited after the fact.
        </p>
        <p>
          Racing tips are one opinion among many and should never be treated as
          guaranteed outcomes. We built this site to help you form a sharper
          view of a race, not to replace your own judgement. Please read our{" "}
          <a className="font-semibold text-racing-800 underline" href="/responsible-gambling">
            responsible gambling
          </a>{" "}
          guidance if betting is part of how you follow the sport.
        </p>
        <p>
          This site is currently running on illustrative demo data while we
          build out our live racing feeds &mdash; the structure, design and
          tipster model are all real, and will be populated with live
          racecards and tips as we launch.
        </p>
      </div>
    </div>
  );
}
