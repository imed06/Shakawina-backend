-- DropForeignKey
ALTER TABLE `complaint` DROP FOREIGN KEY `Complaint_answerId_fkey`;

-- AlterTable
ALTER TABLE `complaint` MODIFY `answerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Complaint` ADD CONSTRAINT `Complaint_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `Answer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
