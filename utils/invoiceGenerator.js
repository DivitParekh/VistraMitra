import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// ✅ Enhanced VastraMitra Invoice Generator with Working Local Logo
export const generateInvoice = async (orderData) => {
  try {
    const {
      orderId,
      customerName,
      fabric,
      styleCategory,
      totalCost,
      advancePaid,
      balanceDue,
      date,
      address,
      paymentStatus = 'Advance Paid',
    } = orderData;

    // 🖼️ Load local logo asset & convert to base64
    const logoAsset = Asset.fromModule(require('../assets/logo.jpg'));
    await logoAsset.downloadAsync(); // ensure the image is available
    const logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const logoUrl = `data:image/jpeg;base64,${logoBase64}`;

    // 🎨 Payment color
    const statusColor =
      paymentStatus === 'Full Paid'
        ? '#2ecc71'
        : paymentStatus === 'Advance Paid'
        ? '#f1c40f'
        : '#e74c3c';

    // 🧾 HTML template
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body {
              font-family: 'Poppins', Arial, sans-serif;
              background-color: #f7f9fc;
              margin: 0;
              padding: 0;
              color: #2c3e50;
            }
            .invoice-container {
              max-width: 750px;
              background: #fff;
              margin: 40px auto;
              border-radius: 12px;
              padding: 30px 40px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #007bff;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header img {
              width: 110px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              color: #007bff;
              font-size: 26px;
              margin: 0;
              font-weight: 700;
            }
            .sub-info {
              text-align: center;
              font-size: 14px;
              color: #555;
              margin-top: 6px;
            }
            hr {
              border: none;
              border-top: 1px solid #eee;
              margin: 25px 0;
            }
            .section-title {
              color: #007bff;
              font-weight: 600;
              margin-bottom: 8px;
              font-size: 17px;
            }
            p {
              margin: 5px 0;
              font-size: 14px;
              line-height: 1.4;
            }
            .details {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: #444;
            }
            .details div {
              width: 48%;
            }
            .amount-section {
              background-color: #f9fbff;
              border: 1px solid #e5e9f2;
              border-radius: 8px;
              padding: 16px;
              margin-top: 10px;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
              font-size: 15px;
            }
            .amount-total {
              border-top: 1px solid #ccc;
              padding-top: 6px;
              color: #007bff;
              font-weight: 600;
            }
            .payment-status {
              text-align: center;
              margin-top: 20px;
              padding: 10px;
              border-radius: 8px;
              color: #fff;
              background-color: ${statusColor};
              font-weight: 600;
              font-size: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 13px;
              color: #777;
              border-top: 1px solid #eee;
              padding-top: 15px;
            }
            .footer strong {
              color: #007bff;
            }
          </style>
        </head>

        <body>
          <div class="invoice-container">
            <div class="header">
              <img src="${logoUrl}" alt="VastraMitra Logo" />
              <h1>VastraMitra Invoice</h1>
              <div class="sub-info">Crafting Elegance with Precision</div>
            </div>

            <div class="details">
              <div>
                <p><strong>Invoice ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              </div>
              <div style="text-align:right">
                <p><strong>Contact:</strong> +91 98765 43210</p>
                <p><strong>Email:</strong> support@vastramitra.com</p>
              </div>
            </div>

            <hr/>

            <div>
              <h3 class="section-title">Customer Details</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Address:</strong> ${address || 'N/A'}</p>
            </div>

            <hr/>

            <div>
              <h3 class="section-title">Order Details</h3>
              <p><strong>Style:</strong> ${styleCategory || 'Custom Design'}</p>
              <p><strong>Fabric:</strong> ${fabric || 'Own Fabric'}</p>
            </div>

            <div class="amount-section">
              <div class="amount-row"><span>Total Cost</span><span>₹${totalCost}</span></div>
              <div class="amount-row"><span>Advance Paid</span><span>₹${advancePaid}</span></div>
              <div class="amount-row amount-total"><span>Remaining Balance</span><span>₹${balanceDue}</span></div>
            </div>

            <div class="payment-status">
              Payment Status: ${paymentStatus}
            </div>

            <div class="footer">
              <p>Thank you for trusting <strong>VastraMitra</strong>! We’re proud to craft your style with care 👗</p>
              <p>© ${new Date().getFullYear()} VastraMitra. All Rights Reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 🖨️ Generate invoice PDF
    const { uri } = await Print.printToFileAsync({ html });
    console.log('📄 Invoice generated at:', uri);

    // 📤 Share automatically
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    return uri;
  } catch (error) {
    console.error('❌ Invoice Generation Error:', error);
    throw error;
  }
};
