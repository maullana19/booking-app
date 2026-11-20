import {
  IsString,
  MinLength,
  IsNumber,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsUUID()
  product_id: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quota: number;
}
