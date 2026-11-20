import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity('product_events')
export class ProductEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', unique: true })
  productId: string;

  // ✅ Di sinilah venue dirujuk
  @ManyToOne('Venue', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'venue_id' })
  venueId: string;

  @Column({
    name: 'artist_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  artistName: string | null;

  @Column({
    name: 'start_time',
    type: 'datetime',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
    type: 'datetime',
  })
  endTime: Date;

  @Column({
    name: 'sale_start_time',
    type: 'datetime',
    nullable: true,
  })
  saleStartTime: Date | null;

  @Column({
    name: 'sale_end_time',
    type: 'datetime',
    nullable: true,
  })
  saleEndTime: Date | null;

  // DATE TIMES
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
