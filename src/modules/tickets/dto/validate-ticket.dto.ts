import { IsString } from 'class-validator';

export class ValidateTicketDto {
  @IsString()
  code: string;
}
