import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ProjectWithFinancials, BusinessSettings, Client } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const generateInvoicePDF = async (
  project: ProjectWithFinancials,
  client: Client | undefined,
  settings: BusinessSettings
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points: 210mm x 297mm
  const { width, height } = page.getSize();

  // Load fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette
  const darkText = rgb(0.06, 0.09, 0.15); // #111827
  const mutedText = rgb(0.42, 0.45, 0.50); // #6B7280
  const lightBg = rgb(0.97, 0.98, 0.99); // #F9FAFB
  const borderColor = rgb(0.90, 0.91, 0.93); // #E5E7EB
  const greenColor = rgb(0.09, 0.64, 0.29); // #16A34A
  const orangeColor = rgb(0.96, 0.62, 0.04); // #F59E0B
  const redColor = rgb(0.86, 0.15, 0.15); // #DC2626

  let y = height - 50;

  // Header Logo / Business Name
  let logoEmbedded = false;
  if (settings.businessLogoUrl && settings.businessLogoUrl.startsWith('data:image')) {
    try {
      const base64Data = settings.businessLogoUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      let img;
      if (settings.businessLogoUrl.includes('image/png')) {
        img = await pdfDoc.embedPng(imageBytes);
      } else {
        img = await pdfDoc.embedJpg(imageBytes);
      }
      const imgDims = img.scale(30 / img.height);
      page.drawImage(img, {
        x: 50,
        y: y - imgDims.height,
        width: imgDims.width,
        height: imgDims.height,
      });
      logoEmbedded = true;
    } catch (e) {
      console.warn('Could not embed logo image:', e);
    }
  }

  // Business Name
  const busX = logoEmbedded ? 120 : 50;
  page.drawText(settings.businessName || 'Freelance Graphic Designer', {
    x: busX,
    y: y - 12,
    size: 16,
    font: helveticaBold,
    color: darkText,
  });

  // Business Contact Info
  page.drawText([settings.email, settings.phone, settings.address].filter(Boolean).join('  |  '), {
    x: busX,
    y: y - 28,
    size: 9,
    font: helvetica,
    color: mutedText,
  });

  // Top Right: INVOICE Label and Number
  const invNumber = project.invoiceNumber || 'INV-0001';
  page.drawText('INVOICE', {
    x: width - 150,
    y: y - 12,
    size: 20,
    font: helveticaBold,
    color: darkText,
  });

  page.drawText(invNumber, {
    x: width - 150,
    y: y - 28,
    size: 11,
    font: helveticaBold,
    color: mutedText,
  });

  y -= 65;

  // Divider line
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: borderColor,
  });

  y -= 25;

  // Billed To & Invoice Details Box (Two Columns)
  const col1X = 50;
  const col2X = width - 200;

  // Left Column: Client Details
  page.drawText('BILLED TO', {
    x: col1X,
    y,
    size: 9,
    font: helveticaBold,
    color: mutedText,
  });

  y -= 15;
  page.drawText(client?.name || project.clientName || 'Valued Client', {
    x: col1X,
    y,
    size: 12,
    font: helveticaBold,
    color: darkText,
  });

  if (client?.company) {
    y -= 14;
    page.drawText(client.company, {
      x: col1X,
      y,
      size: 10,
      font: helvetica,
      color: darkText,
    });
  }

  if (client?.email) {
    y -= 14;
    page.drawText(client.email, {
      x: col1X,
      y,
      size: 9,
      font: helvetica,
      color: mutedText,
    });
  }

  if (client?.phone) {
    y -= 14;
    page.drawText(client.phone, {
      x: col1X,
      y,
      size: 9,
      font: helvetica,
      color: mutedText,
    });
  }

  // Right Column: Date & Status
  let rightY = y + (client?.company ? 28 : 14);
  page.drawText('INVOICE DETAILS', {
    x: col2X,
    y: rightY,
    size: 9,
    font: helveticaBold,
    color: mutedText,
  });

  rightY -= 15;
  page.drawText(`Date: ${formatDate(project.createdDate)}`, {
    x: col2X,
    y: rightY,
    size: 10,
    font: helvetica,
    color: darkText,
  });

  rightY -= 15;
  const statusColor = project.status === 'Paid' ? greenColor : project.status === 'Partial' ? orangeColor : redColor;
  page.drawText(`Status: ${project.status.toUpperCase()}`, {
    x: col2X,
    y: rightY,
    size: 10,
    font: helveticaBold,
    color: statusColor,
  });

  y = Math.min(y, rightY) - 30;

  // Main Services Table Header
  page.drawRectangle({
    x: 50,
    y: y - 8,
    width: width - 100,
    height: 24,
    color: lightBg,
  });

  page.drawText('PROJECT & SERVICE', {
    x: 60,
    y,
    size: 9,
    font: helveticaBold,
    color: darkText,
  });

  page.drawText('TOTAL PRICE', {
    x: width - 150,
    y,
    size: 9,
    font: helveticaBold,
    color: darkText,
  });

  y -= 25;

  // Project Line Item
  page.drawText(project.projectName, {
    x: 60,
    y,
    size: 11,
    font: helveticaBold,
    color: darkText,
  });

  const priceFormatted = formatCurrency(project.totalPrice, settings.currencySymbol);
  page.drawText(priceFormatted, {
    x: width - 150,
    y,
    size: 11,
    font: helveticaBold,
    color: darkText,
  });

  y -= 14;
  page.drawText(`Service: ${project.service}`, {
    x: 60,
    y,
    size: 9,
    font: helvetica,
    color: mutedText,
  });

  y -= 20;

  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: borderColor,
  });

  y -= 25;

  // Payment History Section (If any payments exist)
  if (project.payments && project.payments.length > 0) {
    page.drawText(`PARTIAL PAYMENT BREAKDOWN (${project.payments.length} ${project.payments.length === 1 ? 'INSTALLMENT' : 'SEPARATE INSTALLMENTS'})`, {
      x: 50,
      y,
      size: 9,
      font: helveticaBold,
      color: darkText,
    });

    y -= 15;

    // Table Header
    page.drawRectangle({
      x: 50,
      y: y - 6,
      width: width - 100,
      height: 20,
      color: lightBg,
    });

    page.drawText('INSTALLMENT', { x: 60, y, size: 8, font: helveticaBold, color: mutedText });
    page.drawText('DATE PAID', { x: 150, y, size: 8, font: helveticaBold, color: mutedText });
    page.drawText('NOTES', { x: 250, y, size: 8, font: helveticaBold, color: mutedText });
    page.drawText('AMOUNT PAID', { x: width - 150, y, size: 8, font: helveticaBold, color: mutedText });

    y -= 18;

    project.payments.forEach((pay, idx) => {
      page.drawText(`Payment #${idx + 1}`, { x: 60, y, size: 9, font: helveticaBold, color: darkText });
      page.drawText(formatDate(pay.date), { x: 150, y, size: 9, font: helvetica, color: darkText });
      page.drawText(pay.notes || `Partial Payment #${idx + 1}`, { x: 250, y, size: 9, font: helvetica, color: mutedText });
      page.drawText(`+ ${formatCurrency(pay.amount, settings.currencySymbol)}`, {
        x: width - 150,
        y,
        size: 9,
        font: helveticaBold,
        color: greenColor,
      });
      y -= 16;
    });

    y -= 10;
  }

  // Financial Summary Box (Right aligned)
  const sumBoxWidth = 220;
  const sumBoxX = width - 50 - sumBoxWidth;

  page.drawRectangle({
    x: sumBoxX,
    y: y - 60,
    width: sumBoxWidth,
    height: 70,
    color: lightBg,
    borderColor,
    borderWidth: 1,
  });

  let sumY = y - 5;
  page.drawText('Total Amount:', { x: sumBoxX + 15, y: sumY, size: 9, font: helvetica, color: mutedText });
  page.drawText(formatCurrency(project.totalPrice, settings.currencySymbol), {
    x: sumBoxX + 120,
    y: sumY,
    size: 9,
    font: helveticaBold,
    color: darkText,
  });

  sumY -= 16;
  page.drawText('Total Paid:', { x: sumBoxX + 15, y: sumY, size: 9, font: helvetica, color: mutedText });
  page.drawText(formatCurrency(project.totalReceived, settings.currencySymbol), {
    x: sumBoxX + 120,
    y: sumY,
    size: 9,
    font: helveticaBold,
    color: greenColor,
  });

  sumY -= 18;
  page.drawLine({
    start: { x: sumBoxX + 10, y: sumY + 12 },
    end: { x: sumBoxX + sumBoxWidth - 10, y: sumY + 12 },
    thickness: 1,
    color: borderColor,
  });

  page.drawText('Amount Due:', { x: sumBoxX + 15, y: sumY, size: 10, font: helveticaBold, color: darkText });
  page.drawText(formatCurrency(project.remainingAmount, settings.currencySymbol), {
    x: sumBoxX + 120,
    y: sumY,
    size: 11,
    font: helveticaBold,
    color: project.remainingAmount > 0 ? redColor : greenColor,
  });

  y = sumY - 50;

  // Thank you & Footer
  page.drawText('Thank you for your business!', {
    x: 50,
    y,
    size: 11,
    font: helveticaBold,
    color: darkText,
  });

  y -= 14;
  page.drawText('For questions regarding this invoice, please contact ' + (settings.email || settings.phone || 'us.'), {
    x: 50,
    y,
    size: 9,
    font: helvetica,
    color: mutedText,
  });

  // Footer Branding
  page.drawText('Generated via Client Ledger', {
    x: width / 2 - 60,
    y: 30,
    size: 8,
    font: helvetica,
    color: mutedText,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

export const downloadPDF = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 1000);
};
