/*
  Warnings:

  - Made the column `type` on table `complaint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `objet` on table `complaint` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `complaint` MODIFY `content` TEXT NULL,
    MODIFY `type` VARCHAR(191) NOT NULL,
    MODIFY `objet` VARCHAR(191) NOT NULL;
