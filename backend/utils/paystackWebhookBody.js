const capturePaystackWebhookBody = (req, res, buffer) => {
    if (req.originalUrl.split("?")[0].replace(/\/+$/, "") === "/api/order/webhook") {
        req.rawBody = Buffer.from(buffer);
    }
};

export default capturePaystackWebhookBody;
