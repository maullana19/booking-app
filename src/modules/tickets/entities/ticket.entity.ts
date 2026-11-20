import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity.js';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('OrderItem', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'order_item_id', unique: true })
  orderItemId: string;

  // Kode unik yang dipakai untuk QR (bisa UUID atau format khusus)
  @Column({ unique: true, length: 50 })
  code: string;

  // QR code dalam bentuk base64 (data URL) — siap ditampilkan di <img>
  @Column({
    name: 'qr_code',
    type: 'text',
  })
  qrCode: string;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({
    name: 'used_at',
    type: 'datetime',
    nullable: true,
  })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
