import { ApiProperty } from '@nestjs/swagger';

export class UploadPosterDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  poster: any;
}