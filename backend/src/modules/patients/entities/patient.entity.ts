import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';

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

  @Column({ name: 'deceased_at', type: 'datetime', nullable: true })
  deceasedAt: Date | null;
}
