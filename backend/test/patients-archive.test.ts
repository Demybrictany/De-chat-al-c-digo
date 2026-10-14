import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PatientsService } from '../src/modules/patients/patients.service';
import { PatientsRepository } from '../src/modules/patients/patients.repository';
import { PatientsController } from '../src/modules/patients/patients.controller';
import { ArchivePatientDto } from '../src/modules/patients/dto/archive-patient.dto';
import { ListPatientsDto } from '../src/modules/patients/dto/list-patients.dto';
import { AuditService } from '../src/modules/audit/audit.service';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { AppointmentsService } from '../src/modules/appointments/appointments.service';
import { PrescriptionsService } from '../src/modules/prescriptions/prescriptions.service';
import { AuthUser } from '../src/common/decorators/current-user.decorator';

const admin: AuthUser = { id: 7, email: 'admin@example.com', roleId: 1, roleName: 'admin' };
const nurse: AuthUser = { ...admin, roleName: 'nurse' };

function fixture(overrides: Record<string, unknown> = {}) {
  let patient: any = {
    id: 1, isArchived: false, archivedAt: null, archivedById: null, archiveReason: null,
    updatedById: 2, isPriority: true, isDeceased: false, ...overrides,
  };
  const manager = {};
  const events: any[] = [];
  const queries: any[] = [];
  let saves = 0, locks = 0;
  let failAudit = false, future = 0, alerts = 0, missing = false;
  const repo: any = {
    findById: async () => missing ? null : { ...patient },
    findByIdForUpdate: async (_id: number, m: unknown) => {
      assert.equal(m, manager); locks++; return missing ? null : { ...patient };
    },
    saveInTransaction: async (p: unknown, m: unknown) => {
      assert.equal(m, manager); saves++; patient = { ...p as object }; return { ...patient };
    },
    findAll: async (options: unknown) => { queries.push(options); return []; },
    countAppointmentsAfter: async (_id: number, date: Date, status: string, m: unknown) => {
      assert.ok(date instanceof Date); assert.equal(status, 'scheduled'); assert.equal(m, manager); return future;
    },
    countAlertsByStatus: async (_id: number, status: string, m: unknown) => {
      assert.equal(status, 'active'); assert.equal(m, manager); return alerts;
    },
    findByNationalId: async () => null,
  };
  const audit: any = { recordInTransaction: async (entry: unknown, m: unknown) => {
    assert.equal(m, manager); if (failAudit) throw new Error('audit unavailable'); events.push(entry);
  } };
  const ds: any = { transaction: async (operation: (m: unknown) => Promise<unknown>) => {
    const before = { ...patient }, count = events.length;
    try { return await operation(manager); }
    catch (error) { patient = before; events.length = count; throw error; }
  } };
  const service = new PatientsService(repo, audit, ds);
  return { service, manager, queries, events,
    state: () => ({ ...patient }), saves: () => saves, locks: () => locks,
    setFuture: (n: number) => { future = n; }, setAlerts: (n: number) => { alerts = n; },
    failAudit: () => { failAudit = true; }, missing: () => { missing = true; },
  };
}

test('archive registra actor, motivo, IP y ambos estados sin alterar flags clinicos', async () => {
  const f = fixture();
  const saved = await f.service.archive(1, { reason: 'Baja administrativa' }, admin, '127.0.0.1');
  assert.equal(saved.isArchived, true); assert.equal(saved.archivedById, 7);
  assert.ok(saved.archivedAt instanceof Date); assert.equal(saved.updatedById, 7);
  assert.equal(saved.archiveReason, 'Baja administrativa'); assert.equal(saved.isPriority, true);
  assert.equal(f.events.length, 1); assert.equal(f.events[0].oldValues.isArchived, false);
  assert.equal(f.events[0].newValues.operation, 'ARCHIVE'); assert.equal(f.events[0].ipAddress, '127.0.0.1');
});

