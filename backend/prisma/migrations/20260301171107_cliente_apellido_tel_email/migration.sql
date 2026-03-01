/*
  Warnings:

  - You are about to drop the column `activo` on the `cliente` table. All the data in the column will be lost.
  - Added the required column `apellido` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefono` on table `cliente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `cliente` DROP COLUMN `activo`,
    ADD COLUMN `apellido` VARCHAR(191) NOT NULL,
    MODIFY `telefono` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL;
