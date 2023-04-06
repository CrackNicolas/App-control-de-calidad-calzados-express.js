CREATE TABLE `color` (
  `Codigo` INT(11) NOT NULL,
  `Descripcion` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`Codigo`));

CREATE TABLE `modelo` (
  `Sku` INT(11) NOT NULL,
  `Denominacion` VARCHAR(40) NOT NULL,
  `Limite_inf_reproceso` INT(11) NOT NULL,
  `Limite_sup_reproceso` INT(11) NOT NULL,
  `Limite_inf_observado` INT(11) NOT NULL,
  `Limite_sup_observado` INT(11) NOT NULL,
  PRIMARY KEY (`Sku`));

CREATE TABLE `empleado` (
  `Dni` VARCHAR(10) NOT NULL,
  `Nombre` VARCHAR(45) NOT NULL,
  `Apellido` VARCHAR(45) NOT NULL,
  `Correo` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`Dni`));

CREATE TABLE `turno` (
  `Descripcion` VARCHAR(7) NOT NULL,
  `Hora_inicio` TIME NOT NULL,
  `Hora_fin` TIME NOT NULL,
  PRIMARY KEY (`Descripcion`));

CREATE TABLE `defecto` (
  `Descripcion` VARCHAR(45) NOT NULL,
  `Tipo_defecto` ENUM('Observado', 'Reproceso') NOT NULL,
  PRIMARY KEY (`Descripcion`));

CREATE TABLE `linea` (
  `Numero` INT(11) NOT NULL,
  PRIMARY KEY (`Numero`));

CREATE TABLE `tipo_usuario` (
  `Nombre` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`Nombre`));

