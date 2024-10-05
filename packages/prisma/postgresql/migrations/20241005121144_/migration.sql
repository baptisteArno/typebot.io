-- CreateTable
CREATE TABLE "WorkspaceAiFeature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "credentialId" TEXT,

    CONSTRAINT "WorkspaceAiFeature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkspaceAiFeature" ADD CONSTRAINT "WorkspaceAiFeature_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceAiFeature" ADD CONSTRAINT "WorkspaceAiFeature_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
