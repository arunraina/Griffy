import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import ws from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappSenderService } from '../notifications/whatsapp-sender.service';

export interface OtpSession {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class WhatsappOtpService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappSenderService,
    private readonly config: ConfigService,
  ) {
    this.supabase = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { realtime: { transport: ws as any } },
    );
  }

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

  // Verifying the OTP only proves the phone number -- it doesn't by itself
  // give the caller a Supabase session (AuthGuard requires a real Supabase
  // JWT). So on success we also sign the phone in via Supabase's admin API,
  // using a password we derive deterministically from the phone number
  // rather than storing one, and return the resulting session tokens for
  // the frontend to set via supabase.auth.setSession().
  async verifyWhatsappOtp(phone: string, otp: string): Promise<OtpSession> {
    const record = await this.prisma.whatsappOtp.findFirst({
      where: { phone, otp, verified: false, expiresAt: { gt: new Date() } },
    });

    if (!record) throw new BadRequestException('Invalid or expired OTP');

    await this.prisma.whatsappOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return this.mintSession(phone);
  }

  private async mintSession(phone: string): Promise<OtpSession> {
    const password = this.derivePassword(phone);

    const { error: createErr } = await this.supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      password,
    });

    if (createErr) {
      // Most likely "already registered" -- find the existing user and
      // reset their password to our derived value so sign-in below works
      // regardless of what it was set to previously.
      const { data: list, error: listErr } = await this.supabase.auth.admin.listUsers();
      const existing = list?.users.find(u => u.phone === phone.replace(/^\+/, ''));
      if (listErr || !existing) throw new BadRequestException('Could not create or find account for this phone number');

      const { error: updateErr } = await this.supabase.auth.admin.updateUserById(existing.id, { password });
      if (updateErr) throw new BadRequestException('Could not sign in with this phone number');
    }

    const { data: signIn, error: signInErr } = await this.supabase.auth.signInWithPassword({ phone, password });
    if (signInErr || !signIn.session) throw new BadRequestException('Could not sign in with this phone number');

    return { access_token: signIn.session.access_token, refresh_token: signIn.session.refresh_token };
  }

  private derivePassword(phone: string): string {
    return crypto.createHmac('sha256', this.config.getOrThrow('JWT_SECRET')).update(phone).digest('hex');
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
