import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ProjectType {
  CIVIL = 'civil',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  INTERIOR = 'interior',
  STRUCTURAL = 'structural',
  PAINTING = 'painting',
  ARCHITECTURE = 'architecture',
  OTHER = 'other',
}

export enum ProjectStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  AWARDED = 'awarded',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  homeownerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'homeownerId' })
  homeowner: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProjectType })
  projectType: ProjectType;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ nullable: true })
  timeline: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
