import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min, IsPositive } from 'class-validator';

export class CreatePharmacyProductDto {
  @IsInt()
  @IsPositive()
  typeId: number;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  manufacturer?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
