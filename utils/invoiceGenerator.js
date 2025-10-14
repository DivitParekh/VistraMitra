// utils/invoiceGenerator.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
    } = orderData;

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1 style="text-align:center; color:#007bff;">VastraMitra Invoice</h1>
          <p><strong>Invoice ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>

          <hr/>
          <h2>Customer Details</h2>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Address:</strong> ${address || 'N/A'}</p>

          <hr/>
          <h2>Order Details</h2>
          <p><strong>Style:</strong> ${styleCategory || 'Custom Design'}</p>
          <p><strong>Fabric:</strong> ${fabric || 'Own Fabric'}</p>
          <p><strong>Total Cost:</strong> ₹${totalCost}</p>
          <p><strong>Advance Paid:</strong> ₹${advancePaid}</p>
          <p><strong>Remaining Balance:</strong> ₹${balanceDue}</p>

          <hr/>
          <h3 style="color:#27ae60;">Status: Paid in Full</h3>
          <p style="text-align:center; margin-top: 40px;">Thank you for choosing <b>VastraMitra</b>!</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    console.log("📄 Invoice file generated:", uri);

    // Optional: auto-open share dialog
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }

    return uri;
  } catch (error) {
    console.error("❌ Invoice Generation Error:", error);
    throw error;
  }
};
