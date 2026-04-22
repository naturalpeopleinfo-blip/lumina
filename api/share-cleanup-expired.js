const {
  json,
  handleCors,
  formatErrorDetail,
  removeStorageObjects,
  supabaseRest
} = require("./_share-utils");

const DEFAULT_PERMANENT_SHARE_TOKENS = ["a74178667ac22c20c574e91e2bfd47951614"];

function getPermanentShareTokens() {
  return String(process.env.PERMANENT_SHARE_TOKENS || "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .concat(DEFAULT_PERMANENT_SHARE_TOKENS);
}

function isPermanentShareToken(token) {
  return getPermanentShareTokens().includes(String(token || ""));
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const rows = await supabaseRest(
      "/rest/v1/shared_reports?expires_at=lt." + encodeURIComponent(new Date().toISOString()) + "&select=id,token,preview_image_path,report_payload",
      { method: "GET" }
    );

    const expiredReports = (Array.isArray(rows) ? rows : []).filter(function (report) {
      return !isPermanentShareToken(report.token);
    });

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
      detail: formatErrorDetail(error)
    });
  }
};
