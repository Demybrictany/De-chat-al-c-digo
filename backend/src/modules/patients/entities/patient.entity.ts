import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { AuditableEntity } from 'src/common/base/auditable.entity';

@Index('idx_patients_archived_id', ['isArchived', 'id'])
@Entity('patients')
export class Patient extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  // Texto libre mientras no exista un vocabulario de genero acordado.
  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ name: 'national_id', type: 'varchar', length: 30, unique: true, nullable: true })
  nationalId: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ name: 'is_priority', type: 'boolean', default: false })
  isPriority: boolean;

  @Column({ name: 'is_deceased', type: 'boolean', default: false })
  isDeceased: boolean;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ name: 'archived_at', type: 'datetime', precision: 6, nullable: true })
  archivedAt: Date | null;

  @Column({ name: 'archived_by_id', type: 'int', nullable: true })
  archivedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'archived_by_id' })
  archivedBy?: User | null;

  @Column({ name: 'archive_reason', type: 'varchar', length: 500, nullable: true })
  archiveReason: string | null;

  @Column({ name: 'deceased_at', type: 'datetime', nullable: true })
  deceasedAt: Date | null;
}
