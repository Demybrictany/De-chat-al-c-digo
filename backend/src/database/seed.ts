import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { AlertStatus } from '../modules/catalogs/entities/alert-status.entity';
import { AppointmentStatus } from '../modules/catalogs/entities/appointment-status.entity';
import { ProductType } from '../modules/catalogs/entities/product-type.entity';
import { Role } from '../modules/catalogs/entities/role.entity';
import { User } from '../modules/users/entities/user.entity';

/**
 * Siembra los catalogos (sustituyen a los ENUM) y un usuario admin inicial.
 * Idempotente: no duplica filas si ya existen. Requiere la BD ya creada.
 * Ejecutar: npm run seed
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const upsert = async <T extends { name: string }>(entity: any, rows: Partial<T>[]) => {
    const repo = ds.getRepository(entity);
    for (const row of rows) {
      const exists = await repo.findOne({ where: { name: (row as any).name } });
      if (!exists) await repo.save(repo.create(row));
    }
  };

  await upsert<Role>(Role, [
    { name: 'admin', description: 'Administrador del sistema' },
    { name: 'doctor', description: 'Medico' },
    { name: 'nurse', description: 'Enfermeria' },
    { name: 'receptionist', description: 'Recepcion' },
    { name: 'pharmacist', description: 'Farmacia' },
  ]);

  await upsert<AppointmentStatus>(AppointmentStatus, [
    { name: 'scheduled', description: 'Programada' },
    { name: 'completed', description: 'Completada' },
    { name: 'cancelled', description: 'Cancelada' },
    { name: 'no_show', description: 'Paciente no asistio' },
  ]);

  await upsert<AlertStatus>(AlertStatus, [
    { name: 'active', description: 'Activa' },
    { name: 'resolved', description: 'Resuelta' },
  ]);

  await upsert<ProductType>(ProductType, [
    { name: 'medicamento', description: 'Medicamento' },
    { name: 'muestra_medica', description: 'Muestra medica' },
  ]);

  // Usuario admin inicial (solo si no existe ninguno con ese email).
  const users = ds.getRepository(User);
  const roles = ds.getRepository(Role);
  const adminEmail = 'admin@clinicas.local';
  if (!(await users.findOne({ where: { email: adminEmail } }))) {
    const adminRole = await roles.findOneOrFail({ where: { name: 'admin' } });
    await users.save(
      users.create({
        roleId: adminRole.id,
        fullName: 'Administrador',
        email: adminEmail,
        passwordHash: await bcrypt.hash('Admin1234', 10),
        isActive: true,
      }),
    );
    console.log(`Usuario admin creado: ${adminEmail} / Admin1234 (cambiar en produccion)`);
  }

  console.log('Seed completado.');
  await app.close();
}

seed().catch((err) => {
  console.error('Seed fallido:', err);
  process.exit(1);
});