test('archivar dos veces no guarda ni audita otra vez ni cambia fecha/motivo', async () => {
  const f = fixture();
  const first = await f.service.archive(1, { reason: 'Primer motivo' }, admin);
  const second = await f.service.archive(1, { reason: 'Otro motivo' }, admin);
  assert.deepEqual(second, first); assert.equal(f.saves(), 1); assert.equal(f.events.length, 1);
});

for (const blocker of ['appointments', 'alerts']) test('archivo bloqueado por ' + blocker, async () => {
  const f = fixture(); if (blocker === 'appointments') f.setFuture(2); else f.setAlerts(3);
  await assert.rejects(f.service.archive(1, { reason: 'Baja' }, admin), (e: any) => {
    assert.ok(e instanceof ConflictException);
    assert.equal(e.getResponse()[blocker === 'appointments' ? 'futureAppointments' : 'activeAlerts'], blocker === 'appointments' ? 2 : 3);
    return true;
  });
  assert.equal(f.state().isArchived, false); assert.equal(f.saves(), 0); assert.equal(f.events.length, 0);
});

test('restaurar limpia el archivo actual y conserva su metadata anterior en auditoria', async () => {
  const f = fixture({ isArchived: true, archivedAt: new Date(), archivedById: 7, archiveReason: 'Motivo previo' });
  const saved = await f.service.restore(1, admin);
  assert.equal(saved.isArchived, false); assert.equal(saved.archivedAt, null);
  assert.equal(saved.archivedById, null); assert.equal(saved.archiveReason, null);
  assert.equal(f.events[0].oldValues.archiveReason, 'Motivo previo');
  assert.equal(f.events[0].newValues.operation, 'RESTORE');
  await f.service.restore(1, admin); assert.equal(f.saves(), 1); assert.equal(f.events.length, 1);
});

for (const operation of ['archive', 'restore'] as const) test(operation + ' revierte ante fallo de auditoria', async () => {
  const f = fixture({ isArchived: operation === 'restore' }); const before = f.state(); f.failAudit();
  await assert.rejects(operation === 'archive' ? f.service.archive(1, { reason: 'Baja' }, admin) : f.service.restore(1, admin), /audit unavailable/);
  assert.deepEqual(f.state(), before); assert.equal(f.events.length, 0);
});

test('solo admin puede archivar, restaurar o incluir archivados', async () => {
  const f = fixture();
  await assert.rejects(f.service.archive(1, { reason: 'Baja' }, nurse), ForbiddenException);
  await assert.rejects(f.service.restore(1, nurse), ForbiddenException);
  assert.throws(() => f.service.findAll(true, nurse), ForbiddenException);
  assert.equal(f.locks(), 0);
});

test('listado habitual excluye archivados y admin puede incluirlos', async () => {
  const f = fixture(); await f.service.findAll(); await f.service.findAll(true, admin);
  assert.deepEqual(f.queries[0].where, { isArchived: false }); assert.deepEqual(f.queries[1].where, {});
});

test('consulta por ID permanece disponible para informacion historica', async () => {
  const f = fixture({ isArchived: true }); assert.equal((await f.service.findById(1)).isArchived, true);
});

test('paciente inexistente produce 404 en archive y restore', async () => {
  const f = fixture(); f.missing();
  await assert.rejects(f.service.archive(1, { reason: 'Baja' }, admin), NotFoundException);
  await assert.rejects(f.service.restore(1, admin), NotFoundException);
});

test('withActivePatient bloquea operaciones nuevas y permite continuar despues de restaurar', async () => {
  const f = fixture({ isArchived: true }); let called = false;
  await assert.rejects(f.service.withActivePatient(1, async () => { called = true; }), ConflictException);
  assert.equal(called, false); await f.service.restore(1, admin);
  assert.equal(await f.service.withActivePatient(1, async m => { assert.equal(m, f.manager); return 42; }), 42);
});

