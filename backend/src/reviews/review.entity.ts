import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ReviewTargetType {
  MATERIAL = 'material',
  CONTRACTOR = 'contractor',
  LABOUR = 'labour',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'enum', enum: ReviewTargetType })
  targetType: ReviewTargetType;

  @Column()
  targetId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
