import { IsIn } from 'class-validator';

/** Estados validos del catalogo appointment_statuses. */
export class ChangeStatusDto {
  @IsIn(['scheduled', 'completed', 'cancelled', 'no_show'])
  status: string;
}
