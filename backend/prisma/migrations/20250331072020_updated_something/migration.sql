/*
  Warnings:

  - You are about to drop the `_Taskassignee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Taskassignee" DROP CONSTRAINT "_Taskassignee_A_fkey";

-- DropForeignKey
ALTER TABLE "_Taskassignee" DROP CONSTRAINT "_Taskassignee_B_fkey";

-- DropIndex
DROP INDEX "Task_assignerId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthDate" DROP NOT NULL,
ALTER COLUMN "joiningDate" DROP NOT NULL,
ALTER COLUMN "jobRole" SET DEFAULT '',
ALTER COLUMN "role" SET DEFAULT 'developer',
ALTER COLUMN "profilePhoto" SET DEFAULT '';

-- DropTable
DROP TABLE "_Taskassignee";

-- CreateTable
CREATE TABLE "_TaskFollowers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskFollowers_B_index" ON "_TaskFollowers"("B");

-- AddForeignKey
ALTER TABLE "_TaskFollowers" ADD CONSTRAINT "_TaskFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskFollowers" ADD CONSTRAINT "_TaskFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
