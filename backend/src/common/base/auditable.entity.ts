import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { TimestampEntity } from './timestamp.entity';

/**
 * Base para entidades de negocio: marcas de tiempo + autoria de la ultima escritura.
 * created_by_id / updated_by_id se poblan en el service con el usuario autenticado.
 */
export abstract class AuditableEntity extends TimestampEntity {
  @Column({ name: 'created_by_id', type: 'int' })
  createdById: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @Column({ name: 'updated_by_id', type: 'int', nullable: true })
  updatedById: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User;
}
