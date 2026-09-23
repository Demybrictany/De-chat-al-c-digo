import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { PharmacyProduct } from 'src/modules/pharmacy-products/entities/pharmacy-product.entity';
import { Prescription } from './prescription.entity';

@Entity('prescription_items')
export class PrescriptionItem extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'prescription_id', type: 'int' })
  prescriptionId: number;

  @ManyToOne(() => Prescription, (prescription) => prescription.items)
  @JoinColumn({ name: 'prescription_id' })
  prescription?: Prescription;

  @Column({ name: 'pharmacy_product_id', type: 'int' })
  pharmacyProductId: number;

  @ManyToOne(() => PharmacyProduct, { eager: true })
  @JoinColumn({ name: 'pharmacy_product_id' })
  pharmacyProduct?: PharmacyProduct;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosage: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  frequency: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string | null;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
