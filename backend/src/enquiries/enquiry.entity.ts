import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum EnquiryStatus {
  PENDING = 'pending',
  REPLIED = 'replied',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('enquiries')
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  recipientId: string;

  @Column({ type: 'varchar', length: 20 })
  recipientType: string; // 'contractor' | 'labour'

  @Column()
  targetId: string; // contractor or labour profile id

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'text', nullable: true })
  projectDescription: string;

  @Column({ type: 'enum', enum: EnquiryStatus, default: EnquiryStatus.PENDING })
  status: EnquiryStatus;

  @Column({ type: 'text', nullable: true })
  reply: string;

  @Column({ nullable: true })
  repliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
