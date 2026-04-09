const crypto = require("crypto");

const DEFAULT_SUPABASE_URL = "https://kmwnpiibbxtajdgfaouw.supabase.co";
const FREE_DAILY_LIMIT = 2;
const PRO_DAILY_LIMIT = 9999;
const ACTIVE_PRO_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseStripeSignature(headerValue) {
  return String(headerValue || "")
    .split(",")
    .reduce((acc, part) => {
      const bits = part.split("=");
      if (bits.length !== 2) {
        return acc;
      }
      const key = bits[0].trim();
      const value = bits[1].trim();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(value);
      return acc;
    }, {});
}

function safeCompareHex(left, right) {
  try {
    const leftBuffer = Buffer.from(String(left || ""), "hex");
    const rightBuffer = Buffer.from(String(right || ""), "hex");
    if (!leftBuffer.length || leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  } catch (error) {
    return false;
  }
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parsed = parseStripeSignature(signatureHeader);
  const timestamp = parsed.t && parsed.t[0];
  const signatures = parsed.v1 || [];

  if (!timestamp || !signatures.length) {
    throw new Error("Missing Stripe signature");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - Number(timestamp)) > 300) {
    throw new Error("Stripe signature timestamp is too old");
  }

  const payload = timestamp + "." + rawBody.toString("utf8");
  const expected = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  const isValid = signatures.some((candidate) => safeCompareHex(candidate, expected));

  if (!isValid) {
    throw new Error("Invalid Stripe signature");
  }
}

function getStripeWebhookSecrets() {
  return [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET_TEST].filter(Boolean);
}

function verifyStripeSignatureAgainstKnownSecrets(rawBody, signatureHeader) {
  const secrets = getStripeWebhookSecrets();
  let lastError = null;

  if (!secrets.length) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  for (const secret of secrets) {
    try {
      verifyStripeSignature(rawBody, signatureHeader, secret);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Invalid Stripe signature");
}

function getSupabaseConfig() {
  const elevatedKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return {
    url: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
    serviceRoleKey: elevatedKey
  };
}

function isOpaqueSupabaseKey(value) {
  return /^sb_(secret|publishable)_/i.test(String(value || ""));
}

async function supabaseRequest(path, options) {
  const config = getSupabaseConfig();

  if (!config.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const response = await fetch(config.url + path, {
    method: options.method || "GET",
    headers: {
      apikey: config.serviceRoleKey,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!isOpaqueSupabaseKey(config.serviceRoleKey)) {
    response.headers;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Supabase request failed: " + response.status + " " + text);
  }

  if (response.status === 204) {
    return [];
  }

  return response.json();
}

async function upsertAppUser(record) {
  return supabaseRequest("/rest/v1/app_users?on_conflict=clerk_user_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    body: [record]
  });
}

async function updateAppUserByFilter(filterKey, filterValue, record) {
  if (!filterValue) {
    return [];
  }

  return supabaseRequest("/rest/v1/app_users?" + filterKey + "=eq." + encodeURIComponent(String(filterValue)), {
    method: "PATCH",
    body: record
  });
}

function fallbackEmailForUser(clerkUserId) {
  return "billing+" + String(clerkUserId || "unknown") + "@lumina-zone.local";
}

function buildProRecord(base) {
  return Object.assign(
    {
      plan: "pro",
      daily_limit: PRO_DAILY_LIMIT,
      beta_unlocked: false,
      pro_activated_at: new Date().toISOString()
    },
    base || {}
  );
}

function buildFreeRecord(base) {
  return Object.assign(
    {
      plan: "free",
      daily_limit: FREE_DAILY_LIMIT,
      beta_unlocked: false,
      pro_activated_at: null
    },
    base || {}
  );
}

function normalizeSubscriptionId(value) {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value.id || "";
}

function shouldGrantPro(status) {
  return ACTIVE_PRO_STATUSES.has(String(status || "").toLowerCase());
}

async function handleCheckoutCompleted(session) {
  const clerkUserId = session && session.client_reference_id ? String(session.client_reference_id) : "";
  const subscriptionId = normalizeSubscriptionId(session && session.subscription);
  const customerId = session && session.customer ? String(session.customer) : "";
  const email =
    (session && session.customer_details && session.customer_details.email) ||
    (session && session.customer_email) ||
    fallbackEmailForUser(clerkUserId);

  if (!clerkUserId) {
    return;
  }

  await upsertAppUser(
    buildProRecord({
      clerk_user_id: clerkUserId,
      email: email,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      stripe_subscription_status: "checkout_completed"
    })
  );
}

async function handleSubscriptionUpdate(subscription, isDeleted) {
  const subscriptionId = subscription && subscription.id ? String(subscription.id) : "";
  const customerId = subscription && subscription.customer ? String(subscription.customer) : "";
  const status = isDeleted ? "canceled" : String(subscription && subscription.status || "");
  const record = shouldGrantPro(status)
    ? buildProRecord({
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        stripe_subscription_status: status
      })
    : buildFreeRecord({
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        stripe_subscription_status: status
      });

  let result = await updateAppUserByFilter("stripe_subscription_id", subscriptionId, record);

  if (!result.length && customerId) {
    result = await updateAppUserByFilter("stripe_customer_id", customerId, record);
  }

  return result;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  if (!getStripeWebhookSecrets().length) {
    return json(res, 500, { error: "Missing STRIPE_WEBHOOK_SECRET" });
  }

  if (!getSupabaseConfig().serviceRoleKey) {
    return json(res, 500, { error: "Missing SUPABASE_SERVICE_ROLE_KEY" });
  }

  try {
    const rawBody = await readRawBody(req);
    verifyStripeSignatureAgainstKnownSecrets(rawBody, req.headers["stripe-signature"]);

    const event = JSON.parse(rawBody.toString("utf8"));

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data && event.data.object ? event.data.object : {});
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data && event.data.object ? event.data.object : {}, false);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionUpdate(event.data && event.data.object ? event.data.object : {}, true);
        break;
      default:
        break;
    }

    return json(res, 200, { received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return json(res, 400, { error: error && error.message ? error.message : "Webhook failed" });
  }
};
