/*
  Warnings:

  - You are about to drop the column `taskCode` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_taskCode_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "taskCode";
