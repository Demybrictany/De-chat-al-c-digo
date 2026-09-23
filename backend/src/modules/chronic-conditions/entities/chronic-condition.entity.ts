import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';

@Entity('chronic_conditions')
export class ChronicCondition extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id', type: 'int' })
  patientId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ name: 'condition_name', type: 'varchar', length: 150 })
  conditionName: string;

  @Column({ name: 'diagnosed_at', type: 'date', nullable: true })
  diagnosedAt: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  severity: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
