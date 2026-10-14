import { Column, Index, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from 'src/common/base/timestamp.entity';
import { Role } from 'src/modules/catalogs/entities/role.entity';

@Index('idx_users_role', ['roleId'])
@Entity('users')
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @ManyToOne(() => Role, { eager: true, nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  /** Null permite crear el primer administrador sin un usuario previo.
   * Pendiente: UsersService debe poblar ambos IDs con el actor autenticado.
   */
  @Column({ name: 'created_by_id', type: 'int', nullable: true })
  createdById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User | null;

  @Column({ name: 'updated_by_id', type: 'int', nullable: true })
  updatedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User | null;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
