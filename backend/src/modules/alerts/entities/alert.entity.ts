import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { AlertStatus } from 'src/modules/catalogs/entities/alert-status.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('alerts')
export class Alert extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id', type: 'int' })
  patientId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ name: 'chronic_condition_id', type: 'int', nullable: true })
  chronicConditionId: number | null;

  @Column({ name: 'status_id', type: 'int' })
  statusId: number;

  @ManyToOne(() => AlertStatus, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status?: AlertStatus;

  @Column({ name: 'alert_type', type: 'varchar', length: 50 })
  alertType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'triggered_at', type: 'datetime' })
  triggeredAt: Date;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by_id', type: 'int', nullable: true })
  resolvedById: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy?: User;
}
