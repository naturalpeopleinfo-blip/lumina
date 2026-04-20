const {
  json,
  handleCors,
  removeStorageObjects,
  supabaseRest
} = require("./_share-utils");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const rows = await supabaseRest(
      "/rest/v1/shared_reports?expires_at=lt." + encodeURIComponent(new Date().toISOString()) + "&select=id,preview_image_path,report_payload",
      { method: "GET" }
    );

    const expiredReports = Array.isArray(rows) ? rows : [];

    for (const report of expiredReports) {
      const pagePaths = Array.isArray(report.report_payload && report.report_payload.pages)
        ? report.report_payload.pages.reduce(function (accumulator, page) {
            if (page.previewImagePath) {
              accumulator.push(page.previewImagePath);
            }
            (page.flags || []).forEach(function (flag) {
              if (flag.previewFramePath) {
                accumulator.push(flag.previewFramePath);
              }
            });
            return accumulator;
          }, [])
        : [];

      await removeStorageObjects(pagePaths);

      await supabaseRest("/rest/v1/shared_reports?id=eq." + encodeURIComponent(String(report.id)), {
        method: "DELETE",
        headers: {
          Prefer: "return=minimal"
        }
      });
    }

    return json(res, 200, {
      deleted: expiredReports.length
    });
  } catch (error) {
    console.error("share-cleanup-expired failed", error);
    return json(res, 500, {
      error: "Failed to cleanup expired reports",
      detail: error && error.message ? error.message : "unknown_error"
    });
  }
};
