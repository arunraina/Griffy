import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FirebasePhoneAuthService } from './firebase-phone-auth.service';
import { FirebasePhoneSigninDto } from './dto/firebase-phone-signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly firebasePhoneAuth: FirebasePhoneAuthService) {}

  // Client already verified the phone number's OTP directly with Firebase --
  // this just exchanges the resulting Firebase ID token for a real Supabase
  // session (AuthGuard only accepts Supabase JWTs).
  @Post('firebase-phone-signin')
  @Throttle({ short: { limit: 5, ttl: 60000 }, long: { limit: 20, ttl: 3600000 } })
  async firebasePhoneSignin(@Body() body: FirebasePhoneSigninDto) {
    const session = await this.firebasePhoneAuth.signInWithFirebaseToken(body.idToken);
    return { success: true, ...session };
  }
}
