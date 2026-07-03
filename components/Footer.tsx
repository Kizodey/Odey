import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gold-500/20 bg-racing-950 text-racing-100">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-xl font-bold italic text-gold-400">
              Silks &amp; Stayers
            </div>
            <p className="mt-3 text-sm leading-6 text-racing-100/80">
              Daily tips, racecards and analysis for UK &amp; Ireland horse racing,
              from Newmarket and Ascot to the Curragh and Leopardstown.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-gold-300" href="/racecards">Racecards</Link></li>
              <li><Link className="hover:text-gold-300" href="/tips">Today&apos;s Tips</Link></li>
              <li><Link className="hover:text-gold-300" href="/tipsters">Our Tipsters</Link></li>
              <li><Link className="hover:text-gold-300" href="/about">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
              Site
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:text-gold-300" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-gold-300" href="/terms">Terms &amp; Disclaimer</Link></li>
              <li><Link className="hover:text-gold-300" href="/responsible-gambling">Responsible Gambling</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-400">
              Play Responsibly
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400 text-xs font-bold text-gold-400">
                18+
              </span>
              <p className="text-xs text-racing-100/70">
                For over-18s only. Odds and prices are for illustration.
              </p>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a className="hover:text-gold-300" href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">
                  BeGambleAware.org
                </a>
              </li>
              <li>
                <a className="hover:text-gold-300" href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer">
                  GamCare
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gold-500/10 pt-6 text-xs text-racing-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            Silks &amp; Stayers. All tips are opinion,
            not financial or betting advice. Please gamble responsibly.
          </p>
          <p>Demo content for illustration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
