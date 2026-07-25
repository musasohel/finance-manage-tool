import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ProjectWithFinancials, BusinessSettings, Client } from '../types';
import { formatCurrency, formatDate, formatInvoiceNumber } from '../utils/formatters';

const dummyCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

// Converts oklab(...), oklch(...), color(srgb ...) or any non-standard color function to standard rgb/rgba/hex
export const sanitizeColorString = (colorStr: string): string => {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  if (!colorStr.includes('oklab') && !colorStr.includes('oklch') && !colorStr.includes('color(')) {
    return colorStr;
  }

  return colorStr.replace(/(oklab|oklch|color)\([^)]+\)/gi, (match) => {
    if (dummyCtx) {
      try {
        dummyCtx.fillStyle = 'rgba(0,0,0,0)';
        dummyCtx.fillStyle = match;
        const computed = dummyCtx.fillStyle;
        if (
          computed &&
          computed !== 'rgba(0, 0, 0, 0)' &&
          computed !== 'transparent' &&
          computed !== '#00000000' &&
          !computed.includes('oklab') &&
          !computed.includes('oklch')
        ) {
          return computed;
        }
      } catch (e) {
        // ignore
      }
    }
    if (match.includes('0 0 0') || match.includes('0/')) {
      return 'rgba(0, 0, 0, 0.05)';
    }
    return '#111827';
  });
};

// 1. Pixel-perfect PDF generation from the rendered DOM sheet
export const generatePDFFromElement = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  // Capture HTML DOM with html2canvas at desktop A4 canvas dimensions
  const canvas = await html2canvas(element, {
    scale: 2, // 2x DPI for ultra-crisp high-resolution vector/text output
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200, // Enforce desktop viewport so media queries maintain flex-row & grid layouts
    onclone: (clonedDoc, clonedEl) => {
      // 1. Sanitize all <style> tags in the cloned document
      const styleElements = clonedDoc.querySelectorAll('style');
      styleElements.forEach((style) => {
        if (style.textContent) {
          style.textContent = sanitizeColorString(style.textContent);
        }
      });

      // 2. Sanitize inline style attributes and computed styles on all cloned elements
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const styleAttr = htmlEl.getAttribute('style');
        if (styleAttr && (styleAttr.includes('oklab') || styleAttr.includes('oklch') || styleAttr.includes('color('))) {
          htmlEl.setAttribute('style', sanitizeColorString(styleAttr));
        }

        const defaultView = clonedDoc.defaultView || window;
        try {
          const comp = defaultView.getComputedStyle(htmlEl);
          if (comp.color && (comp.color.includes('oklab') || comp.color.includes('oklch'))) {
            htmlEl.style.color = sanitizeColorString(comp.color);
          }
          if (comp.backgroundColor && (comp.backgroundColor.includes('oklab') || comp.backgroundColor.includes('oklch'))) {
            htmlEl.style.backgroundColor = sanitizeColorString(comp.backgroundColor);
          }
          if (comp.borderColor && (comp.borderColor.includes('oklab') || comp.borderColor.includes('oklch'))) {
            htmlEl.style.borderColor = sanitizeColorString(comp.borderColor);
          }
        } catch (e) {
          // ignore
        }
      });

      // 3. Force exact standard printable A4 dimensions on the captured DOM clone
      clonedEl.style.width = '794px'; // 210mm at 96 DPI
      clonedEl.style.maxWidth = '794px';
      clonedEl.style.minWidth = '794px';
      clonedEl.style.margin = '0 auto';
      clonedEl.style.padding = '48px';
      clonedEl.style.boxSizing = 'border-box';
      clonedEl.style.borderRadius = '0px';
      clonedEl.style.boxShadow = 'none';
      clonedEl.style.border = 'none';
      clonedEl.style.backgroundColor = '#ffffff';
    },
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm (Standard A4)
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm (Standard A4)

  // Full-bleed width using the sheet's internal padding (no double margin offset)
  const imgWidth = pdfWidth; 
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight) {
    // Fits single page perfectly
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
  } else {
    // Multi-page page-slicing
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
};

// Helper: Sanitize text for standard PDF-lib fonts (Helvetica)
const sanitizeText = (str: string): string => {
  if (!str) return '';
  // Replace Bengali Taka symbol ৳ with BDT and replace non-ASCII characters if needed
  return str
    .replace(/৳/g, 'BDT ')
    .replace(/[^\x00-\x7F]/g, '');
};

