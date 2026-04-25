import type { Quotation, Invoice, Client, BusinessSettings } from '@/types';
import { currencySymbols } from '@/types';

interface DocumentData {
  type: 'quotation' | 'invoice';
  document: Quotation | Invoice;
  client?: Client;
  settings: BusinessSettings;
}

// Convert number to words for amount display
function numberToWords(num: number, currency: string): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  const isOmani = currency === 'OMR';
  const currencyUnit = isOmani ? 'Omani Rial' : 'Rupee';
  const currencyUnitPlural = isOmani ? 'Omani Rials' : 'Rupees';

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const tenPlace = Math.floor(n / 10);
      const remainder = n % 10;
      return tens[tenPlace] + (remainder ? ' ' + ones[remainder] : '');
    }
    const hundredPlace = Math.floor(n / 100);
    const afterHundred = n % 100;
    return ones[hundredPlace] + ' Hundred' + (afterHundred ? ' ' + convertBelowThousand(afterHundred) : '');
  }

  const intPart = Math.floor(num);
  const decimalPart = Math.round((num - intPart) * 100);

  if (intPart === 0) {
    return `Zero ${currencyUnitPlural} Only`;
  }

  let result = '';
  let scaleIndex = 0;
  let temp = intPart;

  while (temp > 0) {
    const chunk = temp % (scaleIndex === 0 ? 1000 : scaleIndex === 1 ? 1000 : 10000000);
    if (chunk !== 0) {
      result = convertBelowThousand(chunk) + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + result;
    }
    temp = Math.floor(temp / (scaleIndex === 0 ? 1000 : scaleIndex === 1 ? 1000 : 10000000));
    scaleIndex++;
  }

  result = result.trim() + ' ' + (intPart === 1 ? currencyUnit : currencyUnitPlural);

  if (decimalPart > 0) {
    result += ' and ' + convertBelowThousand(decimalPart) + ' Fils';
  }

  result += ' Only';
  return result;
}

