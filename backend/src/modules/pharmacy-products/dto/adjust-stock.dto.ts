import { IsInt } from 'class-validator';

export class AdjustStockDto {
  /** Delta de inventario: positivo ingreso, negativo salida. */
  @IsInt()
  delta: number;
}
