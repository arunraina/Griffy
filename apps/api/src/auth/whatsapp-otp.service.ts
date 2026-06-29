import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async sendWhatsappOtp(phone: string): Promise<void> {
    const otp       = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.whatsappOtp.deleteMany({ where: { phone } });
    await this.prisma.whatsappOtp.create({ data: { phone, otp, expiresAt } });

    await this.callMsg91(phone, otp);
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

  private async callMsg91(phone: string, otp: string): Promise<void> {
    const apiKey     = this.config.getOrThrow('MSG91_API_KEY');
    const templateId = this.config.getOrThrow('MSG91_TEMPLATE_ID');

    const mobile = phone.startsWith('+91') ? phone.slice(1) : phone.startsWith('91') ? phone : `91${phone}`;

    const res = await fetch('https://api.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        flow_id: templateId,
        sender: 'GRIFFY',
        mobiles: mobile,
        OTP: otp,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new BadRequestException(`MSG91 error: ${body}`);
    }
  }
}
