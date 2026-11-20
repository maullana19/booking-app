import { PartialType } from '@nestjs/swagger';
import { CreateProductEventDto } from './create-product-event.dto.js';

export class UpdateProductEventDto extends PartialType(CreateProductEventDto) {}
