-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `oauth_token_secret` VARCHAR(191) NULL,
    `oauth_token` VARCHAR(191) NULL,
    `refresh_token_expires_in` INTEGER NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(1000) NULL,
    `company` VARCHAR(191) NULL,
    `onboardingCategories` JSON NOT NULL,
    `referral` VARCHAR(191) NULL,
    `graphNavigation` ENUM('MOUSE', 'TRACKPAD') NULL,
    `preferredAppAppearance` VARCHAR(191) NULL,
    `displayedInAppNotifications` JSON NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApiToken` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `token` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ApiToken_token_key`(`token`),
    INDEX `ApiToken_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(1000) NULL,
    `plan` ENUM('FREE', 'STARTER', 'PRO', 'LIFETIME', 'OFFERED', 'CUSTOM', 'UNLIMITED') NOT NULL DEFAULT 'FREE',
    `stripeId` VARCHAR(191) NULL,
    `additionalChatsIndex` INTEGER NOT NULL DEFAULT 0,
    `additionalStorageIndex` INTEGER NOT NULL DEFAULT 0,
    `chatsLimitFirstEmailSentAt` DATETIME(3) NULL,
    `storageLimitFirstEmailSentAt` DATETIME(3) NULL,
    `chatsLimitSecondEmailSentAt` DATETIME(3) NULL,
    `storageLimitSecondEmailSentAt` DATETIME(3) NULL,
    `customChatsLimit` INTEGER NULL,
    `customStorageLimit` INTEGER NULL,
    `customSeatsLimit` INTEGER NULL,
    `isQuarantined` BOOLEAN NOT NULL DEFAULT false,
    `isSuspended` BOOLEAN NOT NULL DEFAULT false,
    `isPastDue` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NULL,

    UNIQUE INDEX `Workspace_stripeId_key`(`stripeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemberInWorkspace` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MEMBER', 'GUEST') NOT NULL,

    INDEX `MemberInWorkspace_workspaceId_idx`(`workspaceId`),
    UNIQUE INDEX `MemberInWorkspace_userId_workspaceId_key`(`userId`, `workspaceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `email` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `type` ENUM('ADMIN', 'MEMBER', 'GUEST') NOT NULL,

    INDEX `WorkspaceInvitation_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomDomain` (
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `workspaceId` VARCHAR(191) NOT NULL,

    INDEX `CustomDomain_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Credentials` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `workspaceId` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `iv` VARCHAR(191) NOT NULL,

    INDEX `Credentials_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DashboardFolder` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(255) NOT NULL,
    `parentFolderId` VARCHAR(191) NULL,
    `workspaceId` VARCHAR(191) NOT NULL,

    INDEX `DashboardFolder_workspaceId_idx`(`workspaceId`),
    INDEX `DashboardFolder_parentFolderId_idx`(`parentFolderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Typebot` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `icon` TEXT NULL,
    `name` VARCHAR(255) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `groups` JSON NOT NULL,
    `events` JSON NULL,
    `variables` JSON NOT NULL,
    `edges` JSON NOT NULL,
    `theme` JSON NOT NULL,
    `selectedThemeTemplateId` VARCHAR(191) NULL,
    `settings` JSON NOT NULL,
    `publicId` VARCHAR(191) NULL,
    `customDomain` VARCHAR(191) NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `resultsTablePreferences` JSON NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `whatsAppCredentialsId` VARCHAR(191) NULL,
    `riskLevel` INTEGER NULL,

    UNIQUE INDEX `Typebot_publicId_key`(`publicId`),
    UNIQUE INDEX `Typebot_customDomain_key`(`customDomain`),
    INDEX `Typebot_workspaceId_idx`(`workspaceId`),
    INDEX `Typebot_folderId_idx`(`folderId`),
    INDEX `Typebot_isArchived_createdAt_idx`(`isArchived`, `createdAt` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invitation` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `email` VARCHAR(191) NOT NULL,
    `typebotId` VARCHAR(191) NOT NULL,
    `type` ENUM('READ', 'WRITE', 'FULL_ACCESS') NOT NULL,

    INDEX `Invitation_typebotId_idx`(`typebotId`),
    UNIQUE INDEX `Invitation_email_typebotId_key`(`email`, `typebotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollaboratorsOnTypebots` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `typebotId` VARCHAR(191) NOT NULL,
    `type` ENUM('READ', 'WRITE', 'FULL_ACCESS') NOT NULL,

    INDEX `CollaboratorsOnTypebots_typebotId_idx`(`typebotId`),
    UNIQUE INDEX `CollaboratorsOnTypebots_userId_typebotId_key`(`userId`, `typebotId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PublicTypebot` (
    `id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `typebotId` VARCHAR(191) NOT NULL,
    `groups` JSON NOT NULL,
    `events` JSON NULL,
    `variables` JSON NOT NULL,
    `edges` JSON NOT NULL,
    `theme` JSON NOT NULL,
    `settings` JSON NOT NULL,

    UNIQUE INDEX `PublicTypebot_typebotId_key`(`typebotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Result` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `typebotId` VARCHAR(191) NOT NULL,
    `variables` JSON NOT NULL,
    `isCompleted` BOOLEAN NOT NULL,
    `hasStarted` BOOLEAN NULL,
    `isArchived` BOOLEAN NULL DEFAULT false,

    INDEX `Result_typebotId_isArchived_hasStarted_createdAt_idx`(`typebotId`, `isArchived`, `hasStarted`, `createdAt` DESC),
    INDEX `Result_typebotId_isArchived_isCompleted_idx`(`typebotId`, `isArchived`, `isCompleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VisitedEdge` (
    `resultId` VARCHAR(191) NOT NULL,
    `edgeId` VARCHAR(191) NOT NULL,
    `index` INTEGER NOT NULL,

    UNIQUE INDEX `VisitedEdge_resultId_index_key`(`resultId`, `index`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `details` TEXT NULL,

    INDEX `Log_resultId_idx`(`resultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Answer` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resultId` VARCHAR(191) NOT NULL,
    `blockId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `variableId` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `storageUsed` INTEGER NULL,

    INDEX `Answer_blockId_itemId_idx`(`blockId`, `itemId`),
    INDEX `Answer_storageUsed_idx`(`storageUsed`),
    UNIQUE INDEX `Answer_resultId_blockId_groupId_key`(`resultId`, `blockId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `userPropertiesToUpdate` JSON NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `dateRedeemed` DATETIME(3) NULL,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Webhook` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `url` VARCHAR(2000) NULL,
    `method` VARCHAR(191) NOT NULL,
    `queryParams` JSON NOT NULL,
    `headers` JSON NOT NULL,
    `body` TEXT NULL,
    `typebotId` VARCHAR(191) NOT NULL,

    INDEX `Webhook_typebotId_idx`(`typebotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClaimableCustomPlan` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimedAt` DATETIME(3) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,
    `chatsLimit` INTEGER NOT NULL,
    `storageLimit` INTEGER NOT NULL,
    `seatsLimit` INTEGER NOT NULL,
    `isYearly` BOOLEAN NOT NULL DEFAULT false,
    `companyName` VARCHAR(191) NULL,
    `vatType` VARCHAR(191) NULL,
    `vatValue` VARCHAR(191) NULL,

    UNIQUE INDEX `ClaimableCustomPlan_workspaceId_key`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatSession` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `state` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThemeTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NOT NULL,
    `theme` JSON NOT NULL,
    `workspaceId` VARCHAR(191) NOT NULL,

    INDEX `ThemeTemplate_workspaceId_idx`(`workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BannedIp` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(191) NOT NULL,
    `responsibleTypebotId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BannedIp_ip_key`(`ip`),
    INDEX `BannedIp_responsibleTypebotId_idx`(`responsibleTypebotId`),
    INDEX `BannedIp_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Embed` (
    `id` VARCHAR(191) NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
