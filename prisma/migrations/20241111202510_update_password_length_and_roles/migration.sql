-- AlterTable
ALTER TABLE `usuario` MODIFY `password` VARCHAR(100) NOT NULL;

INSERT INTO `Role` (`nombre`) VALUES ('ADMINISTRADOR');
INSERT INTO `Role` (`nombre`) VALUES ('ESTUDIANTE');