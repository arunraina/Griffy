import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ContractorSpecialty {
  CIVIL = 'civil',
  STRUCTURAL = 'structural',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  INTERIOR = 'interior',
  ARCHITECT = 'architect',
  PAINTING = 'painting',
  OTHER = 'other',
}

@Entity('contractors')
export class Contractor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  businessName: string;

  @Column({ type: 'enum', enum: ContractorSpecialty })
  specialty: ContractorSpecialty;

  @Column({ type: 'int' })
  experienceYears: number;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  priceRangeMin: number;

  @Column({ nullable: true })
  priceRangeMax: number;

  @Column({ nullable: true })
  priceUnit: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', array: true, nullable: true })
  skills: string[];

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: 0 })
  completedProjects: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
