-- DropForeignKey
ALTER TABLE `detalleventa` DROP FOREIGN KEY `DetalleVenta_productoId_fkey`;

-- AlterTable
ALTER TABLE `detalleventa` MODIFY `productoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DetalleVenta` ADD CONSTRAINT `DetalleVenta_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
