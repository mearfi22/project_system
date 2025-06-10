import { format } from "date-fns";

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptData {
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    receipt_footer: string;
  };
  transaction: {
    id: number;
    reference_number: string;
    date: string;
    customer_name: string;
    cashier: string;
    items: ReceiptItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payment_method: string;
    payment_status: string;
  };
}

const printReceipt = (receiptData: ReceiptData) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const { business, transaction } = receiptData;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${transaction.reference_number}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          margin: 0;
          padding: 20px;
          width: 300px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .mb-1 { margin-bottom: 8px; }
        .mb-2 { margin-bottom: 16px; }
        .border-top { border-top: 1px dashed #000; padding-top: 8px; }
        .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 8px; }
        table { width: 100%; }
        th, td { padding: 4px 0; }
        .receipt-header { font-size: 14px; }
        .receipt-body { font-size: 12px; }
        .receipt-footer { font-size: 12px; }
        @media print {
          body { width: 80mm; }
          @page { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <div class="text-center mb-2">
          <h2 style="margin: 0;">${business.name}</h2>
          <div>${business.address}</div>
          <div>Tel: ${business.phone}</div>
          <div>${business.email}</div>
        </div>
        
        <div class="border-bottom mb-2">
          <div>Receipt #: ${transaction.reference_number}</div>
          <div>Date: ${format(new Date(transaction.date), "PPp")}</div>
          <div>Customer: ${transaction.customer_name}</div>
          <div>Cashier: ${transaction.cashier}</div>
        </div>
      </div>

      <div class="receipt-body">
        <table class="mb-2">
          <thead>
            <tr>
              <th style="text-align: left">Item</th>
              <th style="text-align: right">Qty</th>
              <th style="text-align: right">Price</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right">${item.quantity}</td>
                <td style="text-align: right">${business.currency}${Number(
                  item.unit_price
                ).toFixed(2)}</td>
                <td style="text-align: right">${business.currency}${Number(
                  item.total
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="border-top mb-2">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">${business.currency}${Number(
    transaction.subtotal
  ).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td class="text-right">${business.currency}${Number(
    transaction.discount
  ).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td class="text-right">${business.currency}${Number(
    transaction.tax
  ).toFixed(2)}</td>
            </tr>
            <tr>
              <th>Total:</th>
              <th class="text-right">${business.currency}${Number(
    transaction.total
  ).toFixed(2)}</th>
            </tr>
            <tr>
              <td>Payment Method:</td>
              <td class="text-right">${transaction.payment_method}</td>
            </tr>
            <tr>
              <td>Status:</td>
              <td class="text-right">${transaction.payment_status}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="receipt-footer text-center border-top">
        <p>${business.receipt_footer}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };
};

export default printReceipt;
