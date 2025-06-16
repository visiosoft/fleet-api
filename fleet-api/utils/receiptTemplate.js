const generateReceiptHTML = (receipt) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
            }
            .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
            }
            .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
            }
            .company-info {
                flex: 1;
            }
            .receipt-info {
                text-align: right;
                flex: 1;
            }
            .receipt-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            .client-info {
                margin: 20px 0;
                padding: 10px;
                background: #f9f9f9;
            }
            .payment-details {
                margin: 20px 0;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            th, td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .total-section {
                margin-top: 20px;
                text-align: right;
            }
            .total-amount {
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <div class="company-info">
                    <div class="receipt-title">RECEIPT</div>
                    <div><strong>${receipt.companyInfo.name}</strong></div>
                    <div>${receipt.companyInfo.address}</div>
                    <div>Email: ${receipt.companyInfo.email}</div>
                </div>
                <div class="receipt-info">
                    <div><strong>Receipt No:</strong> ${receipt.receiptNumber}</div>
                    <div><strong>Date:</strong> ${new Date(receipt.paymentDate).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> ${receipt.status}</div>
                </div>
            </div>

            <div class="client-info">
                <div><strong>Client Name:</strong> ${receipt.clientName}</div>
                ${receipt.clientEmail ? `<div><strong>Email:</strong> ${receipt.clientEmail}</div>` : ''}
                <div><strong>Invoice Reference:</strong> ${receipt.invoiceId}</div>
            </div>

            <div class="payment-details">
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Payment for Invoice ${receipt.invoiceId}</td>
                            <td>${receipt.amount.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="total-section">
                <div><strong>Payment Method:</strong> ${receipt.paymentMethod}</div>
                <div><strong>Reference Number:</strong> ${receipt.referenceNumber}</div>
                <div class="total-amount">Total Amount: ${receipt.amount.toFixed(2)}</div>
            </div>

            ${receipt.notes ? `
            <div class="notes">
                <strong>Notes:</strong><br>
                ${receipt.notes}
            </div>
            ` : ''}

            <div class="footer">
                <p>This is a computer-generated receipt and does not require a signature.</p>
                <p>Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generateReceiptHTML
}; 