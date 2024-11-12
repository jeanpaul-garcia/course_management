/*
  Warnings:

  - You are about to alter the column `nombre` on the `role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(15)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `role` MODIFY `nombre` ENUM('ADMINISTRADOR', 'ESTUDIANTE') NOT NULL;
