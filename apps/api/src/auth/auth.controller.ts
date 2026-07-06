import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappOtpService } from './whatsapp-otp.service';
import { SendWhatsappOtpDto, VerifyWhatsappOtpDto } from './dto/whatsapp-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly whatsappOtp: WhatsappOtpService) {}

  @Post('send-whatsapp-otp')
  async sendWhatsappOtp(@Body() body: SendWhatsappOtpDto) {
    await this.whatsappOtp.sendWhatsappOtp(body.phone);
    return { success: true };
  }

  @Post('verify-whatsapp-otp')
  async verifyWhatsappOtp(@Body() body: VerifyWhatsappOtpDto) {
    await this.whatsappOtp.verifyWhatsappOtp(body.phone, body.otp);
    return { success: true };
  }
}
