import { IsString, IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateProductEventDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  venueId: string;

  @IsString()
  artistName: string | null;

  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({ strict: true }, { message: 'Date format must be YYYY-MM-DD' })
  startTime: Date;

  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({ strict: true }, { message: 'Date format must be YYYY-MM-DD' })
  endTime: Date;

  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({ strict: true }, { message: 'Date format must be YYYY-MM-DD' })
  saleStartTime: Date | null;

  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({ strict: true }, { message: 'Date format must be YYYY-MM-DD' })
  saleEndTime: Date | null;
}
