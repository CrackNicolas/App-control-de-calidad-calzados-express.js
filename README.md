# Project name -- App control de calidad de zapatillas

** Instalacion
   -- 1. npm i      -->    Dependencias

** Crear database
   -- 1. Copiar el script del directorio [database/tables_deploy.sql]
   -- 2. Posteriormente crear su db en su maquina o hosting.
   -- 3. Copiar el script del directorio [database/datos.sql] son datos a modo de ejemplo.
   -- 4. Posteriormenet rellenar las tablas de su db.

** Configurar variables de entorno  
   -- 1. Ingresar las credenciales de su database en el directorio [config/variables.js]

** Ejecucion
   -- 1. npm start

** Uso
   -- Cuenta con 3 roles de usuario
      .Administrador           -->  Realiza el Alta, Baja y modificacion de los usuarios.
      .Supervisor de calidad   -->  Realiza la supervision de las zapatillas.
      .Supervisor de linea     -->  Realiza el control de la linea de produccion.

   -- Cuenta con dos turnos de trabajo (La app solo estara disponible en estos turnos)
      .Turno mañana desde 06:00:00 a 13:00:00
      .Turno tarde desde 13:00:00 a 22:00:00

** Tecnologias utilizadas
   .JavaScript
   .TypeScript
   .Framework Express.js
   .HTML5
   .Motor de plantillas Handlebars
   .CSS3
   .Framework Tailwind
   .DB MySql
   .Testing con jest