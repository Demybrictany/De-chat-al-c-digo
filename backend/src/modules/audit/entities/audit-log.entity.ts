import { Column, Index, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FAILED';

/** Bitacora inmutable: solo se inserta, nunca se actualiza ni se borra. */
@Index('idx_audit_entity_created', ['entityName', 'entityId', 'createdAt'])
@Index('idx_audit_user_created', ['userId', 'createdAt'])
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 20 })
  action: AuditAction;

  @Column({ name: 'entity_name', type: 'varchar', length: 100 })
  entityName: string;

  @Column({ name: 'entity_id', type: 'int', nullable: true })
  entityId: number | null;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: Record<string, unknown> | null;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
