const fetch = require("node-fetch");

async function sendPushNotification() {
  const expoPushToken = "ExponentPushToken[xxxxxxx]"; // copy from console
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "VastraMitra",
    body: "Your order is ready 🎉",
    data: { orderId: "123" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

sendPushNotification();
