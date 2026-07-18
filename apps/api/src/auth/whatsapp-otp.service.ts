import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappSenderService } from '../notifications/whatsapp-sender.service';

// TEMPORARY: fixed OTP for closed testing with a handful of known users,
// while real SMS delivery is blocked on India DLT/carrier compliance
// registration. Remove FIXED_TEST_OTP and restore generateOtp()'s
// randomness before opening signup to the public.
const FIXED_TEST_OTP = '202600';

@Injectable()
export class WhatsappOtpService {
  private readonly logger = new Logger(WhatsappOtpService.name);

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
      // Real SMS delivery is expected to fail until DLT compliance is sorted —
      // don't block the fixed-OTP test flow on that.
      this.logger.warn(`SMS send failed for ${phone}, continuing with fixed test OTP: ${(err as Error).message}`);
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
    return FIXED_TEST_OTP;
  }
}
