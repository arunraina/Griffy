import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

// "Rs." rather than the ₹ glyph — pdfkit's built-in Helvetica doesn't
// include the Rupee sign, and embedding a custom font just for this isn't
// worth it yet.
export interface InvoicePdfData {
  invoiceNumber: string;
  order: {
    id: string;
    shippingAddress: string | null;
    items: { quantity: number; unitPrice: unknown; lineTotal: unknown; material: { name: string } }[];
    buyer: { name: string } | null;
  };
  businessName: string;
  businessAddress: string;
  gstin: string | undefined;
  gstRate: number;
}

export function renderInvoicePdf(data: InvoicePdfData): PassThrough {
  const { invoiceNumber, order, businessName, businessAddress, gstin, gstRate } = data;
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fillColor('#9E3F24').fontSize(22).text(businessName);
  doc.fillColor('#5A4436').fontSize(9);
  if (businessAddress) doc.text(businessAddress);
  doc.text(`GSTIN: ${gstin || 'Applied For'}`);
  doc.moveDown();

  doc.fillColor('#2C1810').fontSize(14).text(`Invoice ${invoiceNumber}`);
  doc.fillColor('#6B5248').fontSize(9);
  doc.text(`Order ID: ${order.id}`);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown();

  doc.fillColor('#2C1810').fontSize(11).text('Billed To:');
  doc.fillColor('#5A4436').fontSize(9);
  doc.text(order.buyer?.name ?? 'Customer');
  if (order.shippingAddress) doc.text(order.shippingAddress);
  doc.moveDown();

  const tableTop = doc.y;
  doc.fillColor('#2C1810').fontSize(9);
  doc.text('Item', 50, tableTop, { width: 220, continued: true });
  doc.text('Qty', 270, tableTop, { width: 50, continued: true });
  doc.text('Unit Price', 320, tableTop, { width: 90, continued: true });
  doc.text('Amount', 410, tableTop, { width: 90 });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(500, doc.y).strokeColor('#EBE0D8').stroke();
  doc.moveDown(0.3);

  let subtotal = 0;
  for (const item of order.items) {
    const lineTotal = Number(item.lineTotal);
    subtotal += lineTotal;
    const y = doc.y;
    doc.fillColor('#5A4436').fontSize(9);
    doc.text(item.material.name, 50, y, { width: 220, continued: true });
    doc.text(String(item.quantity), 270, y, { width: 50, continued: true });
    doc.text(`Rs. ${Number(item.unitPrice).toFixed(2)}`, 320, y, { width: 90, continued: true });
    doc.text(`Rs. ${lineTotal.toFixed(2)}`, 410, y, { width: 90 });
    doc.moveDown(0.4);
  }

  doc.moveDown();
  doc.fontSize(9).fillColor('#6B5248');
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, { align: 'right' });

  let grandTotal = subtotal;
  if (gstin) {
    const gstAmount = subtotal * (gstRate / 100);
    grandTotal += gstAmount;
    doc.text(`GST (${gstRate}%): Rs. ${gstAmount.toFixed(2)}`, { align: 'right' });
  } else {
    doc.text('GST: Not Applicable', { align: 'right' });
  }

  doc.fontSize(12).fillColor('#2C1810').text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, { align: 'right' });

  doc.moveDown(2);
  doc.fontSize(8).fillColor('#A08070').text('This is a computer-generated invoice.', { align: 'center' });

  doc.end();
  return stream;
}
