import { PartialType } from '@nestjs/mapped-types';
import { CreatePharmacyProductDto } from './create-pharmacy-product.dto';

export class UpdatePharmacyProductDto extends PartialType(CreatePharmacyProductDto) {}
