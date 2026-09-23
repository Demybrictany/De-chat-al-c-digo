import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { ProductType } from 'src/modules/catalogs/entities/product-type.entity';
import { CreatePharmacyProductDto } from './dto/create-pharmacy-product.dto';
import { UpdatePharmacyProductDto } from './dto/update-pharmacy-product.dto';
import { PharmacyProduct } from './entities/pharmacy-product.entity';
import { PharmacyProductsRepository } from './pharmacy-products.repository';

@Injectable()
export class PharmacyProductsService {
  constructor(
    private readonly repo: PharmacyProductsRepository,
    @InjectRepository(ProductType) private readonly types: Repository<ProductType>,
    private readonly audit: AuditService,
  ) {}

  findAll(): Promise<PharmacyProduct[]> {
    return this.repo.findAll({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<PharmacyProduct> {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`);
    return product;
  }

  async create(dto: CreatePharmacyProductDto, actor: AuthUser): Promise<PharmacyProduct> {
    await this.ensureType(dto.typeId);
    const entity = this.repo.create({
      ...dto,
      stockQuantity: dto.stockQuantity ?? 0,
      createdById: actor.id,
      updatedById: actor.id,
    });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'pharmacy_products',
      entityId: saved.id,
      newValues: { ...dto },
    });
    return saved;
  }

  async update(id: number, dto: UpdatePharmacyProductDto, actor: AuthUser): Promise<PharmacyProduct> {
    const product = await this.findById(id);
    if (dto.typeId) await this.ensureType(dto.typeId);
    Object.assign(product, dto, { updatedById: actor.id });
    const saved = await this.repo.save(product);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'pharmacy_products',
      entityId: id,
      newValues: { ...dto },
    });
    return saved;
  }

  /** Ajuste de inventario: delta positivo (ingreso) o negativo (salida). */
  async adjustStock(id: number, delta: number, actor: AuthUser): Promise<PharmacyProduct> {
    const product = await this.findById(id);
    const next = product.stockQuantity + delta;
    if (next < 0) throw new BadRequestException('Stock insuficiente para el ajuste solicitado');
    product.stockQuantity = next;
    product.updatedById = actor.id;
    const saved = await this.repo.save(product);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'pharmacy_products',
      entityId: id,
      newValues: { stockQuantity: next, delta },
    });
    return saved;
  }

  private async ensureType(typeId: number): Promise<void> {
    if (!(await this.types.exists({ where: { id: typeId } }))) {
      throw new BadRequestException(`Tipo de producto ${typeId} inexistente`);
    }
  }
}
