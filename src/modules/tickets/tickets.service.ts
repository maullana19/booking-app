import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { Ticket } from './entities/ticket.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly dataSource: DataSource,
  ) {}

  async generateForOrder(orderId: string): Promise<Ticket[]> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Ambil order + items
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: { items: true },
      });

      // If nothing order data
      if (!order) {
        throw new NotFoundException(`Order with ID: ${orderId} is not found!`);
      }

      if (order.status !== OrderStatus.PAID) {
        throw new BadRequestException(
          `Order must be PAID before generated the tickets. Status: ${order.status}`,
        );
      }

      // 2. Cek apakah tiket sudah pernah dibuat (idempoten)
      const existing = await manager.find(Ticket, {
        where: order.items.map((item) => ({ orderItemId: item.id })),
      });
      if (existing.length > 0) {
        return existing; // sudah ada, jangan duplikat
      }

      // 3. Generate tiket untuk setiap order_item
      const tickets: Ticket[] = [];
      for (const item of order.items) {
        // Generate satu tiket per quantity
        for (let i = 0; i < item.quantity; i++) {
          const code = `TIX-${randomUUID().slice(0, 8).toUpperCase()}`;
          const qrCode = await QRCode.toDataURL(code, {
            width: 300,
            margin: 2,
          });

          const ticket = manager.create(Ticket, {
            orderItemId: item.id,
            code,
            qrCode,
          });
          tickets.push(ticket);
        }
      }

      // Simpan semua tiket
      return manager.save(tickets);
    });
  }

  async findMyTickets(userId: string): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.orderItem', 'orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: OrderStatus.PAID })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.orderItem', 'orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('ticket.id = :id', { id })
      .andWhere('order.userId = :userId', { userId })
      .getOne();

    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} tidak ditemukan`);
    }
    return ticket;
  }

  async validate(code: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { code },
      relations: { orderItem: { order: true } },
    });

    if (!ticket) {
      throw new NotFoundException(`Tiket dengan kode ${code} tidak ditemukan`);
    }

    if (ticket.isUsed) {
      throw new BadRequestException(
        `Tiket sudah digunakan pada ${ticket.usedAt?.toISOString()}`,
      );
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();
    return this.ticketRepository.save(ticket);
  }
}
