/*
  Warnings:

  - You are about to drop the column `card_id` on the `ActivityLogs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ActivityLogs` table. All the data in the column will be lost.
  - Added the required column `actor_id` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_id` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_type` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspace_id` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'DOMAIN_VERIFIED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('Lead', 'Member', 'Viewer');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('ProjectAdmin', 'Contributor', 'Viewer');

-- CreateEnum
CREATE TYPE "AuditTargetType" AS ENUM ('Workspace', 'Team', 'Project', 'Board', 'List', 'Card', 'Membership', 'TeamMembership', 'ProjectMembership', 'Verification');

-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_card_id_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_user_id_fkey";

-- DropIndex
DROP INDEX "ActivityLogs_card_id_idx";

-- DropIndex
DROP INDEX "ActivityLogs_user_id_idx";

-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "card_id",
DROP COLUMN "user_id",
ADD COLUMN     "actor_id" UUID NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "target_id" UUID NOT NULL,
ADD COLUMN     "target_type" "AuditTargetType" NOT NULL,
ADD COLUMN     "workspace_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Boards" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "team_id" UUID;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "is_system_admin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workspaces" ADD COLUMN     "current_members" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "legal_name" TEXT,
ADD COLUMN     "member_limit" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "org_domain" TEXT,
ADD COLUMN     "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "registration_id" TEXT,
ADD COLUMN     "verification_notes" TEXT,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "website" TEXT,
ALTER COLUMN "verified" SET DEFAULT false;

-- CreateTable
CREATE TABLE "Teams" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMemberships" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "TeamMemberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMemberships" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "ProjectMemberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Teams_workspace_id_idx" ON "Teams"("workspace_id");

-- CreateIndex
CREATE INDEX "TeamMemberships_team_id_idx" ON "TeamMemberships"("team_id");

-- CreateIndex
CREATE INDEX "TeamMemberships_user_id_idx" ON "TeamMemberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberships_team_id_user_id_key" ON "TeamMemberships"("team_id", "user_id");

-- CreateIndex
CREATE INDEX "ProjectMemberships_project_id_idx" ON "ProjectMemberships"("project_id");

-- CreateIndex
CREATE INDEX "ProjectMemberships_user_id_idx" ON "ProjectMemberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMemberships_project_id_user_id_key" ON "ProjectMemberships"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "ActivityLogs_actor_id_idx" ON "ActivityLogs"("actor_id");

-- CreateIndex
CREATE INDEX "ActivityLogs_workspace_id_idx" ON "ActivityLogs"("workspace_id");

-- CreateIndex
CREATE INDEX "ActivityLogs_target_type_idx" ON "ActivityLogs"("target_type");

-- CreateIndex
CREATE INDEX "ActivityLogs_target_id_idx" ON "ActivityLogs"("target_id");

-- CreateIndex
CREATE INDEX "Projects_team_id_idx" ON "Projects"("team_id");

-- CreateIndex
CREATE INDEX "Workspaces_owner_id_idx" ON "Workspaces"("owner_id");

-- CreateIndex
CREATE INDEX "Workspaces_type_idx" ON "Workspaces"("type");

-- CreateIndex
CREATE INDEX "Workspaces_plan_idx" ON "Workspaces"("plan");

-- CreateIndex
CREATE INDEX "Workspaces_org_domain_idx" ON "Workspaces"("org_domain");

-- AddForeignKey
ALTER TABLE "Teams" ADD CONSTRAINT "Teams_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberships" ADD CONSTRAINT "TeamMemberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberships" ADD CONSTRAINT "TeamMemberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projects" ADD CONSTRAINT "Projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberships" ADD CONSTRAINT "ProjectMemberships_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberships" ADD CONSTRAINT "ProjectMemberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
