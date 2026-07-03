import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

// All names, tipsters and analysis below are fictional demo content used to
// showcase the site's design and data model - not real horses, people or tips.

const COURSES = [
  { name: "Newmarket (July Course)", slug: "newmarket", country: "UK", region: "Suffolk" },
  { name: "Sandown Park", slug: "sandown-park", country: "UK", region: "Surrey" },
  { name: "Ascot", slug: "ascot", country: "UK", region: "Berkshire" },
  { name: "Haydock Park", slug: "haydock-park", country: "UK", region: "Merseyside" },
  { name: "Naas", slug: "naas", country: "IRE", region: "Kildare" },
  { name: "Gowran Park", slug: "gowran-park", country: "IRE", region: "Kilkenny" },
  { name: "Curragh", slug: "curragh", country: "IRE", region: "Kildare" },
  { name: "Leopardstown", slug: "leopardstown", country: "IRE", region: "Dublin" },
] as const;

const HORSE_NAMES = [
  "Emerald Charger", "Silent Author", "Kestrel Bay", "Northern Anthem", "Velvet Sovereign",
  "Copper Skyline", "Highfield Rebel", "Midnight Cartographer", "Auric Whisper", "Bramble Fortune",
  "Gallant Fable", "Saffron Vigil", "Ironbark Chase", "Whistling Legacy", "Regal Currency",
  "Distant Odyssey", "Firethorn Lad", "Quiet Insurgent", "Marbled Ambition", "Solstice Runner",
  "Ballintubber Boy", "Cloudberry Queen", "Devil's Causeway", "Errigal Star", "Foxglove Melody",
  "Granite Harbour", "Heron's Return", "Inisheer Dream", "Jacobean Prince", "Knockroe Rambler",
  "Larkspur Lane", "Mossy Banks", "Nightjar Native", "Orchard Thief", "Primrose Diplomat",
  "Quillfeather", "Rathmore Glory", "Slaney Warrior", "Turlough Mist", "Ussher's Gamble",
  "Vantage Point", "Willowherb", "Xanthe Moon", "Yeoman's Pride", "Zephyr Crossing",
  "Abbeyleix Ace", "Blackthorn Bay", "Ceannt Station",
];

const JOCKEYS = [
  "R. Fenwick", "L. Marsh", "T. O'Halloran", "J. Kavanagh", "S. Whitmore", "C. Doyle",
  "A. Prendergast", "M. Blaney", "E. Considine", "D. Hartnett", "K. Sloane", "P. Redmond",
  "N. Farrelly", "G. Buckham",
];

const TRAINERS = [
  "W. Ashcombe", "J. Merriman", "P. Guilfoyle", "A. Roskill", "S. Delahunty", "H. Coburn",
  "M. Fitzsimons", "D. Whately", "C. Bergin", "R. Costigan", "L. Rainsford",
];

const GOINGS = ["Good", "Good to Firm", "Good to Soft", "Soft"];

const RACE_TEMPLATES = [
  { suffix: "Maiden Stakes", raceClass: "Class 4", distance: "1m", prizeMoney: 6000 },
  { suffix: "Novice Stakes", raceClass: "Class 5", distance: "6f", prizeMoney: 5000 },
  { suffix: "Handicap", raceClass: "Class 3", distance: "1m2f", prizeMoney: 9500 },
  { suffix: "Fillies' Handicap", raceClass: "Class 4", distance: "7f", prizeMoney: 7000 },
  { suffix: "Nursery Handicap", raceClass: "Class 5", distance: "5f", prizeMoney: 5500 },
  { suffix: "Listed Stakes", raceClass: "Listed", distance: "1m4f", prizeMoney: 28000 },
  { suffix: "Group 3 Stakes", raceClass: "Group 3", distance: "1m1f", prizeMoney: 45000 },
  { suffix: "Handicap Chase", raceClass: "Class 2", distance: "2m4f", prizeMoney: 15000 },
];

const ODDS_POOL = [
  "11/4F", "7/2", "9/2", "5/1", "13/2", "8/1", "10/1", "12/1", "14/1", "16/1", "20/1", "25/1",
];

