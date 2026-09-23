import { Entity } from 'typeorm';
import { CatalogEntity } from './catalog.entity';

/** Catalogo: scheduled, completed, cancelled, no_show */
@Entity('appointment_statuses')
export class AppointmentStatus extends CatalogEntity {}
