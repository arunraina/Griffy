import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Contractor } from '../contractors/contractor.entity';

export enum BidStatus {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  AWARDED = 'awarded',
  REJECTED = 'rejected',
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, { eager: false })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  contractorId: string;

  @ManyToOne(() => Contractor, { eager: false })
  @JoinColumn({ name: 'contractorId' })
  contractor: Contractor;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  bidAmount: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.PENDING })
  status: BidStatus;

  @CreateDateColumn()
  createdAt: Date;
}
