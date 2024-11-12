-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(15) NOT NULL,

    UNIQUE INDEX `Role_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombres` VARCHAR(15) NOT NULL,
    `apellidos` VARCHAR(15) NOT NULL,
    `email` VARCHAR(30) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_rol_id_idx`(`rol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscripcion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `curso_id` INTEGER NOT NULL,
    `fecha_inscripcion` DATETIME(3) NOT NULL,
    `estado` VARCHAR(45) NOT NULL,

    INDEX `Inscripcion_usuario_id_idx`(`usuario_id`),
    INDEX `Inscripcion_curso_id_idx`(`curso_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Curso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(35) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL,
    `creador_id` INTEGER NOT NULL,
    `fecha_finalizacion` DATETIME(3) NOT NULL,

    INDEX `Curso_creador_id_idx`(`creador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recurso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curso_id` INTEGER NOT NULL,
    `tipo` VARCHAR(15) NOT NULL,
    `url` VARCHAR(255) NOT NULL,

    INDEX `Recurso_curso_id_idx`(`curso_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(15) NOT NULL,
    `descripcion` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaCurso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `curso_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    INDEX `CategoriaCurso_curso_id_idx`(`curso_id`),
    INDEX `CategoriaCurso_categoria_id_idx`(`categoria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscripcion` ADD CONSTRAINT `Inscripcion_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Curso` ADD CONSTRAINT `Curso_creador_id_fkey` FOREIGN KEY (`creador_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recurso` ADD CONSTRAINT `Recurso_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaCurso` ADD CONSTRAINT `CategoriaCurso_curso_id_fkey` FOREIGN KEY (`curso_id`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriaCurso` ADD CONSTRAINT `CategoriaCurso_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
