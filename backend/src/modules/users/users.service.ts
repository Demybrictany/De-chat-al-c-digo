import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.findAll({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }

  /** Usado por el flujo de autenticacion; incluye el hash. */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo.findByEmailWithPassword(email);
  }

  async create(dto: CreateUserDto, actor: AuthUser): Promise<User> {
    if (await this.repo.findByEmail(dto.email)) {
      throw new ConflictException(`El email ${dto.email} ya esta registrado`);
    }
    const entity = this.repo.create({
      roleId: dto.roleId,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
      isActive: dto.isActive ?? true,
    });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'users',
      entityId: saved.id,
      newValues: { email: saved.email, roleId: saved.roleId, fullName: saved.fullName },
    });
    return this.findById(saved.id);
  }

  async update(id: number, dto: UpdateUserDto, actor: AuthUser): Promise<User> {
    const user = await this.findById(id);
    const before = { email: user.email, roleId: user.roleId, fullName: user.fullName, isActive: user.isActive };

    if (dto.email && dto.email !== user.email) {
      const clash = await this.repo.findByEmail(dto.email);
      if (clash && clash.id !== id) throw new ConflictException(`El email ${dto.email} ya esta registrado`);
      user.email = dto.email;
    }
    if (dto.roleId !== undefined) user.roleId = dto.roleId;
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const saved = await this.repo.save(user);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'users',
      entityId: id,
      oldValues: before,
      newValues: { email: saved.email, roleId: saved.roleId, fullName: saved.fullName, isActive: saved.isActive },
    });
    return this.findById(id);
  }
}
