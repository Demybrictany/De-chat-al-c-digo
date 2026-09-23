import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class CreatePrescriptionItemDto {
  @IsInt()
  @IsPositive()
  pharmacyProductId: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dosage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  frequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  duration?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePrescriptionDto {
  @IsInt()
  @IsPositive()
  patientId: number;

  @IsInt()
  @IsPositive()
  doctorId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  medicalHistoryId?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}
