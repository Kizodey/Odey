import { prisma } from "@/lib/prisma";

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getMeetingsForDate(date: Date) {
  return prisma.meeting.findMany({
    where: { date: { gte: startOfDay(date), lte: endOfDay(date) } },
    include: {
      course: true,
      races: {
        orderBy: { raceTime: "asc" },
        include: { tips: true },
      },
    },
    orderBy: { course: { name: "asc" } },
  });
}

export function getRaceById(id: string) {
  return prisma.race.findUnique({
    where: { id },
    include: {
      meeting: { include: { course: true } },
      runners: { orderBy: { number: "asc" } },
      tips: { include: { tipster: true, runner: true } },
    },
  });
}

export function getTipsForDate(date: Date) {
  return prisma.tip.findMany({
    where: {
      race: {
        meeting: { date: { gte: startOfDay(date), lte: endOfDay(date) } },
      },
    },
    include: {
      tipster: true,
      runner: true,
      race: { include: { meeting: { include: { course: true } } } },
    },
    orderBy: { race: { raceTime: "asc" } },
  });
}

export function getTipsters() {
  return prisma.tipster.findMany({ orderBy: { roi: "desc" } });
}

export function getTipsterBySlug(slug: string) {
  return prisma.tipster.findUnique({
    where: { slug },
    include: {
      tips: {
        include: { runner: true, race: { include: { meeting: { include: { course: true } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAvailableMeetingDates() {
  const meetings = await prisma.meeting.findMany({
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "asc" },
  });
  return meetings.map((m) => m.date);
}