const FORM_POOL = [
  "1-21", "213-4", "1-1", "34-21", "2-13", "0-1", "1-", "421-3", "11-2", "3-24", "P-11", "0-42",
];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function atTime(date: Date, hours: number, minutes: number) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const TIPSTERS = [
  {
    name: "Jack Hollowell",
    slug: "jack-hollowell",
    bio: "Former bloodstock analyst turned full-time tipster, specialising in big-field handicaps across Britain.",
    specialty: "Flat Handicaps",
    winRate: 34,
    roi: 18,
    totalTips: 842,
  },
  {
    name: "Fiona Marsh",
    slug: "fiona-marsh",
    bio: "Dedicated Irish racing watcher covering the Curragh, Leopardstown and the summer festival circuit.",
    specialty: "Irish Flat Specialist",
    winRate: 31,
    roi: 22,
    totalTips: 613,
  },
  {
    name: "Callum Bright",
    slug: "callum-bright",
    bio: "Nap-of-the-day specialist known for high-conviction single selections rather than volume betting.",
    specialty: "Nap Selections",
    winRate: 29,
    roi: 27,
    totalTips: 401,
  },
  {
    name: "Priya Nandan",
    slug: "priya-nandan",
    bio: "Data-led tipster building models around pace, going and course bias for UK Group and Listed races.",
    specialty: "Group & Listed Races",
    winRate: 27,
    roi: 24,
    totalTips: 356,
  },
  {
    name: "Dermot Casey",
    slug: "dermot-casey",
    bio: "Each-way value hunter focused on outsiders overlooked in the market across UK and Irish cards.",
    specialty: "Each-Way Value",
    winRate: 22,
    roi: 31,
    totalTips: 728,
  },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.tip.deleteMany();
  await prisma.runner.deleteMany();
  await prisma.race.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tipster.deleteMany();

  console.log("Seeding courses...");
  const courseRecords = await Promise.all(
    COURSES.map((c) =>
      prisma.course.create({
        data: { name: c.name, slug: c.slug, country: c.country, region: c.region },
      })
    )
  );

  console.log("Seeding tipsters...");
  const tipsterRecords = await Promise.all(
    TIPSTERS.map((t) => prisma.tipster.create({ data: t }))
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Meeting plan: which courses race on which relative day, and how many races.
  const meetingPlan = [
    { dayOffset: 0, courseSlug: "newmarket", raceCount: 6 },
    { dayOffset: 0, courseSlug: "sandown-park", raceCount: 6 },
    { dayOffset: 0, courseSlug: "naas", raceCount: 7 },
    { dayOffset: 0, courseSlug: "gowran-park", raceCount: 6 },
    { dayOffset: 1, courseSlug: "ascot", raceCount: 7 },
    { dayOffset: 1, courseSlug: "haydock-park", raceCount: 6 },
    { dayOffset: 1, courseSlug: "curragh", raceCount: 7 },
    { dayOffset: 1, courseSlug: "leopardstown", raceCount: 6 },
    { dayOffset: 2, courseSlug: "newmarket", raceCount: 6 },
    { dayOffset: 2, courseSlug: "curragh", raceCount: 6 },
  ];

  let globalHorseCursor = 0;
  let globalJockeyCursor = 0;
  let globalTrainerCursor = 0;
  let globalOddsCursor = 0;
  let globalFormCursor = 0;
  let tipsterCursor = 0;
  let globalRaceIndex = 0;

  for (const plan of meetingPlan) {
    const course = courseRecords.find((c) => c.slug === plan.courseSlug)!;
    const meetingDate = addDays(today, plan.dayOffset);
    const going = pick(GOINGS, globalRaceIndex);

    const meeting = await prisma.meeting.create({
      data: {
        date: meetingDate,
        courseId: course.id,
        going,
        raceType: "FLAT",
      },
    });

    for (let r = 0; r < plan.raceCount; r++) {
      const template = pick(RACE_TEMPLATES, globalRaceIndex);
      const startHour = 13;
      const raceTime = atTime(meetingDate, startHour, r * 35 + (r >= 1 ? 15 : 0));

      const race = await prisma.race.create({
        data: {
          meetingId: meeting.id,
          name: `${course.name.split(" (")[0]} ${template.suffix}`,
          raceTime,
          distance: template.distance,
          raceClass: template.raceClass,
          prizeMoney: template.prizeMoney,
        },
      });

      const runnerCount = 6 + (globalRaceIndex % 5); // 6 to 10 runners
      const runnerRecords = [];
      for (let n = 0; n < runnerCount; n++) {
        const runner = await prisma.runner.create({
          data: {
            raceId: race.id,
            number: n + 1,
            horseName: pick(HORSE_NAMES, globalHorseCursor++),
            jockey: pick(JOCKEYS, globalJockeyCursor++),
            trainer: pick(TRAINERS, globalTrainerCursor++),
            age: 3 + (n % 5),
            weight: `9-${(n % 9) + 1}`,
            odds: pick(ODDS_POOL, globalOddsCursor++),
            form: pick(FORM_POOL, globalFormCursor++),
          },
        });
        runnerRecords.push(runner);
      }

      // Add a tip for roughly two out of every three races, favouring earlier
      // (feature) races on the card.
      if (globalRaceIndex % 3 !== 2) {
        const tipster = pick(tipsterRecords, tipsterCursor++);
        // Favour the runner with the shortest looking odds string as the pick,
        // falling back to a mid-pack runner for variety.
        const pickIndex = globalRaceIndex % 3 === 0 ? 0 : Math.min(2, runnerRecords.length - 1);
        const selectedRunner = runnerRecords[pickIndex];

        await prisma.tip.create({
          data: {
            raceId: race.id,
            runnerId: selectedRunner.id,
            tipsterId: tipster.id,
            confidence: 3 + (globalRaceIndex % 3),
            analysis: `${selectedRunner.horseName} has been in good heart this season and the ${template.distance} trip at ${course.name.split(" (")[0]} should play to their strengths. ${selectedRunner.jockey} takes over and the yard of ${selectedRunner.trainer} has a strong record with this type fresh. Respected at the current price for the ${template.suffix.toLowerCase()}.`,
            result: "PENDING",
          },
        });
      }

      globalRaceIndex++;
    }

    console.log(`Seeded meeting at ${course.name} (${meetingDate.toDateString()})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
