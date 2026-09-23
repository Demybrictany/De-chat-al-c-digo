import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { ProductType } from 'src/modules/catalogs/entities/product-type.entity';

@Entity('pharmacy_products')
export class PharmacyProduct extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_id', type: 'int' })
  typeId: number;

  @ManyToOne(() => ProductType, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type?: ProductType;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  manufacturer: string | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  unit: string | null;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: string | null;
}
