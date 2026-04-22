(function () {
  "use strict";

  var state = {
    token: "",
    report: null,
    activePageIndex: 0,
    activeFlagIndex: 0
  };

  var els = {};

  function qs(id) {
    return document.getElementById(id);
  }

  function initElements() {
    els.loading = qs("shareLoading");
    els.expired = qs("shareExpired");
    els.error = qs("shareError");
    els.errorCopy = qs("shareErrorCopy");
    els.app = qs("shareApp");
    els.fileName = qs("shareFileName");
    els.meta = qs("shareMeta");
    els.expiryNote = qs("shareExpiryNote");
    els.previewMedia = document.querySelector(".share-preview-media");
    els.previewImage = qs("sharePreviewImage");
    els.pinLayer = qs("sharePinLayer");
    els.prevButton = qs("sharePrevButton");
    els.nextButton = qs("shareNextButton");
    els.currentIndex = qs("shareCurrentIndex");
    els.totalCount = qs("shareTotalCount");
    els.instructionCount = qs("shareInstructionCount");
    els.instructionList = qs("shareInstructionList");
    els.copyButton = qs("shareCopyButton");
    els.closeButton = qs("shareCloseButton");
  }

  function getToken() {
    try {
      return new URLSearchParams(window.location.search).get("token") || "";
    } catch (error) {
      return "";
    }
  }

  function isEmbedMode() {
    try {
      return new URLSearchParams(window.location.search).get("embed") === "1";
    } catch (error) {
      return false;
    }
  }

  function setView(mode, message) {
    [els.loading, els.expired, els.error, els.app].forEach(function (node) {
      node.classList.add("share-hidden");
    });

    if (mode === "loading") {
      els.loading.classList.remove("share-hidden");
      return;
    }

    if (mode === "expired") {
      els.expired.classList.remove("share-hidden");
      return;
    }

    if (mode === "error") {
      if (message) {
        els.errorCopy.textContent = message;
      }
      els.error.classList.remove("share-hidden");
      return;
    }

    els.app.classList.remove("share-hidden");
  }

  function getPlatformKeys(platformKey) {
    if (!platformKey || platformKey === "all") {
      return ["all"];
    }

    return String(platformKey)
      .split(/[+,]/)
      .map(function (item) { return item.trim().toLowerCase(); })
      .filter(Boolean);
  }

  function buildPlatformIcons(platformKey) {
    var keys = getPlatformKeys(platformKey);
    return keys.map(function (key) {
      if (key === "tiktok") {
        return '<span class="share-platform-icon share-platform-icon--tiktok" title="TikTok" aria-label="TikTok">' +
          '<svg class="share-platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path class="tiktok-cyan" d="M13.8 3.8c.4 1.6 1.4 2.8 2.9 3.6 1 .5 1.8.7 2.4.7v2.5c-.8 0-1.9-.2-3.2-.8-.6-.3-1.3-.7-1.9-1.3v7c0 3.1-2.4 5.5-5.5 5.5s-5.4-2.4-5.4-5.5 2.4-5.5 5.4-5.5c.4 0 .8 0 1.2.1v2.6a4 4 0 0 0-1.2-.2c-1.6 0-2.8 1.2-2.8 2.9 0 1.6 1.2 2.8 2.8 2.8 1.6 0 2.9-1.2 2.9-2.8V3.8h2.4Z"></path>' +
            '<path class="tiktok-red" d="M14.9 3c.4 1.5 1.5 2.8 3 3.6 1 .5 1.9.7 2.5.7v2.7c-.8 0-2-.2-3.4-.9-.7-.3-1.4-.8-2-1.4v7.2c0 3.1-2.5 5.6-5.6 5.6S3.8 18 3.8 14.9s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.6Z"></path>' +
            '<path class="tiktok-main" d="M14.4 3.3c.4 1.6 1.5 2.9 3 3.7 1 .5 1.9.7 2.4.7v2.6c-.8 0-2-.2-3.3-.9-.7-.3-1.4-.8-2-1.4v7.1c0 3.1-2.5 5.6-5.6 5.6S3.5 18.2 3.5 15.1s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.2-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3S7.5 18 9.1 18s2.9-1.3 2.9-2.9V3.3h2.4Z"></path>' +
          "</svg>" +
        "</span>";
      }

      if (key === "reels" || key === "instagram") {
        return '<span class="share-platform-icon share-platform-icon--reels" title="Instagram" aria-label="Instagram">' +
          '<svg class="share-platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 2.2A2.6 2.6 0 0 0 5.2 7.8v8.4a2.6 2.6 0 0 0 2.6 2.6h8.4a2.6 2.6 0 0 0 2.6-2.6V7.8a2.6 2.6 0 0 0-2.6-2.6H7.8Zm4.2 3.2a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0 2.1a1.5 1.5 0 1 0 0 3.1 1.5 1.5 0 0 0 0-3.1Zm4.4-2.9a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1Z"></path>' +
          "</svg>" +
        "</span>";
      }

      if (key === "shorts" || key === "youtube") {
        return '<span class="share-platform-icon share-platform-icon--shorts" title="YouTube Shorts" aria-label="YouTube Shorts">' +
          '<svg class="share-platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M10 8.3v7.4l6-3.7-6-3.7Zm9.4-2.8c.9.3 1.6 1 1.8 1.9.4 1.5.4 4.6.4 4.6s0 3.1-.4 4.6c-.2.9-.9 1.6-1.8 1.9-1.5.4-7.4.4-7.4.4s-5.9 0-7.4-.4a2.7 2.7 0 0 1-1.8-1.9c-.4-1.5-.4-4.6-.4-4.6s0-3.1.4-4.6c.2-.9.9-1.6 1.8-1.9C6.1 5.1 12 5.1 12 5.1s5.9 0 7.4.4Z"></path>' +
          "</svg>" +
        "</span>";
      }

      return '<span class="share-platform-icon share-platform-icon--all">ALL</span>';
    }).join("");
  }

  function getZoneColor(flag) {
    var zone = String((flag && (flag.reportZone || flag.zone)) || "");
    var color = String((flag && flag.reportZoneColor) || "");
    var colors = {
      top: "#ffb84d",
      right: "#5ac8fa",
      left: "#bf5af2",
      bottom: "#ff6b6b",
      center: "#34c759"
    };

    return /^#[0-9a-f]{6}$/i.test(color) ? color : (colors[zone] || colors.center);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCurrentPage() {
    if (!state.report || !Array.isArray(state.report.pages) || !state.report.pages.length) {
      return null;
    }

    return state.report.pages[Math.max(0, Math.min(state.activePageIndex, state.report.pages.length - 1))] || null;
  }

  function getCurrentFlags() {
    var page = getCurrentPage();
    return page && Array.isArray(page.flags) ? page.flags : [];
  }

  function getActiveFlag() {
    var flags = getCurrentFlags();
    return flags[Math.max(0, Math.min(state.activeFlagIndex, flags.length - 1))] || null;
  }

  function renderMeta() {
    els.fileName.textContent = state.report.fileName || "未命名素材";
    els.meta.innerHTML = [
      '<span class="share-meta-item"><span class="share-meta-label">長さ</span><span>' + escapeHtml(state.report.durationText || "00:00") + "</span></span>",
      '<span class="share-meta-divider">/</span>',
      '<span class="share-meta-item"><span class="share-meta-label">サイズ</span><span>' + escapeHtml(state.report.resolutionText || "-- × --") + "</span></span>",
      '<span class="share-meta-divider">/</span>',
      '<span class="share-meta-item"><span class="share-meta-label">対象SNS</span><span class="share-platforms">' + buildPlatformIcons(state.report.settingsKey || "all") + "</span></span>",
      '<span class="share-meta-divider">/</span>',
      '<span class="share-meta-item"><span class="share-meta-label">修正指示</span><span>' + escapeHtml(String(state.report.instructionCount || 0) + "件") + "</span></span>"
    ].join("");

    if (els.expiryNote) {
      els.expiryNote.textContent = buildExpiryText(state.report.expiresAt);
    }
  }

  function buildExpiryText(expiresAt) {
    var date = expiresAt ? new Date(expiresAt) : null;

    if (!date || Number.isNaN(date.getTime())) {
      return "共有URLは発行日から7日後に失効します。";
    }

    return (date.getMonth() + 1) + "月" + date.getDate() + "日中にこの共有URLは失効します。";
  }

  function renderPins() {
    var flags = getCurrentFlags();
    var activeFlag = getActiveFlag();

    els.pinLayer.innerHTML = flags.map(function (flag) {
      var classes = ["share-pin", "share-pin--" + escapeHtml(flag.reportSeverity || "low")];
      var zoneColor = getZoneColor(flag);
      if (activeFlag && String(activeFlag.id || "") === String(flag.id || "")) {
        classes.push("is-active");
      }

      return '<div class="' + classes.join(" ") + '" data-zone="' + escapeHtml(flag.reportZone || flag.zone || "") + '" style="left:' + ((flag.x || 0) * 100) + "%; top:" + ((flag.y || 0) * 100) + "%; background:" + escapeHtml(zoneColor) + ';">' +
        escapeHtml(String(flag.reportNo || "")) +
      "</div>";
    }).join("");

    syncPinLayerBounds();
  }

  function syncPinLayerBounds() {
    if (!els.previewMedia || !els.previewImage || !els.pinLayer) {
      return;
    }

    var mediaRect = els.previewMedia.getBoundingClientRect();
    var imageRect = els.previewImage.getBoundingClientRect();

    if (!mediaRect.width || !mediaRect.height || !imageRect.width || !imageRect.height) {
      return;
    }

    var left = imageRect.left - mediaRect.left;
    var top = imageRect.top - mediaRect.top;

    els.pinLayer.style.left = left + "px";
    els.pinLayer.style.top = top + "px";
    els.pinLayer.style.width = imageRect.width + "px";
    els.pinLayer.style.height = imageRect.height + "px";
  }

  function renderPreview() {
    var page = getCurrentPage();
    var activeFlag = getActiveFlag();
    var imageUrl = activeFlag && activeFlag.previewFrameUrl
      ? activeFlag.previewFrameUrl
      : (page && page.previewImageUrl ? page.previewImageUrl : "");

    els.previewImage.src = imageUrl;
    if (els.previewImage.complete) {
      requestAnimationFrame(syncPinLayerBounds);
    }
    renderPins();
  }

  function getStatusLabel(flag) {
    return String(flag.reportStatus || "pending") === "done" ? "対応済み" : "未対応";
  }

  function getStatusClass(flag) {
    return String(flag.reportStatus || "pending") === "done" ? "share-status--done" : "share-status--pending";
  }

  function renderInstructions() {
    var flags = getCurrentFlags();

    els.instructionCount.textContent = String(flags.length) + "件";
    els.totalCount.textContent = String(flags.length || 1);
    els.currentIndex.textContent = String(Math.min(state.activeFlagIndex + 1, Math.max(flags.length, 1)));

    els.instructionList.innerHTML = flags.map(function (flag, index) {
      var isActive = index === state.activeFlagIndex;
      var zoneColor = getZoneColor(flag);
      return '<article class="share-instruction' + (isActive ? " is-active" : "") + '" data-flag-index="' + index + '" tabindex="0">' +
        '<div class="share-instruction-head">' +
          '<div class="share-instruction-main">' +
            '<span class="share-no-badge share-no-badge--' + escapeHtml(flag.reportSeverity || "low") + '" style="background:' + escapeHtml(zoneColor) + ';">' + escapeHtml(String(flag.reportNo || "")) + "</span>" +
            '<strong class="share-time">' + escapeHtml(flag.timeLabel || flag.reportTitle || "00:00") + "</strong>" +
            '<span class="share-position" style="color:' + escapeHtml(zoneColor) + ';">(' + escapeHtml(flag.reportPositionShort || "中央") + ")</span>" +
          "</div>" +
          '<button class="share-status ' + getStatusClass(flag) + '" type="button" data-status-index="' + index + '" aria-pressed="' + (String(flag.reportStatus || "pending") === "done" ? "true" : "false") + '">' +
            '<span>' + getStatusLabel(flag) + '</span><span class="share-status-icon">▾</span>' +
          "</button>" +
        "</div>" +
        (flag.comment ? '<div class="share-note"><span>修正内容</span><p>' + escapeHtml(flag.comment) + "</p></div>" : "") +
      "</article>";
    }).join("");

    Array.prototype.slice.call(els.instructionList.querySelectorAll(".share-instruction")).forEach(function (item) {
      item.addEventListener("click", function () {
        state.activeFlagIndex = Number(item.getAttribute("data-flag-index") || 0);
        renderPreview();
        renderInstructions();
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          state.activeFlagIndex = Number(item.getAttribute("data-flag-index") || 0);
          renderPreview();
          renderInstructions();
        }
      });
    });

    Array.prototype.slice.call(els.instructionList.querySelectorAll("[data-status-index]")).forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        var index = Number(button.getAttribute("data-status-index") || 0);
        var flag = flags[index];
        if (!flag) {
          return;
        }
        flag.reportStatus = String(flag.reportStatus || "pending") === "done" ? "pending" : "done";
        renderInstructions();
      });
    });

    els.prevButton.disabled = state.activeFlagIndex <= 0;
    els.nextButton.disabled = state.activeFlagIndex >= flags.length - 1;
  }

  function render() {
    renderMeta();
    renderPreview();
    renderInstructions();
    setView("app");
  }

  async function loadReport() {
    var response = await fetch("./api/share-get?token=" + encodeURIComponent(state.token), {
      headers: { Accept: "application/json" }
    });

    if (response.status === 410) {
      setView("expired");
      return;
    }

    if (!response.ok) {
      var payload = await response.json().catch(function () { return {}; });
      throw new Error(payload && payload.error ? payload.error : "共有ページの取得に失敗しました");
    }

    state.report = await response.json();
    state.activePageIndex = 0;
    state.activeFlagIndex = 0;
    render();
  }

  async function copyCurrentUrl() {
    var originalLabel = els.copyButton.textContent;
    try {
      await navigator.clipboard.writeText(window.location.href);
      els.copyButton.textContent = "コピーしました";
      setTimeout(function () {
        els.copyButton.textContent = originalLabel;
      }, 1600);
    } catch (error) {
      els.copyButton.textContent = originalLabel;
      window.alert("共有URLのコピーに失敗しました。");
    }
  }

  function bindGlobalActions() {
    els.previewImage.addEventListener("load", function () {
      syncPinLayerBounds();
    });

    window.addEventListener("resize", function () {
      syncPinLayerBounds();
    });

    els.copyButton.addEventListener("click", function () {
      copyCurrentUrl();
    });

    if (els.closeButton) {
      els.closeButton.addEventListener("click", function () {
        window.close();
      });
    }

    els.prevButton.addEventListener("click", function () {
      state.activeFlagIndex = Math.max(0, state.activeFlagIndex - 1);
      renderPreview();
      renderInstructions();
    });

    els.nextButton.addEventListener("click", function () {
      state.activeFlagIndex = Math.min(getCurrentFlags().length - 1, state.activeFlagIndex + 1);
      renderPreview();
      renderInstructions();
    });
  }

  function start() {
    initElements();
    state.token = getToken();

    if (isEmbedMode()) {
      document.body.classList.add("is-embed");
    }

    if (!state.token) {
      setView("error", "共有URLに必要な情報がありません。");
      return;
    }

    bindGlobalActions();
    setView("loading");
    loadReport().catch(function (error) {
      console.error(error);
      setView("error", "共有ページを読み込めませんでした。");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
