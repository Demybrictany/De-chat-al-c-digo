# Migraciones de Clinicas

La migracion inicial se preparo desde el schema.dbml vigente, sin conexion a MySQL.
Incluye las 14 tablas del modelo, 131 columnas, 14 claves primarias autoincrementales,
36 claves foraneas RESTRICT, 17 indices de consulta y 6 indices unicos.
MySQL agrega los indices de soporte de FK que hagan falta.
Los catalogos se crean vacios: esta migracion no ejecuta seeds ni crea usuarios.

## Configuracion

- Usar backend/.env con DB_DATABASE=clinicas y DB_SYNCHRONIZE=false.
- Configurar DB_HOST, DB_PORT, DB_USERNAME y DB_PASSWORD para el servidor deseado.
- La base clinicas debe existir previamente; no se ejecuta CREATE DATABASE.
- El DataSource rechaza otro nombre de base y no se inicializa al importarlo.
- NestJS mantiene synchronize, migrationsRun y dropSchema en false.
- Se declara dotenv como dependencia directa; package-lock.json queda alineado.
- El CLI usa ts-node y tsconfig-paths para resolver los imports src/* existentes.

## Comandos posteriores (no ejecutados durante la preparacion)

Desde la raiz del repositorio:

    npm --prefix backend run migration:show
    npm --prefix backend run migration:run

O desde backend:

    npm run migration:show
    npm run migration:run

Ambos comandos abren una conexion al servidor configurado cuando se invocan.
El comando run equivale a:

    ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts --transaction none

TypeORM registra las ejecuciones en una tabla tecnica migrations, adicional a las
14 tablas de negocio. Al volver a ejecutar run no repite una migracion registrada.
Antes del primer CREATE de negocio se comprueba la base seleccionada y se rechaza
la presencia de cualquiera de las 14 tablas, evitando sobrescribir datos o adoptar
un esquema parcial sin revisar. No se usa IF NOT EXISTS ni se deshabilitan las FKs.

## Restricciones y recuperacion

MySQL hace commit implicito de DDL. Por eso se usa transaction none: no hay una
promesa de rollback atomico de todos los CREATE/ALTER. Si la ejecucion falla,
inspeccionar el estado antes de reintentar; no borrar tablas automaticamente.
El metodo down rechaza la reversion automatica para evitar perdida de datos.
Cualquier rollback requiere un plan y una migracion explicita autorizada.

Se usan InnoDB y utf8mb4_unicode_ci. Las fechas de auditoria son datetime(6), con
CURRENT_TIMESTAMP(6); updated_at tiene ON UPDATE CURRENT_TIMESTAMP(6), igual que
los metadatos TypeORM. Las cantidades y existencias son INT UNSIGNED. La cantidad
minima 1 de una receta se valida en el DTO; UNSIGNED permite cero. Las reglas de
rol medico, pertenencia al mismo paciente, prioridad y resolucion de alertas siguen
a cargo de los servicios. No se agregaron CHECK ni triggers ausentes del DBML.

Para evolucionar el esquema, actualizar DBML y entidades juntos y preparar una
nueva migracion; no editar una migracion que ya se haya aplicado.

## Seed de catalogos y primer administrador

El seed usa el mismo DataSource limitado a clinicas y no ejecuta migraciones.
Antes de la primera ejecucion, agregar a backend/.env:

    SEED_ADMIN_EMAIL=tu-correo@ejemplo.com
    SEED_ADMIN_PASSWORD="tu-clave-propia"
    SEED_ADMIN_FULL_NAME=Administrador

La clave debe tener al menos 8 caracteres y como maximo 72 bytes UTF-8. Usar
comillas en .env si contiene # o espacios. No hay clave predeterminada ni se
imprime la clave/hash en consola o auditoria. No subir el .env al repositorio.
JWT_SECRET sigue siendo necesario para iniciar la API y autenticar despues.

Desde la raiz del repositorio, ejecutar posteriormente:

    npm --prefix backend run seed

Desde backend, el equivalente es npm run seed.

Valores iniciales (se busca por name, sin asumir IDs numericos):

| Tabla | Valores |
|---|---|
| roles | admin, doctor, nurse, receptionist, pharmacist |
| appointment_statuses | scheduled, completed, cancelled, no_show |
| alert_statuses | active, resolved |
| product_types | medicamento, muestra_medica |

Los roles nuevos usan status=1, el valor predeterminado actual de la entidad.
No se redefine el significado de roles.status. Los registros existentes se
conservan completos, incluyendo IDs y descripciones. Si un codigo existente
solo coincide por mayusculas/acentos, el seed falla sin cambiarlo: el backend
compara los nombres de roles exactamente. La restriccion UNIQUE evita duplicados.
Un bloqueo de sesion MySQL serializa ejecuciones simultaneas del propio seed.
Una insercion concurrente desde otra herramienta puede hacer fallar el seed por
UNIQUE; la transaccion se revierte y puede reintentarse sin duplicar registros.

Si ya hay un administrador activo, no se crea otro y las variables de bootstrap
no cambian su correo, nombre, rol ni clave. Si solo hay administradores inactivos,
o el correo configurado pertenece a otro usuario, el seed falla sin reasignar ni
reactivar usuarios. Las nuevas cuentas posteriores se gestionan mediante la API.

El primer administrador se crea activo, con rol admin resuelto por nombre y
bcrypt de 10 rondas, compatible con AuthService. created_by_id/updated_by_id son
NULL porque el bootstrap no tiene actor autenticado. Las inserciones de catalogos
y usuario generan CREATE en audit_logs con user_id=NULL y origin=initial_seed.
Todo se guarda en una transaccion: si falla la auditoria, validacion o creacion
del admin, se revierten tambien las nuevas filas de catalogos. Repetir el seed
sin cambios no agrega nuevas filas ni eventos de auditoria.

Tras el seed y al iniciar la API, usar POST /api/auth/login con email y password.
El token expira a los 30 minutos con JWT_EXPIRES_IN=30m. Las variables SEED_ADMIN_*
solo son de bootstrap; retirarlas no cambia la cuenta ya creada ni su hash.

Pendiente independiente: UsersService aun debe poblar autoria en las escrituras
normales de usuarios. Este seed no modifica los servicios ni la migracion aplicada.

## Archivado y restauracion de pacientes

Migracion pendiente: 1791849601000-add-patient-archive.ts. Ejecutar posteriormente
npm --prefix backend run migration:run desde la raiz. No editar la inicial aplicada.
La API actualizada requiere esta migracion antes de utilizar pacientes; el codigo
consulta columnas nuevas que aun no existen en la base local hasta aplicarla.
No se ejecutaron migraciones ni seeds para preparar esta funcionalidad.

La nueva migracion agrega is_archived (false para pacientes existentes), archived_at,
archived_by_id y archive_reason, un indice (is_archived, id) y una FK RESTRICT a users.
La restauracion limpia los metadatos de archivo actuales, manteniendo los anteriores
en audit_logs. No elimina registros clinicos ni cambia prioridad/fallecimiento.

- PATCH /api/patients/:id/archive (admin): body { "reason": "Baja administrativa" }.
  Motivo obligatorio, 3 a 500 caracteres despues de quitar espacios externos.
- PATCH /api/patients/:id/restore (admin): sin body.
- GET /api/patients: excluye archivados.
- GET /api/patients?includeArchived=true: incluye todos, solo admin; otro rol recibe 403.
- GET /api/patients?includeArchived=false: listado habitual.
- GET /api/patients/:id: conserva los permisos de lectura existentes y permite
  consultar el paciente archivado para acceder a su informacion historica.

Archive responde 409 si hay citas scheduled con scheduled_at >= ahora o alertas
active. El mensaje indica ambas cantidades para que se revisen explicitamente.
No cancela citas ni resuelve alertas. Historias, condiciones, citas, alertas y
recetas existentes permanecen intactas. Las consultas historicas no se filtran.
Archivar o restaurar dos veces es idempotente: no cambia timestamps ni duplica auditoria.
Paciente inexistente produce 404; los motivos o filtros invalidos producen 400.

Las nuevas citas/recetas devuelven 409 si el paciente esta archivado. Su creacion
comparte un bloqueo de escritura del paciente con archive/restore hasta el commit.
Las escrituras normales del paciente tambien adquieren el bloqueo para que un
save concurrente no sobrescriba el estado del archivo. La auditoria de archivo y
restauracion es UPDATE con operation ARCHIVE/RESTORE, old/new, actor e IP, dentro
de la misma transaccion. Un fallo de auditoria revierte la operacion completa.

Pruebas sin MySQL: npm --prefix backend test. Compilacion: npm --prefix backend run build.
Las pruebas usan dobles de persistencia; no inicializan el DataSource ni aplican DDL.
