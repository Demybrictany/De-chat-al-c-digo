import { Column, Index, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/base/auditable.entity';
import { PharmacyProduct } from 'src/modules/pharmacy-products/entities/pharmacy-product.entity';
import { Prescription } from './prescription.entity';

@Index('idx_items_prescription', ['prescriptionId'])
@Index('idx_items_product', ['pharmacyProductId'])
@Entity('prescription_items')
export class PrescriptionItem extends AuditableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'prescription_id', type: 'int' })
  prescriptionId: number;

  @ManyToOne(() => Prescription, (prescription) => prescription.items, { nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'prescription_id' })
  prescription?: Prescription;

  @Column({ name: 'pharmacy_product_id', type: 'int' })
  pharmacyProductId: number;

  @ManyToOne(() => PharmacyProduct, { eager: true, nullable: false, onDelete: 'RESTRICT', onUpdate: 'RESTRICT' })
  @JoinColumn({ name: 'pharmacy_product_id' })
  pharmacyProduct?: PharmacyProduct;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosage: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  frequency: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string | null;

  // UNSIGNED impide negativos; quantity >= 1 se valida en DTO/servicio.
  @Column({ type: 'int', unsigned: true, default: 1 })
  quantity: number;
}
