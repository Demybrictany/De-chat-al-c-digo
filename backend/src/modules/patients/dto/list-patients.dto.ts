import { IsIn, IsOptional } from 'class-validator';

export class ListPatientsDto {
  // Mantener texto para evitar que la conversion implicita convierta "false" en true.
  @IsOptional()
  @IsIn(['true', 'false'])
  includeArchived?: string;
}
