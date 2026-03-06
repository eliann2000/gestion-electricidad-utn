/*
  Warnings:

  - You are about to drop the column `categoria` on the `producto` table. All the data in the column will be lost.
  - Added the required column `codigo` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `producto` DROP COLUMN `categoria`,
    ADD COLUMN `codigo` VARCHAR(191) NOT NULL;
