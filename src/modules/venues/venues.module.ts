import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service.js';
import { VenuesController } from './venues.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entities/venue.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Venue])],
  controllers: [VenuesController],
  providers: [VenuesService],
})
export class VenuesModule {}
