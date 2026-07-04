import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry, EnquiryStatus } from './enquiry.entity';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { ReplyEnquiryDto } from './dto/reply-enquiry.dto';
import { Contractor } from '../contractors/contractor.entity';
import { Labour } from '../labour/labour.entity';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry) private readonly repo: Repository<Enquiry>,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Labour) private readonly labourRepo: Repository<Labour>,
  ) {}

  async create(dto: CreateEnquiryDto, senderId: string): Promise<Enquiry> {
    let recipientId: string;

    if (dto.recipientType === 'contractor') {
      const contractor = await this.contractorRepo.findOne({ where: { id: dto.targetId } });
      if (!contractor) throw new NotFoundException('Contractor not found');
      recipientId = contractor.userId;
    } else {
      const labour = await this.labourRepo.findOne({ where: { id: dto.targetId } });
      if (!labour) throw new NotFoundException('Labour not found');
      recipientId = labour.userId;
    }

    const enquiry = this.repo.create({
      senderId,
      recipientId,
      recipientType: dto.recipientType,
      targetId: dto.targetId,
      message: dto.message,
      budget: dto.budget,
      projectDescription: dto.projectDescription,
      status: EnquiryStatus.PENDING,
    });
    return this.repo.save(enquiry);
  }

  async findSent(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { senderId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findReceived(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { recipientId: userId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Enquiry> {
    const enquiry = await this.repo.findOne({ where: { id }, relations: ['sender'] });
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  async reply(id: string, dto: ReplyEnquiryDto, userId: string): Promise<Enquiry> {
    const enquiry = await this.findOne(id);
    if (enquiry.recipientId !== userId) throw new ForbiddenException('Not your enquiry to reply to');

    enquiry.reply = dto.reply;
    enquiry.status = (dto.status as EnquiryStatus) ?? EnquiryStatus.REPLIED;
    enquiry.repliedAt = new Date();
    return this.repo.save(enquiry);
  }
}
