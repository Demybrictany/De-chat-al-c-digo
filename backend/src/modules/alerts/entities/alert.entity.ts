import { Column, Index, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { AlertStatus } from 'src/modules/catalogs/entities/alert-status.entity';
import { ChronicCondition } from 'src/modules/chronic-conditions/entities/chronic-condition.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Index('idx_alerts_patient_triggered', ['patientId', 'triggeredAt'])
@Index('idx_alerts_status_triggered', ['statusId', 'triggeredAt'])
@Index('idx_alerts_condition', ['chronicConditionId'])
@Entity('alerts')
export class Alert extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id', type: 'int' })
  patientId: number;

  @ManyToOne(() => Patient, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ name: 'chronic_condition_id', type: 'int', nullable: true })
  chronicConditionId: number | null;

  @ManyToOne(() => ChronicCondition, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'chronic_condition_id' })
  chronicCondition?: ChronicCondition | null;

  @Column({ name: 'status_id', type: 'int' })
  statusId: number;

  @ManyToOne(() => AlertStatus, { eager: true, nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status?: AlertStatus;

  // Codigo extensible; normalizar si se acuerda una lista cerrada de tipos.
  @Column({ name: 'alert_type', type: 'varchar', length: 50 })
  alertType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'triggered_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  triggeredAt: Date;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'resolved_by_id', type: 'int', nullable: true })
  resolvedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'resolved_by_id' })
  resolvedBy?: User;
}
