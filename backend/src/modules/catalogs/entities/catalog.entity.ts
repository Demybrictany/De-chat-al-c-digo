import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { TimestampEntity } from 'src/common/base/timestamp.entity';

/** Forma comun de los catalogos simples (name + description). */
export abstract class CatalogEntity extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;
}
