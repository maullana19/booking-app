import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
  BeforeInsert,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  attributes: Record<string, string> | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price: number;

  @Column({ type: 'int' })
  quota: number;

  @Column({ type: 'int', default: 0 })
  available: number;

  @BeforeInsert()
  setAvailableFromQuota() {
    if (this.available === undefined || this.available === null) {
      this.available = this.quota;
    }
  }

  @VersionColumn()
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
