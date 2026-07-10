import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { renderInvoicePdf } from './invoice-pdf';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly storage: StorageService,
  ) {}

  // Idempotent — one invoice per order (unique constraint on orderId).
  // Called from OrdersService.markPaid() the moment paymentStatus hits PAID.
  async generateForOrder(orderId: string): Promise<void> {
    const existing = await this.prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { material: { select: { name: true } } } },
        buyer: { select: { name: true } },
      },
    });
    if (!order) return;

    const invoiceNumber = await this.nextInvoiceNumber();

    const pdfBuffer = await this.renderPdfBuffer(invoiceNumber, order);
    const filename = `${invoiceNumber.replace(/\//g, '_')}.pdf`;
    const { location } = await this.storage.uploadBuffer('documents', filename, pdfBuffer, 'application/pdf');

    // Unique constraint on orderId protects against a race between two
    // concurrent markPaid() calls both passing the findUnique check above.
    await this.prisma.invoice.upsert({
      where: { orderId },
      create: { orderId, invoiceNumber, pdfUrl: location },
      update: {},
    });
  }

  async getPdfForOrder(orderId: string): Promise<{ invoiceNumber: string; buffer: Buffer } | null> {
    const invoice = await this.prisma.invoice.findUnique({ where: { orderId } });
    if (!invoice?.pdfUrl) return null;
    const buffer = await this.storage.downloadBuffer(invoice.pdfUrl);
    return { invoiceNumber: invoice.invoiceNumber, buffer };
  }

  private async renderPdfBuffer(
    invoiceNumber: string,
    order: {
      id: string;
      shippingAddress: string | null;
      items: { quantity: number; unitPrice: unknown; lineTotal: unknown; material: { name: string } }[];
      buyer: { name: string } | null;
    },
  ): Promise<Buffer> {
    const stream = renderInvoicePdf({
      invoiceNumber,
      order,
      businessName: this.config.get<string>('GRIFFY_BUSINESS_NAME') || 'Griffy',
      businessAddress: this.config.get<string>('GRIFFY_BUSINESS_ADDRESS') || '',
      gstin: this.config.get<string>('GRIFFY_GSTIN') || undefined,
      gstRate: Number(this.config.get<string>('GST_RATE') ?? '18'),
    });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  private async nextInvoiceNumber(): Promise<string> {
    const rows = await this.prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('invoice_number_seq') as nextval`;
    const seq = rows[0].nextval;
    const fy = this.currentFinancialYear();
    return `GRF/${fy}/${seq.toString().padStart(5, '0')}`;
  }

  // India FY runs April (month index 3) through March.
  private currentFinancialYear(date = new Date()): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month >= 3) return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
    return `${year - 1}-${String(year % 100).padStart(2, '0')}`;
  }
}
