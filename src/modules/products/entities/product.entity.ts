import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    length: 100,
  })
  slug: string;

  @Column({ length: 200 })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'poster_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  posterUrl: string | null;

  // CATEGORY RELATION TABLE
  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @Column({ name: 'category_id' })
  categoryId: string;

  @OneToMany('ProductVariant', 'product', { cascade: true })
  variants: ProductVariant[];

  // DATE TIMES
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