for (const domain of ['appointments', 'prescriptions']) test(domain + ' rechaza creacion para archivados', async () => {
  const f = fixture({ isArchived: true });
  const service = domain === 'appointments'
    ? new AppointmentsService({} as any, {} as any, f.service, {} as any)
    : new PrescriptionsService({} as any, f.service, {} as any, {} as any, {} as any);
  await assert.rejects(service.create({ patientId: 1 } as any, admin), ConflictException);
});

test('validacion del motivo rechaza blancos y exceso de longitud', () => {
  const dto = plainToInstance(ArchivePatientDto, { reason: '  Archivo administrativo  ' });
  assert.equal(dto.reason, 'Archivo administrativo'); assert.equal(validateSync(dto).length, 0);
  for (const reason of ['', '   ', 'x'.repeat(501), null]) {
    assert.ok(validateSync(plainToInstance(ArchivePatientDto, { reason })).length > 0);
  }
});

test('filtro acepta solo true/false textuales sin convertir false en true', () => {
  for (const includeArchived of ['true', 'false']) assert.equal(validateSync(plainToInstance(ListPatientsDto, { includeArchived })).length, 0);
  for (const includeArchived of ['1', 'yes', true, ['true']]) assert.ok(validateSync(plainToInstance(ListPatientsDto, { includeArchived })).length > 0);
});

test('RolesGuard protege ambos handlers con metadata admin', () => {
  const guard = new RolesGuard(new Reflector());
  for (const name of ['archive', 'restore'] as const) {
    const context: any = { getHandler: () => PatientsController.prototype[name], getClass: () => PatientsController,
      switchToHttp: () => ({ getRequest: () => ({ user: nurse }) }) };
    assert.throws(() => guard.canActivate(context), ForbiddenException);
    context.switchToHttp = () => ({ getRequest: () => ({ user: admin }) });
    assert.equal(guard.canActivate(context), true);
  }
});

test('repositorio bloquea por fila sin ocultar pacientes archivados', async () => {
  let options: any;
  const repo = new PatientsRepository({} as any);
  const manager: any = { getRepository: () => ({ findOne: async (o: unknown) => { options = o; return null; } }) };
  await repo.findByIdForUpdate(9, manager);
  assert.deepEqual(options, { where: { id: 9 }, lock: { mode: 'pessimistic_write' } });
});

test('auditoria estricta usa el manager transaccional y propaga errores', async () => {
  const audit = new AuditService({} as any);
  const manager: any = { getRepository: () => ({ insert: async () => { throw new Error('db failure'); } }) };
  await assert.rejects(audit.recordInTransaction({ userId: 7, action: 'UPDATE', entityName: 'patients' }, manager), /db failure/);
});

for (const domain of ['appointments', 'prescriptions']) test(domain + ' crea para activo usando el mismo manager y auditoria', async () => {
  const f = fixture(); let saved: any, audited = false;
  const repo: any = {
    create: (value: unknown) => value,
    saveInTransaction: async (value: unknown, m: unknown) => { assert.equal(m, f.manager); saved = { ...value as object, id: 12 }; return saved; },
    findByIdInTransaction: async (id: number, m: unknown) => { assert.equal(id, 12); assert.equal(m, f.manager); return saved; },
  };
  const audit: any = { recordInTransaction: async (entry: any, m: unknown) => {
    assert.equal(m, f.manager); assert.equal(entry.action, 'CREATE'); assert.equal(entry.entityId, 12); audited = true;
  } };
  const service = domain === 'appointments'
    ? new AppointmentsService(repo, { findOne: async () => ({ id: 1 }) } as any, f.service, audit)
    : new PrescriptionsService(repo, f.service, { findById: async () => ({ id: 3 }) } as any, { findById: async () => ({ id: 4 }) } as any, audit);
  const result = await service.create({ patientId: 1, doctorId: 7, scheduledAt: '2027-01-01T12:00:00Z',
    medicalHistoryId: 4, items: [{ pharmacyProductId: 3, quantity: 1 }] } as any, admin);
  assert.equal(result.id, 12); assert.equal(audited, true); assert.equal(f.locks(), 1);
});
