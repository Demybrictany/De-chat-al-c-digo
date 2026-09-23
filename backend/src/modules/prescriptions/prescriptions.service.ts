import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { MedicalHistoryService } from 'src/modules/medical-history/medical-history.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { PharmacyProductsService } from 'src/modules/pharmacy-products/pharmacy-products.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { PrescriptionsRepository } from './prescriptions.repository';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly repo: PrescriptionsRepository,
    private readonly patients: PatientsService,
    private readonly products: PharmacyProductsService,
    private readonly medicalHistory: MedicalHistoryService,
    private readonly audit: AuditService,
  ) {}

  findByPatient(patientId: number): Promise<Prescription[]> {
    return this.repo.findByPatient(patientId);
  }

  async findById(id: number): Promise<Prescription> {
    const prescription = await this.repo.findById(id, { relations: { items: true } });
    if (!prescription) throw new NotFoundException(`Receta ${id} no encontrada`);
    return prescription;
  }

  async create(dto: CreatePrescriptionDto, actor: AuthUser): Promise<Prescription> {
    await this.patients.findById(dto.patientId);
    if (dto.medicalHistoryId) await this.medicalHistory.findById(dto.medicalHistoryId);
    // Valida que cada producto exista antes de emitir la receta.
    for (const item of dto.items) await this.products.findById(item.pharmacyProductId);

    const items = dto.items.map((item) =>
      Object.assign(new PrescriptionItem(), {
        pharmacyProductId: item.pharmacyProductId,
        dosage: item.dosage ?? null,
        frequency: item.frequency ?? null,
        duration: item.duration ?? null,
        quantity: item.quantity,
        createdById: actor.id,
        updatedById: actor.id,
      }),
    );

    // save() con cascade inserta receta + items en una sola transaccion.
    const entity = this.repo.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      medicalHistoryId: dto.medicalHistoryId ?? null,
      issuedAt: new Date(),
      notes: dto.notes ?? null,
      items,
      createdById: actor.id,
      updatedById: actor.id,
    });
    const saved = await this.repo.save(entity);

    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'prescriptions',
      entityId: saved.id,
      newValues: { patientId: dto.patientId, doctorId: dto.doctorId, items: dto.items.length },
    });
    return this.findById(saved.id);
  }
}
