import { IsDateString, IsInt, IsOptional, IsString, IsPositive } from 'class-validator';

export class CreateMedicalHistoryDto {
  @IsInt()
  @IsPositive()
  patientId: number;

  @IsInt()
  @IsPositive()
  doctorId: number;

  @IsDateString()
  visitDate: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
