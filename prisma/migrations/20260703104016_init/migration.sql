-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "going" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    CONSTRAINT "Meeting_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "raceTime" DATETIME NOT NULL,
    "distance" TEXT NOT NULL,
    "raceClass" TEXT NOT NULL,
    "prizeMoney" INTEGER NOT NULL,
    CONSTRAINT "Race_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Runner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "horseName" TEXT NOT NULL,
    "jockey" TEXT NOT NULL,
    "trainer" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "weight" TEXT NOT NULL,
    "odds" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    CONSTRAINT "Runner_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tipster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "winRate" INTEGER NOT NULL,
    "roi" INTEGER NOT NULL,
    "totalTips" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "tipsterId" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "analysis" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tip_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tip_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "Runner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tip_tipsterId_fkey" FOREIGN KEY ("tipsterId") REFERENCES "Tipster" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Meeting_date_idx" ON "Meeting"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_courseId_date_key" ON "Meeting"("courseId", "date");

-- CreateIndex
CREATE INDEX "Race_meetingId_idx" ON "Race"("meetingId");

-- CreateIndex
CREATE INDEX "Race_raceTime_idx" ON "Race"("raceTime");

-- CreateIndex
CREATE INDEX "Runner_raceId_idx" ON "Runner"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tipster_name_key" ON "Tipster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tipster_slug_key" ON "Tipster"("slug");

-- CreateIndex
CREATE INDEX "Tip_raceId_idx" ON "Tip"("raceId");

-- CreateIndex
CREATE INDEX "Tip_tipsterId_idx" ON "Tip"("tipsterId");
