import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConsoleLogger,
} from '@nestjs/common';

import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { PaymentStatus } from './enums/payment.enum.js';
import { TicketsService } from '../tickets/tickets.service.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketsService,
  ) {}

  async create(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    // Order owner user
    const order = await this.dataSource.getRepository(Order).findOne({
      where: { id: createPaymentDto.order_id, userId },
    });
    // If not found
    if (!order) {
      throw new NotFoundException(
        `Order ${createPaymentDto.order_id} tidak ditemukan`,
      );
    }

    // Order must is PENDING
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order tidak bisa dibayar. Status saat ini: ${order.status}`,
      );
    }

    // Checking not any payment PENDING for this payment
    const existingPending = await this.paymentRepository.findOne({
      where: {
        orderId: createPaymentDto.order_id,
        status: PaymentStatus.PENDING,
      },
    });
    if (existingPending) {
      throw new BadRequestException(
        'Sudah ada pembayaran pending untuk order ini. Selesaikan atau tunggu expired.',
      );
    }

    // Order is not expired
    if (new Date() > order.expiresAt) {
      throw new BadRequestException(
        'Order sudah expired. Silakan buat order baru.',
      );
    }

    // Create the Payments
    const payment = this.paymentRepository.create({
      orderId: createPaymentDto.order_id,
      method: createPaymentDto.method,
      amount: order.totalAmount,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  // Confirmation payments (Admin Roles)
  async confirm(id: string): Promise<Payment> {
    const payment = await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id },
        relations: { order: true },
      });

      if (!payment)
        throw new NotFoundException(`Payment ${id} tidak ditemukan`);

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(`Payment tidak bisa dikonfirmasi...`);
      }

      const order = payment.order;
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(`Order tidak dalam status PENDING...`);
      }

      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      await manager.save(payment);

      order.status = OrderStatus.PAID;
      await manager.save(order);

      return payment;
    });

    // Generate tiket SETELAH transaksi commit
    try {
      await this.ticketService.generateForOrder(payment.orderId);
    } catch (err: any) {
      throw new ConsoleLogger(`Gagal melakukan konfirmasi pembayaran: ${err}`);
    }

    return payment;
  }

  async findAllByUser(userId: string, query: QueryPaymentDto) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('order.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      qb.andWhere('payment.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('payment.id = :id', { id })
      .andWhere('order.userId = :userId', { userId })
      .getOne();

    if (!payment) {
      throw new NotFoundException(`Payment ${id} tidak ditemukan`);
    }

    return payment;
  }

  async fail(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} tidak ditemukan`);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Payment tidak bisa ditandai gagal. Status saat ini: ${payment.status}`,
      );
    }

    payment.status = PaymentStatus.FAILED;
    return this.paymentRepository.save(payment);
  }
}
