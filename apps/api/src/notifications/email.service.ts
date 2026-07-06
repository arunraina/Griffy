import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderEmailHtml } from './email-template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) this.resend = new Resend(apiKey);
  }

  async send(to: string, subject: string, params: { title: string; body: string; linkUrl?: string }): Promise<void> {
    const html = renderEmailHtml(params);

    if (!this.resend) {
      this.logger.log(`[email:dev-mode] RESEND_API_KEY not set — logging instead of sending.\nTo: ${to}\nSubject: ${subject}\nBody: ${params.body}`);
      return;
    }

    const from = this.config.get<string>('EMAIL_FROM') ?? 'Griffy <notifications@griffy.in>';
    const { error } = await this.resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend error: ${error.message}`);
  }
}
