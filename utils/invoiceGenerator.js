import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ✅ VastraMitra Invoice Generator — Final Professional Version (Full Paid)
export const generateInvoice = async (orderData) => {
  try {
    const {
      orderId,
      customerName,
      fabric,
      styleCategory,
      totalCost = 0,
      date,
      address,
    } = orderData;

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

            body {
              font-family: 'Poppins', Arial, sans-serif;
              background-color: #f9fafc;
              color: #2c3e50;
              margin: 0;
              padding: 0;
            }

            .invoice-container {
              max-width: 750px;
              background: #fff;
              margin: 40px auto;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }

            .header {
              text-align: center;
              border-bottom: 3px solid #007bff;
              padding-bottom: 12px;
              margin-bottom: 30px;
            }

            .header h1 {
              font-size: 30px;
              color: #007bff;
              margin-bottom: 4px;
            }

            .header p {
              font-size: 14px;
              color: #555;
              margin: 0;
            }

            .invoice-info {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: #555;
              margin-bottom: 25px;
            }

            .section {
              margin-top: 24px;
            }

            .section h2 {
              font-size: 18px;
              color: #007bff;
              border-left: 4px solid #007bff;
              padding-left: 8px;
              margin-bottom: 10px;
            }

            .details p {
              margin: 5px 0;
              font-size: 14px;
              color: #333;
            }

            .amount-box {
              border: 1px solid #e0e0e0;
              border-radius: 10px;
              padding: 20px;
              margin-top: 25px;
              background-color: #f6f9ff;
            }

            .amount-total {
              display: flex;
              justify-content: space-between;
              font-size: 16px;
              font-weight: 700;
              color: #007bff;
              border-top: 1px solid #ccc;
              margin-top: 10px;
              padding-top: 8px;
            }

            .status {
              background-color: #27ae60;
              color: #fff;
              padding: 12px;
              border-radius: 8px;
              text-align: center;
              margin-top: 30px;
              font-weight: 600;
              font-size: 15px;
              letter-spacing: 0.4px;
            }

            .footer {
              text-align: center;
              color: #888;
              font-size: 13px;
              border-top: 1px solid #ddd;
              margin-top: 40px;
              padding-top: 15px;
            }

            .footer strong {
              color: #007bff;
            }

            .footer p {
              margin: 4px 0;
            }
          </style>
        </head>

        <body>
          <div class="invoice-container">
            <!-- HEADER -->
            <div class="header">
              <h1>VastraMitra Invoice</h1>
              <p>Smart Tailoring Assistant Platform</p>
            </div>

            <!-- INFO -->
            <div class="invoice-info">
              <p><strong>Invoice ID:</strong> ${orderId}</p>
              <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            </div>

            <!-- CUSTOMER DETAILS -->
            <div class="section">
              <h2>Customer Details</h2>
              <div class="details">
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Address:</strong> ${address || 'N/A'}</p>
              </div>
            </div>

            <!-- ORDER DETAILS -->
            <div class="section">
              <h2>Order Details</h2>
              <div class="details">
                <p><strong>Style:</strong> ${styleCategory || 'Custom Design'}</p>
                <p><strong>Fabric:</strong> ${fabric || 'Own Fabric'}</p>
              </div>
            </div>

            <!-- PAYMENT -->
            <div class="amount-box">
              <div class="amount-total">
                <span>Total Amount</span><span>₹${totalCost}</span>
              </div>
            </div>

            <!-- STATUS -->
            <div class="status">Payment Status: Paid in Full ✅</div>

            <!-- FOOTER -->
            <div class="footer">
              <p>Thank you for trusting <strong>VastraMitra</strong>! 👗</p>
              <p>Your satisfaction is our priority.</p>
              <p>© ${new Date().getFullYear()} VastraMitra. All Rights Reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 🖨 Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    console.log('📄 Invoice generated:', uri);

    // 📤 Share or Save Invoice
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

  } catch (error) {
    console.error('❌ Invoice Generation Error:', error);
  }
};
