import {
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsDateString() dateOfBirth?: Date;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}
