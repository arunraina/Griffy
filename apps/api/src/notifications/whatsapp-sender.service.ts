import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Shared with WhatsappOtpService — same Twilio account/number, just a
// generic message body instead of an OTP-specific one.
//
// Sends plain SMS rather than WhatsApp: WhatsApp business-initiated
// messages require an approved Meta template and only deliver to
// numbers that joined Twilio's sandbox, which isn't viable for real
// users. Plain SMS has no such approval step.
@Injectable()
export class WhatsappSenderService {
  constructor(private readonly config: ConfigService) {}

  async send(phone: string, body: string): Promise<void> {
    const accountSid = this.config.getOrThrow('TWILIO_ACCOUNT_SID');
    const authToken = this.config.getOrThrow('TWILIO_AUTH_TOKEN');
    const messagingServiceSid = this.config.getOrThrow('TWILIO_MESSAGING_SERVICE_SID');

    const to = phone.startsWith('+') ? phone : `+91${phone}`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ MessagingServiceSid: messagingServiceSid, To: to, Body: body }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Twilio error: ${text}`);
    }
  }
}
