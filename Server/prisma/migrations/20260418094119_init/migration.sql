-- CreateEnum
CREATE TYPE "SDELevel" AS ENUM ('SDE_1', 'SDE_2', 'SDE_3', 'SDE_4');

-- CreateEnum
CREATE TYPE "DevRole" AS ENUM ('FRONTEND', 'BACKEND', 'FULL_STACK', 'DEVOPS', 'MOBILE');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('FAANG', 'STARTUP', 'MNC', 'FINTECH', 'PRODUCT');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM', 'TEAM');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('APTITUDE', 'DSA_BASIC', 'DSA_MEDIUM', 'DSA_HARD', 'HR', 'LLD', 'HLD', 'BEHAVIOURAL', 'TECH_FUNDAMENTALS', 'TECH_DEEP_DIVE', 'HIRING_MANAGER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'PAUSED');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'CODING', 'VOICE', 'TEXT', 'DESIGN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatar" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "providerId" TEXT,
    "level" "SDELevel" NOT NULL DEFAULT 'SDE_1',
    "role" "DevRole" NOT NULL DEFAULT 'FULL_STACK',
    "targetCompany" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "planExpiry" TIMESTAMP(3),
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" "SDELevel" NOT NULL,
    "role" "DevRole" NOT NULL,
    "companyType" "CompanyType" NOT NULL,
    "companyName" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "totalRounds" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalScore" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "feedback" TEXT,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "type" "RoundType" NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeTaken" INTEGER,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "userAnswer" TEXT,
    "codeAnswer" TEXT,
    "voiceTranscript" TEXT,
    "aiEvaluation" JSONB,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMin" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "dsaScore" DOUBLE PRECISION,
    "lldScore" DOUBLE PRECISION,
    "hldScore" DOUBLE PRECISION,
    "hrScore" DOUBLE PRECISION,
    "aptitudeScore" DOUBLE PRECISION,
    "weakAreas" JSONB NOT NULL DEFAULT '[]',
    "strongAreas" JSONB NOT NULL DEFAULT '[]',
    "badges" JSONB NOT NULL DEFAULT '[]',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "plan" "Plan" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_status_idx" ON "InterviewSession"("userId", "status");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_startedAt_idx" ON "InterviewSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Round_sessionId_idx" ON "Round"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_sessionId_roundNumber_key" ON "Round"("sessionId", "roundNumber");

-- CreateIndex
CREATE INDEX "Question_roundId_idx" ON "Question"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