CREATE TABLE `usuario` (
  `Empleado` VARCHAR(10) NOT NULL,
  `Nombre` VARCHAR(15) NOT NULL,
  `Contraseña` VARCHAR(45) NOT NULL,
  `Id_tipo_usuario` VARCHAR(25) NOT NULL,
  PRIMARY KEY (`Empleado`),
  INDEX `fk_Usuario_Tipo_usuario1_idx` (`Id_tipo_usuario` ASC),
  INDEX `fk_Usuario_Empleado1_idx` (`Empleado` ASC),
  CONSTRAINT `fk_Usuario_Tipo_usuario1`
    FOREIGN KEY (`Id_tipo_usuario`)
    REFERENCES `tipo_usuario` (`Nombre`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Usuario_Empleado1`
    FOREIGN KEY (`Empleado`)
    REFERENCES `empleado` (`Dni`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE `orden_de_produccion` (
  `Id_orden_de_produccion` INT(11) NOT NULL AUTO_INCREMENT,
  `Numero` INT(11) NOT NULL,
  `Fecha_inicio` DATETIME NOT NULL,
  `Fecha_fin` DATETIME NULL DEFAULT NULL,
  `Pares_de_primera` INT(11) NOT NULL,
  `Pares_de_segunda` INT(11) NOT NULL,
  `Estado` ENUM('Iniciada', 'Pausada', 'Finalizada') NOT NULL,
  `Modelo` INT(11) NOT NULL,
  `Color` INT(11) NOT NULL,
  `Linea` INT(11) NOT NULL,
  `Empleado` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`Id_orden_de_produccion`),
  INDEX `fk_op_modelo1_idx` (`Modelo` ASC),
  INDEX `fk_op_color1_idx` (`Color` ASC),
  INDEX `fk_Op_Linea1_idx` (`Linea` ASC),
  INDEX `fk_Orden_de_produccion_Empleado1_idx` (`Empleado` ASC),
  CONSTRAINT `fk_op_modelo1`
    FOREIGN KEY (`Modelo`)
    REFERENCES `modelo` (`Sku`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_op_color1`
    FOREIGN KEY (`Color`)
    REFERENCES `color` (`Codigo`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Op_Linea1`
    FOREIGN KEY (`Linea`)
    REFERENCES `linea` (`Numero`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Orden_de_produccion_Empleado1`
    FOREIGN KEY (`Empleado`)
    REFERENCES `empleado` (`Dni`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE `jornada_laboral` (
  `Id_jornada_laboral` INT(11) NOT NULL AUTO_INCREMENT,
  `Fecha_inicio` DATETIME NOT NULL,
  `Fecha_fin` DATETIME NULL DEFAULT NULL,
  `Orden_de_produccion` INT(11) NOT NULL,
  `Turno` VARCHAR(7) NOT NULL,
  INDEX `fk_Jornada_laboral_Turno1_idx` (`Turno` ASC),
  PRIMARY KEY (`Id_jornada_laboral`),
  INDEX `fk_Jornada_laboral_Orden_de_produccion1_idx` (`Orden_de_produccion` ASC),
  CONSTRAINT `fk_Jornada_laboral_Turno1`
    FOREIGN KEY (`Turno`)
    REFERENCES `turno` (`Descripcion`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Jornada_laboral_Orden_de_produccion1`
    FOREIGN KEY (`Orden_de_produccion`)
    REFERENCES `orden_de_produccion` (`Id_orden_de_produccion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `horario_control` (
  `Id_horario_control` INT(11) NOT NULL AUTO_INCREMENT,
  `Jornada_laboral` INT(11) NOT NULL,
  `Fecha_inicio_hora` DATETIME NULL DEFAULT NULL,
  `Fecha_fin_hora` DATETIME NULL DEFAULT NULL,
  `Empleado` VARCHAR(10) NULL DEFAULT NULL,
  INDEX `fk_Jornada_laboral_has_Empleado_Empleado1_idx` (`Empleado` ASC),
  INDEX `fk_Horario_control_Jornada_laboral1_idx` (`Jornada_laboral` ASC),
  PRIMARY KEY (`Id_horario_control`),
  CONSTRAINT `fk_Jornada_laboral_has_Empleado_Empleado1`
    FOREIGN KEY (`Empleado`)
    REFERENCES `empleado` (`Dni`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Horario_control_Jornada_laboral1`
    FOREIGN KEY (`Jornada_laboral`)
    REFERENCES `jornada_laboral` (`Id_jornada_laboral`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE DEFINER = CURRENT_USER TRIGGER `Iniciar_horario_control` AFTER INSERT ON `jornada_laboral` FOR EACH ROW
insert into horario_control value(0,new.Id_jornada_laboral,null,null,null);

CREATE TABLE `incidencia` (
  `Id_incidencia` INT(11) NOT NULL AUTO_INCREMENT,
  `Fecha` DATE NOT NULL,
  `Hora` TIME NOT NULL,
  `Cantidad` INT(11) NOT NULL,
  `Pie` ENUM('Izquierdo', 'Derecho') NOT NULL,
  `Estado` VARCHAR(10) NOT NULL,
  `Defecto` VARCHAR(45) NOT NULL,
  `Id_horario_control` INT(11) NOT NULL,
  INDEX `fk_Incidencia_Defecto1_idx` (`Defecto` ASC),
  PRIMARY KEY (`Id_incidencia`),
  INDEX `fk_Incidencia_Horario_control1_idx` (`Id_horario_control` ASC),
  CONSTRAINT `fk_Incidencia_Defecto1`
    FOREIGN KEY (`Defecto`)
    REFERENCES `defecto` (`Descripcion`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Incidencia_Horario_control1`
    FOREIGN KEY (`Id_horario_control`)
    REFERENCES `horario_control` (`Id_horario_control`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE `alerta` (
  `Id_alerta` INT(11) NOT NULL AUTO_INCREMENT,
  `Fecha_disparo` DATETIME NOT NULL,
  `Fecha_reinicio` DATETIME NULL DEFAULT NULL,
  `Tipo_defecto` ENUM('Observado', 'Reproceso') NOT NULL,
  `Id_jornada_laboral` INT(11) NOT NULL,
  PRIMARY KEY (`Id_alerta`),
  INDEX `fk_Alerta_Jornada_laboral1_idx` (`Id_jornada_laboral` ASC),
  CONSTRAINT `fk_Alerta_Jornada_laboral1`
    FOREIGN KEY (`Id_jornada_laboral`)
    REFERENCES `jornada_laboral` (`Id_jornada_laboral`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);