import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UpdateUserDto } from './update-user.dto.js';
import { UserRole } from '../enums/user-role.enum.js';

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
