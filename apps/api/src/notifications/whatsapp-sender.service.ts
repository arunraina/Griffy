import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Shared with WhatsappOtpService — same Twilio account/number, just a
// generic message body instead of an OTP-specific one.
//
// NOTE: Twilio WhatsApp business-initiated messages require an
// approved message template in production (freeform text only works
// within a 24h user-initiated session, or in sandbox/dev). The
// notification texts below are sent freeform for now; before going
// live, register them as WhatsApp templates in the Twilio console and
// switch this to the templated-message API.
@Injectable()
export class WhatsappSenderService {
  constructor(private readonly config: ConfigService) {}

  async send(phone: string, body: string): Promise<void> {
    const accountSid = this.config.getOrThrow('TWILIO_ACCOUNT_SID');
    const authToken = this.config.getOrThrow('TWILIO_AUTH_TOKEN');
    const from = this.config.getOrThrow('TWILIO_WHATSAPP_FROM');

    const to = `whatsapp:${phone.startsWith('+') ? phone : `+91${phone}`}`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Twilio error: ${text}`);
    }
  }
}
