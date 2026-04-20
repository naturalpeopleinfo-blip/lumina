const crypto = require("crypto");

const DEFAULT_SUPABASE_URL = "https://kmwnpiibbxtajdgfaouw.supabase.co";
const DEFAULT_SHARE_BUCKET = "shared-report-assets";

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function formatErrorDetail(error) {
  if (!error) {
    return "unknown_error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    if (typeof error.message === "string") {
      return error.message;
    }

    try {
      return JSON.stringify(error.message);
    } catch (_stringifyMessageError) {
      return String(error.message);
    }
  }

  try {
    return JSON.stringify(error);
  } catch (_stringifyError) {
    return String(error);
  }
}

function applyCors(req, res) {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function handleCors(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function getSupabaseConfig() {
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  return {
    url: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
    serviceRoleKey: serviceRoleKey,
    bucket: process.env.SHARED_REPORT_BUCKET || DEFAULT_SHARE_BUCKET
  };
}

function getBaseUrl(req) {
  const configured = process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || "";
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  return host ? proto + "://" + host : "";
}

async function supabaseRest(path, options) {
  const config = getSupabaseConfig();

  if (!config.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const response = await fetch(config.url + path, {
    method: options.method || "GET",
    headers: Object.assign(
      {
        apikey: config.serviceRoleKey,
        Authorization: "Bearer " + config.serviceRoleKey
      },
      options.headers || {}
    ),
    body: options.body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Supabase request failed: " + response.status + " " + text);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.indexOf("application/json") >= 0) {
    return response.json();
  }

  return response.text();
}

function createShareToken() {
  return crypto.randomBytes(18).toString("hex");
}

function parseDataUrl(dataUrl) {
  const matched = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!matched) {
    throw new Error("Invalid data URL");
  }

  return {
    contentType: matched[1],
    buffer: Buffer.from(matched[2], "base64")
  };
}

function detectExtension(contentType) {
  if (/png/i.test(contentType)) {
    return "png";
  }

  if (/webp/i.test(contentType)) {
    return "webp";
  }

  return "jpg";
}

async function uploadDataUrl(token, relativeName, dataUrl) {
  const config = getSupabaseConfig();
  const parsed = parseDataUrl(dataUrl);
  const ext = detectExtension(parsed.contentType);
  const objectPath = "shared/" + token + "/" + relativeName + "." + ext;

  await supabaseRest("/storage/v1/object/" + encodeURIComponent(config.bucket) + "/" + objectPath, {
    method: "POST",
    headers: {
      "Content-Type": parsed.contentType,
      "x-upsert": "true"
    },
    body: parsed.buffer
  });

  return objectPath;
}

async function createSignedUrl(path, expiresInSeconds) {
  const config = getSupabaseConfig();
  const payload = JSON.stringify({ expiresIn: expiresInSeconds || 3600 });
  const result = await supabaseRest(
    "/storage/v1/object/sign/" + encodeURIComponent(config.bucket) + "/" + path,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload
    }
  );

  const signedPath = result && (result.signedURL || result.signedUrl || result.path || "");
  if (!signedPath) {
    throw new Error("Signed URL was not returned");
  }

  if (/^https?:\/\//i.test(signedPath)) {
    return signedPath;
  }

  return config.url + "/storage/v1" + signedPath;
}

async function removeStorageObjects(paths) {
  const config = getSupabaseConfig();
  const uniquePaths = Array.from(new Set((paths || []).filter(Boolean)));

  if (!uniquePaths.length) {
    return;
  }

  await supabaseRest("/storage/v1/object/" + encodeURIComponent(config.bucket), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prefixes: uniquePaths })
  });
}

module.exports = {
  json,
  applyCors,
  handleCors,
  formatErrorDetail,
  readJsonBody,
  getSupabaseConfig,
  getBaseUrl,
  supabaseRest,
  createShareToken,
  uploadDataUrl,
  createSignedUrl,
  removeStorageObjects
};
