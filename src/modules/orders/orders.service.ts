import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity.js';
import { ProductVariant } from '../product-variants/entities/product-variant.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { generateBookingCode } from '../../common/utils/generate-booking-code.utils.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    private readonly dataSource: DataSource,
  ) {}

  // CREATE
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const variantIds = createOrderDto.items.map((i) => i.variantId);

    if (new Set(variantIds).size !== variantIds.length) {
      throw new BadRequestException('Not allowed any variant duplicated!');
    }

    return this.dataSource.transaction(async (manager) => {
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of createOrderDto.items) {
        // 1. Take variant with a lock (prevent race condition)
        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variantId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variant ticket ${item.variantId} not found!`,
          );
        }

        // 2. Check Stock
        if (variant.available < item.quantity) {
          throw new BadRequestException(
            `Stock "${variant.name}" is not enough. Left is ${variant.available}, requested is ${item.quantity}`,
          );
        }

        // 3. Decrease stock
        variant.available -= item.quantity;
        await manager.save(variant);

        // 4. Count subtotals from DB price (not from frontend)
        const subtotal = Number(variant.price) * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          variantId: variant.id,
          quantity: item.quantity,
          unitPrice: variant.price,
          subtotal,
        });
      }

      const order = manager.create(Order, {
        userId,
        bookingCode: generateBookingCode(),
        totalAmount,
        status: OrderStatus.PENDING,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        items: orderItems as OrderItem[],
      });

      return manager.save(order);
    });
  }

  // Find
  async findAllByUser(userId: string, query: QueryOrderDto) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await this.ordersRepository.findAndCount({
      where,
      relations: { items: { variant: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Find By ID
  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: { items: { variant: true } },
    });
    if (!order) {
      throw new NotFoundException(`Order with id: ${id} is not found!`);
    }
    return order;
  }

  // Cancel
  async cancel(id: string, userId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id, userId },
        relations: { items: true },
      });

      if (!order) throw new NotFoundException(`Orders ID ${id} is not found!`);

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          `You can only cancel PENDING orders. Right now, the status is: ${order.status}`,
        );
      }

      // Returning stock
      for (const item of order.items) {
        await manager.increment(
          ProductVariant,
          { id: item.variantId },
          'available',
          item.quantity,
        );
      }

      order.status = OrderStatus.CANCELLED;
      return manager.save(order);
    });
  }
}
