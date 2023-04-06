//------Datos a modo de ejemplo--------

use calzados;
insert into empleado values
("12345687","Lucas","Rojas","lucasrojas@gmail.com"),
("87361534","Martin","Medina","martinmedina@gmail.com"),
("74635491","Luciano","Cordoba","lucianocordoba@gmail.com"),
("66677388","Lila","Gonzales","leilagonzales@gmail.com"),
("94836455","Maru","Bellor","marubellor@gmail.com"),
("31527872","Agustina","Rocha","agustinarocha@gmail.com"),
("11284950","Rocio","Romero","rocioromero@gmail.com"),
("98000463","Tamara","Diaz","tamaradiaz@gmail.com"),
("99990002","Stefania","Roble","stefaniaroble@gmail.com"),
("51882829","Marta","Perez","martaperez@gmail.com"),
("75331234","Adaluz","Romero","adaluzromero@gmail.com"),
("74645380","Erika","Leiva","ericaleiva@gmail.com");

insert into tipo_usuario values
("Administrador"),
("Supervisor de linea"),
("Supervisor de calidad");

insert into usuario values
("12345687","Lucas","11111","Administrador"),
("87361534","Martin","22222","Administrador"),
("74635491","Luciano","33333","Administrador"),
("66677388","Liela","44444","Administrador"),
("94836455","Mari","55555","Supervisor de linea"),
("31527872","Agus","66666","Supervisor de linea"),
("11284950","Roo","77777","Supervisor de linea"),
("98000463","Tami","88888","Supervisor de linea"),
("99990002","Stefi","99999","Supervisor de calidad"),
("51882829","Martu","10000","Supervisor de calidad"),
("75331234","Ada","10001","Supervisor de calidad"),
("74645380","Cota","10002","Supervisor de calidad");

insert into linea values(1),(2),(3),(4);

insert into color values
(1,'Negro'),
(2,'Verde'),
(3,'Azul'),
(4,'Blanco'),
(5,'Rosa'),
(6,'Morado'),
(7,'Dorado'),
(8,'Naranja'),
(9,'Amarillo'),
(10,'Rojo'),
(11,'Celeste'),
(12,'Marron'),
(13,'Gris');

insert into modelo values
(1,'Adidas',3,7,4,8),
(2,'Puma',3,7,4,8),
(3,'Nike',3,7,4,8),
(4,'Topper',3,7,4,8),
(5,'Reebok',3,7,4,8),
(6,'Vans',3,7,4,8),
(7,'Converse',3,7,4,8),
(8,'New Balance',3,7,4,8),
(9,'Fila',3,7,4,8),
(10,'Skechers',3,7,4,8),
(11,'Bershka',3,7,4,8),
(12,'Vegtus',3,7,4,8);

insert into turno values
('Mañana','06:00:00','13:00:00'),
('Tarde','13:00:00','22:00:00');

insert into defecto values
('Grietas','Reproceso'),
('Decoloracion','Reproceso'),
('Suela desigual','Reproceso'),
('Plantilla desigual','Reproceso'),
('Descosido','Reproceso'),
('Despegado','Reproceso'),
('Manchas','Observado'),
('Arrugas','Observado');