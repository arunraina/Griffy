import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KycStatus } from '@prisma/client';

export interface KycSubmitInput {
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  businessName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountHolderName?: string;
  panCardUrl?: string;
  bankProofUrl?: string;
}

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const existing = await this.prisma.kycDetail.findUnique({ where: { userId } });
    if (existing) return existing;
    // Not submitted yet — return a shape the frontend can render without a
    // separate "does KYC exist" branch.
    return {
      id: null,
      userId,
      status: KycStatus.NOT_SUBMITTED,
      aadhaarNumber: null,
      panNumber: null,
      gstNumber: null,
      businessName: null,
      bankAccountNumber: null,
      bankIfsc: null,
      bankAccountHolderName: null,
      panCardUrl: null,
      bankProofUrl: null,
      rejectionReason: null,
      submittedAt: null,
      verifiedAt: null,
    };
  }

  submit(userId: string, data: KycSubmitInput) {
    return this.prisma.kycDetail.upsert({
      where: { userId },
      update: { ...data, status: KycStatus.PENDING, rejectionReason: null, submittedAt: new Date() },
      create: { userId, ...data, status: KycStatus.PENDING, submittedAt: new Date() },
    });
  }

  listAll(status?: KycStatus) {
    return this.prisma.kycDetail.findMany({
      where: status ? { status } : {},
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async setStatus(userId: string, status: KycStatus, rejectionReason?: string) {
    const existing = await this.prisma.kycDetail.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('No KYC submission for this user');
    return this.prisma.kycDetail.update({
      where: { userId },
      data: {
        status,
        rejectionReason: status === KycStatus.REJECTED ? (rejectionReason ?? null) : null,
        verifiedAt: status === KycStatus.VERIFIED ? new Date() : null,
      },
    });
  }
}
