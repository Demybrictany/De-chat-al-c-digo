import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from 'src/common/base/timestamp.entity';

@Entity('roles')
export class Role extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  // Pendiente definir valores: no asumir activo/inactivo sin acuerdo de negocio.
  @Column({ type: 'int', default: 1 })
  status: number;
}
