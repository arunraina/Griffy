import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum LabourTrade {
  MASON = 'mason',
  ELECTRICIAN = 'electrician',
  PLUMBER = 'plumber',
  CARPENTER = 'carpenter',
  PAINTER = 'painter',
  TILER = 'tiler',
  WELDER = 'welder',
  HELPER = 'helper',
  OTHER = 'other',
}

@Entity('labour')
@Index('idx_labour_userId', ['userId'], { unique: true })
@Index('idx_labour_city_trade', ['city', 'trade'])
@Index('idx_labour_dailyRate', ['dailyRate'])
@Index('idx_labour_rating', ['rating'])
export class Labour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: LabourTrade })
  trade: LabourTrade;

  @Column({ type: 'int' })
  experienceYears: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  dailyRate: number;

  @Column({ nullable: true })
  weeklyRate: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', array: true, nullable: true })
  skills: string[];

  @Column({ type: 'text', array: true, nullable: true })
  languages: string[];

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: 0 })
  completedJobs: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: 0 })
  profileViews: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
