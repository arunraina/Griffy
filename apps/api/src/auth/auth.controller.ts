import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WhatsappOtpService } from './whatsapp-otp.service';
import { SendWhatsappOtpDto, VerifyWhatsappOtpDto } from './dto/whatsapp-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly whatsappOtp: WhatsappOtpService) {}

  @Post('send-whatsapp-otp')
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 3600000 } })
  async sendWhatsappOtp(@Body() body: SendWhatsappOtpDto) {
    await this.whatsappOtp.sendWhatsappOtp(body.phone);
    return { success: true };
  }

  // TEMPORARY, testing-only: signs in with just a phone number, no OTP check.
  @Post('phone-signin')
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 3600000 } })
  async phoneSignin(@Body() body: SendWhatsappOtpDto) {
    const session = await this.whatsappOtp.signInWithPhone(body.phone);
    return { success: true, ...session };
  }

  @Post('verify-whatsapp-otp')
  @Throttle({ short: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 3600000 } })
  async verifyWhatsappOtp(@Body() body: VerifyWhatsappOtpDto) {
    const session = await this.whatsappOtp.verifyWhatsappOtp(body.phone, body.otp);
    return { success: true, ...session };
  }
}
