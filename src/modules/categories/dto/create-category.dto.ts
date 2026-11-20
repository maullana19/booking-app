import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  slug: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  description: string;
}
