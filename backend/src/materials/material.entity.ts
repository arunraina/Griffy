import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum MaterialCategory {
  SAND = 'sand',
  BRICKS = 'bricks',
  CEMENT = 'cement',
  STEEL = 'steel',
  WOOD = 'wood',
  TILES = 'tiles',
  PAINT = 'paint',
  GLASS = 'glass',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  OTHER = 'other',
}

@Entity('materials')
@Index('idx_materials_supplierId', ['supplierId'])
@Index('idx_materials_category', ['category'])
@Index('idx_materials_city_category', ['city', 'category'])
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: MaterialCategory })
  category: MaterialCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  pricePerUnit: number;

  @Column()
  unit: string;

  @Column({ nullable: true })
  minOrderQuantity: number;

  @Column({ nullable: true })
  stockQuantity: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrls: string[];

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  deliveryDays: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'supplierId' })
  supplier: User;

  @Column({ nullable: true })
  supplierId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
