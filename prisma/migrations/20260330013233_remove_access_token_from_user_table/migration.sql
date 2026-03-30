/*
  Warnings:

  - You are about to drop the column `accessToken` on the `UserToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserToken_accessToken_key";

-- AlterTable
ALTER TABLE "UserToken" DROP COLUMN "accessToken";
