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
        return '<span class="share-platform-icon share-platform-icon--tiktok">T</span>';
      }

      if (key === "reels" || key === "instagram") {
        return '<span class="share-platform-icon share-platform-icon--reels">I</span>';
      }

      if (key === "shorts" || key === "youtube") {
        return '<span class="share-platform-icon share-platform-icon--shorts">Y</span>';
      }

      return '<span class="share-platform-icon share-platform-icon--all">ALL</span>';
    }).join("");
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
  }

  function renderPins() {
    var flags = getCurrentFlags();
    var activeFlag = getActiveFlag();

    els.pinLayer.innerHTML = flags.map(function (flag) {
      var classes = ["share-pin", "share-pin--" + escapeHtml(flag.reportSeverity || "low")];
      if (activeFlag && String(activeFlag.id || "") === String(flag.id || "")) {
        classes.push("is-active");
      }

      return '<div class="' + classes.join(" ") + '" style="left:' + ((flag.x || 0) * 100) + "%; top:" + ((flag.y || 0) * 100) + '%;">' +
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
      return '<article class="share-instruction' + (isActive ? " is-active" : "") + '" data-flag-index="' + index + '" tabindex="0">' +
        '<div class="share-instruction-head">' +
          '<div class="share-instruction-main">' +
            '<span class="share-no-badge share-no-badge--' + escapeHtml(flag.reportSeverity || "low") + '">' + escapeHtml(String(flag.reportNo || "")) + "</span>" +
            '<strong class="share-time">' + escapeHtml(flag.timeLabel || "00:00") + "</strong>" +
            '<span class="share-position">(' + escapeHtml(flag.reportPositionShort || "中央") + ")</span>" +
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
