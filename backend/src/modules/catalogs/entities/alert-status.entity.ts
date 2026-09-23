import { Entity } from 'typeorm';
import { CatalogEntity } from './catalog.entity';

/** Catalogo: active, resolved */
@Entity('alert_statuses')
export class AlertStatus extends CatalogEntity {}
