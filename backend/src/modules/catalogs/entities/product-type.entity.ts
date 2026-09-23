import { Entity } from 'typeorm';
import { CatalogEntity } from './catalog.entity';

/** Catalogo: medicamento, muestra_medica */
@Entity('product_types')
export class ProductType extends CatalogEntity {}
