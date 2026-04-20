const {
  json,
  handleCors,
  createSignedUrl,
  supabaseRest
} = require("./_share-utils");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const token = String((req.query && req.query.token) || "").trim();

    if (!token) {
      return json(res, 400, { error: "Missing token" });
    }

    const rows = await supabaseRest(
      "/rest/v1/shared_reports?token=eq." + encodeURIComponent(token) + "&select=*",
      { method: "GET" }
    );
    const record = Array.isArray(rows) ? rows[0] : rows;

    if (!record) {
      return json(res, 404, { error: "Not found" });
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      return json(res, 410, {
        error: "Expired",
        message: "この共有URLの有効期限は切れています。"
      });
    }

    const pages = Array.isArray(record.report_payload && record.report_payload.pages)
      ? record.report_payload.pages
      : [];

    const hydratedPages = [];

    for (const page of pages) {
      const previewImageUrl = page.previewImagePath
        ? await createSignedUrl(page.previewImagePath, 60 * 60)
        : "";

      const flags = [];
      for (const flag of page.flags || []) {
        flags.push(
          Object.assign({}, flag, {
            previewFrameUrl: flag.previewFramePath
              ? await createSignedUrl(flag.previewFramePath, 60 * 60)
              : previewImageUrl
          })
        );
      }

      hydratedPages.push({
        pageIndex: Number(page.pageIndex || 0),
        pageCount: Number(page.pageCount || 1),
        previewImageUrl: previewImageUrl,
        flags: flags
      });
    }

    return json(res, 200, {
      token: record.token,
      fileName: record.file_name,
      durationText: record.duration_text,
      resolutionText: record.resolution_text,
      settingsKey: record.platform_key,
      platformLabels: record.platform_labels || [],
      instructionCount: Number(record.instruction_count || 0),
      expiresAt: record.expires_at,
      pages: hydratedPages
    });
  } catch (error) {
    console.error("share-get failed", error);
    return json(res, 500, {
      error: "Failed to fetch shared report",
      detail: error && error.message ? error.message : "unknown_error"
    });
  }
};
