import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service.js';
import { ProductVariantsController } from './product-variants.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant])],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
