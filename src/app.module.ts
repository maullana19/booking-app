import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import configuration from './config/configuration.js';
import { UsersModule } from './modules/users/users.module.js';
import { AllexceptionFilter } from './common/filters/allexception.filter.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { DatabaseModule } from './database/database.modul.js';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { VenuesModule } from './modules/venues/venues.module.js';
import { ProductEventsModule } from './modules/product-events/product-events.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { TicketsModule } from './modules/tickets/tickets.module.js';
import { ImageKitModule } from './common/imagekit/imagekit.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ImageKitModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    OrdersModule,
    VenuesModule,
    ProductEventsModule,
    PaymentsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllexceptionFilter,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
