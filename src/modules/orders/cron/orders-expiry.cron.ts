import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { Order } from '../entities/order.entity.js';
import { Payment } from '../../payments/entities/payment.entity.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import { PaymentStatus } from '../../payments/enums/payment.enum.js';
import { ProductVariantsService } from '../../product-variants/product-variants.service.js';

@Injectable()
export class OrdersExpiryCron {
  private readonly logger = new Logger(OrdersExpiryCron.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly variantsService: ProductVariantsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expirePendingOrders(): Promise<void> {
    const now = new Date();

    // 1. Find order PENDING who's have expiresAt
    const expiredOrders = await this.dataSource.getRepository(Order).find({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: LessThan(now),
      },
      relations: { items: true },
    });

    // Nothing to process
    if (expiredOrders.length === 0) {
      return;
    }

    this.logger.log(
      `Menemukan ${expiredOrders.length} order expired. Memproses...`,
    );

    let successCount = 0;
    let failedCount = 0;

    for (const order of expiredOrders) {
      try {
        await this.dataSource.transaction(async (manager) => {
          //  Restock every item
          for (const item of order.items) {
            await this.variantsService.restoreStock(
              item.variantId,
              item.quantity,
              manager,
            );
          }

          // Change order status to EXPIRED
          order.status = OrderStatus.EXPIRED;
          await manager.save(order);

          // c. Mark the payment PENDING about → EXPIRED
          await manager.update(
            Payment,
            { orderId: order.id, status: PaymentStatus.PENDING },
            { status: PaymentStatus.EXPIRED },
          );
        });

        successCount++;
        this.logger.log(
          `Order ${order.bookingCode} (${order.id}) berhasil di-expire`,
        );
      } catch (err: any) {
        failedCount++;
        this.logger.error(
          `Gagal expire order ${order.bookingCode} (${order.id}): ${err.message}`,
          err.stack,
        );
        // Lanjut ke order berikutnya—jangan hentikan seluruh proses
      }
    }

    this.logger.log(`Selesai: ${successCount} berhasil, ${failedCount} gagal`);
  }
}
