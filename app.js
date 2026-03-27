(function () {
  "use strict";

  var SPEED_OPTIONS = [1, 1.5, 2, 3];
  var FRAME_LEFT_PADDING = 6;
  var DEFAULT_RATIO = 9 / 16;
  var DEFAULT_FRAME_RATE = 30;
  var FLAG_STORAGE_PREFIX = "lumina-boundary-pro::flags::";
  var HISTORY_INDEX_KEY = "lumina-boundary-pro::history-index";
  var HISTORY_LIMIT = 30;
  var FIRST_FRAME_TIME = 0.04;
  var ACTIVE_FLAG_TOLERANCE = 0.45;
  var MIN_RANGE_DURATION = 0.2;
  var PLATFORM_ORDER = ["tiktok", "reels", "shorts"];
  var DEFAULT_PLATFORM_SETTINGS = {
    tiktok: { right: "15%", bottom: "20%", top: "5%" },
    reels: { right: "12%", bottom: "22%", top: "0%" },
    shorts: { right: "15%", bottom: "20%", top: "10%" }
  };
  var COMPOSITE_PLATFORM_META = {
    accent: "#0a84ff",
    accentSecondary: "#7dc0ff",
    accentSoft: "rgba(10, 132, 255, 0.18)",
    accentStrong: "rgba(125, 192, 255, 0.92)",
    dangerStrong: "rgba(203, 61, 61, 0.58)",
    dangerSoft: "rgba(203, 61, 61, 0.16)",
    ghost: "rgba(225, 238, 255, 0.28)"
  };
  var FLAG_LABELS = {
    top: "上",
    right: "右",
    left: "左",
    bottom: "下",
    center: "中央"
  };
  var TOAST_TITLES = {
    success: "保存完了",
    warning: "ご確認",
    error: "エラー",
    info: "Lumina Boundary Pro"
  };
  var EMPTY_MODE_LABEL = "縦動画専用セーフゾーンチェッカー";
  var EMPTY_MODE_DESCRIPTION = "1つ以上選ぶと、セーフゾーンの枠が表示されます。";

  var DEFAULT_PLATFORM_META = {
    all: {
      label: "ALL",
      modeLabel: "ALL",
      description: "3つのSNSをまとめて確認できます。",
      accent: "#0a84ff",
      accentSecondary: "#7dc0ff",
      accentSoft: "rgba(10, 132, 255, 0.18)",
      accentStrong: "rgba(125, 192, 255, 0.92)",
      dangerStrong: "rgba(203, 61, 61, 0.62)",
      dangerSoft: "rgba(203, 61, 61, 0.14)",
      ghost: "rgba(225, 238, 255, 0.28)"
    },
    tiktok: {
      label: "TikTok",
      modeLabel: "TikTok",
      description: "TikTok の表示枠で確認できます。",
      accent: "#25f4ee",
      accentSecondary: "#fe2c55",
      accentSoft: "rgba(37, 244, 238, 0.18)",
      accentStrong: "rgba(37, 244, 238, 0.9)",
      dangerStrong: "rgba(233, 71, 71, 0.62)",
      dangerSoft: "rgba(37, 244, 238, 0.16)",
      ghost: "rgba(227, 255, 253, 0.28)"
    },
    reels: {
      label: "Reels",
      modeLabel: "Reels",
      description: "Reels の表示枠で確認できます。",
      accent: "#7b61ff",
      accentSecondary: "#c88fff",
      accentSoft: "rgba(123, 97, 255, 0.2)",
      accentStrong: "rgba(200, 143, 255, 0.92)",
      dangerStrong: "rgba(214, 70, 118, 0.6)",
      dangerSoft: "rgba(123, 97, 255, 0.16)",
      ghost: "rgba(240, 232, 255, 0.28)"
    },
    shorts: {
      label: "Shorts",
      modeLabel: "Shorts",
      description: "Shorts の表示枠で確認できます。",
      accent: "#ff3b30",
      accentSecondary: "#ff9c84",
      accentSoft: "rgba(255, 59, 48, 0.22)",
      accentStrong: "rgba(255, 156, 132, 0.92)",
      dangerStrong: "rgba(214, 48, 48, 0.64)",
      dangerSoft: "rgba(255, 59, 48, 0.18)",
      ghost: "rgba(255, 231, 228, 0.26)"
    }
  };

  var state = {
    activePlatform: "",
    activePlatforms: [],
    playbackRate: 1,
    frameRate: DEFAULT_FRAME_RATE,
    objectUrl: null,
    fileName: "",
    fileSize: 0,
    mediaKey: "",
    flags: [],
    selectedFlagId: "",
    reviewMode: "point",
    pendingRange: null,
    autoStopEnabled: false,
    autoStopTargetTime: null,
    isScrubbing: false,
    stageRatio: DEFAULT_RATIO,
    isInfoOpen: false,
    isHistoryOpen: false,
    isConfirmOpen: false,
    confirmIntent: "",
    pendingFile: null,
    pendingInitialFrame: false,
    isPreviewSeeking: false
  };

  var platforms = null;
  var platformMeta = null;
  var els = {};

  function init() {
    var configSource = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};

    platforms = buildPlatformMap(configSource.platforms || DEFAULT_PLATFORM_SETTINGS);
    platformMeta = buildPlatformMeta(configSource.platformMeta || {});

    cacheElements();
    bindEvents();
    renderModeButtons();
    renderSpeedButtons();
    clearPlatformSelection();
    applyReviewMode(state.reviewMode);
    syncPlaybackRate();
    clearMediaStatus();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    setControlsEnabled(false);
    requestStageFit();
  }

  function cacheElements() {
    els.fileInput = document.getElementById("fileInput");
    els.dropZone = document.getElementById("dropZone");
    els.stageFrame = document.getElementById("stageFrame");
    els.stageSurface = document.getElementById("stageSurface");
    els.flagPins = document.getElementById("flagPins");
    els.video = document.getElementById("previewVideo");
    els.modeLabel = document.getElementById("modeLabel");
    els.modeDescription = document.getElementById("modeDescription");
    els.modeButtons = document.getElementById("modeButtons");
    els.speedButtons = document.getElementById("speedButtons");
    els.playToggle = document.getElementById("playToggle");
    els.playToggleLabel = document.getElementById("playToggleLabel");
    els.jumpBack = document.getElementById("jumpBack");
    els.jumpForward = document.getElementById("jumpForward");
    els.frameBack = document.getElementById("frameBack");
    els.frameForward = document.getElementById("frameForward");
    els.timeline = document.getElementById("timeline");
    els.flagMarkers = document.getElementById("flagMarkers");
    els.currentTime = document.getElementById("currentTime");
    els.totalTime = document.getElementById("totalTime");
    els.metaName = document.getElementById("metaName");
    els.metaSize = document.getElementById("metaSize");
    els.metaDuration = document.getElementById("metaDuration");
    els.metaResolution = document.getElementById("metaResolution");
    els.flagsCount = document.getElementById("flagsCount");
    els.currentFlagTime = document.getElementById("currentFlagTime");
    els.flagsHint = document.getElementById("flagsHint");
    els.reviewModeButtons = document.getElementById("reviewModeButtons");
    els.pendingRangeCard = document.getElementById("pendingRangeCard");
    els.pendingRangeLabel = document.getElementById("pendingRangeLabel");
    els.pendingRangeCancel = document.getElementById("pendingRangeCancel");
    els.autoStopToggle = document.getElementById("autoStopToggle");
    els.exportScreenshotButton = document.getElementById("exportScreenshotButton");
    els.copyShareTextButton = document.getElementById("copyShareTextButton");
    els.commentEditorTitle = document.getElementById("commentEditorTitle");
    els.commentTargetTime = document.getElementById("commentTargetTime");
    els.flagCommentInput = document.getElementById("flagCommentInput");
    els.saveCommentButton = document.getElementById("saveCommentButton");
    els.clearCommentButton = document.getElementById("clearCommentButton");
    els.flagsEmpty = document.getElementById("flagsEmpty");
    els.flagsList = document.getElementById("flagsList");
    els.clearFlagsButton = document.getElementById("clearFlagsButton");
    els.commentEditor = document.getElementById("commentEditor");
    els.helpToggle = document.getElementById("helpToggle");
    els.infoModal = document.getElementById("infoModal");
    els.infoClose = document.getElementById("infoClose");
    els.historyToggle = document.getElementById("historyToggle");
    els.historyModal = document.getElementById("historyModal");
    els.historyClose = document.getElementById("historyClose");
    els.historyEmpty = document.getElementById("historyEmpty");
    els.historyList = document.getElementById("historyList");
    els.confirmModal = document.getElementById("confirmModal");
    els.confirmTitle = document.getElementById("confirmTitle");
    els.confirmMessage = document.getElementById("confirmMessage");
    els.confirmCancel = document.getElementById("confirmCancel");
    els.confirmAccept = document.getElementById("confirmAccept");
    els.toastRoot = document.getElementById("toastRoot");
  }

  function bindEvents() {
    els.fileInput.addEventListener("change", onFileInputChange);
    els.dropZone.addEventListener("click", onDropZoneClick);
    els.dropZone.addEventListener("dragenter", preventDefaultDrag);
    els.dropZone.addEventListener("dragover", onDragOver);
    els.dropZone.addEventListener("dragleave", onDragLeave);
    els.dropZone.addEventListener("drop", onDrop);
    els.stageSurface.addEventListener("click", onStageSurfaceClick);
    els.flagPins.addEventListener("click", onFlagPinsClick);

    els.playToggle.addEventListener("click", togglePlayback);
    els.jumpBack.addEventListener("click", function () {
      skipBy(-3);
    });
    els.jumpForward.addEventListener("click", function () {
      skipBy(3);
    });
    els.frameBack.addEventListener("click", function () {
      skipBy(-1);
    });
    els.frameForward.addEventListener("click", function () {
      skipBy(1);
    });

    els.timeline.addEventListener("input", onTimelineInput);
    els.timeline.addEventListener("change", onTimelineCommit);
    els.flagMarkers.addEventListener("click", onFlagMarkerClick);
    els.flagsList.addEventListener("click", onFlagsListClick);
    els.clearFlagsButton.addEventListener("click", clearAllFlags);
    els.reviewModeButtons.addEventListener("click", onReviewModeClick);
    els.pendingRangeCancel.addEventListener("click", cancelPendingRange);
    els.autoStopToggle.addEventListener("click", toggleAutoStop);
    els.exportScreenshotButton.addEventListener("click", exportScreenshot);
    els.copyShareTextButton.addEventListener("click", copyShareText);
    els.saveCommentButton.addEventListener("click", saveSelectedFlagComment);
    els.clearCommentButton.addEventListener("click", clearSelectedFlagComment);
    els.flagCommentInput.addEventListener("keydown", onFlagCommentInputKeydown);

    els.video.addEventListener("loadedmetadata", onVideoMetadataLoaded);
    els.video.addEventListener("seeked", onVideoSeeked);
    els.video.addEventListener("timeupdate", syncTimeline);
    els.video.addEventListener("play", updateTransportState);
    els.video.addEventListener("pause", updateTransportState);
    els.video.addEventListener("ended", updateTransportState);
    els.video.addEventListener("error", onVideoError);

    els.helpToggle.addEventListener("click", openInfoModal);
    els.infoClose.addEventListener("click", closeInfoModal);
    els.infoModal.addEventListener("click", onInfoModalClick);
    els.historyToggle.addEventListener("click", openHistoryModal);
    els.historyClose.addEventListener("click", closeHistoryModal);
    els.historyModal.addEventListener("click", onHistoryModalClick);
    els.historyList.addEventListener("click", onHistoryListClick);
    els.confirmCancel.addEventListener("click", closeConfirmModal);
    els.confirmAccept.addEventListener("click", confirmPendingAction);
    els.confirmModal.addEventListener("click", onConfirmModalClick);

    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", requestStageFit);
    window.addEventListener("beforeunload", releaseObjectUrl);
  }

  function buildPlatformMap(platformMap) {
    var topMax = 0;
    var rightMax = 0;
    var bottomMax = 0;
    var result = {};

    Object.keys(platformMap).forEach(function (key) {
      result[key] = {
        top: platformMap[key].top,
        right: platformMap[key].right,
        bottom: platformMap[key].bottom
      };

      topMax = Math.max(topMax, percentToNumber(platformMap[key].top));
      rightMax = Math.max(rightMax, percentToNumber(platformMap[key].right));
      bottomMax = Math.max(bottomMax, percentToNumber(platformMap[key].bottom));
    });

    result.all = {
      top: topMax + "%",
      right: rightMax + "%",
      bottom: bottomMax + "%"
    };

    return result;
  }

  function buildPlatformMeta(metaMap) {
    var result = {};

    Object.keys(DEFAULT_PLATFORM_META).forEach(function (key) {
      result[key] = mergeObjects(DEFAULT_PLATFORM_META[key], metaMap[key] || {});
    });

    return result;
  }

  function mergeObjects(base, override) {
    var result = {};

    Object.keys(base).forEach(function (key) {
      result[key] = base[key];
    });

    Object.keys(override).forEach(function (key) {
      result[key] = override[key];
    });

    return result;
  }

  function renderModeButtons() {
    var order = ["all"].concat(PLATFORM_ORDER);

    els.modeButtons.innerHTML = order.map(function (key) {
      var meta = getPlatformMeta(key);
      return (
        '<button class="platform-button" type="button" data-platform="' + key + '"' +
        ' style="--button-accent:' + meta.accent + ";--button-accent-secondary:" + meta.accentSecondary + ";--button-accent-soft:" + meta.accentSoft + ';">' +
        '<span class="platform-icon">' + getPlatformIconMarkup(key, meta) + "</span>" +
        '<span class="platform-label">' + meta.label + "</span>" +
        "</button>"
      );
    }).join("");

    els.modeButtons.addEventListener("click", function (event) {
      var button = event.target.closest("[data-platform]");
      if (!button) {
        return;
      }
      togglePlatformSelection(button.getAttribute("data-platform"));
    });
  }

  function renderSpeedButtons() {
    els.speedButtons.innerHTML = SPEED_OPTIONS.map(function (speed) {
      return (
        '<button class="segment-button" type="button" data-speed="' + speed + '">' +
        speed.toFixed(1) + "x" +
        "</button>"
      );
    }).join("");

    els.speedButtons.addEventListener("click", function (event) {
      var button = event.target.closest("[data-speed]");
      if (!button) {
        return;
      }
      state.playbackRate = parseFloat(button.getAttribute("data-speed")) || 1;
      syncPlaybackRate();
    });
  }

  function togglePlatformSelection(platformKey) {
    var currentKeys = state.activePlatforms.slice();
    var nextKeys = [];

    if (platformKey === "all") {
      if (state.activePlatform === "all") {
        clearPlatformSelection();
        return;
      }

      applyPlatform("all");
      return;
    }

    if (PLATFORM_ORDER.indexOf(platformKey) === -1) {
      return;
    }

    if (currentKeys.indexOf(platformKey) !== -1) {
      nextKeys = currentKeys.filter(function (key) {
        return key !== platformKey;
      });
    } else {
      nextKeys = currentKeys.concat(platformKey);
    }

    if (!nextKeys.length) {
      clearPlatformSelection();
      return;
    }

    applyPlatform(nextKeys);
  }

  function updatePlatformButtons() {
    var allSelected = state.activePlatform === "all" && hasActiveSelection();
    var buttons = els.modeButtons.querySelectorAll("[data-platform]");

    Array.prototype.forEach.call(buttons, function (button) {
      var key = button.getAttribute("data-platform");
      var isActive = key === "all"
        ? allSelected
        : state.activePlatforms.indexOf(key) !== -1;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function hasActiveSelection() {
    return Array.isArray(state.activePlatforms) && state.activePlatforms.length > 0;
  }

  function onReviewModeClick(event) {
    var button = event.target.closest("[data-review-mode]");

    if (!button) {
      return;
    }

    applyReviewMode(button.getAttribute("data-review-mode"));
  }

  function applyReviewMode(mode) {
    var nextMode = "point";

    if (state.reviewMode === nextMode) {
      updateReviewModeUI();
      return;
    }

    if (state.pendingRange) {
      cancelPendingRange(false);
    }

    state.reviewMode = nextMode;
    updateReviewModeUI();
  }

  function updateReviewModeUI() {
    updateActiveButtons(els.reviewModeButtons, "[data-review-mode]", state.reviewMode, "data-review-mode");
    updateFlagsHint();
    renderPendingRange();
  }

  function updateFlagsHint() {
    els.flagsHint.textContent = "プレビュー画面内をクリックすると、タイムスタンプが記録されます。";
  }

  function toggleAutoStop() {
    state.autoStopEnabled = !state.autoStopEnabled;

    if (!state.autoStopEnabled) {
      state.autoStopTargetTime = null;
      updateAutoStopButton();
      showToast("自動停止をオフにしました。", "info");
      return;
    }

    armAutoStopTarget();
    updateAutoStopButton();
    showToast("次の記録位置で自動停止します。", "success");
  }

  function updateAutoStopButton() {
    var enabled = state.autoStopEnabled;

    els.autoStopToggle.textContent = enabled ? "自動停止 ON" : "自動停止 OFF";
    els.autoStopToggle.classList.toggle("is-active", enabled);
    els.autoStopToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    els.autoStopToggle.disabled = !hasMediaLoaded() || !state.flags.length;
    els.exportScreenshotButton.disabled = !hasMediaLoaded() || !hasActiveSelection();
    els.copyShareTextButton.disabled = !state.flags.length;
    els.autoStopToggle.title = state.flags.length ? "次の記録位置で自動停止します。" : "記録ができると使えます。";
    els.exportScreenshotButton.title = hasActiveSelection() ? "今の画面をPNGで保存します。" : "表示設定を選ぶと使えます。";
    els.copyShareTextButton.title = state.flags.length ? "時刻とメモを文章でコピーします。" : "記録ができると使えます。";
  }

  function applyPlatform(platformSelection) {
    if (Array.isArray(platformSelection) && !platformSelection.length) {
      clearPlatformSelection();
      return;
    }

    if (!platformSelection) {
      clearPlatformSelection();
      return;
    }

    var platformKey = normalizePlatformKey(platformSelection);
    var selected = getPlatformSettings(platformKey);
    var meta = getPlatformMeta(platformKey);
    var platformKeys = getPlatformKeys(platformKey);

    if (!selected || !meta) {
      return;
    }

    state.activePlatform = platformKey;
    state.activePlatforms = platformKeys;
    els.stageSurface.dataset.platform =
      platformKey === "all" ? "all" : (platformKeys.length === 1 ? platformKeys[0] : "combo");
    els.stageSurface.classList.add("has-selection");
    els.stageSurface.style.setProperty("--overlay-top", selected.top);
    els.stageSurface.style.setProperty("--overlay-right", selected.right);
    els.stageSurface.style.setProperty("--overlay-bottom", selected.bottom);
    els.stageSurface.style.setProperty("--overlay-left", FRAME_LEFT_PADDING + "%");

    els.modeLabel.textContent = EMPTY_MODE_LABEL;
    els.modeDescription.textContent = EMPTY_MODE_DESCRIPTION;

    setPlatformTheme(meta);
    updatePlatformButtons();
    updateFlagsHint();
    updateAutoStopButton();
  }

  function clearPlatformSelection() {
    var fallbackMeta = getPlatformMeta("all");
    var fallbackSettings = getPlatformSettings("all");

    if (hasMediaLoaded() && !els.video.paused) {
      els.video.pause();
      updateTransportState();
    }

    state.activePlatform = "";
    state.activePlatforms = [];
    els.stageSurface.dataset.platform = "none";
    els.stageSurface.classList.remove("has-selection");
    els.stageSurface.style.setProperty("--overlay-top", fallbackSettings.top);
    els.stageSurface.style.setProperty("--overlay-right", fallbackSettings.right);
    els.stageSurface.style.setProperty("--overlay-bottom", fallbackSettings.bottom);
    els.stageSurface.style.setProperty("--overlay-left", FRAME_LEFT_PADDING + "%");
    els.modeLabel.textContent = EMPTY_MODE_LABEL;
    els.modeDescription.textContent = EMPTY_MODE_DESCRIPTION;
    setPlatformTheme(fallbackMeta);
    updatePlatformButtons();
    updateFlagsHint();
    updateAutoStopButton();
  }

  function setPlatformTheme(meta) {
    var style = document.documentElement.style;

    style.setProperty("--mode-accent", meta.accent);
    style.setProperty("--mode-accent-secondary", meta.accentSecondary);
    style.setProperty("--mode-accent-soft", meta.accentSoft);
    style.setProperty("--mode-accent-strong", meta.accentStrong);
    style.setProperty("--mode-danger-strong", meta.dangerStrong);
    style.setProperty("--mode-danger-soft", meta.dangerSoft);
    style.setProperty("--mode-ghost", meta.ghost);
  }

  function onFileInputChange(event) {
    var file = event.target.files && event.target.files[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    queueFileForIngest(file);
  }

  function queueFileForIngest(file) {
    if (shouldConfirmReplacement(file)) {
      openConfirmModal({
        intent: "swap-file",
        file: file,
        title: "素材を切り替えますか？",
        message: state.flags.length
          ? "今のチェック記録は履歴に残ります。新しい素材を読み込みますか？"
          : "新しい素材を読み込みますか？",
        acceptLabel: "読み込む"
      });
      return;
    }

    ingestFile(file);
  }

  function shouldConfirmReplacement(file) {
    if (!state.mediaKey || !hasMediaLoaded()) {
      return false;
    }

    return buildMediaKey(file) !== state.mediaKey;
  }

  function ingestFile(file) {
    var reader = null;

    if (!looksLikeVideo(file)) {
      showToast("動画ファイルを選んでください。", "error");
      return;
    }

    reader = new FileReader();
    reader.onerror = function () {
      showToast("ファイルのローカル読込に失敗しました。", "error");
    };
    reader.onload = function () {
      loadVideoFromFile(file);
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  }

  function loadVideoFromFile(file) {
    releaseObjectUrl();
    resetVideoElement();

    state.fileName = file.name;
    state.fileSize = file.size;
    state.mediaKey = buildMediaKey(file);
    state.flags = readFlagsFromStorage(state.mediaKey);
    state.selectedFlagId = "";
    state.pendingRange = null;
    state.autoStopTargetTime = null;
    state.pendingFile = null;
    state.pendingInitialFrame = true;
    state.isPreviewSeeking = false;
    state.objectUrl = URL.createObjectURL(file);

    els.video.src = state.objectUrl;
    els.video.playbackRate = state.playbackRate;
    els.stageSurface.classList.add("has-media");

    els.metaName.textContent = file.name;
    els.metaName.title = file.name;
    els.metaSize.textContent = formatBytes(file.size);
    els.metaSize.title = formatBytes(file.size);
    els.metaDuration.textContent = "--:--";
    els.metaResolution.textContent = "-- × --";

    clearPlatformSelection();
    closeConfirmModal();
    setControlsEnabled(false);
    syncTimeline();
    renderFlags();
    renderCommentEditor();
    updateReviewModeUI();
    updateAutoStopButton();
    requestStageFit();
    showToast(file.name + " を読み込みました。", "success");
  }

  function onVideoMetadataLoaded() {
    var width = els.video.videoWidth;
    var height = els.video.videoHeight;
    var duration = isFinite(els.video.duration) ? els.video.duration : 0;

    if (width > 0 && height > 0) {
      state.stageRatio = width / height;
      els.stageSurface.style.aspectRatio = width + " / " + height;
      els.metaResolution.textContent = width + " × " + height;
    }

    els.metaDuration.textContent = formatDuration(duration);
    els.totalTime.textContent = formatDuration(duration);
    persistHistorySnapshot();
    setControlsEnabled(true);
    updateTransportState();
    requestStageFit();

    if (state.pendingInitialFrame && duration > 0) {
      state.pendingInitialFrame = false;
      state.isPreviewSeeking = true;
      els.video.currentTime = clamp(Math.min(FIRST_FRAME_TIME, duration), 0, duration);
      return;
    }

    syncTimeline();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
  }

  function onVideoSeeked() {
    if (!state.isPreviewSeeking) {
      return;
    }

    state.isPreviewSeeking = false;
    syncTimeline();
    renderFlags();
    renderCommentEditor();
    updateTransportState();
  }

  function onVideoError() {
    releaseObjectUrl();
    resetVideoElement();
    resetReviewState();
    clearMediaStatus();
    clearPlatformSelection();
    els.stageSurface.classList.remove("has-media");
    state.stageRatio = DEFAULT_RATIO;
    els.stageSurface.style.aspectRatio = "9 / 16";
    setControlsEnabled(false);
    updateTransportState();
    renderFlags();
    renderPendingRange();
    renderCommentEditor();
    updateAutoStopButton();
    requestStageFit();
    showToast("動画プレビューの初期化に失敗しました。別の形式をお試しください。", "error");
  }

  function clearMediaStatus() {
    els.metaName.textContent = "未読み込み";
    els.metaName.title = "";
    els.metaSize.textContent = "-- MB";
    els.metaSize.title = "";
    els.metaDuration.textContent = "00:00";
    els.metaResolution.textContent = "-- × --";
    els.currentTime.textContent = "00:00";
    els.totalTime.textContent = "00:00";
    els.timeline.value = 0;
    els.timeline.max = 1000;
    els.timeline.style.setProperty("--range-progress", "0%");
    els.currentFlagTime.textContent = "00:00";
  }

  function resetReviewState() {
    state.fileName = "";
    state.fileSize = 0;
    state.mediaKey = "";
    state.flags = [];
    state.selectedFlagId = "";
    state.pendingRange = null;
    state.autoStopTargetTime = null;
    state.pendingInitialFrame = false;
    state.isPreviewSeeking = false;
  }

  function setControlsEnabled(enabled) {
    els.playToggle.disabled = !enabled;
    els.jumpBack.disabled = !enabled;
    els.jumpForward.disabled = !enabled;
    els.frameBack.disabled = !enabled;
    els.frameForward.disabled = !enabled;
    els.timeline.disabled = !enabled;
    els.clearFlagsButton.disabled = !enabled || !state.flags.length;
    els.autoStopToggle.disabled = !enabled || !state.flags.length;
    els.exportScreenshotButton.disabled = !enabled || !hasActiveSelection();
    els.copyShareTextButton.disabled = !state.flags.length;
    els.clearFlagsButton.title = state.flags.length ? "今のチェック記録をすべて削除します。" : "記録ができると使えます。";
  }

  function togglePlayback() {
    if (!hasMediaLoaded()) {
      showToast("先に動画を読み込んでください。", "warning");
      return;
    }

    if (!hasActiveSelection()) {
      showToast("表示設定を1つ以上選んでください。", "warning");
      return;
    }

    if (els.video.paused) {
      els.video.play().catch(function () {
        showToast("ブラウザが再生を開始できませんでした。", "warning");
      });
      return;
    }

    els.video.pause();
  }

  function skipBy(seconds) {
    if (!hasMediaLoaded()) {
      return;
    }

    jumpToTime(els.video.currentTime + seconds, false);
  }

  function stepFrame(direction) {
    if (!hasMediaLoaded()) {
      return;
    }

    els.video.pause();
    jumpToTime(els.video.currentTime + (direction * (1 / (state.frameRate || DEFAULT_FRAME_RATE))), true);
    updateTransportState();
  }

  function onTimelineInput(event) {
    if (!hasMediaLoaded()) {
      return;
    }

    state.isScrubbing = true;
    els.video.currentTime = clamp(parseFloat(event.target.value) || 0, 0, els.video.duration || 0);
    syncTimeline();
  }

  function onTimelineCommit() {
    state.isScrubbing = false;
    syncTimeline();
  }

  function syncTimeline() {
    var duration = isFinite(els.video.duration) ? els.video.duration : 0;
    var currentTime = duration ? clamp(els.video.currentTime, 0, duration) : 0;
    var progress = duration ? (currentTime / duration) * 100 : 0;

    els.currentTime.textContent = formatDuration(currentTime);
    els.totalTime.textContent = formatDuration(duration);
    els.currentFlagTime.textContent = formatDuration(currentTime);
    els.timeline.max = duration || 1000;

    if (!state.isScrubbing) {
      els.timeline.value = duration ? currentTime : 0;
    }

    els.timeline.style.setProperty("--range-progress", progress + "%");
    updateFlagHighlights();
    handleAutoStop(currentTime);
  }

  function syncPlaybackRate() {
    els.video.playbackRate = state.playbackRate;
    updateActiveButtons(els.speedButtons, "[data-speed]", String(state.playbackRate), "data-speed");
  }

  function updateTransportState() {
    var isPlaying = !els.video.paused;

    els.playToggle.classList.toggle("is-playing", isPlaying);
    els.playToggleLabel.textContent = isPlaying ? "停止" : "再生";

    if (isPlaying) {
      armAutoStopTarget();
      return;
    }

    state.autoStopTargetTime = null;
  }

  function updateActiveButtons(container, selector, activeValue, attrName) {
    var buttons = container.querySelectorAll(selector);

    Array.prototype.forEach.call(buttons, function (button) {
      var value = button.getAttribute(attrName);
      var isActive = value === activeValue;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function armAutoStopTarget() {
    var currentTime = 0;
    var candidates = [];

    if (!state.autoStopEnabled || !hasMediaLoaded() || els.video.paused) {
      state.autoStopTargetTime = null;
      return;
    }

    currentTime = els.video.currentTime || 0;
    candidates = collectStopTimes().filter(function (time) {
      return time > currentTime + 0.08;
    });

    state.autoStopTargetTime = candidates.length ? candidates[0] : null;
  }

  function handleAutoStop(currentTime) {
    var stopTime = 0;

    if (!state.autoStopEnabled || els.video.paused || state.autoStopTargetTime === null) {
      return;
    }

    if (currentTime + 0.04 < state.autoStopTargetTime) {
      return;
    }

    stopTime = state.autoStopTargetTime;
    state.autoStopTargetTime = null;
    els.video.pause();
    els.video.currentTime = stopTime;
    updateTransportState();
    syncTimeline();
    showToast(formatDuration(stopTime) + " で自動停止しました。", "info");
  }

  function collectStopTimes() {
    var times = state.flags.reduce(function (result, flag) {
      result.push(getFlagStartTime(flag));
      if (isRangeFlag(flag)) {
        result.push(getFlagEndTime(flag));
      }
      return result;
    }, []).sort(function (left, right) {
      return left - right;
    });

    return times.filter(function (time, index) {
      return index === 0 || Math.abs(time - times[index - 1]) > 0.05;
    });
  }

  function onDragOver(event) {
    preventDefaultDrag(event);
    els.dropZone.classList.add("is-dragover");
  }

  function onDragLeave(event) {
    preventDefaultDrag(event);
    if (!els.dropZone.contains(event.relatedTarget)) {
      els.dropZone.classList.remove("is-dragover");
    }
  }

  function onDrop(event) {
    var file = null;

    preventDefaultDrag(event);
    els.dropZone.classList.remove("is-dragover");

    file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) {
      return;
    }

    queueFileForIngest(file);
  }

  function onDropZoneClick(event) {
    if (hasMediaLoaded()) {
      return;
    }

    if (event.target.closest("label") || event.target.closest("button") || event.target.closest("input")) {
      return;
    }

    els.fileInput.click();
  }

  function onStageSurfaceClick(event) {
    var rect = null;
    var xRatio = 0;
    var yRatio = 0;

    if (!hasMediaLoaded()) {
      return;
    }

    if (!hasActiveSelection()) {
      showToast("表示設定を1つ以上選んでください。", "warning");
      return;
    }

    if (event.target.closest("[data-flag-pin]")) {
      return;
    }

    rect = els.stageSurface.getBoundingClientRect();
    xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    els.video.pause();

    savePointRecord(xRatio, yRatio);
    updateTransportState();
  }

  function onFlagPinsClick(event) {
    var pin = event.target.closest("[data-flag-pin]");

    if (!pin) {
      return;
    }

    event.stopPropagation();
    selectFlag(pin.getAttribute("data-flag-id"));
    jumpToTime(parseFloat(pin.getAttribute("data-time")) || 0, true);
    els.video.pause();
    updateTransportState();
  }

  function preventDefaultDrag(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onKeydown(event) {
    var activeTag = document.activeElement && document.activeElement.tagName;

    if (state.isInfoOpen && event.key === "Escape") {
      event.preventDefault();
      closeInfoModal();
      return;
    }

    if (state.isHistoryOpen && event.key === "Escape") {
      event.preventDefault();
      closeHistoryModal();
      return;
    }

    if (state.isConfirmOpen && event.key === "Escape") {
      event.preventDefault();
      closeConfirmModal();
      return;
    }

    if (state.isInfoOpen || state.isHistoryOpen || state.isConfirmOpen) {
      return;
    }

    if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
      return;
    }

    if (!hasMediaLoaded()) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      togglePlayback();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      skipBy(event.shiftKey ? -3 : -1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      skipBy(event.shiftKey ? 3 : 1);
      return;
    }

    if (event.key === "," || event.key === "<") {
      event.preventDefault();
      stepFrame(-1);
      return;
    }

    if (event.key === "." || event.key === ">") {
      event.preventDefault();
      stepFrame(1);
    }
  }

  function openInfoModal() {
    els.infoModal.hidden = false;
    state.isInfoOpen = true;
  }

  function closeInfoModal() {
    els.infoModal.hidden = true;
    state.isInfoOpen = false;
  }

  function onInfoModalClick(event) {
    if (event.target && event.target.getAttribute("data-close-modal") === "true") {
      closeInfoModal();
    }
  }

  function openHistoryModal() {
    renderHistoryList();
    els.historyModal.hidden = false;
    state.isHistoryOpen = true;
  }

  function closeHistoryModal() {
    els.historyModal.hidden = true;
    state.isHistoryOpen = false;
  }

  function onHistoryModalClick(event) {
    if (event.target && event.target.getAttribute("data-close-history") === "true") {
      closeHistoryModal();
    }
  }

  function openConfirmModal(options) {
    var config = options || {};

    state.pendingFile = config.file || null;
    state.confirmIntent = config.intent || "";
    els.confirmTitle.textContent = config.title || "素材を切り替えますか？";
    els.confirmMessage.textContent = config.message || "";
    els.confirmAccept.textContent = config.acceptLabel || "続ける";
    els.confirmModal.hidden = false;
    state.isConfirmOpen = true;
  }

  function closeConfirmModal() {
    els.confirmModal.hidden = true;
    state.isConfirmOpen = false;
    state.confirmIntent = "";
    state.pendingFile = null;
    els.confirmTitle.textContent = "素材を切り替えますか？";
    els.confirmMessage.textContent = "今の記録は履歴に残ります。";
    els.confirmAccept.textContent = "続ける";
  }

  function onConfirmModalClick(event) {
    if (event.target && event.target.getAttribute("data-close-confirm") === "cancel") {
      closeConfirmModal();
    }
  }

  function confirmPendingAction() {
    var pendingFile = state.pendingFile;

    if (state.confirmIntent === "clear-flags") {
      performClearAllFlags();
      closeConfirmModal();
      return;
    }

    if (!pendingFile) {
      closeConfirmModal();
      return;
    }

    ingestFile(pendingFile);
  }

  function savePointRecord(xRatio, yRatio) {
    var flag = createPointRecord(xRatio, yRatio);

    state.flags.push(flag);
    state.selectedFlagId = flag.id;
    sortFlags();
    persistFlags();
    renderFlags();
    renderCommentEditor();
    syncTimeline();
    showToast(formatDuration(flag.time) + " / " + FLAG_LABELS[flag.zone] + " を記録しました。", "success");
  }

  function handleRangeRecord(xRatio, yRatio) {
    var pointRecord = createPointRecord(xRatio, yRatio);
    var nextRange = null;

    if (!state.pendingRange) {
      state.pendingRange = {
        id: createFlagId(),
        kind: "range",
        startTime: pointRecord.time,
        endTime: pointRecord.time,
        zone: pointRecord.zone,
        x: pointRecord.x,
        y: pointRecord.y,
        platform: pointRecord.platform,
        createdAt: pointRecord.createdAt
      };
      renderPendingRange();
      showToast(formatDuration(pointRecord.time) + " / " + FLAG_LABELS[pointRecord.zone] + " から区間を開始しました。", "success");
      return;
    }

    nextRange = completePendingRange(pointRecord.time);
    if (!nextRange) {
      return;
    }

    state.flags.push(nextRange);
    state.pendingRange = null;
    sortFlags();
    persistFlags();
    renderFlags();
    syncTimeline();
    renderPendingRange();
    showToast(formatDuration(nextRange.startTime) + " - " + formatDuration(nextRange.endTime) + " / " + FLAG_LABELS[nextRange.zone] + " を保存しました。", "success");
  }

  function cancelPendingRange(showMessage) {
    if (!state.pendingRange) {
      return;
    }

    state.pendingRange = null;
    renderPendingRange();

    if (showMessage !== false) {
      showToast("進行中の区間記録を取り消しました。", "info");
    }
  }

  function renderPendingRange() {
    if (!state.pendingRange) {
      els.pendingRangeCard.hidden = true;
      els.pendingRangeLabel.textContent = "00:00 / 右 / ALL";
      updateFlagsHint();
      return;
    }

    els.pendingRangeCard.hidden = false;
    els.pendingRangeLabel.textContent =
      formatDuration(state.pendingRange.startTime) + " / " +
      FLAG_LABELS[state.pendingRange.zone] + " / " +
      getPlatformMeta(state.pendingRange.platform).label;
    updateFlagsHint();
  }

  function completePendingRange(endTime) {
    var startTime = 0;
    var resolvedEnd = 0;

    if (!state.pendingRange) {
      return null;
    }

    startTime = Math.min(state.pendingRange.startTime, endTime);
    resolvedEnd = Math.max(state.pendingRange.startTime, endTime);

    if (resolvedEnd - startTime < MIN_RANGE_DURATION) {
      showToast("区間は0.2秒以上離して終了してください。", "warning");
      return null;
    }

    return {
      id: state.pendingRange.id,
      kind: "range",
      startTime: roundToHundredths(startTime),
      endTime: roundToHundredths(resolvedEnd),
      zone: state.pendingRange.zone,
      x: state.pendingRange.x,
      y: state.pendingRange.y,
      platform: state.pendingRange.platform,
      createdAt: state.pendingRange.createdAt
    };
  }

  function createPointRecord(xRatio, yRatio) {
    return {
      id: createFlagId(),
      kind: "point",
      time: roundToHundredths(els.video.currentTime || 0),
      zone: detectZone(xRatio, yRatio),
      x: roundToThousandths(xRatio),
      y: roundToThousandths(yRatio),
      platform: normalizePlatformKey(state.activePlatform),
      comment: "",
      createdAt: Date.now()
    };
  }

  function buildFlagFromPointer(xRatio, yRatio) {
    return createPointRecord(xRatio, yRatio);
  }

  function detectZone(xRatio, yRatio) {
    var metrics = getPlatformSettings(state.activePlatform);
    var topBound = percentToNumber(metrics.top);
    var rightBound = 100 - percentToNumber(metrics.right);
    var bottomBound = 100 - percentToNumber(metrics.bottom);
    var leftBound = FRAME_LEFT_PADDING;
    var x = xRatio * 100;
    var y = yRatio * 100;
    var violations = [];

    if (x >= leftBound && x <= rightBound && y >= topBound && y <= bottomBound) {
      return "center";
    }

    if (y < topBound) {
      violations.push({ zone: "top", delta: topBound - y });
    }
    if (x > rightBound) {
      violations.push({ zone: "right", delta: x - rightBound });
    }
    if (x < leftBound) {
      violations.push({ zone: "left", delta: leftBound - x });
    }
    if (y > bottomBound) {
      violations.push({ zone: "bottom", delta: y - bottomBound });
    }

    violations.sort(function (left, right) {
      return left.delta - right.delta;
    });

    return violations.length ? violations[0].zone : "center";
  }

  function isRangeFlag(flag) {
    return !!flag && flag.kind === "range";
  }

  function getFlagStartTime(flag) {
    return isRangeFlag(flag) ? flag.startTime : flag.time;
  }

  function getFlagEndTime(flag) {
    return isRangeFlag(flag) ? flag.endTime : flag.time;
  }

  function getFlagTitle(flag) {
    if (isRangeFlag(flag)) {
      return formatDuration(flag.startTime) + " - " + formatDuration(flag.endTime);
    }

    return formatDuration(flag.time);
  }

  function sortFlags() {
    state.flags.sort(function (left, right) {
      return getFlagStartTime(left) - getFlagStartTime(right);
    });
  }

  function findFlagById(flagId) {
    var index = 0;

    for (index = 0; index < state.flags.length; index += 1) {
      if (state.flags[index].id === flagId) {
        return state.flags[index];
      }
    }

    return null;
  }

  function getFocusedFlagId(currentTime) {
    if (state.selectedFlagId && findFlagById(state.selectedFlagId)) {
      return state.selectedFlagId;
    }

    return getActiveFlagId(currentTime);
  }

  function selectFlag(flagId) {
    if (!flagId || !findFlagById(flagId)) {
      state.selectedFlagId = "";
      updateFlagHighlights();
      renderCommentEditor();
      return;
    }

    state.selectedFlagId = flagId;
    updateFlagHighlights();
    renderCommentEditor();
  }

  function renderCommentEditor() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;

    els.commentEditor.classList.toggle("is-disabled", !flag);

    if (!flag) {
      els.commentEditorTitle.textContent = "記録を選ぶと、共有メモを追加できます。";
      els.commentTargetTime.textContent = "--:--";
      els.flagCommentInput.value = "";
      els.flagCommentInput.disabled = true;
      els.saveCommentButton.disabled = true;
      els.clearCommentButton.disabled = true;
      return;
    }

    els.commentEditorTitle.textContent = FLAG_LABELS[flag.zone] + " / " + getPlatformMeta(flag.platform).label;
    els.commentTargetTime.textContent = getFlagTitle(flag);
    els.flagCommentInput.value = flag.comment || "";
    els.flagCommentInput.disabled = false;
    els.saveCommentButton.disabled = false;
    els.clearCommentButton.disabled = !(flag.comment || "").length;
  }

  function onFlagCommentInputKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    saveSelectedFlagComment();
  }

  function saveSelectedFlagComment() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var nextComment = "";

    if (!flag) {
      return;
    }

    nextComment = String(els.flagCommentInput.value || "").trim();
    flag.comment = nextComment;
    persistFlags();
    renderFlags();
    renderCommentEditor();
    showToast(nextComment ? "メモを保存しました。" : "メモを空にしました。", "success");
  }

  function clearSelectedFlagComment() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;

    if (!flag || !(flag.comment || "").length) {
      return;
    }

    flag.comment = "";
    els.flagCommentInput.value = "";
    persistFlags();
    renderFlags();
    renderCommentEditor();
    showToast("メモを削除しました。", "info");
  }

  function onFlagsListClick(event) {
    var item = event.target.closest("[data-flag-id]");
    var jumpButton = event.target.closest("[data-flag-jump]");
    var deleteButton = event.target.closest("[data-flag-delete]");
    var flag = null;

    if (jumpButton) {
      selectFlag(jumpButton.getAttribute("data-flag-jump"));
      jumpToTime(parseFloat(jumpButton.getAttribute("data-time")) || 0, true);
      els.video.pause();
      updateTransportState();
      return;
    }

    if (deleteButton) {
      deleteFlag(deleteButton.getAttribute("data-flag-delete"));
      return;
    }

    if (item) {
      flag = findFlagById(item.getAttribute("data-flag-id"));
      if (!flag) {
        return;
      }

      selectFlag(flag.id);
      jumpToTime(getFlagStartTime(flag), true);
      els.video.pause();
      updateTransportState();
    }
  }

  function onFlagMarkerClick(event) {
    var marker = event.target.closest("[data-marker-time]");

    if (!marker) {
      return;
    }

    selectFlag(marker.getAttribute("data-flag-id"));
    jumpToTime(parseFloat(marker.getAttribute("data-marker-time")) || 0, true);
    els.video.pause();
    updateTransportState();
  }

  function deleteFlag(flagId) {
    var nextFlags = state.flags.filter(function (flag) {
      return flag.id !== flagId;
    });

    if (nextFlags.length === state.flags.length) {
      return;
    }

    state.flags = nextFlags;
    if (state.selectedFlagId === flagId) {
      state.selectedFlagId = "";
    }
    state.autoStopTargetTime = null;
    persistFlags();
    renderFlags();
    renderCommentEditor();
    syncTimeline();
    showToast("チェック記録を削除しました。", "info");
  }

  function clearAllFlags() {
    if (!state.flags.length) {
      return;
    }

    openConfirmModal({
      intent: "clear-flags",
      title: "チェック記録を削除しますか？",
      message: "今のチェック記録をすべて削除します。元に戻せません。",
      acceptLabel: "すべて削除"
    });
  }

  function performClearAllFlags() {
    state.flags = [];
    state.selectedFlagId = "";
    state.pendingRange = null;
    state.autoStopTargetTime = null;
    persistFlags();
    renderFlags();
    syncTimeline();
    renderPendingRange();
    renderCommentEditor();
    showToast("チェック記録をすべてクリアしました。", "info");
  }

  function renderFlags() {
    var activeFlagId = getFocusedFlagId(els.video.currentTime || 0);

    els.flagsCount.textContent = state.flags.length + "件";
    els.flagsEmpty.hidden = state.flags.length > 0;
    els.clearFlagsButton.disabled = !hasMediaLoaded() || !state.flags.length;
    els.clearFlagsButton.title = state.flags.length ? "今のチェック記録をすべて削除します。" : "記録ができると使えます。";
    updateAutoStopButton();

    if (!state.flags.length) {
      els.flagsList.innerHTML = "";
      els.flagMarkers.innerHTML = "";
      els.flagPins.innerHTML = "";
      renderCommentEditor();
      return;
    }

    els.flagsList.innerHTML = state.flags.map(function (flag) {
      var platform = getPlatformMeta(flag.platform);
      var isActive = flag.id === activeFlagId;
      var timeLabel = getFlagTitle(flag);

      return (
        '<article class="flag-item' + (isActive ? " is-active" : "") + '" data-flag-id="' + escapeHtml(flag.id) + '">' +
          '<button class="flag-time-button' + (isRangeFlag(flag) ? " is-range" : "") + '" type="button" data-flag-jump="' + escapeHtml(flag.id) + '" data-time="' + getFlagStartTime(flag) + '">' +
            escapeHtml(timeLabel) +
          "</button>" +
          '<div class="flag-meta">' +
            ((flag.comment || "").length ? '<span class="flag-comment-badge">メモ</span>' : "") +
            (isRangeFlag(flag) ? '<span class="flag-kind-badge">区間</span>' : "") +
            '<span class="flag-zone-badge" data-zone="' + escapeHtml(flag.zone) + '">' + escapeHtml(FLAG_LABELS[flag.zone]) + "</span>" +
            '<span class="flag-platform-badge">' + escapeHtml(platform.label) + "</span>" +
          "</div>" +
          '<button class="flag-delete" type="button" data-flag-delete="' + escapeHtml(flag.id) + '">削除</button>' +
        "</article>"
      );
    }).join("");

    renderFlagMarkers(activeFlagId);
    renderFlagPins(activeFlagId);
    updateFlagHighlights();
    renderCommentEditor();
  }

  function renderFlagMarkers(activeFlagId) {
    var duration = isFinite(els.video.duration) ? els.video.duration : 0;

    if (!state.flags.length || !duration) {
      els.flagMarkers.innerHTML = "";
      return;
    }

    els.flagMarkers.innerHTML = state.flags.map(function (flag) {
      var position = clamp((getFlagStartTime(flag) / duration) * 100, 0, 100);
      var width = clamp(((getFlagEndTime(flag) - getFlagStartTime(flag)) / duration) * 100, 0.6, 100);
      var isActive = flag.id === activeFlagId;
      var title = getFlagTitle(flag) + " / " + FLAG_LABELS[flag.zone];

      return (
        '<button class="flag-marker' + (isRangeFlag(flag) ? " flag-marker-range" : " flag-marker-point") + (isActive ? " is-active" : "") + '" type="button"' +
        ' data-flag-id="' + escapeHtml(flag.id) + '"' +
        ' data-zone="' + escapeHtml(flag.zone) + '"' +
        ' data-marker-time="' + getFlagStartTime(flag) + '"' +
        ' style="left:' + position + "%;" + (isRangeFlag(flag) ? "width:" + width + "%;" : "") + '"' +
        ' title="' + escapeHtml(title) + '">' +
        "</button>"
      );
    }).join("");
  }

  function renderFlagPins(activeFlagId) {
    if (!state.flags.length) {
      els.flagPins.innerHTML = "";
      return;
    }

    els.flagPins.innerHTML = state.flags.map(function (flag) {
      var isActive = flag.id === activeFlagId;
      var title = getFlagTitle(flag) + " / " + FLAG_LABELS[flag.zone];

      return (
        '<button class="flag-pin' + (isRangeFlag(flag) ? " is-range" : "") + (isActive ? " is-active" : "") + '" type="button"' +
        ' data-flag-pin="' + escapeHtml(flag.id) + '"' +
        ' data-flag-id="' + escapeHtml(flag.id) + '"' +
        ' data-zone="' + escapeHtml(flag.zone) + '"' +
        ' data-time="' + getFlagStartTime(flag) + '"' +
        ' style="left:' + (flag.x * 100) + "%;top:" + (flag.y * 100) + '%;"' +
        ' title="' + escapeHtml(title) + '">' +
        "</button>"
      );
    }).join("");
  }

  function updateFlagHighlights() {
    var activeFlagId = getFocusedFlagId(els.video.currentTime || 0);
    var listItems = els.flagsList.querySelectorAll("[data-flag-id]");
    var markerItems = els.flagMarkers.querySelectorAll("[data-flag-id]");
    var pinItems = els.flagPins.querySelectorAll("[data-flag-id]");

    Array.prototype.forEach.call(listItems, function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-flag-id") === activeFlagId);
    });

    Array.prototype.forEach.call(markerItems, function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-flag-id") === activeFlagId);
    });

    Array.prototype.forEach.call(pinItems, function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-flag-id") === activeFlagId);
    });
  }

  function getActiveFlagId(currentTime) {
    var activeFlag = null;
    var closestDelta = Number.POSITIVE_INFINITY;

    state.flags.forEach(function (flag) {
      var delta = 0;

      if (isRangeFlag(flag) && currentTime >= flag.startTime && currentTime <= flag.endTime) {
        activeFlag = flag;
        closestDelta = 0;
        return;
      }

      delta = Math.abs(getFlagStartTime(flag) - currentTime);

      if (delta <= ACTIVE_FLAG_TOLERANCE && delta < closestDelta) {
        closestDelta = delta;
        activeFlag = flag;
      }
    });

    return activeFlag ? activeFlag.id : "";
  }

  function persistFlags() {
    if (!state.mediaKey) {
      return;
    }

    try {
      window.localStorage.setItem(FLAG_STORAGE_PREFIX + state.mediaKey, JSON.stringify(state.flags));
      persistHistorySnapshot();
    } catch (error) {
      showToast("チェック記録のローカル保存に失敗しました。", "warning");
    }
  }

  function readFlagsFromStorage(mediaKey) {
    var raw = "";
    var parsed = [];

    if (!mediaKey) {
      return [];
    }

    try {
      raw = window.localStorage.getItem(FLAG_STORAGE_PREFIX + mediaKey) || "[]";
      parsed = JSON.parse(raw);
    } catch (error) {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeStoredFlag).filter(Boolean).sort(function (left, right) {
      return getFlagStartTime(left) - getFlagStartTime(right);
    });
  }

  function normalizeStoredFlag(flag) {
    if (!flag || typeof flag !== "object" || typeof flag.id !== "string") {
      return null;
    }

    if (!FLAG_LABELS[flag.zone]) {
      return null;
    }

    return {
      id: flag.id,
      kind: "point",
      time: clamp(parseFloat(flag.kind === "range" ? flag.startTime : flag.time) || 0, 0, Number.MAX_SAFE_INTEGER),
      zone: flag.zone,
      x: clamp(parseFloat(flag.x) || 0, 0, 1),
      y: clamp(parseFloat(flag.y) || 0, 0, 1),
      platform: normalizePlatformKey(flag.platform),
      comment: String(flag.comment || ""),
      createdAt: parseInt(flag.createdAt, 10) || Date.now()
    };
  }

  function createFlagId() {
    return "flag-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function persistHistorySnapshot() {
    var history = [];
    var nextRecord = null;

    if (!state.mediaKey) {
      return;
    }

    history = readHistoryIndex();
    history = history.filter(function (record) {
      return record.mediaKey !== state.mediaKey;
    });

    if (state.flags.length) {
      nextRecord = {
        mediaKey: state.mediaKey,
        fileName: state.fileName || "未命名素材",
        fileSize: state.fileSize || 0,
        durationText: els.metaDuration.textContent || "00:00",
        resolutionText: els.metaResolution.textContent || "-- × --",
        flagCount: state.flags.length,
        lastOpened: Date.now()
      };

      history.unshift(nextRecord);
    }

    saveHistoryIndex(history.slice(0, HISTORY_LIMIT));

    if (state.isHistoryOpen) {
      renderHistoryList();
    }
  }

  function readHistoryIndex() {
    var raw = "";
    var parsed = [];

    try {
      raw = window.localStorage.getItem(HISTORY_INDEX_KEY) || "[]";
      parsed = JSON.parse(raw);
    } catch (error) {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeHistoryRecord).filter(Boolean).sort(function (left, right) {
      return right.lastOpened - left.lastOpened;
    });
  }

  function saveHistoryIndex(history) {
    try {
      window.localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(history));
    } catch (error) {
      showToast("履歴の保存に失敗しました。", "warning");
    }
  }

  function normalizeHistoryRecord(record) {
    if (!record || typeof record !== "object" || typeof record.mediaKey !== "string") {
      return null;
    }

    return {
      mediaKey: record.mediaKey,
      fileName: String(record.fileName || "未命名素材"),
      fileSize: clamp(parseFloat(record.fileSize) || 0, 0, Number.MAX_SAFE_INTEGER),
      durationText: String(record.durationText || "00:00"),
      resolutionText: String(record.resolutionText || "-- × --"),
      flagCount: clamp(parseInt(record.flagCount, 10) || 0, 0, Number.MAX_SAFE_INTEGER),
      lastOpened: parseInt(record.lastOpened, 10) || Date.now()
    };
  }

  function renderHistoryList() {
    var entries = readHistoryEntries();

    els.historyEmpty.hidden = entries.length > 0;

    if (!entries.length) {
      els.historyList.innerHTML = "";
      return;
    }

    els.historyList.innerHTML = entries.map(function (entry) {
      return (
        '<article class="history-item">' +
          '<div class="history-item-header">' +
            '<div class="history-item-copy">' +
              '<strong title="' + escapeHtml(entry.fileName) + '">' + escapeHtml(entry.fileName) + "</strong>" +
              '<span>' + escapeHtml(entry.durationText + " / " + entry.resolutionText + " / " + entry.flags.length + "件") + "</span>" +
            "</div>" +
            '<span class="history-date">' + escapeHtml(formatHistoryDate(entry.lastOpened)) + "</span>" +
          "</div>" +
          '<div class="history-chip-row">' +
            entry.flags.map(function (flag) {
              return (
                '<button class="history-flag-chip" type="button"' +
                ' data-history-key="' + escapeHtml(entry.mediaKey) + '"' +
                ' data-history-time="' + getFlagStartTime(flag) + '">' +
                  '<span class="history-chip-time">' + escapeHtml(getFlagTitle(flag)) + "</span>" +
                  '<span class="history-chip-meta">' +
                    ((flag.comment || "").length ? '<span class="history-chip-kind">メモ</span>' : "") +
                    '<span class="history-chip-zone" data-zone="' + escapeHtml(flag.zone) + '">' + escapeHtml(FLAG_LABELS[flag.zone]) + "</span>" +
                    '<span class="history-chip-platform">' + escapeHtml(getPlatformMeta(flag.platform).label) + "</span>" +
                  "</span>" +
                  ((flag.comment || "").length ? '<span class="history-chip-note">' + escapeHtml(flag.comment) + "</span>" : "") +
                "</button>"
              );
            }).join("") +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function readHistoryEntries() {
    return readHistoryIndex().map(function (record) {
      var flags = readFlagsFromStorage(record.mediaKey);

      return {
        mediaKey: record.mediaKey,
        fileName: record.fileName,
        durationText: record.durationText,
        resolutionText: record.resolutionText,
        lastOpened: record.lastOpened,
        flags: flags
      };
    }).filter(function (record) {
      return record.flags.length > 0;
    });
  }

  function onHistoryListClick(event) {
    var chip = event.target.closest("[data-history-time]");
    var time = 0;
    var mediaKey = "";

    if (!chip) {
      return;
    }

    time = parseFloat(chip.getAttribute("data-history-time")) || 0;
    mediaKey = chip.getAttribute("data-history-key") || "";

    if (mediaKey === state.mediaKey && hasMediaLoaded()) {
      jumpToTime(time, true);
      els.video.pause();
      updateTransportState();
      closeHistoryModal();
      return;
    }

    showToast("同じ素材を開いている時だけ、履歴の時刻から戻れます。", "warning");
  }

  function copyShareText() {
    if (!state.flags.length) {
      showToast("共有する記録がありません。", "warning");
      return;
    }

    copyTextToClipboard(buildShareText()).then(function () {
      showToast("共有文をコピーしました。", "success");
    }).catch(function () {
      showToast("コピーできませんでした。ブラウザの権限をご確認ください。", "warning");
    });
  }

  function buildShareText() {
    var lines = [
      "Lumina Boundary Pro 共有メモ",
      "素材: " + (state.fileName || "未命名素材"),
      "記録数: " + state.flags.length + "件",
      ""
    ];

    state.flags.forEach(function (flag, index) {
      lines.push(
        (index + 1) + ". " +
        getFlagTitle(flag) + " / " +
        FLAG_LABELS[flag.zone] + " / " +
        getPlatformMeta(flag.platform).label
      );

      if ((flag.comment || "").trim()) {
        lines.push("   メモ: " + flag.comment.trim());
      }

      lines.push("");
    });

    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopyText(text);
      });
    }

    return fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      var copied = false;

      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }

      document.body.removeChild(textarea);

      if (copied) {
        resolve();
        return;
      }

      reject(new Error("copy-failed"));
    });
  }

  function exportScreenshot() {
    var width = 0;
    var height = 0;
    var canvas = null;
    var ctx = null;
    var selectedFlag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var exportFlags = [];
    var fileName = "";

    if (!hasMediaLoaded()) {
      showToast("先に動画を読み込んでください。", "warning");
      return;
    }

    if (!hasActiveSelection()) {
      showToast("表示設定を1つ以上選んでください。", "warning");
      return;
    }

    width = els.video.videoWidth || Math.round(els.stageSurface.clientWidth);
    height = els.video.videoHeight || Math.round(els.stageSurface.clientHeight);

    if (!width || !height) {
      showToast("スクリーンショットの書き出しに必要な映像情報が不足しています。", "warning");
      return;
    }

    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");

    ctx.drawImage(els.video, 0, 0, width, height);
    drawExportOverlay(ctx, width, height);

    exportFlags = selectedFlag ? [selectedFlag] : state.flags;
    drawExportFlags(ctx, exportFlags, width, height, selectedFlag ? selectedFlag.id : "");

    if (selectedFlag) {
      drawExportAnnotation(ctx, selectedFlag, width, height);
    }

    fileName = buildScreenshotFileName();
    canvas.toBlob(function (blob) {
      if (!blob) {
        showToast("PNG の書き出しに失敗しました。", "error");
        return;
      }

      downloadBlob(fileName, blob);
      showToast(fileName + " をPNGで保存しました。", "success");
    }, "image/png");
  }

  function drawExportOverlay(ctx, width, height) {
    var meta = getPlatformMeta(state.activePlatform);
    var metrics = getPlatformSettings(state.activePlatform);
    var top = height * (percentToNumber(metrics.top) / 100);
    var rightWidth = width * (percentToNumber(metrics.right) / 100);
    var bottomHeight = height * (percentToNumber(metrics.bottom) / 100);
    var left = width * (FRAME_LEFT_PADDING / 100);
    var safeTop = top;
    var safeLeft = left;
    var safeRight = width - rightWidth;
    var safeBottom = height - bottomHeight;

    ctx.save();

    ctx.fillStyle = meta.dangerStrong;
    ctx.fillRect(0, 0, width, top);
    ctx.fillRect(0, 0, left, height);
    ctx.fillRect(width - rightWidth, 0, rightWidth, height);
    ctx.fillRect(0, height - bottomHeight, width, bottomHeight);

    ctx.strokeStyle = meta.accentStrong;
    ctx.lineWidth = Math.max(4, Math.round(width * 0.0038));
    ctx.strokeRect(safeLeft, safeTop, safeRight - safeLeft, safeBottom - safeTop);

    ctx.restore();
  }

  function drawExportFlags(ctx, flags, width, height, activeFlagId) {
    var zoneColors = {
      top: "#ffb84d",
      right: "#5ac8fa",
      left: "#bf5af2",
      bottom: "#ff6b6b",
      center: "#34c759"
    };

    flags.forEach(function (flag) {
      var x = flag.x * width;
      var y = flag.y * height;
      var bodyRadius = Math.max(14, Math.round(width * 0.014));
      var bodyCenterY = y - Math.max(12, Math.round(bodyRadius * 0.95));
      var tailSize = Math.max(8, Math.round(bodyRadius * 0.7));
      var zoneColor = zoneColors[flag.zone] || "#5ac8fa";
      var isActive = activeFlagId && flag.id === activeFlagId;

      ctx.save();
      ctx.shadowColor = isActive ? "rgba(125, 192, 255, 0.34)" : "rgba(0, 0, 0, 0.18)";
      ctx.shadowBlur = isActive ? bodyRadius + 14 : bodyRadius + 8;
      ctx.shadowOffsetY = Math.max(8, Math.round(bodyRadius * 0.5));

      ctx.fillStyle = "rgba(248, 250, 255, 0.96)";
      ctx.beginPath();
      ctx.arc(x, bodyCenterY, bodyRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.save();
      ctx.fillStyle = "rgba(248, 250, 255, 0.92)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.94)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - tailSize * 0.55, bodyCenterY + bodyRadius * 0.68);
      ctx.lineTo(x + tailSize * 0.55, bodyCenterY + bodyRadius * 0.68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.88)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, bodyCenterY, bodyRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = zoneColor;
      ctx.beginPath();
      ctx.arc(x, bodyCenterY, Math.max(5, Math.round(bodyRadius * 0.36)), 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, bodyCenterY, Math.max(5, Math.round(bodyRadius * 0.36)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawExportAnnotation(ctx, flag, width, height) {
    var safeMarginX = Math.round(width * 0.06);
    var safeMarginY = Math.round(height * 0.05);
    var cardWidth = Math.min(width - safeMarginX * 2, Math.round(width * 0.72));
    var title = getFlagTitle(flag) + " / " + FLAG_LABELS[flag.zone] + " / " + getPlatformMeta(flag.platform).label;
    var lines = wrapCanvasText(ctx, flag.comment || "", cardWidth - 36);
    var cardHeight = 64 + (lines.length ? lines.length * 24 + 10 : 0);

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(255,255,255,0.98)";
    ctx.lineWidth = 1;
    drawRoundedRectPath(ctx, safeMarginX, safeMarginY, cardWidth, cardHeight, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(12, 14, 18, 0.94)";
    ctx.font = Math.max(20, Math.round(width * 0.024)) + 'px "SF Pro Display", sans-serif';
    ctx.fillText(title, safeMarginX + 18, safeMarginY + 30);

    if (lines.length) {
      ctx.fillStyle = "rgba(12, 14, 18, 0.72)";
      ctx.font = Math.max(18, Math.round(width * 0.02)) + 'px "SF Pro Display", sans-serif';
      lines.forEach(function (line, index) {
        ctx.fillText(line, safeMarginX + 18, safeMarginY + 60 + (index * 24));
      });
    }

    ctx.restore();
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    var rawText = String(text || "").trim();
    var words = /\s/.test(rawText) ? rawText.split(/\s+/) : rawText.split("");
    var lines = [];
    var currentLine = "";
    var separator = /\s/.test(rawText) ? " " : "";

    if (!words[0]) {
      return lines;
    }

    words.forEach(function (word) {
      var testLine = currentLine ? currentLine + separator + word : word;

      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        return;
      }

      currentLine = testLine;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 3);
  }

  function drawRoundedRectPath(ctx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function buildScreenshotFileName() {
    var baseName = (state.fileName || "lumina-boundary-pro").replace(/\.[^/.]+$/, "");
    return baseName + "-" + formatDuration(els.video.currentTime || 0).replace(/:/g, "-") + ".png";
  }

  function downloadBlob(fileName, blob) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function buildMediaKey(file) {
    return [file.name, file.size, file.lastModified].join("__");
  }

  function jumpToTime(seconds, pauseVideo) {
    if (!hasMediaLoaded()) {
      return;
    }

    if (pauseVideo) {
      els.video.pause();
    }

    els.video.currentTime = clamp(seconds, 0, els.video.duration || 0);
    if (!pauseVideo) {
      armAutoStopTarget();
    }
    syncTimeline();
  }

  function releaseObjectUrl() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = null;
    }
  }

  function resetVideoElement() {
    els.video.pause();
    els.video.removeAttribute("src");
    els.video.load();
  }

  function hasMediaLoaded() {
    return !!state.objectUrl && isFinite(els.video.duration);
  }

  function requestStageFit() {
    window.requestAnimationFrame(fitStageSurface);
  }

  function fitStageSurface() {
    var availableWidth = Math.max(els.stageFrame.clientWidth, 220);
    var availableHeight = Math.max(els.stageFrame.clientHeight, 300);
    var ratio = state.stageRatio || DEFAULT_RATIO;
    var width = Math.min(availableWidth, availableHeight * ratio);
    var height = width / ratio;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * ratio;
    }

    els.stageSurface.style.width = Math.floor(width) + "px";
    els.stageSurface.style.height = Math.floor(height) + "px";
  }

  function looksLikeVideo(file) {
    if (file.type && file.type.indexOf("video/") === 0) {
      return true;
    }

    return /\.(mp4|mov|m4v|webm|ogv)$/i.test(file.name);
  }

  function formatDuration(totalSeconds) {
    var minutes = 0;
    var seconds = 0;

    if (!isFinite(totalSeconds) || totalSeconds < 0) {
      return "00:00";
    }

    minutes = Math.floor(totalSeconds / 60);
    seconds = Math.floor(totalSeconds % 60);

    return pad(minutes) + ":" + pad(seconds);
  }

  function formatBytes(bytes) {
    var units = ["B", "KB", "MB", "GB"];
    var size = bytes;
    var unitIndex = 0;

    if (!isFinite(bytes) || bytes <= 0) {
      return "0 B";
    }

    while (size >= 1024 && unitIndex < units.length - 1) {
      size = size / 1024;
      unitIndex += 1;
    }

    return size.toFixed(size >= 100 || unitIndex === 0 ? 0 : 1) + " " + units[unitIndex];
  }

  function formatHistoryDate(timestamp) {
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch (error) {
      return "";
    }
  }

  function roundToHundredths(value) {
    return Math.round((value || 0) * 100) / 100;
  }

  function roundToThousandths(value) {
    return Math.round((value || 0) * 1000) / 1000;
  }

  function percentToNumber(value) {
    return parseFloat(String(value).replace("%", "")) || 0;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function normalizePlatformKeys(platformKeys, fallbackToAll) {
    var uniqueKeys = [];

    (platformKeys || []).forEach(function (key) {
      var normalizedKey = String(key || "").toLowerCase().trim();

      if (PLATFORM_ORDER.indexOf(normalizedKey) === -1 || uniqueKeys.indexOf(normalizedKey) !== -1) {
        return;
      }

      uniqueKeys.push(normalizedKey);
    });

    uniqueKeys.sort(function (left, right) {
      return PLATFORM_ORDER.indexOf(left) - PLATFORM_ORDER.indexOf(right);
    });

    if (!uniqueKeys.length && fallbackToAll !== false) {
      return PLATFORM_ORDER.slice();
    }

    return uniqueKeys;
  }

  function getPlatformKeys(platformSelection) {
    if (Array.isArray(platformSelection)) {
      return normalizePlatformKeys(platformSelection, true);
    }

    if (typeof platformSelection === "string") {
      if (!platformSelection || platformSelection === "all") {
        return PLATFORM_ORDER.slice();
      }

      return normalizePlatformKeys(platformSelection.split(/[+,]/), true);
    }

    return PLATFORM_ORDER.slice();
  }

  function buildPlatformKey(platformSelection) {
    var platformKeys = normalizePlatformKeys(getPlatformKeys(platformSelection), true);

    if (platformKeys.length === PLATFORM_ORDER.length) {
      return "all";
    }

    return platformKeys.join("+");
  }

  function normalizePlatformKey(platformSelection) {
    return buildPlatformKey(platformSelection);
  }

  function getPlatformSettings(platformSelection) {
    var platformKeys = getPlatformKeys(platformSelection);
    var topMax = 0;
    var rightMax = 0;
    var bottomMax = 0;

    if (platformKeys.length === PLATFORM_ORDER.length) {
      return platforms.all;
    }

    if (platformKeys.length === 1 && platforms[platformKeys[0]]) {
      return platforms[platformKeys[0]];
    }

    platformKeys.forEach(function (key) {
      var current = platforms[key];

      if (!current) {
        return;
      }

      topMax = Math.max(topMax, percentToNumber(current.top));
      rightMax = Math.max(rightMax, percentToNumber(current.right));
      bottomMax = Math.max(bottomMax, percentToNumber(current.bottom));
    });

    return {
      top: topMax + "%",
      right: rightMax + "%",
      bottom: bottomMax + "%"
    };
  }

  function buildCompositePlatformMeta(platformKeys) {
    var labels = platformKeys.map(function (key) {
      return (platformMeta[key] || DEFAULT_PLATFORM_META[key]).label;
    });
    var label = labels.join(" + ");

    return mergeObjects(COMPOSITE_PLATFORM_META, {
      label: label,
      modeLabel: label,
      description: labels.join(" / ") + " の枠を重ねて確認できます。"
    });
  }

  function getPlatformMeta(key) {
    var normalizedKey = normalizePlatformKey(key);
    var platformKeys = getPlatformKeys(normalizedKey);

    if (platformMeta[normalizedKey]) {
      return platformMeta[normalizedKey];
    }

    if (platformKeys.length === 1 && platformMeta[platformKeys[0]]) {
      return platformMeta[platformKeys[0]];
    }

    return buildCompositePlatformMeta(platformKeys);
  }

  function getPlatformIconMarkup(key, meta) {
    if (key === "tiktok") {
      return (
        '<svg class="platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M14 4h2.2c.3 1.7 1.5 3 3.5 3.3v2.2c-1.5-.1-2.8-.6-3.8-1.3v5.3c0 3.2-2.3 5.5-5.3 5.5-2.6 0-4.7-1.9-4.7-4.4 0-2.8 2.4-4.8 5.3-4.8.3 0 .6 0 .9.1v2.2a3.7 3.7 0 0 0-.9-.1c-1.5 0-2.8 1-2.8 2.4 0 1.3 1 2.3 2.3 2.3 1.5 0 2.4-1.1 2.4-2.6V4z" fill="' + meta.accentSecondary + '" transform="translate(1 1)"></path>' +
        '<path d="M14 4h2.2c.3 1.7 1.5 3 3.5 3.3v2.2c-1.5-.1-2.8-.6-3.8-1.3v5.3c0 3.2-2.3 5.5-5.3 5.5-2.6 0-4.7-1.9-4.7-4.4 0-2.8 2.4-4.8 5.3-4.8.3 0 .6 0 .9.1v2.2a3.7 3.7 0 0 0-.9-.1c-1.5 0-2.8 1-2.8 2.4 0 1.3 1 2.3 2.3 2.3 1.5 0 2.4-1.1 2.4-2.6V4z" fill="' + meta.accent + '" transform="translate(-1 -1)"></path>' +
        '<path d="M14 4h2.2c.3 1.7 1.5 3 3.5 3.3v2.2c-1.5-.1-2.8-.6-3.8-1.3v5.3c0 3.2-2.3 5.5-5.3 5.5-2.6 0-4.7-1.9-4.7-4.4 0-2.8 2.4-4.8 5.3-4.8.3 0 .6 0 .9.1v2.2a3.7 3.7 0 0 0-.9-.1c-1.5 0-2.8 1-2.8 2.4 0 1.3 1 2.3 2.3 2.3 1.5 0 2.4-1.1 2.4-2.6V4z" fill="#ffffff"></path>' +
        "</svg>"
      );
    }

    if (key === "reels") {
      return (
        '<svg class="platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="' + meta.accent + '" stroke-width="1.8"></rect>' +
        '<path d="M4.5 9h15" stroke="' + meta.accentSecondary + '" stroke-width="1.6" stroke-linecap="round"></path>' +
        '<path d="M8 4.8l3.5 4.1" stroke="' + meta.accentSecondary + '" stroke-width="1.6" stroke-linecap="round"></path>' +
        '<path d="M12.5 4.8l3.5 4.1" stroke="' + meta.accentSecondary + '" stroke-width="1.6" stroke-linecap="round"></path>' +
        '<path d="M10 11l5 3-5 3z" fill="' + meta.accent + '"></path>' +
        "</svg>"
      );
    }

    if (key === "shorts") {
      return (
        '<svg class="platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M9 4.8c1.2-.7 2.8.1 2.8 1.5v2.1l3.3-1.9c1.3-.8 3 .1 3 1.6v.3c0 .8-.4 1.5-1.1 1.9l-2.7 1.6 2.7 1.6c.7.4 1.1 1.1 1.1 1.9v.3c0 1.5-1.7 2.4-3 1.6l-3.3-1.9v2.1c0 1.4-1.6 2.2-2.8 1.5L6.2 17.5A2.1 2.1 0 0 1 5 15.7v-7.4c0-.8.4-1.5 1.2-1.9L9 4.8z" fill="' + meta.accent + '"></path>' +
        '<path d="M11 9.3l4.3 2.7L11 14.7z" fill="#ffffff"></path>' +
        "</svg>"
      );
    }

    return (
      '<svg class="platform-svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="4" y="4" width="6" height="6" rx="1.6" fill="' + meta.accent + '"></rect>' +
      '<rect x="14" y="4" width="6" height="6" rx="1.6" fill="' + meta.accentSecondary + '"></rect>' +
      '<rect x="4" y="14" width="6" height="6" rx="1.6" fill="' + meta.accentSecondary + '"></rect>' +
      '<rect x="14" y="14" width="6" height="6" rx="1.6" fill="' + meta.accent + '"></rect>' +
      "</svg>"
    );
  }

  function showToast(message, type) {
    var tone = type || "info";
    var toast = document.createElement("div");

    toast.className = "toast is-" + tone;
    toast.innerHTML =
      "<strong>" + TOAST_TITLES[tone] + "</strong>" +
      "<p>" + escapeHtml(message) + "</p>";

    els.toastRoot.appendChild(toast);

    window.requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    window.setTimeout(function () {
      toast.classList.remove("is-visible");
      window.setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 220);
    }, 3200);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
