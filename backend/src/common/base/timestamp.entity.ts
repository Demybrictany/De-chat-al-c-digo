import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** Solo marcas de tiempo. Base para catalogos (sin autoria). */
export abstract class TimestampEntity {
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
