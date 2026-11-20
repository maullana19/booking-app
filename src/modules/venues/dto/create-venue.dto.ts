import { IsString, MinLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  address: string;

  @IsString()
  @MinLength(3)
  city: string;

  @IsString()
  @MinLength(3)
  province: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsString()
  description: string | null;
}
