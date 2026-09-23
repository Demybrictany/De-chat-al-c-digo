import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, IsPositive } from 'class-validator';

export class CreateChronicConditionDto {
  @IsInt()
  @IsPositive()
  patientId: number;

  @IsString()
  @MaxLength(150)
  conditionName: string;

  @IsOptional()
  @IsDateString()
  diagnosedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  severity?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
