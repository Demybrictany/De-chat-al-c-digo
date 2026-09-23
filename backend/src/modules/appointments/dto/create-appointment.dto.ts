import { IsDateString, IsInt, IsOptional, IsString, MaxLength, IsPositive } from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @IsPositive()
  patientId: number;

  @IsInt()
  @IsPositive()
  doctorId: number;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
