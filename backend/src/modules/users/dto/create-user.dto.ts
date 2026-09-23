import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength, IsPositive } from 'class-validator';

export class CreateUserDto {
  @IsInt()
  @IsPositive()
  roleId: number;

  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
