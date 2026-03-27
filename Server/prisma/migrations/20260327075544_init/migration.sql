-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'email',
    `providerId` VARCHAR(191) NULL,
    `level` ENUM('SDE_1', 'SDE_2', 'SDE_3', 'SDE_4') NOT NULL DEFAULT 'SDE_1',
    `role` ENUM('FRONTEND', 'BACKEND', 'FULL_STACK', 'DEVOPS', 'MOBILE') NOT NULL DEFAULT 'FULL_STACK',
    `targetCompany` VARCHAR(191) NULL,
    `plan` ENUM('FREE', 'PRO', 'PREMIUM', 'TEAM') NOT NULL DEFAULT 'FREE',
    `planExpiry` DATETIME(3) NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `level` ENUM('SDE_1', 'SDE_2', 'SDE_3', 'SDE_4') NOT NULL,
    `role` ENUM('FRONTEND', 'BACKEND', 'FULL_STACK', 'DEVOPS', 'MOBILE') NOT NULL,
    `companyType` ENUM('FAANG', 'STARTUP', 'MNC', 'FINTECH', 'PRODUCT') NOT NULL,
    `companyName` VARCHAR(191) NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'PAUSED') NOT NULL DEFAULT 'IN_PROGRESS',
    `currentRound` INTEGER NOT NULL DEFAULT 1,
    `totalRounds` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `lastSavedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalScore` DOUBLE NULL,
    `percentile` DOUBLE NULL,
    `feedback` TEXT NULL,

    INDEX `InterviewSession_userId_status_idx`(`userId`, `status`),
    INDEX `InterviewSession_userId_startedAt_idx`(`userId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Round` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `type` ENUM('APTITUDE', 'DSA_BASIC', 'DSA_MEDIUM', 'DSA_HARD', 'HR', 'LLD', 'HLD', 'BEHAVIOURAL', 'TECH_FUNDAMENTALS', 'TECH_DEEP_DIVE', 'HIRING_MANAGER') NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'NOT_STARTED',
    `score` DOUBLE NULL,
    `maxScore` DOUBLE NOT NULL DEFAULT 100,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `timeTaken` INTEGER NULL,

    INDEX `Round_sessionId_idx`(`sessionId`),
    UNIQUE INDEX `Round_sessionId_roundNumber_key`(`sessionId`, `roundNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `roundId` VARCHAR(191) NOT NULL,
    `questionNumber` INTEGER NOT NULL,
    `type` ENUM('MCQ', 'CODING', 'VOICE', 'TEXT', 'DESIGN') NOT NULL,
    `content` TEXT NOT NULL,
    `metadata` JSON NULL,
    `userAnswer` TEXT NULL,
    `codeAnswer` TEXT NULL,
    `voiceTranscript` TEXT NULL,
    `aiEvaluation` JSON NULL,
    `score` DOUBLE NULL,
    `maxScore` DOUBLE NOT NULL DEFAULT 100,
    `hintsUsed` INTEGER NOT NULL DEFAULT 0,
    `skipped` BOOLEAN NOT NULL DEFAULT false,
    `answeredAt` DATETIME(3) NULL,

    INDEX `Question_roundId_idx`(`roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `totalSessions` INTEGER NOT NULL DEFAULT 0,
    `totalTimeMin` INTEGER NOT NULL DEFAULT 0,
    `averageScore` DOUBLE NULL,
    `dsaScore` DOUBLE NULL,
    `lldScore` DOUBLE NULL,
    `hldScore` DOUBLE NULL,
    `hrScore` DOUBLE NULL,
    `aptitudeScore` DOUBLE NULL,
    `weakAreas` JSON NOT NULL,
    `strongAreas` JSON NOT NULL,
    `currentStreak` INTEGER NOT NULL DEFAULT 0,
    `longestStreak` INTEGER NOT NULL DEFAULT 0,
    `lastActiveDate` DATETIME(3) NULL,
    `badges` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `razorpayOrderId` VARCHAR(191) NOT NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `plan` ENUM('FREE', 'PRO', 'PREMIUM', 'TEAM') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_razorpayOrderId_key`(`razorpayOrderId`),
    INDEX `Payment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InterviewSession` ADD CONSTRAINT `InterviewSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Round` ADD CONSTRAINT `Round_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `InterviewSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Round`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
