const crypto = require("crypto");

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
  return Buffer.concat(chunks).toString("utf8");
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

function getSvixSecret(secret) {
  const value = String(secret || "");
  const encoded = value.startsWith("whsec_") ? value.slice(6) : value;
  return Buffer.from(encoded, "base64");
}

function verifyClerkSignature(req, rawBody) {
  const secret = process.env.CLERK_WEBHOOK_SECRET || "";
  const svixId = req.headers["svix-id"];
  const svixTimestamp = req.headers["svix-timestamp"];
  const svixSignature = req.headers["svix-signature"];

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not configured");
  }

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  const timestamp = Number(svixTimestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > 5 * 60) {
    return false;
  }

  const signedContent = svixId + "." + svixTimestamp + "." + rawBody;
  const expected = crypto
    .createHmac("sha256", getSvixSecret(secret))
    .update(signedContent)
    .digest("base64");

  return String(svixSignature)
    .split(" ")
    .some(function (item) {
      const parts = item.split(",");
      if (parts[0] !== "v1") {
        return false;
      }

      const signature = parts.slice(1).join(",");
      return timingSafeEqual(signature, expected);
    });
}

function pickEmail(userData) {
  const emails = Array.isArray(userData.email_addresses) ? userData.email_addresses : [];
  const primaryId = userData.primary_email_address_id ? String(userData.primary_email_address_id) : "";
  const primary = emails.find(function (item) {
    return String(item.id || "") === primaryId;
  }) || emails[0];

  return primary && primary.email_address ? String(primary.email_address) : "";
}

function pickName(userData) {
  const parts = [userData.first_name, userData.last_name]
    .map(function (value) {
      return String(value || "").trim();
    })
    .filter(Boolean);

  return parts.join(" ") || String(userData.username || "").trim() || "未設定";
}

function formatJstDate(value) {
  const date = value ? new Date(Number(value)) : new Date();

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

async function sendNotificationEmail(userData) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const to = process.env.ADMIN_NOTIFY_EMAIL || "";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!to) {
    throw new Error("ADMIN_NOTIFY_EMAIL is not configured");
  }

  const email = pickEmail(userData);
  const name = pickName(userData);
  const clerkUserId = String(userData.id || "");
  const createdAt = formatJstDate(userData.created_at);
  const subject = "【Lumina Zone】新規ユーザー登録がありました";
  const text = [
    "Lumina Zoneに新規ユーザー登録がありました。",
    "",
    "名前: " + name,
    "メール: " + (email || "未設定"),
    "Clerk User ID: " + (clerkUserId || "未設定"),
    "登録日時: " + createdAt,
    "初期プラン: free"
  ].join("\n");
  const html = [
    "<div style=\"font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;line-height:1.7;\">",
    "<h2 style=\"margin:0 0 16px;\">Lumina Zone 新規ユーザー登録</h2>",
    "<p style=\"margin:0 0 18px;\">新しいユーザーが登録されました。</p>",
    "<table style=\"border-collapse:collapse;width:100%;max-width:560px;\">",
    rowHtml("名前", name),
    rowHtml("メール", email || "未設定"),
    rowHtml("Clerk User ID", clerkUserId || "未設定"),
    rowHtml("登録日時", createdAt),
    rowHtml("初期プラン", "free"),
    "</table>",
    "</div>"
  ].join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject: subject,
      text: text,
      html: html
    })
  });

  const result = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(result && result.message ? result.message : "Failed to send notification email");
  }

  return result;
}

function rowHtml(label, value) {
  return [
    "<tr>",
    "<th style=\"text-align:left;width:140px;padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:13px;\">",
    escapeHtml(label),
    "</th>",
    "<td style=\"padding:10px 12px;border:1px solid #e5e7eb;font-size:14px;\">",
    escapeHtml(value),
    "</td>",
    "</tr>"
  ].join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const rawBody = await readRawBody(req);

    if (!verifyClerkSignature(req, rawBody)) {
      return json(res, 401, { error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.type !== "user.created") {
      return json(res, 200, { ok: true, skipped: true });
    }

    const result = await sendNotificationEmail(event.data || {});
    return json(res, 200, { ok: true, emailId: result && result.id ? result.id : "" });
  } catch (error) {
    console.error("clerk-user-created notification failed", error);
    return json(res, 500, {
      error: "Failed to process user notification",
      detail: error && error.message ? error.message : String(error)
    });
  }
};
