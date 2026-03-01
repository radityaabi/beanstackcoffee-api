/*
  Warnings:

  - You are about to alter the column `sku` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sku" SET DATA TYPE VARCHAR(50);
