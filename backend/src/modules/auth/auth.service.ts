import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuditService } from 'src/modules/audit/audit.service';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto, ip?: string) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    const ok = user && user.isActive && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!ok) {
      await this.audit.record({
        userId: user?.id ?? null,
        action: 'LOGIN_FAILED',
        entityName: 'users',
        entityId: user?.id ?? null,
        newValues: { email: dto.email },
        ipAddress: ip,
      });
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name,
    };
    const accessToken = await this.jwt.signAsync(payload);

    await this.audit.record({
      userId: user.id,
      action: 'LOGIN',
      entityName: 'users',
      entityId: user.id,
      ipAddress: ip,
    });

    return {
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role?.name },
    };
  }
}
