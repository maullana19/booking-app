import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(3)
  first_name: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Tanggal lahir user',
    example: '2001-01-01',
    type: String,
  })
  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString(
    { strict: true },
    { message: 'Format tanggal lahir harus YYYY-MM-DD' },
  )
  date_of_birth: string;
}
