import { IsInt, IsOptional, IsString, MaxLength, IsPositive } from 'class-validator';

export class CreateAlertDto {
  @IsInt()
  @IsPositive()
  patientId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  chronicConditionId?: number;

  @IsString()
  @MaxLength(50)
  alertType: string;

  @IsString()
  message: string;
}
