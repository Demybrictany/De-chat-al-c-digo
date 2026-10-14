import * as bcrypt from 'bcrypt';
import { validateSync } from 'class-validator';
import { EntityManager, EntityTarget } from 'typeorm';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { AlertStatus } from '../modules/catalogs/entities/alert-status.entity';
import { AppointmentStatus } from '../modules/catalogs/entities/appointment-status.entity';
import { CatalogEntity } from '../modules/catalogs/entities/catalog.entity';
import { ProductType } from '../modules/catalogs/entities/product-type.entity';
import { Role } from '../modules/catalogs/entities/role.entity';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { User } from '../modules/users/entities/user.entity';
import dataSource from './data-source';

const catalogs: {
  entity: EntityTarget<CatalogEntity>;
  table: string;
  rows: { name: string; description: string }[];
}[] = [
  { entity: Role, table: 'roles', rows: [
    { name: 'admin', description: 'Administrador del sistema' },
    { name: 'doctor', description: 'Medico' },
    { name: 'nurse', description: 'Enfermeria' },
    { name: 'receptionist', description: 'Recepcion' },
    { name: 'pharmacist', description: 'Farmacia' },
  ] },
  { entity: AppointmentStatus, table: 'appointment_statuses', rows: [
    { name: 'scheduled', description: 'Programada' },
    { name: 'completed', description: 'Completada' },
    { name: 'cancelled', description: 'Cancelada' },
    { name: 'no_show', description: 'Paciente no asistio' },
  ] },
  { entity: AlertStatus, table: 'alert_statuses', rows: [
    { name: 'active', description: 'Activa' },
    { name: 'resolved', description: 'Resuelta' },
  ] },
  { entity: ProductType, table: 'product_types', rows: [
    { name: 'medicamento', description: 'Medicamento' },
    { name: 'muestra_medica', description: 'Muestra medica' },
  ] },
];

/** Bootstrap sin actor autenticado. La auditoria usa user_id NULL, nunca secretos. */
async function auditCreation(
  manager: EntityManager, table: string, id: number, values: Record<string, unknown>,
): Promise<void> {
  // Usar el mismo manager transaccional: un fallo de auditoria revierte el seed.
  await manager.getRepository(AuditLog).insert({
    userId: null,
    action: 'CREATE',
    entityName: table,
    entityId: id,
    oldValues: null,
    newValues: { ...values, origin: 'initial_seed' },
    ipAddress: null,
  });
}

async function seedCatalogs(manager: EntityManager): Promise<number> {
  let inserted = 0;
  for (const catalog of catalogs) {
    const repo = manager.getRepository(catalog.entity);
    for (const row of catalog.rows) {
      const existing = await repo.findOne({ where: { name: row.name } });
      if (existing) {
        // La collation MySQL ignora mayusculas/acentos, pero RolesGuard compara texto exacto.
        if (existing.name !== row.name) {
          throw new Error('Codigo incompatible en ' + catalog.table + ': se esperaba ' + row.name);
        }
        continue; // Conservar ID, descripcion y cualquier otro dato existente.
      }
      const saved = await repo.save(repo.create(row));
      await auditCreation(manager, catalog.table, saved.id, row);
      inserted++;
    }
  }
  return inserted;
}

async function ensureFirstAdmin(manager: EntityManager): Promise<string> {
  const roles = manager.getRepository(Role);
  const users = manager.getRepository(User);
  const adminRole = await roles.findOneOrFail({ where: { name: 'admin' } });
  if (await users.exists({ where: { roleId: adminRole.id, isActive: true } })) {
    return 'Ya existe un administrador activo; se conservaron sus credenciales.';
  }
  if (await users.exists({ where: { roleId: adminRole.id } })) {
    throw new Error('Existen administradores inactivos. Revisar su acceso; el seed no los reactiva ni crea reemplazos.');
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
  const password = process.env.SEED_ADMIN_PASSWORD ?? '';
  const fullName = process.env.SEED_ADMIN_FULL_NAME?.trim() || 'Administrador';
  if (!email || !password) {
    throw new Error('Para crear el primer administrador configura SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en backend/.env.');
  }
  const dto = Object.assign(new CreateUserDto(), {
    roleId: adminRole.id, fullName, email, password, isActive: true,
  });
  const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
  if (errors.length > 0) {
    // No imprimir ValidationError: incluye el objeto con la clave en texto plano.
    throw new Error('Datos del administrador invalidos: ' + errors.map(e =>
      e.property + ' (' + Object.values(e.constraints ?? {}).join(', ') + ')',
    ).join('; '));
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('SEED_ADMIN_PASSWORD no debe exceder 72 bytes UTF-8 (limite de bcrypt).');
  }
  if (await users.exists({ where: { email } })) {
    throw new Error('SEED_ADMIN_EMAIL ya pertenece a otro usuario; no se modificara su rol ni su clave.');
  }
  const saved = await users.save(users.create({
    roleId: adminRole.id,
    fullName,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    isActive: true,
    createdById: null,
    updatedById: null,
  }));
  await auditCreation(manager, 'users', saved.id, {
    email, fullName, roleId: adminRole.id, isActive: true,
    createdById: null, updatedById: null,
  });
  return 'Primer administrador creado: ' + email + '. La clave no se imprime ni se guarda en auditoria.';
}

async function seed(): Promise<void> {
  // El DataSource fija clinicas y desactiva synchronize/migrationsRun/dropSchema.
  await dataSource.initialize();
  const runner = dataSource.createQueryRunner();
  const lockName = 'clinicas:initial-seed';
  let lockHeld = false;
  try {
    await runner.connect();
    const [database] = await runner.query('SELECT DATABASE() AS databaseName');
    if (database?.databaseName !== 'clinicas') throw new Error('El seed solo puede ejecutarse en clinicas.');
    // Serializa dos ejecuciones del seed en la misma conexion hasta el commit.
    const [lock] = await runner.query('SELECT GET_LOCK(?, 10) AS acquired', [lockName]);
    if (Number(lock?.acquired) !== 1) throw new Error('Otro seed esta en ejecucion. Intenta de nuevo al terminar.');
    lockHeld = true;
    await runner.startTransaction();
    const inserted = await seedCatalogs(runner.manager);
    const adminMessage = await ensureFirstAdmin(runner.manager);
    await runner.commitTransaction();
    console.log('Seed completado: ' + inserted + ' registros de catalogo insertados.');
    console.log(adminMessage);
  } finally {
    try {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
    } finally {
      try {
        if (lockHeld) await runner.query('SELECT RELEASE_LOCK(?)', [lockName]);
      } finally {
        try { await runner.release(); }
        finally { await dataSource.destroy(); }
      }
    }
  }
}

// Importar este archivo no ejecuta el seed.
if (require.main === module) {
  seed().catch((err: unknown) => {
    console.error('Seed fallido:', err instanceof Error ? err.message : 'Error desconocido');
    process.exitCode = 1;
  });
}
