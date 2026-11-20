import { IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  slug: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsString()
  category_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  posterUrl?: string;
}