// Helper: Draw right-aligned text
const drawTextRight = (
  page: any,
  text: string,
  rightX: number,
  y: number,
  size: number,
  font: any,
  color: any
) => {
  const safeStr = sanitizeText(text);
  const textWidth = font.widthOfTextAtSize(safeStr, size);
  page.drawText(safeStr, {
    x: rightX - textWidth,
    y,
    size,
    font,
    color,
  });
};

// Helper: Truncate text to fit max width
const truncateToWidth = (
  text: string,
  maxWidth: number,
  size: number,
  font: any
): string => {
  let safeStr = sanitizeText(text);
  if (!safeStr) return '';
  if (font.widthOfTextAtSize(safeStr, size) <= maxWidth) {
    return safeStr;
  }
  while (safeStr.length > 0 && font.widthOfTextAtSize(safeStr + '...', size) > maxWidth) {
    safeStr = safeStr.slice(0, -1);
  }
  return safeStr + '...';
};

// 2. Pure programmatic PDF generation with strict layout bounds and no overlaps
export const generateInvoicePDF = async (
  project: ProjectWithFinancials,
  client: Client | undefined,
  settings: BusinessSettings
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
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

  const leftMargin = 50;
  const rightMargin = width - 50; // 545.28
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
        x: leftMargin,
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
  const busX = logoEmbedded ? 120 : leftMargin;
  const busNameTruncated = truncateToWidth(
    settings.businessName || 'Freelance Studio',
    280,
    16,
    helveticaBold
  );
  page.drawText(busNameTruncated, {
    x: busX,
    y: y - 12,
    size: 16,
    font: helveticaBold,
    color: darkText,
  });

  // Business Contact Info
  const contactText = [settings.email, settings.phone, settings.address].filter(Boolean).join('  |  ');
  const contactTruncated = truncateToWidth(contactText, 280, 8.5, helvetica);
  page.drawText(contactTruncated, {
    x: busX,
    y: y - 28,
    size: 8.5,
    font: helvetica,
    color: mutedText,
  });

  // Top Right: INVOICE Label and Number (Right Aligned)
  const invNumber = formatInvoiceNumber(settings?.invoicePrefix, project.invoiceNumber);
  drawTextRight(page, 'INVOICE', rightMargin, y - 12, 20, helveticaBold, darkText);
  drawTextRight(page, invNumber, rightMargin, y - 28, 11, helveticaBold, mutedText);

  y -= 60;

  // Divider line
  page.drawLine({
    start: { x: leftMargin, y },
    end: { x: rightMargin, y },
    thickness: 1,
    color: borderColor,
  });

  y -= 25;

  // Billed To (Left Column) & Invoice Details (Right Column)
  let col1Y = y;
  page.drawText('BILLED TO', {
    x: leftMargin,
    y: col1Y,
    size: 8.5,
    font: helveticaBold,
    color: mutedText,
  });

  col1Y -= 15;
  const clientNameTrunc = truncateToWidth(
    client?.name || project.clientName || 'Valued Client',
    240,
    12,
    helveticaBold
  );
  page.drawText(clientNameTrunc, {
    x: leftMargin,
    y: col1Y,
    size: 12,
    font: helveticaBold,
    color: darkText,
  });

  if (client?.company) {
    col1Y -= 14;
    const compTrunc = truncateToWidth(client.company, 240, 9.5, helvetica);
    page.drawText(compTrunc, {
      x: leftMargin,
      y: col1Y,
      size: 9.5,
      font: helvetica,
      color: darkText,
    });
  }

  if (client?.email) {
    col1Y -= 14;
    const emailTrunc = truncateToWidth(client.email, 240, 8.5, helvetica);
    page.drawText(emailTrunc, {
      x: leftMargin,
      y: col1Y,
      size: 8.5,
      font: helvetica,
      color: mutedText,
    });
  }

  if (client?.phone) {
    col1Y -= 14;
    const phoneTrunc = truncateToWidth(client.phone, 240, 8.5, helvetica);
    page.drawText(phoneTrunc, {
      x: leftMargin,
      y: col1Y,
      size: 8.5,
      font: helvetica,
      color: mutedText,
    });
  }

  // Right Column: Invoice Details (Right Aligned)
  let col2Y = y;
  drawTextRight(page, 'INVOICE DETAILS', rightMargin, col2Y, 8.5, helveticaBold, mutedText);

  col2Y -= 15;
  drawTextRight(
    page,
    `Date Issued: ${formatDate(project.createdDate)}`,
    rightMargin,
    col2Y,
    9.5,
    helvetica,
    darkText
  );

  col2Y -= 14;
  const statusColor = project.status === 'Paid' ? greenColor : project.status === 'Partial' ? orangeColor : redColor;
  drawTextRight(
    page,
    `Status: ${project.status.toUpperCase()}`,
    rightMargin,
    col2Y,
    9.5,
    helveticaBold,
    statusColor
  );

  y = Math.min(col1Y, col2Y) - 30;

  // Main Services Table Header
  page.drawRectangle({
    x: leftMargin,
    y: y - 8,
    width: rightMargin - leftMargin,
    height: 24,
    color: lightBg,
  });

  page.drawText('PROJECT & SERVICE', {
    x: leftMargin + 10,
    y,
    size: 8.5,
    font: helveticaBold,
    color: darkText,
  });

  drawTextRight(page, 'TOTAL PRICE', rightMargin - 10, y, 8.5, helveticaBold, darkText);

  y -= 25;

  // Project Line Item
  const projNameTrunc = truncateToWidth(project.projectName, 340, 11, helveticaBold);
  page.drawText(projNameTrunc, {
    x: leftMargin + 10,
    y,
    size: 11,
    font: helveticaBold,
    color: darkText,
  });

  const priceFormatted = formatCurrency(project.totalPrice, settings.currencySymbol);
  drawTextRight(page, priceFormatted, rightMargin - 10, y, 11, helveticaBold, darkText);

  y -= 14;
  const serviceTrunc = truncateToWidth(`Service: ${project.service}`, 340, 8.5, helvetica);
  page.drawText(serviceTrunc, {
    x: leftMargin + 10,
    y,
    size: 8.5,
    font: helvetica,
    color: mutedText,
  });

  y -= 20;

  page.drawLine({
    start: { x: leftMargin, y },
    end: { x: rightMargin, y },
    thickness: 1,
    color: borderColor,
  });

  y -= 25;

  // Partial Payment Breakdown Section (If any payments exist)
  if (project.payments && project.payments.length > 0) {
    page.drawText(
      `PARTIAL PAYMENT BREAKDOWN (${project.payments.length} ${project.payments.length === 1 ? 'INSTALLMENT' : 'SEPARATE INSTALLMENTS'})`,
      {
        x: leftMargin,
        y,
        size: 8.5,
        font: helveticaBold,
        color: darkText,
      }
    );

    y -= 15;

    // Table Header
    page.drawRectangle({
      x: leftMargin,
      y: y - 6,
      width: rightMargin - leftMargin,
      height: 20,
      color: lightBg,
    });

    page.drawText('INSTALLMENT', { x: leftMargin + 10, y, size: 8, font: helveticaBold, color: mutedText });
    page.drawText('DATE PAID', { x: leftMargin + 110, y, size: 8, font: helveticaBold, color: mutedText });
    page.drawText('NOTES', { x: leftMargin + 200, y, size: 8, font: helveticaBold, color: mutedText });
    drawTextRight(page, 'AMOUNT PAID', rightMargin - 10, y, 8, helveticaBold, mutedText);

    y -= 18;

    project.payments.forEach((pay, idx) => {
      page.drawText(`Payment #${idx + 1}`, { x: leftMargin + 10, y, size: 8.5, font: helveticaBold, color: darkText });
      page.drawText(formatDate(pay.date), { x: leftMargin + 110, y, size: 8.5, font: helvetica, color: darkText });
      
      const notesTrunc = truncateToWidth(pay.notes || `Partial Payment #${idx + 1}`, 150, 8.5, helvetica);
      page.drawText(notesTrunc, { x: leftMargin + 200, y, size: 8.5, font: helvetica, color: mutedText });
      
      const amtStr = `+ ${formatCurrency(pay.amount, settings.currencySymbol)}`;
      drawTextRight(page, amtStr, rightMargin - 10, y, 8.5, helveticaBold, greenColor);
      
      y -= 16;
    });

    y -= 12;
  }

  // Financial Summary Box (Right aligned) & Authorized Signature (Left aligned)
  const sumBoxWidth = 220;
  const sumBoxX = rightMargin - sumBoxWidth;

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
  page.drawText('Total Project Price:', { x: sumBoxX + 12, y: sumY, size: 8.5, font: helvetica, color: mutedText });
  drawTextRight(page, formatCurrency(project.totalPrice, settings.currencySymbol), rightMargin - 12, sumY, 8.5, helveticaBold, darkText);

  sumY -= 16;
  page.drawText('Total Received:', { x: sumBoxX + 12, y: sumY, size: 8.5, font: helvetica, color: mutedText });
  drawTextRight(page, formatCurrency(project.totalReceived, settings.currencySymbol), rightMargin - 12, sumY, 8.5, helveticaBold, greenColor);

  sumY -= 16;
  page.drawLine({
    start: { x: sumBoxX + 10, y: sumY + 12 },
    end: { x: rightMargin - 10, y: sumY + 12 },
    thickness: 1,
    color: borderColor,
  });

  page.drawText('Amount Due:', { x: sumBoxX + 12, y: sumY, size: 9.5, font: helveticaBold, color: darkText });
  const remColor = project.remainingAmount > 0 ? redColor : greenColor;
  drawTextRight(page, formatCurrency(project.remainingAmount, settings.currencySymbol), rightMargin - 12, sumY, 9.5, helveticaBold, remColor);

  // Authorized Signature Block (Left side)
  if (settings.showSignatureOnInvoice !== false) {
    let sigY = y;
    let sigImgEmbedded = false;

    if (settings.authorizedSignatureUrl && settings.authorizedSignatureUrl.startsWith('data:image')) {
      try {
        const base64Sig = settings.authorizedSignatureUrl.split(',')[1];
        const sigBytes = Uint8Array.from(atob(base64Sig), c => c.charCodeAt(0));
        let sigImg;
        if (settings.authorizedSignatureUrl.includes('image/png')) {
          sigImg = await pdfDoc.embedPng(sigBytes);
        } else {
          sigImg = await pdfDoc.embedJpg(sigBytes);
        }
        const sigDims = sigImg.scale(30 / sigImg.height);
        page.drawImage(sigImg, {
          x: leftMargin,
          y: sigY - 32,
          width: Math.min(sigDims.width, 140),
          height: sigDims.height,
        });
        sigImgEmbedded = true;
      } catch (err) {
        console.warn('Could not embed signature image in PDF:', err);
      }
    }

    if (!sigImgEmbedded) {
      // Draw signature line
      page.drawLine({
        start: { x: leftMargin, y: sigY - 20 },
        end: { x: leftMargin + 140, y: sigY - 20 },
        thickness: 1,
        color: darkText,
      });
    }

    const nameStr = truncateToWidth(settings.signatoryName || 'Authorized Representative', 180, 9, helveticaBold);
    page.drawText(nameStr, {
      x: leftMargin,
      y: sigY - 36,
      size: 9,
      font: helveticaBold,
      color: darkText,
    });

    const titleStr = truncateToWidth(settings.signatoryTitle || 'Authorized Signatory', 180, 8, helvetica);
    page.drawText(titleStr, {
      x: leftMargin,
      y: sigY - 48,
      size: 8,
      font: helvetica,
      color: mutedText,
    });
  }

  y = sumY - 45;

  // Thank you & Footer
  page.drawText('Thank you for your business!', {
    x: leftMargin,
    y,
    size: 10.5,
    font: helveticaBold,
    color: darkText,
  });

  y -= 14;
  const contactFoot = 'Please direct all payment inquiries to ' + (settings.email || settings.phone || 'us.');
  const contactFootTrunc = truncateToWidth(contactFoot, 480, 8.5, helvetica);
  page.drawText(contactFootTrunc, {
    x: leftMargin,
    y,
    size: 8.5,
    font: helvetica,
    color: mutedText,
  });

  // Footer Branding
  drawTextRight(page, 'Generated via Client Ledger', rightMargin, 30, 8, helvetica, mutedText);

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
