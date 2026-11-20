import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../enums/payment.enum.js';

export class CreatePaymentDto {
  @IsUUID()
  order_id: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
