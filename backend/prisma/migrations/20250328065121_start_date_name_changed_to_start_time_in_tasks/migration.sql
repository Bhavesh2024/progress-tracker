/*
  Warnings:

  - You are about to drop the column `startDate` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "startDate",
ADD COLUMN     "startTime" TIMESTAMP(3);
