import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import { OrderItem } from './order-item.entity.js';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'booking_code',
    unique: true,
    length: 20,
  })
  bookingCode: string;

  // Validate User before insert
  @BeforeInsert()
  validateUserId() {
    if (!this.userId) {
      throw new Error('userId wajib diisi sebelum insert order');
    }
  }

  @ManyToOne('User', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'expires_at',
    type: 'datetime',
  })
  expiresAt: Date;

  @OneToMany('OrderItem', 'order', { cascade: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
