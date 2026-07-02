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

    await this.sendViaTwilio(phone, otp);
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

  private async sendViaTwilio(phone: string, otp: string): Promise<void> {
    const accountSid = this.config.getOrThrow('TWILIO_ACCOUNT_SID');
    const authToken  = this.config.getOrThrow('TWILIO_AUTH_TOKEN');
    const from       = this.config.getOrThrow('TWILIO_WHATSAPP_FROM');

    const to = `whatsapp:${phone.startsWith('+') ? phone : `+91${phone}`}`;

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: `Your Griffy verification code is: ${otp}. Valid for 10 minutes.`,
        }).toString(),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new BadRequestException(`Twilio error: ${body}`);
    }
  }
}
