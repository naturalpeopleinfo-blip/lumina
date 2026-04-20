const {
  json,
  handleCors,
  readJsonBody,
  getBaseUrl,
  supabaseRest,
  createShareToken,
  uploadDataUrl
} = require("./_share-utils");

function sanitizeFlag(flag) {
  return {
    id: String(flag.id || ""),
    reportNo: Number(flag.reportNo || 0),
    reportTitle: String(flag.reportTitle || ""),
    reportPositionShort: String(flag.reportPositionShort || ""),
    reportPositionLabel: String(flag.reportPositionLabel || ""),
    reportSeverity: String(flag.reportSeverity || "low"),
    reportStatus: String(flag.reportStatus || "pending"),
    reportStatusLabel: String(flag.reportStatusLabel || "未対応"),
    comment: String(flag.comment || ""),
    timeLabel: String(flag.timeLabel || ""),
    x: typeof flag.x === "number" ? flag.x : 0,
    y: typeof flag.y === "number" ? flag.y : 0
  };
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const token = createShareToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const pages = Array.isArray(body.pages) ? body.pages : [];

    if (!pages.length) {
      return json(res, 400, { error: "No report pages provided" });
    }

    const persistedPages = [];

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
      const page = pages[pageIndex] || {};
      const previewImagePath = page.previewImageDataUrl
        ? await uploadDataUrl(token, "page-" + (pageIndex + 1) + "-preview", page.previewImageDataUrl)
        : "";

      const flags = [];

      for (let flagIndex = 0; flagIndex < (page.flags || []).length; flagIndex += 1) {
        const flag = page.flags[flagIndex] || {};
        const frame = (page.previewFrames || []).find(function (item) {
          return String(item.id || "") === String(flag.id || "");
        });

        const previewFramePath = frame && frame.previewImageDataUrl
          ? await uploadDataUrl(token, "page-" + (pageIndex + 1) + "-flag-" + (flagIndex + 1), frame.previewImageDataUrl)
          : "";

        flags.push(
          Object.assign(sanitizeFlag(flag), {
            previewFramePath: previewFramePath
          })
        );
      }

      persistedPages.push({
        pageIndex: Number(page.pageIndex || 0),
        pageCount: Number(page.pageCount || 1),
        previewImagePath: previewImagePath,
        flags: flags
      });
    }

    const firstPage = pages[0] || {};
    const firstFlags = firstPage.flags || [];
    const payload = {
      token: token,
      file_name: String(body.fileName || firstPage.fileName || "未命名素材"),
      duration_text: String(body.durationText || firstPage.durationText || "00:00"),
      resolution_text: String(body.resolutionText || firstPage.resolutionText || "-- × --"),
      platform_key: String(body.settingsKey || firstPage.settingsKey || "all"),
      platform_labels: Array.isArray(body.platformLabels) ? body.platformLabels : [String(body.settingsLabel || firstPage.settingsLabel || "未選択")],
      instruction_count: Number(body.instructionCount || firstFlags.length || 0),
      preview_image_path: persistedPages[0] ? persistedPages[0].previewImagePath : "",
      report_payload: {
        pages: persistedPages
      },
      expires_at: expiresAt
    };

    const inserted = await supabaseRest("/rest/v1/shared_reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify([payload])
    });

    const baseUrl = getBaseUrl(req);
    const shareUrl = baseUrl ? baseUrl + "/share.html?token=" + encodeURIComponent(token) : "share.html?token=" + encodeURIComponent(token);

    return json(res, 200, {
      token: token,
      url: shareUrl,
      expiresAt: expiresAt,
      record: Array.isArray(inserted) ? inserted[0] : inserted
    });
  } catch (error) {
    console.error("share-create failed", error);
    return json(res, 500, {
      error: "Failed to create share report",
      detail: error && error.message ? error.message : "unknown_error"
    });
  }
};