export async function generatePDF({ type, document, client, settings, download = false }: DocumentData & { download?: boolean }) {
  const currencySymbol = currencySymbols[settings.currency];
  
  // Create a printable HTML version
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('POPUP_BLOCKED');
  }

  const isInvoice = type === 'invoice';
  const invoice = isInvoice ? (document as Invoice) : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.number}</title>
      <style>
        @page {
          size: A4;
          margin: 10mm 10mm 10mm 10mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          color: #1a1a2e;
          max-width: 100%;
          margin: 0 auto;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
        }
        .logo {
          width: 45px;
          height: 45px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 20px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 3px;
          letter-spacing: -0.5px;
        }
        .company-details {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.3;
        }
        .header-right {
          text-align: right;
          min-width: 150px;
        }
        .doc-type {
          font-size: 25px;
          font-weight: 700;
          text-transform: uppercase;
          color: ${isInvoice ? '#059669' : '#2563eb'};
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .doc-number {
          font-size: 16px;
          color: #374151;
          margin-bottom: 2px;
          font-weight: 600;
        }
        .doc-date {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.3;
        }
        
        .parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 12px;
          padding: 8px 0;
        }
        .party-section h3 {
          font-size: 10px;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 4px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .party-name { 
          font-size: 13px; 
          font-weight: 700; 
          margin-bottom: 3px;
          color: #1a1a2e;
        }
        .party-details { 
          font-size: 13px; 
          color: #4b5563; 
          line-height: 1.4;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 12px;
        }
        th { 
          background: #f8fafc; 
          padding: 8px 8px; 
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          color: #374151;
          letter-spacing: 0.5px;
          font-weight: 700;
          border-top: 1.5px solid #d1d5db;
          border-bottom: 1.5px solid #d1d5db;
        }
        th:last-child { text-align: right; }
        td {
          padding: 6px 8px;
          border-bottom: 0.5px solid #f3f4f6;
          font-size: 11px;
          color: #1a1a2e;
        }
        td:last-child { text-align: right; }
        tr:last-child td { border-bottom: 1px solid #d1d5db; }
        .item-name { 
          font-weight: 600;
          color: #1a1a2e;
          font-size: 11px;
        }
        .item-desc { 
          font-size: 13px; 
          color: #6b7280; 
          margin-top: 1px;
        }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .totals-box {
          width: 250px;
          background: #f8fafc;
          border-radius: 4px;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .total-row span:last-child {
          font-weight: 600;
          color: #1a1a2e;
        }
        .total-row.grand { 
          font-size: 13px; 
          font-weight: 700;
          border-top: 1px solid #d1d5db;
          margin-top: 6px;
          padding-top: 6px;
          color: #1a1a2e;
        }
        
        .notes-section {
          background: #f8fafc;
          padding: 8px 10px;
          border-radius: 4px;
          margin-bottom: 8px;
          border: 0.5px solid #d1d5db;
        }
        .notes-section h4 { 
          font-size: 9px; 
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 4px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }
        .notes-section p { 
          font-size: 11px; 
          color: #4b5563; 
          line-height: 1.4;
        }
        
        .footer {
          text-align: center;
          padding-top: 8px;
          border-top: 0.5px solid #d1d5db;
          font-size: 10px;
          color: #9ca3af;
          margin-top: 8px;
        }
        
        @media print {
          body { padding: 8px 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${settings.name || 'Your Business'}</div>
          <div class="company-details">
            ${settings.phone ? `📞 ${settings.phone}<br>` : ''}
            ${settings.email ? `✉️ ${settings.email}<br>` : ''}
            ${settings.address ? `📍 ${settings.address}` : ''}
            ${settings.taxNumber ? `GST: ${settings.taxNumber}` : ''}
          </div>
        </div>
        <div class="logo-section">
          ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo">` : ''}
        </div>
        <div class="doc-info">
          <div class="doc-type">${type}</div>
          <div class="doc-number">${document.number}</div>
          <div class="doc-date">Date: ${new Date(document.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
      </div>
      
      <div class="parties">
        <div class="party-section">
          <h3>Bill To</h3>
          <div class="party-name">${client?.name || 'Client'}</div>
          <div class="party-details">
            ${client?.email ? `${client.email}<br>` : ''}
            ${client?.phone ? `${client.phone}<br>` : ''}
            ${client?.address || ''}
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-size:12px;color:#6b7280;">Invoice/Quote #: <strong style="color:#111827;">${document.number}</strong></div>
        <div style="font-size:12px;color:#6b7280;">Billing Date: ${new Date(document.createdAt).toLocaleDateString('en-IN')}</div>
        ${isInvoice && invoice ? `<div style="font-size:12px;color:#6b7280;">Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">S.No</th>
            <th>Description</th>
            <th style="width: 80px;">Qty</th>
            <th style="width: 120px;">Rate</th>
            <th style="width: 120px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${document.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>
                <div class="item-name">${item.name}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </td>
              <td>${item.quantity}</td>
              <td>${currencySymbol}${item.rate.toLocaleString('en-IN')}</td>
              <td>${currencySymbol}${(item.total + (item.vatApplicable ? (item.vatAmount ?? 0) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${currencySymbol}${document.items.reduce((s, i) => s + i.total, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row">
            <span>VAT</span>
            <span>${currencySymbol}${document.items.reduce((s, i) => s + (i.vatApplicable ? (i.vatAmount ?? 0) : 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row">
            <span>Total After VAT</span>
            <span>${currencySymbol}${document.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row grand">
            <span>Grand Total</span>
            <span>${currencySymbol}${document.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 30px; padding: 15px; background: #fafbfc; border-radius: 8px;">
        <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">
          <strong>Amount in Words:</strong> ${numberToWords(document.netTotal, settings.currency)}
        </p>
      </div>
      
      ${(settings.bankName || settings.bankAccountNumber) ? `
        <div class="notes-section">
          <h4>Account Details</h4>
          <p>
            ${settings.bankName ? `<strong>Bank:</strong> ${settings.bankName}<br>` : ''}
            ${settings.bankAccountNumber ? `<strong>Account No:</strong> ${settings.bankAccountNumber}` : ''}
          </p>
        </div>
      ` : ''}

      ${document.notes ? `
        <div class="notes-section">
          <h4>Notes</h4>
          <p>${document.notes}</p>
        </div>
      ` : ''}
      
      ${document.terms ? `
        <div class="notes-section">
          <h4>Terms & Conditions</h4>
          <p>${document.terms}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        Thank you for your business!
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  if (download) {
    // Open print preview instead of direct PDF download
    // User can save as PDF from print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('POPUP_BLOCKED');
    }

    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Original print functionality when not downloading
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('POPUP_BLOCKED');
    }

    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export async function shareViaWhatsApp({ type, document, client, settings }: DocumentData) {
  const currencySymbol = currencySymbols[settings.currency];
  const isInvoice = type === 'invoice';
  
  // First, generate and open the PDF in a new window for printing/saving
  try {
    await generatePDF({ type, document, client, settings });
  } catch (err) {
    console.error('PDF generation for WhatsApp sharing failed:', err);
  }

  // Prepare the WhatsApp message with invoice details and amount in words
  const netTotal = document.netTotal;
  const amountInWords = numberToWords(netTotal, settings.currency);
  
  const message = encodeURIComponent(
    `Hi ${client?.name || 'Client'},\n\n` +
    `${isInvoice ? 'Please find invoice' : 'Please find quotation'} details below:\n\n` +
    `📄 ${type.charAt(0).toUpperCase() + type.slice(1)}: ${document.number}\n` +
    `💰 Amount: ${currencySymbol}${netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
    `📝 Amount in Words: ${amountInWords}\n` +
    `📅 Date: ${new Date(document.createdAt).toLocaleDateString('en-IN')}\n` +
    `${isInvoice ? `⏰ Due Date: ${new Date((document as Invoice).dueDate).toLocaleDateString('en-IN')}\n` : ''}` +
    `\n📎 Please find the PDF ${type} attached.\n` +
    `\nFrom: ${settings.name || 'Your Business'}\n` +
    `${settings.phone ? `📞 ${settings.phone}` : ''}`
  );

  const phoneNumber = client?.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;

  // Open WhatsApp in a new tab/window
  window.open(whatsappUrl, '_blank');
}

// Helper function to generate PDF as blob
export async function generatePDFBlob({ type, document, client, settings }: DocumentData) {
  const currencySymbol = currencySymbols[settings.currency];
  const isInvoice = type === 'invoice';
  const invoice = isInvoice ? (document as Invoice) : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${document.number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
          padding: 40px;
          color: #1a1a2e;
          max-width: 850px;
          margin: 0 auto;
          background: white;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          margin-bottom: 50px;
          padding-bottom: 30px;
          border-bottom: 3px solid #e5e7eb;
        }
        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          flex: 1;
        }
        .logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .company-details {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
        }
        .header-right {
          text-align: right;
          min-width: 200px;
        }
        .doc-type { 
          font-size: 28px; 
          font-weight: 700; 
          text-transform: uppercase;
          color: ${isInvoice ? '#059669' : '#2563eb'};
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .doc-number { 
          font-size: 18px; 
          color: #374151; 
          margin-bottom: 6px;
          font-weight: 600;
        }
        .doc-date { 
          font-size: 13px; 
          color: #6b7280;
          line-height: 1.6;
        }
        
        .parties { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px;
          margin-bottom: 40px;
          padding: 25px 0;
        }
        .party-section h3 { 
          font-size: 11px; 
          text-transform: uppercase; 
          color: #6b7280;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .party-name { 
          font-size: 15px; 
          font-weight: 700; 
          margin-bottom: 6px;
          color: #1a1a2e;
        }
        .party-details { 
          font-size: 13px; 
          color: #4b5563; 
          line-height: 1.7;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 35px;
        }
        th { 
          background: #f8fafc; 
          padding: 14px 16px; 
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #374151;
          letter-spacing: 0.6px;
          font-weight: 700;
          border-top: 2px solid #e5e7eb;
          border-bottom: 2px solid #e5e7eb;
        }
        th:last-child { text-align: right; }
        td { 
          padding: 13px 16px; 
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
          color: #1a1a2e;
        }
        td:last-child { text-align: right; }
        tr:last-child td { border-bottom: 2px solid #e5e7eb; }
        .item-name { 
          font-weight: 600;
          color: #1a1a2e;
        }
        .item-desc { 
          font-size: 12px; 
          color: #6b7280; 
          margin-top: 4px;
        }
        
        .totals { 
          display: flex; 
          justify-content: flex-end;
          margin-bottom: 35px;
        }
        .totals-box { 
          width: 280px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between;
          padding: 10px 0;
          font-size: 13px;
          color: #6b7280;
        }
        .total-row span:last-child {
          font-weight: 600;
          color: #1a1a2e;
        }
        .total-row.grand { 
          font-size: 18px; 
          font-weight: 700;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
          padding-top: 14px;
          color: #1a1a2e;
        }
        
        .amount-in-words {
          margin-bottom: 35px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .amount-in-words p {
          font-size: 13px;
          color: #4b5563;
          line-height: 1.7;
          font-weight: 500;
        }
        
        .notes-section { 
          background: #f8fafc; 
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 18px;
          border: 1px solid #e5e7eb;
        }
        .notes-section h4 { 
          font-size: 11px; 
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .notes-section p { 
          font-size: 13px; 
          color: #4b5563; 
          line-height: 1.7;
        }
        
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #9ca3af;
        }
        
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${settings.name || 'Your Business'}</div>
          <div class="company-details">
            ${settings.phone ? `📞 ${settings.phone}<br>` : ''}
            ${settings.email ? `✉️ ${settings.email}<br>` : ''}
            ${settings.address ? `📍 ${settings.address}` : ''}
          </div>
        </div>
        <div class="logo-section">
          ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo">` : ''}
        </div>
        <div class="doc-info">
          <div class="doc-type">${type}</div>
          <div class="doc-number">${document.number}</div>
          <div class="doc-date">Date: ${new Date(document.createdAt).toLocaleDateString('en-IN')}</div>
          ${isInvoice && invoice ? `<div class="doc-date">Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>` : ''}
        </div>
      </div>
      
      <div class="parties">
        <div class="party-section">
          <h3>From</h3>
          <div class="party-name">${settings.name || 'Your Business'}</div>
          <div class="party-details">
            ${settings.address ? `${settings.address}<br>` : ''}
            ${settings.taxNumber ? `GST: ${settings.taxNumber}` : ''}
          </div>
        </div>
        <div class="party-section">
          <h3>Bill To</h3>
          <div class="party-name">${client?.name || 'Client'}</div>
          <div class="party-details">
            ${client?.email ? `${client.email}<br>` : ''}
            ${client?.phone ? `${client.phone}<br>` : ''}
            ${client?.address || ''}
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">S.No</th>
            <th>Description</th>
            <th style="width: 80px;">Qty</th>
            <th style="width: 120px;">Rate</th>
            <th style="width: 120px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${document.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>
                <div class="item-name">${item.name}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </td>
              <td>${item.quantity}</td>
              <td>${currencySymbol}${item.rate.toLocaleString('en-IN')}</td>
              <td>${currencySymbol}${(item.total + (item.vatApplicable ? (item.vatAmount ?? 0) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${currencySymbol}${document.items.reduce((s, i) => s + i.total, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row">
            <span>VAT</span>
            <span>${currencySymbol}${document.items.reduce((s, i) => s + (i.vatApplicable ? (i.vatAmount ?? 0) : 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row">
            <span>Total After VAT</span>
            <span>${currencySymbol}${document.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row grand">
            <span>Grand Total</span>
            <span>${currencySymbol}${document.netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      <div class="amount-in-words">
        <p><strong>Amount in Words:</strong> ${numberToWords(document.netTotal, settings.currency)}</p>
      </div>
      
      ${(settings.bankName || settings.bankAccountNumber) ? `
        <div class="notes-section">
          <h4>Account Details</h4>
          <p>
            ${settings.bankName ? `<strong>Bank:</strong> ${settings.bankName}<br>` : ''}
            ${settings.bankAccountNumber ? `<strong>Account No:</strong> ${settings.bankAccountNumber}` : ''}
          </p>
        </div>
      ` : ''}

      ${document.notes ? `
        <div class="notes-section">
          <h4>Notes</h4>
          <p>${document.notes}</p>
        </div>
      ` : ''}
      
      ${document.terms ? `
        <div class="notes-section">
          <h4>Terms & Conditions</h4>
          <p>${document.terms}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        Thank you for your business!
      </div>
    </body>
    </html>
  `;

  // Update HTML with new header structure
  const updatedHtml = html.replace(
    /<div class="header">[\s\S]*?<\/div>/,
    `<div class="header">
      <div class="header-left">
        ${settings.logo ? `<img src="${settings.logo}" class="logo" alt="Logo">` : ''}
        <div class="company-info">
          <div class="company-name">${settings.name || 'Your Business'}</div>
          <div class="company-details">
            ${settings.phone ? `${settings.phone}<br>` : ''}
            ${settings.email ? `${settings.email}<br>` : ''}
            ${settings.address ? `${settings.address}` : ''}
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-type">${type}</div>
        <div class="doc-number">${document.number}</div>
        <div class="doc-date">Date: ${new Date(document.createdAt).toLocaleDateString('en-IN')}</div>
        ${isInvoice && invoice ? `<div class="doc-date">Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</div>` : ''}
      </div>
    </div>`
  );

  return updatedHtml;
}
