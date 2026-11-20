import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  province: string | null;

  @Column({
    type: 'int',
    nullable: true,
  })
  capacity: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  // DATE TIMES
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
