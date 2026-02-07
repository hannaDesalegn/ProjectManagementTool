/*
  Warnings:

  - You are about to drop the `ActivityLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Boards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMemberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Projects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMemberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workspaces` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "Boards" DROP CONSTRAINT "Boards_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Boards" DROP CONSTRAINT "Boards_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_board_id_fkey";

-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_list_id_fkey";

-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "Lists" DROP CONSTRAINT "Lists_board_id_fkey";

-- DropForeignKey
ALTER TABLE "Memberships" DROP CONSTRAINT "Memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Memberships" DROP CONSTRAINT "Memberships_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMemberships" DROP CONSTRAINT "ProjectMemberships_project_id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMemberships" DROP CONSTRAINT "ProjectMemberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_team_id_fkey";

-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamMemberships" DROP CONSTRAINT "TeamMemberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamMemberships" DROP CONSTRAINT "TeamMemberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Teams" DROP CONSTRAINT "Teams_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "Workspaces" DROP CONSTRAINT "Workspaces_owner_id_fkey";

-- DropTable
DROP TABLE "ActivityLogs";

-- DropTable
DROP TABLE "Boards";

-- DropTable
DROP TABLE "Cards";

-- DropTable
DROP TABLE "Lists";

-- DropTable
DROP TABLE "Memberships";

-- DropTable
DROP TABLE "ProjectMemberships";

-- DropTable
DROP TABLE "Projects";

-- DropTable
DROP TABLE "TeamMemberships";

-- DropTable
DROP TABLE "Teams";

-- DropTable
DROP TABLE "Users";

-- DropTable
DROP TABLE "Workspaces";

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_pic" TEXT,
    "is_system_admin" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "owner_id" UUID NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
    "member_limit" INTEGER NOT NULL DEFAULT 15,
    "current_member" INTEGER NOT NULL DEFAULT 1,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "verification_note" TEXT,
    "org_domain" TEXT,
    "legal_name" TEXT,
    "registration_id" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "team_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMembership" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "ProjectMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" UUID NOT NULL,
    "board_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "board_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL,
    "assigned_to" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "target_type" "AuditTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Workspace_owner_id_idx" ON "Workspace"("owner_id");

-- CreateIndex
CREATE INDEX "Workspace_type_idx" ON "Workspace"("type");

-- CreateIndex
CREATE INDEX "Workspace_plan_idx" ON "Workspace"("plan");

-- CreateIndex
CREATE INDEX "Workspace_org_domain_idx" ON "Workspace"("org_domain");

-- CreateIndex
CREATE INDEX "Membership_workspace_id_idx" ON "Membership"("workspace_id");

-- CreateIndex
CREATE INDEX "Membership_user_id_idx" ON "Membership"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_user_id_workspace_id_key" ON "Membership"("user_id", "workspace_id");

-- CreateIndex
CREATE INDEX "Team_workspace_id_idx" ON "Team"("workspace_id");

-- CreateIndex
CREATE INDEX "TeamMembership_team_id_idx" ON "TeamMembership"("team_id");

-- CreateIndex
CREATE INDEX "TeamMembership_user_id_idx" ON "TeamMembership"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_team_id_user_id_key" ON "TeamMembership"("team_id", "user_id");

-- CreateIndex
CREATE INDEX "Project_workspace_id_idx" ON "Project"("workspace_id");

-- CreateIndex
CREATE INDEX "Project_team_id_idx" ON "Project"("team_id");

-- CreateIndex
CREATE INDEX "ProjectMembership_project_id_idx" ON "ProjectMembership"("project_id");

-- CreateIndex
CREATE INDEX "ProjectMembership_user_id_idx" ON "ProjectMembership"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMembership_project_id_user_id_key" ON "ProjectMembership"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "Board_project_id_idx" ON "Board"("project_id");

-- CreateIndex
CREATE INDEX "Board_workspace_id_idx" ON "Board"("workspace_id");

-- CreateIndex
CREATE INDEX "List_board_id_idx" ON "List"("board_id");

-- CreateIndex
CREATE INDEX "Card_list_id_idx" ON "Card"("list_id");

-- CreateIndex
CREATE INDEX "Card_board_id_idx" ON "Card"("board_id");

-- CreateIndex
CREATE INDEX "Card_workspace_id_idx" ON "Card"("workspace_id");

-- CreateIndex
CREATE INDEX "Card_assigned_to_idx" ON "Card"("assigned_to");

-- CreateIndex
CREATE INDEX "ActivityLog_actor_id_idx" ON "ActivityLog"("actor_id");

-- CreateIndex
CREATE INDEX "ActivityLog_workspace_id_idx" ON "ActivityLog"("workspace_id");

-- CreateIndex
CREATE INDEX "ActivityLog_target_type_idx" ON "ActivityLog"("target_type");

-- CreateIndex
CREATE INDEX "ActivityLog_target_id_idx" ON "ActivityLog"("target_id");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD CONSTRAINT "ProjectMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
