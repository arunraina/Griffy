import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappOtpService } from './whatsapp-otp.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly whatsappOtp: WhatsappOtpService) {}

  @Post('send-whatsapp-otp')
  async sendWhatsappOtp(@Body() body: { phone: string }) {
    await this.whatsappOtp.sendWhatsappOtp(body.phone);
    return { success: true };
  }

  @Post('verify-whatsapp-otp')
  async verifyWhatsappOtp(@Body() body: { phone: string; otp: string }) {
    await this.whatsappOtp.verifyWhatsappOtp(body.phone, body.otp);
    return { success: true };
  }
}
