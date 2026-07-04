import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: config.get<number>('SMTP_PORT', 587),
        secure: config.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: config.get<string>('SMTP_USER'),
          pass: config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  private get from() {
    return this.config.get<string>('SMTP_FROM', 'Griffy <noreply@griffy.in>');
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[EMAIL SKIP] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.warn(`Email send failed to ${to}: ${err?.message}`);
    }
  }

  async sendEnquiryReceived(to: string, senderName: string, message: string) {
    await this.send(
      to,
      '📩 New enquiry received — Griffy',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">You have a new enquiry on Griffy</h2>
        <p><strong>${senderName}</strong> sent you an enquiry:</p>
        <blockquote style="border-left:3px solid #ea580c;padding-left:12px;color:#44403c;font-style:italic">${message}</blockquote>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/dashboard" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Reply on Griffy →</a>
        <p style="color:#a8a29e;font-size:12px;margin-top:24px">You're receiving this because someone contacted you on Griffy.</p>
      </div>`,
    );
  }

  async sendEnquiryReplied(to: string, recipientName: string, reply: string) {
    await this.send(
      to,
      '✅ Your enquiry got a reply — Griffy',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">${recipientName} replied to your enquiry</h2>
        <blockquote style="border-left:3px solid #22c55e;padding-left:12px;color:#44403c;font-style:italic">${reply}</blockquote>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/dashboard" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">View Reply →</a>
        <p style="color:#a8a29e;font-size:12px;margin-top:24px">You're receiving this because you sent an enquiry on Griffy.</p>
      </div>`,
    );
  }

  async sendOrderConfirmed(to: string, orderType: string, amount: number) {
    await this.send(
      to,
      '🎉 Order confirmed — Griffy',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">Your order is confirmed!</h2>
        <p>Your <strong>${orderType}</strong> order for <strong>₹${amount.toLocaleString('en-IN')}</strong> has been placed successfully.</p>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/orders" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">View Order →</a>
        <p style="color:#a8a29e;font-size:12px;margin-top:24px">Thank you for using Griffy — your trusted construction partner.</p>
      </div>`,
    );
  }

  async sendNewOrderReceived(to: string, buyerName: string, amount: number) {
    await this.send(
      to,
      '📦 New order received — Griffy',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">You received a new order</h2>
        <p><strong>${buyerName}</strong> placed an order for <strong>₹${amount.toLocaleString('en-IN')}</strong>. Accept or decline from your dashboard.</p>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/dashboard" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Go to Dashboard →</a>
      </div>`,
    );
  }

  async sendBidReceived(to: string, contractorName: string, projectTitle: string, bidAmount: number) {
    await this.send(
      to,
      '🏗️ New bid on your project — Griffy',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">New bid on your project</h2>
        <p><strong>${contractorName}</strong> submitted a bid of <strong>₹${bidAmount.toLocaleString('en-IN')}</strong> on your project <em>${projectTitle}</em>.</p>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/projects" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">View Bid →</a>
      </div>`,
    );
  }

  async sendWelcome(to: string, fullName: string, referralCode: string) {
    await this.send(
      to,
      '👋 Welcome to Griffy!',
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
        <h2 style="color:#ea580c">Welcome, ${fullName}!</h2>
        <p>We're glad to have you on <strong>Griffy</strong> — India's trusted construction marketplace.</p>
        <p>Your referral code is: <strong style="font-size:20px;letter-spacing:2px;color:#ea580c">${referralCode}</strong></p>
        <p>Share it with friends — every referral helps your community grow.</p>
        <a href="${this.config.get('FRONTEND_URL','https://griffy.in')}/dashboard" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Get Started →</a>
      </div>`,
    );
  }
}
