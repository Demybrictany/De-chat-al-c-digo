import { Column, Index, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { AppointmentStatus } from 'src/modules/catalogs/entities/appointment-status.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Index('idx_appointments_patient_schedule', ['patientId', 'scheduledAt'])
@Index('idx_appointments_doctor_schedule', ['doctorId', 'scheduledAt'])
@Entity('appointments')
export class Appointment extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id', type: 'int' })
  patientId: number;

  @ManyToOne(() => Patient, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ name: 'doctor_id', type: 'int' })
  doctorId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: User;

  @Column({ name: 'status_id', type: 'int' })
  statusId: number;

  @ManyToOne(() => AppointmentStatus, { eager: true, nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status?: AppointmentStatus;

  @Column({ name: 'scheduled_at', type: 'datetime' })
  scheduledAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
