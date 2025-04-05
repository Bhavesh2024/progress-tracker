/*
  Warnings:

  - You are about to drop the column `EMP_CODE` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[empCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empCode` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_EMP_CODE_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "EMP_CODE",
ADD COLUMN     "empCode" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_empCode_key" ON "User"("empCode");
