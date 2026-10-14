import { Column, Index, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { MedicalHistory } from 'src/modules/medical-history/entities/medical-history.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PrescriptionItem } from './prescription-item.entity';

@Index('idx_prescriptions_patient_issued', ['patientId', 'issuedAt'])
@Index('idx_prescriptions_history', ['medicalHistoryId'])
@Entity('prescriptions')
export class Prescription extends AuditableEntity {
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

  @Column({ name: 'medical_history_id', type: 'int', nullable: true })
  medicalHistoryId: number | null;

  @ManyToOne(() => MedicalHistory, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'medical_history_id' })
  medicalHistory?: MedicalHistory;

  @Column({ name: 'issued_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => PrescriptionItem, (item) => item.prescription, { cascade: true, eager: true })
  items: PrescriptionItem[];
}
