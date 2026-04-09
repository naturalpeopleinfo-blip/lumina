const DEFAULT_LIVE_CHECKOUT_URL = "https://buy.stripe.com/4gM5kC0zg4AL5b04siffy01";

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function normalizeMode(value) {
  return String(value || "").toLowerCase() === "test" ? "test" : "live";
}

function getCheckoutUrl(mode) {
  if (mode === "test") {
    return process.env.STRIPE_PRO_CHECKOUT_URL_TEST || "";
  }

  return process.env.STRIPE_PRO_CHECKOUT_URL || DEFAULT_LIVE_CHECKOUT_URL;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const mode = normalizeMode(req.query && req.query.mode);
  const checkoutUrl = getCheckoutUrl(mode);

  if (!checkoutUrl) {
    return json(res, 404, { error: "Checkout URL is not configured", mode: mode });
  }

  return json(res, 200, {
    mode: mode,
    checkoutUrl: checkoutUrl
  });
};
