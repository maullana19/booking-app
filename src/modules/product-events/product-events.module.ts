import { Module } from '@nestjs/common';
import { ProductEventsService } from './product-events.service.js';
import { ProductEventsController } from './product-events.controller.js';
import { ProductEvent } from './entities/product-event.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from '../venues/entities/venue.entity.js';
import { Product } from '../products/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEvent, Venue, Product])],
  controllers: [ProductEventsController],
  providers: [ProductEventsService],
})
export class ProductEventsModule {}
