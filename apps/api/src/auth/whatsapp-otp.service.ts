import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappSenderService } from '../notifications/whatsapp-sender.service';

@Injectable()
export class WhatsappOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappSenderService,
  ) {}

  async sendWhatsappOtp(phone: string): Promise<void> {
    const otp       = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.whatsappOtp.deleteMany({ where: { phone } });
    await this.prisma.whatsappOtp.create({ data: { phone, otp, expiresAt } });

    try {
      await this.whatsapp.send(phone, `Your Griffy verification code is: ${otp}. Valid for 10 minutes.`);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  async verifyWhatsappOtp(phone: string, otp: string): Promise<void> {
    const record = await this.prisma.whatsappOtp.findFirst({
      where: { phone, otp, verified: false, expiresAt: { gt: new Date() } },
    });

    if (!record) throw new BadRequestException('Invalid or expired OTP');

    await this.prisma.whatsappOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
