(function () {
  "use strict";

  var SPEED_OPTIONS = [1, 1.5];
  var DEFAULT_RATIO = 9 / 16;
  var IPHONE_TALL_RATIO = 430 / 932;
  var DEFAULT_FRAME_RATE = 30;
  var FLAG_STORAGE_PREFIX = "lumina-boundary-pro::flags::";
  var HISTORY_INDEX_KEY = "lumina-boundary-pro::history-index";
  var HISTORY_LIMIT = 30;
  var FIRST_FRAME_TIME = 0.04;
  var ACTIVE_FLAG_TOLERANCE = 0.45;
  var PLATFORM_ORDER = ["tiktok", "reels", "shorts"];
  var DISPLAY_PROFILES = {
    standard: {
      key: "standard",
      label: "標準 9:16",
      caption: "編集時の基準",
      ratio: DEFAULT_RATIO
    },
    iphoneTall: {
      key: "iphoneTall",
      label: "iPhone実機イメージ",
      caption: "iPhone 16 / 15 Pro Max など",
      ratio: IPHONE_TALL_RATIO
    }
  };
  var DEFAULT_PLATFORM_SETTINGS = {
    tiktok: {
      effective: {
        areaModel: "blocks",
        highRisk: { left: "10%", top: "13%", right: "12%", rightUpper: "12%", stepY: "52%", bottom: "20%" },
        caution: { left: "16%", top: "18%", right: "18%", rightUpper: "18%", stepY: "52%", bottom: "29%" },
        highRiskAreas: [
          { key: "topBand", zone: "top", top: "0%", left: "0%", width: "100%", height: "13%" },
          { key: "leftRail", zone: "left", top: "13%", left: "0%", width: "10%", height: "67%" },
          { key: "rightRail", zone: "right", top: "18%", right: "0%", width: "12%", height: "62%" },
          { key: "leftLowerUi", zone: "left", left: "0%", bottom: "18%", width: "74%", height: "8%", radius: "8px 8px 0 0" },
          { key: "bottomBand", zone: "bottom", bottom: "0%", left: "0%", width: "100%", height: "20%" }
        ],
        cautionAreas: [
          { key: "topBuffer", zone: "top", top: "13%", left: "0%", width: "100%", height: "5%" },
          { key: "leftBuffer", zone: "left", top: "13%", left: "10%", width: "6%", height: "57%" },
          { key: "rightBuffer", zone: "right", top: "18%", right: "12%", width: "6%", height: "62%" },
          { key: "leftLowerBuffer", zone: "left", left: "0%", bottom: "18%", width: "80%", height: "10%", radius: "10px 10px 0 0" },
          { key: "bottomCaptionBuffer", zone: "bottom", left: "0%", right: "0%", bottom: "20%", height: "9%" }
        ]
      },
      standard: {
        highRisk: { left: "4%", top: "6%", right: "12%", rightUpper: "6%", stepY: "42%", bottom: "17%" },
        caution: { left: "8%", top: "10%", right: "20%", rightUpper: "10%", stepY: "43.5%", bottom: "25%" }
      },
      iphoneTall: {
        highRisk: { left: "5%", top: "6%", right: "14%", rightUpper: "7%", stepY: "42%", bottom: "18%" },
        caution: { left: "9%", top: "10%", right: "23%", rightUpper: "11%", stepY: "43.5%", bottom: "27%" }
      }
    },
    reels: {
      effective: {
        areaModel: "blocks",
        highRisk: { left: "4%", top: "11%", right: "11%", rightUpper: "11%", stepY: "53%", bottom: "19%" },
        caution: { left: "8%", top: "16%", right: "18%", rightUpper: "18%", stepY: "53%", bottom: "29%" },
        highRiskAreas: [
          { key: "topBand", zone: "top", top: "0%", left: "0%", width: "100%", height: "11%" },
          { key: "leftRail", zone: "left", top: "11%", left: "0%", width: "5%", height: "70%" },
          { key: "rightRail", zone: "right", top: "11%", right: "0%", width: "11%", height: "70%" },
          { key: "leftLowerUi", zone: "left", left: "0%", bottom: "17%", width: "58%", height: "9%", radius: "8px 8px 0 0" },
          { key: "bottomBand", zone: "bottom", bottom: "0%", left: "0%", width: "100%", height: "19%" }
        ],
        cautionAreas: [
          { key: "topBuffer", zone: "top", top: "11%", left: "0%", width: "100%", height: "5%" },
          { key: "leftBuffer", zone: "left", top: "11%", left: "5%", width: "4%", height: "60%" },
          { key: "rightBuffer", zone: "right", top: "11%", right: "11%", width: "7%", height: "70%" },
          { key: "leftLowerBuffer", zone: "left", left: "0%", bottom: "17%", width: "66%", height: "10%", radius: "10px 10px 0 0" },
          { key: "bottomCaptionBuffer", zone: "bottom", left: "0%", right: "0%", bottom: "19%", height: "10%" }
        ]
      },
      standard: {
        highRisk: { left: "3%", top: "0%", right: "8%", rightUpper: "8%", stepY: "48%", bottom: "15%" },
        caution: { left: "6%", top: "0%", right: "12%", rightUpper: "12%", stepY: "48%", bottom: "22%" }
      },
      iphoneTall: {
        highRisk: { left: "6%", top: "0%", right: "10%", rightUpper: "10%", stepY: "48%", bottom: "16%" },
        caution: { left: "10%", top: "0%", right: "16%", rightUpper: "16%", stepY: "48%", bottom: "24%" }
      }
    },
    shorts: {
      effective: {
        areaModel: "blocks",
        highRisk: { left: "5%", top: "11%", right: "12%", rightUpper: "12%", stepY: "54%", bottom: "18%" },
        caution: { left: "8%", top: "16%", right: "18%", rightUpper: "18%", stepY: "54%", bottom: "27%" },
        highRiskAreas: [
          { key: "topBand", zone: "top", top: "0%", left: "0%", width: "100%", height: "11%" },
          { key: "leftRail", zone: "left", top: "11%", left: "0%", width: "7%", height: "71%" },
          { key: "rightRail", zone: "right", top: "17%", right: "0%", width: "12%", height: "65%" },
          { key: "leftLowerUi", zone: "left", left: "0%", bottom: "16%", width: "58%", height: "7%", radius: "6px 6px 0 0" },
          { key: "bottomBand", zone: "bottom", bottom: "0%", left: "0%", width: "100%", height: "18%" }
        ],
        cautionAreas: [
          { key: "topBuffer", zone: "top", top: "11%", left: "0%", width: "100%", height: "5%" },
          { key: "leftBuffer", zone: "left", top: "11%", left: "7%", width: "3%", height: "60%" },
          { key: "rightBuffer", zone: "right", top: "17%", right: "12%", width: "6%", height: "65%" },
          { key: "leftLowerBuffer", zone: "left", left: "0%", bottom: "16%", width: "64%", height: "8%", radius: "8px 8px 0 0" },
          { key: "bottomCaptionBuffer", zone: "bottom", left: "0%", right: "0%", bottom: "18%", height: "9%" }
        ]
      },
      standard: {
        highRisk: { left: "3%", top: "7%", right: "10%", rightUpper: "10%", stepY: "46%", bottom: "15%" },
        caution: { left: "6%", top: "10%", right: "15%", rightUpper: "15%", stepY: "46%", bottom: "20%" }
      },
      iphoneTall: {
        highRisk: { left: "6%", top: "7%", right: "12%", rightUpper: "12%", stepY: "46%", bottom: "16%" },
        caution: { left: "10%", top: "10%", right: "18%", rightUpper: "18%", stepY: "46%", bottom: "22%" }
      }
    }
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
  var COMMENT_CATEGORIES = ["UI被り", "位置", "内容", "デザイン", "素材", "その他"];
  var COMMENT_TEMPLATES = {
    "UI被り": [
      "テロップがUIに被っているため、位置を調整してください",
      "UIと重なっているため、上に移動してください",
      "UIに隠れて見えづらいため、位置を調整してください"
    ],
    "位置": [
      "テロップの位置が低いため、上に調整してください",
      "端に寄りすぎているため、中央寄せにしてください",
      "見切れているため、位置を調整してください"
    ],
    "内容": [
      "テロップの文言を修正してください",
      "誤字があるため修正してください",
      "表現を調整してください"
    ],
    "デザイン": [
      "文字サイズを調整してください",
      "色が見えづらいため変更してください",
      "視認性を改善してください"
    ],
    "素材": [
      "この部分の素材を差し替えてください",
      "画像を変更してください",
      "動画を別素材に変更してください"
    ]
  };
  var TOAST_TITLES = {
    success: "保存完了",
    warning: "ご確認",
    error: "エラー",
    info: "Lumina Zone"
  };
  var EMPTY_MODE_LABEL = "縦動画セーフゾーンチェッカー";
  var EMPTY_MODE_DESCRIPTION = "";
  var HINT_NEEDS_RECORDS = "記録すると使えます。";
  var HINT_NEEDS_HISTORY = "履歴がたまると使えます。";
  var FREE_DAILY_PDF_LIMIT = 2;
  var PDF_LIMIT_REACHED_MESSAGE = "本日の無料枠を使い切りました。PROなら無制限で共有できます。";
  var BOOKMARK_HINT_DISMISSED_KEY = "lumina-boundary-pro::bookmark-hint-dismissed";
  var stageResizeObserver = null;
  var ONBOARDING_STEPS = [
    {
      selector: "#guideStepSource",
      label: "使い方ガイド 1 / 4",
      title: "まず動画を読み込みます",
      body: "まず素材を読み込みます。読み込んだ後は左から別素材も開けます。"
    },
    {
      selector: "#guideStepModes",
      label: "使い方ガイド 2 / 4",
      title: "確認するSNSを選びます",
      body: "SNSを選ぶと、危険エリアが表示されます。1つでも、複数でも選べます。"
    },
    {
      selector: "#stageSurface",
      label: "使い方ガイド 3 / 4",
      title: "再生して、気になる位置をクリックします",
      body: "画面内の気になる位置をクリックする度に、時間と位置が右に記録されます。メモも残せます。"
    },
    {
      selector: "#guideStepShare",
      label: "使い方ガイド 4 / 4",
      title: "必要なら共有ページで共有します",
      body: "チェック内容を共有ページにすると、そのまま修正指示として共有できます。"
    }
  ];

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
    mediaType: "",
    mediaLoaded: false,
    fileName: "",
    fileSize: 0,
    mediaKey: "",
    flags: [],
    selectedFlagId: "",
    autoStopEnabled: false,
    autoStopTargetTime: null,
    isScrubbing: false,
    stageRatio: DEFAULT_RATIO,
    isHistoryOpen: false,
    isPlatformInfoOpen: false,
    isConfirmOpen: false,
    isOnboardingOpen: false,
    confirmIntent: "",
    pendingFile: null,
    pendingInitialFrame: false,
    onboardingStep: 0,
    isPreviewSeeking: false,
    pdfNeedsAttention: false,
    lastTrackedMediaKey: "",
    currentProjectId: "",
    accountProfile: null,
    normalizedPlan: "free",
    dailyLimit: FREE_DAILY_PDF_LIMIT,
    pdfExportsToday: 0,
    isBetaUnlocked: false,
    stripeSubscriptionStatus: "",
    billingCancelAtPeriodEnd: false,
    billingCurrentPeriodEnd: "",
    hasBillingPortal: false,
    hasCampaignCheckout: false,
    remoteHistoryEntries: [],
    remoteHistoryLoaded: false,
    hasPlaybackStarted: false,
    isCommentEditorOpen: false,
    commentDraft: {
      category: "",
      templateText: "",
      customNote: ""
    },
    freshFlagId: "",
    freshFlagTimer: 0
  };

  var platforms = null;
  var platformMeta = null;
  var els = {};

  function track(eventName, properties) {
    if (typeof window.luminaTrack !== "function") {
      return;
    }

    window.luminaTrack(eventName, properties || {});
  }

  function init() {
    var configSource = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};

    platforms = buildPlatformProfiles(configSource.platforms || DEFAULT_PLATFORM_SETTINGS);
    platformMeta = buildPlatformMeta(configSource.platformMeta || {});

    cacheElements();
    bindEvents();
    renderModeButtons();
    renderSpeedButtons();
    clearPlatformSelection();
    syncPlaybackRate();
    clearMediaStatus();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    setControlsEnabled(false);
    requestStageFit();
    bindAuthPersistence();
    updateHistoryAwareness();
    syncInlineGuide();
    updateWorkspaceSizeNotice();
    track("app_open");
  }

  function bindAuthPersistence() {
    if (!window.luminaAuth || typeof window.luminaAuth.onChange !== "function") {
      return;
    }

    window.luminaAuth.onChange(function (authState) {
      if (!authState || !authState.isAuthenticated) {
        clearAccountProfile();
        state.currentProjectId = "";
        state.remoteHistoryEntries = [];
        state.remoteHistoryLoaded = false;
        if (state.isHistoryOpen) {
          renderHistoryList();
        }
        updateHistoryAwareness();
        return;
      }

      syncUserAndRefreshHistory();
    });
  }

  function getCurrentAuthState() {
    if (!window.luminaAuth || typeof window.luminaAuth.getState !== "function") {
      return null;
    }

    return window.luminaAuth.getState();
  }

  function cacheElements() {
    els.previewColumn = document.getElementById("previewColumn");
    els.viewerDock = document.getElementById("viewerDock");
    els.workspaceSizeNotice = document.getElementById("workspaceSizeNotice");
    els.fileInput = document.getElementById("fileInput");
    els.dropZone = document.getElementById("dropZone");
    els.stageFrame = document.getElementById("stageFrame");
    els.stageSurface = document.getElementById("stageSurface");
    els.riskAreaBlocks = document.getElementById("riskAreaBlocks");
    els.flagPins = document.getElementById("flagPins");
    els.video = document.getElementById("previewVideo");
    els.previewImage = document.getElementById("previewImage");
    els.modeLabel = document.getElementById("modeLabel");
    els.modeDescription = document.getElementById("modeDescription");
    els.platformInfoButton = document.getElementById("platformInfoButton");
    els.platformInfoModal = document.getElementById("platformInfoModal");
    els.platformInfoClose = document.getElementById("platformInfoClose");
    els.modeButtons = document.getElementById("modeButtons");
    els.speedButtons = document.getElementById("speedButtons");
    els.playToggle = document.getElementById("playToggle");
    els.playToggleLabel = document.getElementById("playToggleLabel");
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
    els.sourceLoadButton = document.getElementById("sourceLoadButton");
    els.guideStepSource = document.getElementById("guideStepSource");
    els.guideStepModes = document.getElementById("guideStepModes");
    els.guideStepShare = document.getElementById("guideStepShare");
    els.exportCurrentPdfButton = document.getElementById("exportCurrentPdfButton");
    els.resultsCard = document.getElementById("resultsCard");
    els.flagsCount = document.getElementById("flagsCount");
    els.flagsHint = document.getElementById("flagsHint");
    els.commentEditorTitle = document.getElementById("commentEditorTitle");
    els.commentEditorLead = document.getElementById("commentEditorLead");
    els.commentTargetTime = document.getElementById("commentTargetTime");
    els.commentBackButton = document.getElementById("commentBackButton");
    els.commentCategoryButtons = document.getElementById("commentCategoryButtons");
    els.commentTemplateGroup = document.getElementById("commentTemplateGroup");
    els.commentTemplateSelect = document.getElementById("commentTemplateSelect");
    els.commentTemplatePreview = document.getElementById("commentTemplatePreview");
    els.flagCommentInput = document.getElementById("flagCommentInput");
    els.commentEditorError = document.getElementById("commentEditorError");
    els.saveCommentButton = document.getElementById("saveCommentButton");
    els.clearCommentButton = document.getElementById("clearCommentButton");
    els.flagsEmpty = document.getElementById("flagsEmpty");
    els.flagsList = document.getElementById("flagsList");
    els.clearFlagsButton = document.getElementById("clearFlagsButton");
    els.commentEditor = document.getElementById("commentEditor");
    els.helpToggle = document.getElementById("helpToggle");
    els.historyToggle = document.getElementById("historyToggle");
    els.workspacePlanMeter = document.getElementById("workspacePlanMeter");
    els.workspacePlanLabel = document.getElementById("workspacePlanLabel");
    els.workspacePlanUsage = document.getElementById("workspacePlanUsage");
    els.workspacePlanManage = document.getElementById("workspacePlanManage");
    els.workspaceBillingAction = document.getElementById("workspaceBillingAction");
    els.workspaceBookmarkBanner = document.getElementById("workspaceBookmarkBanner");
    els.workspaceBookmarkDismiss = document.getElementById("workspaceBookmarkDismiss");
    els.guideStageHint = document.getElementById("guideStageHint");
    els.guideStageHintCopy = document.getElementById("guideStageHintCopy");
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
    els.onboardingOverlay = document.getElementById("onboardingOverlay");
    els.onboardingSpotlight = document.getElementById("onboardingSpotlight");
    els.onboardingCard = document.getElementById("onboardingCard");
    els.onboardingStepLabel = document.getElementById("onboardingStepLabel");
    els.onboardingTitle = document.getElementById("onboardingTitle");
    els.onboardingBody = document.getElementById("onboardingBody");
    els.onboardingSkip = document.getElementById("onboardingSkip");
    els.onboardingNext = document.getElementById("onboardingNext");
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
    if (els.exportCurrentPdfButton) {
      els.exportCurrentPdfButton.addEventListener("click", exportCurrentPdf);
    }
    if (els.workspaceBookmarkDismiss) {
      els.workspaceBookmarkDismiss.addEventListener("click", dismissBookmarkHint);
    }
    if (els.workspacePlanManage) {
      els.workspacePlanManage.addEventListener("click", onWorkspacePlanManageClick);
    }
    if (els.workspaceBillingAction) {
      els.workspaceBillingAction.addEventListener("click", onWorkspaceBillingActionClick);
    }
    els.saveCommentButton.addEventListener("click", saveSelectedFlagComment);
    els.clearCommentButton.addEventListener("click", clearSelectedFlagComment);
    els.commentBackButton.addEventListener("click", closeCommentEditor);
    els.commentCategoryButtons.addEventListener("click", onCommentCategoryClick);
    els.commentTemplateSelect.addEventListener("change", onCommentTemplateChange);
    els.flagCommentInput.addEventListener("input", onFlagCommentInputChange);
    els.flagCommentInput.addEventListener("keydown", onFlagCommentInputKeydown);

    els.video.addEventListener("loadedmetadata", onVideoMetadataLoaded);
    els.video.addEventListener("seeked", onVideoSeeked);
    els.video.addEventListener("timeupdate", syncTimeline);
    els.video.addEventListener("play", updateTransportState);
    els.video.addEventListener("pause", updateTransportState);
    els.video.addEventListener("ended", updateTransportState);
    els.video.addEventListener("error", onVideoError);
    els.previewImage.addEventListener("load", onImageLoaded);
    els.previewImage.addEventListener("error", onImageError);

    els.helpToggle.addEventListener("click", function () {
      track("guide_open");
      openOnboarding(0);
    });
    if (els.platformInfoButton) {
      els.platformInfoButton.addEventListener("click", openPlatformInfoModal);
    }
    if (els.historyToggle) {
      els.historyToggle.addEventListener("click", openHistoryModal);
    }
    if (els.platformInfoClose) {
      els.platformInfoClose.addEventListener("click", closePlatformInfoModal);
    }
    if (els.historyClose) {
      els.historyClose.addEventListener("click", closeHistoryModal);
    }
    if (els.platformInfoModal) {
      els.platformInfoModal.addEventListener("click", onPlatformInfoModalClick);
    }
    if (els.historyModal) {
      els.historyModal.addEventListener("click", onHistoryModalClick);
    }
    if (els.historyList) {
      els.historyList.addEventListener("click", onHistoryListClick);
    }
    els.confirmCancel.addEventListener("click", closeConfirmModal);
    els.confirmAccept.addEventListener("click", confirmPendingAction);
    els.confirmModal.addEventListener("click", onConfirmModalClick);
    els.onboardingSkip.addEventListener("click", closeOnboarding);
    els.onboardingNext.addEventListener("click", advanceOnboarding);

    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", function () {
      requestStageFit();
      updateWorkspaceSizeNotice();
    });
    initStageResizeObserver();
    window.addEventListener("beforeunload", releaseObjectUrl);
  }

  function updateWorkspaceSizeNotice() {
    var shouldWarn = (window.innerWidth || 0) > 0 && window.innerWidth < 1360;

    if (!els.workspaceSizeNotice) {
      return;
    }

    els.workspaceSizeNotice.hidden = !shouldWarn;
  }

  function normalizeRiskSettings(base, override) {
    var merged = mergeObjects(base, override || {});

    if (!merged.rightUpper) {
      merged.rightUpper = merged.right;
    }

    if (!merged.stepY) {
      merged.stepY = "48%";
    }

    return merged;
  }

  function buildProfileSettings(baseProfile, overrideProfile) {
    var standardSource = overrideProfile || {};

    return {
      areaModel: standardSource.areaModel || baseProfile.areaModel || "bands",
      highRisk: normalizeRiskSettings(baseProfile.highRisk, standardSource.highRisk),
      caution: normalizeRiskSettings(baseProfile.caution, standardSource.caution),
      highRiskAreas: cloneRiskAreas(standardSource.highRiskAreas || baseProfile.highRiskAreas),
      cautionAreas: cloneRiskAreas(standardSource.cautionAreas || baseProfile.cautionAreas)
    };
  }

  function cloneRiskAreas(areas) {
    return Array.isArray(areas)
      ? areas.map(function (area) {
          return mergeObjects({}, area);
        })
      : [];
  }

  function buildPlatformProfiles(platformMap) {
    var result = {};

    PLATFORM_ORDER.forEach(function (key) {
      var source = platformMap[key] || {};
      var standardSource = source.standard ? source.standard : source;
      var iphoneSource = source.iphoneTall || {};

      result[key] = {
        standard: buildProfileSettings(DEFAULT_PLATFORM_SETTINGS[key].standard, standardSource),
        iphoneTall: buildProfileSettings(DEFAULT_PLATFORM_SETTINGS[key].iphoneTall, iphoneSource)
      };

      if (source.effective || DEFAULT_PLATFORM_SETTINGS[key].effective) {
        result[key].effective = buildProfileSettings(
          DEFAULT_PLATFORM_SETTINGS[key].effective || createEmptyRiskProfile(),
          source.effective || {}
        );
      }
    });

    result.all = {
      standard: buildCompositeProfileSettings(PLATFORM_ORDER, "standard", result),
      iphoneTall: buildCompositeProfileSettings(PLATFORM_ORDER, "iphoneTall", result),
      effective: buildCompositeEffectiveProfileSettings(PLATFORM_ORDER, result)
    };

    return result;
  }

  function buildCompositeProfileSettings(platformKeys, profileKey, profileMap) {
    return platformKeys.reduce(function (accumulator, key) {
      return mergeRiskProfile(accumulator, profileMap[key][profileKey]);
    }, createEmptyRiskProfile());
  }

  function buildCompositeEffectiveProfileSettings(platformKeys, profileMap) {
    return platformKeys.reduce(function (accumulator, key) {
      var sourceProfile = getEffectiveBaseProfile(key, profileMap);
      return mergeResolvedRiskProfile(accumulator, sourceProfile);
    }, createEmptyRiskProfile());
  }

  function getEffectivePlatformSettings(platformSelection) {
    var platformKeys = getPlatformKeys(platformSelection);
    var standardProfile = getPlatformProfileSettings(platformSelection, "standard");
    var iphoneProfile = getPlatformProfileSettings(platformSelection, "iphoneTall");
    var hasAllEffectiveProfiles = platformKeys.length > 0 && platformKeys.every(function (key) {
      return !!(platforms[key] && platforms[key].effective);
    });

    if (hasAllEffectiveProfiles) {
      return buildCompositeEffectiveProfileSettings(platformKeys, platforms);
    }

    if (platformKeys.length === 1) {
      var singleKey = platformKeys[0];
      if (platforms[singleKey] && platforms[singleKey].effective) {
        return platforms[singleKey].effective;
      }
    }

    return mergeRiskProfile(standardProfile, iphoneProfile);
  }

  function createEmptyRiskProfile() {
    return {
      areaModel: "bands",
      highRisk: {
        left: "0%",
        top: "0%",
        right: "0%",
        rightUpper: "0%",
        stepY: "48%",
        bottom: "0%"
      },
      caution: {
        left: "0%",
        top: "0%",
        right: "0%",
        rightUpper: "0%",
        stepY: "48%",
        bottom: "0%"
      },
      highRiskAreas: [],
      cautionAreas: []
    };
  }

  function mergeRiskProfile(leftProfile, rightProfile) {
    return {
      areaModel: "bands",
      highRisk: mergeRiskLevel(leftProfile.highRisk, rightProfile.highRisk),
      caution: mergeRiskLevel(leftProfile.caution, rightProfile.caution),
      highRiskAreas: [],
      cautionAreas: []
    };
  }

  function getEffectiveBaseProfile(platformKey, profileMap) {
    var platformProfile = profileMap[platformKey] || {};

    if (platformProfile.effective) {
      return cloneRiskProfile(platformProfile.effective);
    }

    return mergeRiskProfile(
      cloneRiskProfile(platformProfile.standard || createEmptyRiskProfile()),
      cloneRiskProfile(platformProfile.iphoneTall || createEmptyRiskProfile())
    );
  }

  function mergeResolvedRiskProfile(leftProfile, rightProfile) {
    var left = leftProfile || createEmptyRiskProfile();
    var right = rightProfile || createEmptyRiskProfile();
    var leftUsesBlocks = left.areaModel === "blocks";
    var rightUsesBlocks = right.areaModel === "blocks";

    if (!leftUsesBlocks && !rightUsesBlocks) {
      return mergeRiskProfile(left, right);
    }

    return {
      areaModel: "blocks",
      highRisk: mergeRiskLevel(left.highRisk, right.highRisk),
      caution: mergeRiskLevel(left.caution, right.caution),
      highRiskAreas: mergeRiskAreasByKey(left.highRiskAreas, right.highRiskAreas),
      cautionAreas: mergeRiskAreasByKey(left.cautionAreas, right.cautionAreas)
    };
  }

  function cloneRiskProfile(profile) {
    var source = profile || createEmptyRiskProfile();
    return {
      areaModel: source.areaModel || "bands",
      highRisk: mergeObjects(createEmptyRiskProfile().highRisk, source.highRisk || {}),
      caution: mergeObjects(createEmptyRiskProfile().caution, source.caution || {}),
      highRiskAreas: cloneRiskAreas(source.highRiskAreas),
      cautionAreas: cloneRiskAreas(source.cautionAreas)
    };
  }

  function mergeRiskAreasByKey(leftAreas, rightAreas) {
    var mergedMap = {};
    var orderedKeys = [];

    function upsert(area) {
      var key = String((area && area.key) || "");

      if (!key) {
        return;
      }

      if (!mergedMap[key]) {
        mergedMap[key] = normalizeRiskAreaRect(area);
        orderedKeys.push(key);
        return;
      }

      mergedMap[key] = mergeRiskAreaRect(mergedMap[key], normalizeRiskAreaRect(area));
    }

    cloneRiskAreas(leftAreas).forEach(upsert);
    cloneRiskAreas(rightAreas).forEach(upsert);

    return orderedKeys.map(function (key) {
      return denormalizeRiskAreaRect(mergedMap[key]);
    });
  }

  function normalizeRiskAreaRect(area) {
    var width = percentToNumber(area.width || "0%");
    var height = percentToNumber(area.height || "0%");
    var left = area.left !== undefined
      ? percentToNumber(area.left)
      : 100 - percentToNumber(area.right || "0%") - width;
    var top = area.top !== undefined
      ? percentToNumber(area.top)
      : 100 - percentToNumber(area.bottom || "0%") - height;

    return {
      key: area.key,
      zone: area.zone || "center",
      left: left,
      top: top,
      right: Math.max(0, 100 - left - width),
      bottom: Math.max(0, 100 - top - height),
      width: width,
      height: height,
      radius: area.radius || ""
    };
  }

  function mergeRiskAreaRect(leftArea, rightArea) {
    var left = Math.min(leftArea.left, rightArea.left);
    var top = Math.min(leftArea.top, rightArea.top);
    var right = Math.min(leftArea.right, rightArea.right);
    var bottom = Math.min(leftArea.bottom, rightArea.bottom);

    return {
      key: leftArea.key,
      zone: leftArea.zone || rightArea.zone || "center",
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      width: Math.max(0, 100 - left - right),
      height: Math.max(0, 100 - top - bottom),
      radius: leftArea.radius || rightArea.radius || ""
    };
  }

  function denormalizeRiskAreaRect(area) {
    return {
      key: area.key,
      zone: area.zone,
      left: area.left + "%",
      top: area.top + "%",
      width: area.width + "%",
      height: area.height + "%",
      radius: area.radius
    };
  }

  function mergeRiskLevel(leftRisk, rightRisk) {
    return {
      left: Math.max(percentToNumber(leftRisk.left), percentToNumber(rightRisk.left)) + "%",
      top: Math.max(percentToNumber(leftRisk.top), percentToNumber(rightRisk.top)) + "%",
      right: Math.max(percentToNumber(leftRisk.right), percentToNumber(rightRisk.right)) + "%",
      rightUpper: Math.max(percentToNumber(leftRisk.rightUpper), percentToNumber(rightRisk.rightUpper)) + "%",
      stepY: Math.max(percentToNumber(leftRisk.stepY), percentToNumber(rightRisk.stepY)) + "%",
      bottom: Math.max(percentToNumber(leftRisk.bottom), percentToNumber(rightRisk.bottom)) + "%"
    };
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
      var buttonClass = key === "all" ? "platform-token platform-token-all" : "platform-token platform-token-icon-only";
      return (
        '<button class="' + buttonClass + '" type="button" data-platform="' + key + '" aria-label="' + meta.label + '"' +
        ' style="--button-accent:' + meta.accent + ";--button-accent-secondary:" + meta.accentSecondary + ";--button-accent-soft:" + meta.accentSoft + ';">' +
        '<span class="platform-token-core">' +
        getPlatformIconMarkup(key, meta) +
        "</span>" +
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
      var speedLabel = speed === 1 ? "通常速度" : "早見速度";

      return (
        '<button class="segment-button speed-icon-button" type="button" data-speed="' + speed + '" aria-label="' + speedLabel + '" title="' + speedLabel + '">' +
        getSpeedIconMarkup(speed) +
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

  function getSpeedIconMarkup(speed) {
    if (speed === 1) {
      return (
        '<svg class="speed-icon speed-icon-walk" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M13.1 4.3a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0Zm-1.9 3.3c.7 0 1.4.3 1.8.9l1.5 2.2 2.1 1.1-.8 1.6-2.7-1.3-1.1-1.5-.8 3.3 2.8 2.1v4h-2v-3l-2.2-1.5-1 4.5H6.7l1.6-7 1-3.7-1.6.9-1.1 2.7-1.8-.7 1.3-3.2 3.4-2c.5-.3 1.1-.4 1.7-.4Z"></path>' +
        "</svg>"
      );
    }

    return (
      '<svg class="speed-icon speed-icon-run" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M15 4.2a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0ZM11.2 7c.8 0 1.5.3 2 .9l1.7 2 2.6.2-.1 1.9-3.5-.3-1-1.1-1.1 2.2 2.7 1.7 1.6 5.1-2 .6-1.3-4.1-2.7-1.5-2.2 5.2-1.9-.8 2.4-5.7 1.1-2.5-1.8.9-1.9 2.3-1.5-1.2 2.2-2.7 3.6-2.6c.4-.3.8-.5 1.4-.5Z"></path>' +
      "</svg>"
    );
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

      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.setAttribute("data-selected", isActive ? "true" : "false");
    });

    setModeDescription(EMPTY_MODE_DESCRIPTION);
  }

  function hasActiveSelection() {
    return Array.isArray(state.activePlatforms) && state.activePlatforms.length > 0;
  }

  function updateFlagsHint() {
    if (!els.flagsHint) {
      return;
    }

    els.flagsHint.textContent = "止めて、気になる位置をクリック";
  }

  function setModeDescription(text) {
    if (!els.modeDescription) {
      return;
    }

    els.modeDescription.textContent = text || "";
    els.modeDescription.hidden = !text;
  }

  function getInlineGuideStep() {
    if (!hasMediaLoaded()) {
      return "source";
    }

    if (!hasActiveSelection()) {
      return "platform";
    }

    if (state.mediaType === "image") {
      if (!state.flags.length) {
        return "click";
      }

      if (state.freshFlagId) {
        return "memo";
      }

      return "";
    }

    if (!state.hasPlaybackStarted && !state.flags.length) {
      return "play";
    }

    if (!state.flags.length) {
      return "click";
    }

    if (state.freshFlagId) {
      return "memo";
    }

    return "";
  }

  function syncInlineGuide() {
    var step = getInlineGuideStep();
    var sourceHeader = els.guideStepSource ? els.guideStepSource.querySelector(".card-header") : null;
    var modesHeader = els.guideStepModes ? els.guideStepModes.querySelector(".card-header") : null;

    if (sourceHeader) {
      sourceHeader.removeAttribute("data-guide-tag");
    }

    if (modesHeader) {
      modesHeader.removeAttribute("data-guide-tag");
    }

    if (els.guideStepShare) {
      els.guideStepShare.removeAttribute("data-guide-tag");
    }

    if (els.playToggle) {
      els.playToggle.removeAttribute("data-guide-tag");
    }

    if (els.guideStepSource) {
      els.guideStepSource.classList.remove("is-guide-active");
    }

    if (els.guideStepModes) {
      els.guideStepModes.classList.remove("is-guide-active");
    }

    if (els.guideStepShare) {
      els.guideStepShare.classList.remove("is-guide-active");
    }

    if (els.playToggle) {
      els.playToggle.classList.remove("is-guide-active");
    }

    if (els.stageSurface) {
      els.stageSurface.classList.remove("is-guide-click");
    }

    if (els.sourceLoadButton) {
      els.sourceLoadButton.classList.toggle("is-guide-active", step === "source");
    }

    if (els.guideStageHint) {
      els.guideStageHint.hidden = step !== "click";
    }

    if (els.guideStageHintCopy) {
      els.guideStageHintCopy.textContent = "画面内の気になる位置をクリック";
    }

    setModeDescription(EMPTY_MODE_DESCRIPTION);

    if (!els.flagsHint) {
      return;
    }

    if (step === "source") {
      els.flagsHint.textContent = "素材を読み込んで開始";
      return;
    }

    if (step === "platform") {
      els.flagsHint.textContent = "SNSを選んで確認";
      return;
    }

    if (step === "play") {
      els.flagsHint.textContent = "止めて、気になる位置をクリック";
      return;
    }

    if (step === "click") {
      els.flagsHint.textContent = "止めて、気になる位置をクリック";
      return;
    }

    if (step === "memo") {
      els.flagsHint.textContent = "修正内容を追加できます";
      return;
    }

    updateFlagsHint();
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
    updatePdfButtons();
  }

  function applyProfileToSurface(surfaceEl, settings, platformSelection, profileKey) {
    var platformKey = normalizePlatformKey(platformSelection);
    var platformKeys = getPlatformKeys(platformKey);

    if (!surfaceEl || !settings) {
      return;
    }

    surfaceEl.dataset.platform =
      platformKey === "all" ? "all" : (platformKeys.length === 1 ? platformKeys[0] : "combo");
    surfaceEl.dataset.profile = profileKey || "standard";
    surfaceEl.dataset.overlayModel = settings.areaModel || "bands";
    surfaceEl.classList.add("has-selection");
    surfaceEl.style.setProperty("--risk-high-top", settings.highRisk.top);
    surfaceEl.style.setProperty("--risk-high-right", settings.highRisk.right);
    surfaceEl.style.setProperty("--risk-high-bottom", settings.highRisk.bottom);
    surfaceEl.style.setProperty("--risk-high-left", settings.highRisk.left);
    surfaceEl.style.setProperty("--risk-high-right-upper", settings.highRisk.rightUpper);
    surfaceEl.style.setProperty("--risk-high-step-y", settings.highRisk.stepY);
    surfaceEl.style.setProperty("--risk-caution-top", settings.caution.top);
    surfaceEl.style.setProperty("--risk-caution-right", settings.caution.right);
    surfaceEl.style.setProperty("--risk-caution-bottom", settings.caution.bottom);
    surfaceEl.style.setProperty("--risk-caution-left", settings.caution.left);
    surfaceEl.style.setProperty("--risk-caution-right-upper", settings.caution.rightUpper);
    surfaceEl.style.setProperty("--risk-caution-step-y", settings.caution.stepY);
    renderRiskAreaBlocks(settings);
    triggerOverlayWipe();
  }

  function clearProfileSurface(surfaceEl, settings, profileKey) {
    if (!surfaceEl || !settings) {
      return;
    }

    surfaceEl.dataset.platform = "none";
    surfaceEl.dataset.profile = profileKey || "standard";
    surfaceEl.dataset.overlayModel = settings.areaModel || "bands";
    surfaceEl.classList.remove("has-selection");
    surfaceEl.style.setProperty("--risk-high-top", settings.highRisk.top);
    surfaceEl.style.setProperty("--risk-high-right", settings.highRisk.right);
    surfaceEl.style.setProperty("--risk-high-bottom", settings.highRisk.bottom);
    surfaceEl.style.setProperty("--risk-high-left", settings.highRisk.left);
    surfaceEl.style.setProperty("--risk-high-right-upper", settings.highRisk.rightUpper);
    surfaceEl.style.setProperty("--risk-high-step-y", settings.highRisk.stepY);
    surfaceEl.style.setProperty("--risk-caution-top", settings.caution.top);
    surfaceEl.style.setProperty("--risk-caution-right", settings.caution.right);
    surfaceEl.style.setProperty("--risk-caution-bottom", settings.caution.bottom);
    surfaceEl.style.setProperty("--risk-caution-left", settings.caution.left);
    surfaceEl.style.setProperty("--risk-caution-right-upper", settings.caution.rightUpper);
    surfaceEl.style.setProperty("--risk-caution-step-y", settings.caution.stepY);
    renderRiskAreaBlocks(settings);
  }

  function renderRiskAreaBlocks(settings) {
    if (!els.riskAreaBlocks) {
      return;
    }

    if (!settings || settings.areaModel !== "blocks") {
      els.riskAreaBlocks.innerHTML = "";
      return;
    }

    els.riskAreaBlocks.innerHTML = renderRiskAreaGroup("caution", settings.cautionAreas || []) +
      renderRiskAreaGroup("high", settings.highRiskAreas || []);
  }

  function renderRiskAreaGroup(level, areas) {
    return areas.map(function (area) {
      var style = buildAreaStyle(area);
      var radius = area.radius ? " style=\"" + style + "border-radius:" + area.radius + ";\"" : " style=\"" + style + "\"";
      return '<div class="risk-area-block risk-area-block-' + level + ' risk-area-block-' + area.key + '"' +
        ' data-zone="' + area.zone + '"' + radius + "></div>";
    }).join("");
  }

  function buildAreaStyle(area) {
    var style = "";
    ["top", "right", "bottom", "left", "width", "height"].forEach(function (key) {
      if (area[key] !== undefined) {
        style += key + ":" + area[key] + ";";
      }
    });
    return style;
  }

  function triggerOverlayWipe() {
    if (!els.boundaryOverlay) {
      return;
    }

    els.boundaryOverlay.classList.remove("is-wiping-in");
    void els.boundaryOverlay.offsetWidth;
    els.boundaryOverlay.classList.add("is-wiping-in");
    window.setTimeout(function () {
      if (els.boundaryOverlay) {
        els.boundaryOverlay.classList.remove("is-wiping-in");
      }
    }, 460);
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
    var selectedProfile = getEffectivePlatformSettings(platformKey);
    var meta = getPlatformMeta(platformKey);
    var platformKeys = getPlatformKeys(platformKey);

    if (!selectedProfile || !meta) {
      return;
    }

    state.activePlatform = platformKey;
    state.activePlatforms = platformKeys;
    applyProfileToSurface(els.stageSurface, selectedProfile, platformKey, "standard");

    if (els.modeLabel) {
      els.modeLabel.textContent = EMPTY_MODE_LABEL;
    }
    setModeDescription(EMPTY_MODE_DESCRIPTION);

    setPlatformTheme(meta);
    updatePlatformButtons();
    updateFlagsHint();
    updateAutoStopButton();
    syncInlineGuide();
    track("platform_select", {
      platform: platformKey,
      platform_count: platformKeys.length
    });
  }

  function clearPlatformSelection() {
    var fallbackMeta = getPlatformMeta("all");
    var fallbackProfile = getEffectivePlatformSettings("all");
    if (hasMediaLoaded() && !els.video.paused) {
      els.video.pause();
      updateTransportState();
    }

    state.activePlatform = "";
    state.activePlatforms = [];
    clearProfileSurface(els.stageSurface, fallbackProfile, "standard");
    if (els.modeLabel) {
      els.modeLabel.textContent = EMPTY_MODE_LABEL;
    }
    setModeDescription(EMPTY_MODE_DESCRIPTION);
    setPlatformTheme(fallbackMeta);
    updatePlatformButtons();
    updateFlagsHint();
    updateAutoStopButton();
    syncInlineGuide();
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

    if (!looksLikeVideo(file) && !looksLikeImage(file)) {
      showToast("動画または画像ファイルを選んでください。", "error");
      return;
    }

    reader = new FileReader();
    reader.onerror = function () {
      showToast("ファイルのローカル読込に失敗しました。", "error");
    };
    reader.onload = function () {
      if (looksLikeVideo(file)) {
        loadVideoFromFile(file);
        return;
      }

      loadImageFromFile(file);
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  }

  function loadVideoFromFile(file) {
    releaseObjectUrl();
    resetPreviewMediaElement();

    state.fileName = file.name;
    state.fileSize = file.size;
    state.mediaKey = buildMediaKey(file);
    state.mediaType = "video";
    state.mediaLoaded = false;
    state.flags = readFlagsFromStorage(state.mediaKey);
    state.selectedFlagId = "";
    state.autoStopTargetTime = null;
    state.pendingFile = null;
    state.pendingInitialFrame = true;
    state.isPreviewSeeking = false;
    state.pdfNeedsAttention = state.flags.length > 0;
    state.lastTrackedMediaKey = "";
    state.currentProjectId = "";
    state.hasPlaybackStarted = false;
    state.objectUrl = URL.createObjectURL(file);

    els.stageSurface.dataset.mediaType = "video";
    els.video.src = state.objectUrl;
    els.video.playbackRate = state.playbackRate;
    els.stageSurface.classList.add("has-media");

    els.metaName.textContent = file.name;
    els.metaName.title = file.name;
    els.metaSize.textContent = formatBytes(file.size);
    els.metaSize.title = formatBytes(file.size);
    els.metaDuration.textContent = "--:--";
    els.metaResolution.textContent = "-- × --";
    updateSourceLoadButton();

    clearPlatformSelection();
    closeConfirmModal();
    setControlsEnabled(false);
    syncTimeline();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    requestStageFit();
    maybeLoadRemoteProjectSnapshot(state.mediaKey);
    showToast(file.name + " を読み込みました。", "success");
  }

  function loadImageFromFile(file) {
    releaseObjectUrl();
    resetPreviewMediaElement();

    state.fileName = file.name;
    state.fileSize = file.size;
    state.mediaKey = buildMediaKey(file);
    state.mediaType = "image";
    state.mediaLoaded = false;
    state.flags = readFlagsFromStorage(state.mediaKey);
    state.selectedFlagId = "";
    state.autoStopTargetTime = null;
    state.pendingFile = null;
    state.pendingInitialFrame = false;
    state.isPreviewSeeking = false;
    state.pdfNeedsAttention = state.flags.length > 0;
    state.lastTrackedMediaKey = "";
    state.currentProjectId = "";
    state.hasPlaybackStarted = true;
    state.objectUrl = URL.createObjectURL(file);

    els.stageSurface.dataset.mediaType = "image";
    els.previewImage.src = state.objectUrl;
    els.stageSurface.classList.add("has-media");

    els.metaName.textContent = file.name;
    els.metaName.title = file.name;
    els.metaSize.textContent = formatBytes(file.size);
    els.metaSize.title = formatBytes(file.size);
    els.metaDuration.textContent = "静止画";
    els.metaResolution.textContent = "-- × --";
    updateSourceLoadButton();

    clearPlatformSelection();
    closeConfirmModal();
    setControlsEnabled(false);
    syncTimeline();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    requestStageFit();
    maybeLoadRemoteProjectSnapshot(state.mediaKey);
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

    state.mediaLoaded = true;
    els.metaDuration.textContent = formatDuration(duration);
    els.totalTime.textContent = formatDuration(duration);
    if (state.mediaKey && state.mediaKey !== state.lastTrackedMediaKey) {
      state.lastTrackedMediaKey = state.mediaKey;
      track("video_load_success", {
        duration_seconds: Math.round(duration || 0),
        resolution: width > 0 && height > 0 ? width + "x" + height : "unknown"
      });
    }
    persistHistorySnapshot();
    setControlsEnabled(true);
    requestStageFit();
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
    syncInlineGuide();
  }

  function onImageLoaded() {
    var width = els.previewImage.naturalWidth;
    var height = els.previewImage.naturalHeight;

    if (width > 0 && height > 0) {
      state.stageRatio = width / height;
      els.stageSurface.style.aspectRatio = width + " / " + height;
      els.metaResolution.textContent = width + " × " + height;
    }

    state.mediaLoaded = true;
    els.metaDuration.textContent = "静止画";
    els.currentTime.textContent = "00:00";
    els.totalTime.textContent = "00:00";
    els.timeline.value = 0;
    els.timeline.max = 1000;
    els.timeline.style.setProperty("--range-progress", "0%");

    if (state.mediaKey && state.mediaKey !== state.lastTrackedMediaKey) {
      state.lastTrackedMediaKey = state.mediaKey;
      track("image_load_success", {
        resolution: width > 0 && height > 0 ? width + "x" + height : "unknown"
      });
    }

    persistHistorySnapshot();
    setControlsEnabled(true);
    requestStageFit();
    updateTransportState();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    syncInlineGuide();
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
    resetPreviewMediaElement();
    resetReviewState();
    clearMediaStatus();
    clearPlatformSelection();
    els.stageSurface.classList.remove("has-media");
    state.stageRatio = DEFAULT_RATIO;
    els.stageSurface.dataset.mediaType = "video";
    els.stageSurface.style.aspectRatio = "9 / 16";
    setControlsEnabled(false);
    updateTransportState();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    requestStageFit();
    showToast("動画プレビューの初期化に失敗しました。別の形式をお試しください。", "error");
  }

  function onImageError() {
    releaseObjectUrl();
    resetPreviewMediaElement();
    resetReviewState();
    clearMediaStatus();
    clearPlatformSelection();
    els.stageSurface.classList.remove("has-media");
    state.stageRatio = DEFAULT_RATIO;
    els.stageSurface.dataset.mediaType = "video";
    els.stageSurface.style.aspectRatio = "9 / 16";
    setControlsEnabled(false);
    updateTransportState();
    renderFlags();
    renderCommentEditor();
    updateAutoStopButton();
    requestStageFit();
    showToast("画像プレビューの初期化に失敗しました。別の形式をお試しください。", "error");
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
    updateSourceLoadButton();
  }

  function resetReviewState() {
    state.mediaType = "";
    state.mediaLoaded = false;
    state.fileName = "";
    state.fileSize = 0;
    state.mediaKey = "";
    state.flags = [];
    state.selectedFlagId = "";
    state.autoStopTargetTime = null;
    state.pendingInitialFrame = false;
    state.isPreviewSeeking = false;
    state.pdfNeedsAttention = false;
    state.hasPlaybackStarted = false;
  }

  function updateSourceLoadButton() {
    var label;

    if (!els.sourceLoadButton) {
      return;
    }

    label = els.sourceLoadButton.querySelector(".source-load-button-label");

    if (label) {
      label.textContent = state.fileName ? "別素材を読み込む" : "素材を読み込む";
      return;
    }

    els.sourceLoadButton.textContent = state.fileName ? "別素材を読み込む" : "素材を読み込む";
  }

  function normalizePlanValue(plan) {
    var value = String(plan || "free").toLowerCase();

    if (value === "pro" || value === "team" || value === "beta_pro") {
      return "pro";
    }

    return "free";
  }

  function applyAccountProfile(profile) {
    state.accountProfile = profile || null;
    state.normalizedPlan = normalizePlanValue(profile && profile.plan);
    state.dailyLimit = Number(profile && profile.daily_limit) || FREE_DAILY_PDF_LIMIT;
    state.isBetaUnlocked = !!(profile && profile.beta_unlocked);
    state.stripeSubscriptionStatus = String(profile && profile.stripe_subscription_status || "");
    state.billingCancelAtPeriodEnd = !!(profile && profile.billing_cancel_at_period_end);
    state.billingCurrentPeriodEnd = String(profile && profile.billing_current_period_end || "");
    syncBillingCapabilities();
    updatePlanMeter();
    updateBookmarkHint();
    updatePdfButtons();
  }

  function clearAccountProfile() {
    state.accountProfile = null;
    state.normalizedPlan = "free";
    state.dailyLimit = FREE_DAILY_PDF_LIMIT;
    state.pdfExportsToday = 0;
    state.isBetaUnlocked = false;
    state.stripeSubscriptionStatus = "";
    state.billingCancelAtPeriodEnd = false;
    state.billingCurrentPeriodEnd = "";
    state.hasBillingPortal = false;
    state.hasCampaignCheckout = false;
    updatePlanMeter();
    updateBookmarkHint();
    updatePdfButtons();
  }

  function syncBillingCapabilities() {
    if (!window.luminaAuth || typeof window.luminaAuth.getBillingCapabilities !== "function") {
      state.hasBillingPortal = false;
      state.hasCampaignCheckout = false;
      updateWorkspaceBillingAction();
      updateWorkspacePlanManageAction();
      return;
    }

    window.luminaAuth.getBillingCapabilities()
      .then(function (capabilities) {
        state.hasBillingPortal = !!(capabilities && capabilities.hasPortal);
        state.hasCampaignCheckout = !!(capabilities && capabilities.hasCampaignCheckout);
        updateWorkspaceBillingAction();
        updateWorkspacePlanManageAction();
      })
      .catch(function () {
        state.hasBillingPortal = false;
        state.hasCampaignCheckout = false;
        updateWorkspaceBillingAction();
        updateWorkspacePlanManageAction();
      });
  }

  function canUseLocalStorage() {
    try {
      return !!window.localStorage;
    } catch (error) {
      return false;
    }
  }

  function hasDismissedBookmarkHint() {
    if (!canUseLocalStorage()) {
      return false;
    }

    return window.localStorage.getItem(BOOKMARK_HINT_DISMISSED_KEY) === "1";
  }

  function dismissBookmarkHint() {
    if (canUseLocalStorage()) {
      window.localStorage.setItem(BOOKMARK_HINT_DISMISSED_KEY, "1");
    }

    updateBookmarkHint();
  }

  function updateBookmarkHint() {
    var authState = getCurrentAuthState();
    var shouldShow = !!(els.workspaceBookmarkBanner && authState && authState.isAuthenticated && !hasDismissedBookmarkHint());

    if (!els.workspaceBookmarkBanner) {
      return;
    }

    els.workspaceBookmarkBanner.hidden = !shouldShow;
  }

  function updateWorkspaceBillingAction() {
    var authState = getCurrentAuthState();
    var shouldShow = !!(
      els.workspaceBillingAction &&
      authState &&
      authState.isAuthenticated &&
      !hasUnlimitedPdfAccess()
    );

    if (!els.workspaceBillingAction) {
      return;
    }

    els.workspaceBillingAction.hidden = !shouldShow;
    els.workspaceBillingAction.classList.remove("is-urgent");

    if (!shouldShow) {
      return;
    }

    if (isPdfExportLocked()) {
      els.workspaceBillingAction.textContent = state.hasCampaignCheckout ? "特別プランで無制限にする" : "PROで無制限にする";
      els.workspaceBillingAction.title = state.hasCampaignCheckout
        ? "本日の無料枠を使い切っています。特別プランなら無制限で共有できます。"
        : "本日の無料枠を使い切っています。PROなら無制限で共有できます。";
      els.workspaceBillingAction.classList.add("is-urgent");
      return;
    }

    els.workspaceBillingAction.textContent = state.hasCampaignCheckout ? "特別プランを開始" : "PROにする";
    els.workspaceBillingAction.title = state.hasCampaignCheckout
      ? "キャンペーン中の特別プランで無制限に使い始められます。"
      : "月額1,080円で無制限に使えます。";
    els.workspaceBillingAction.classList.remove("is-urgent");
  }

  function updateWorkspacePlanManageAction() {
    var authState = getCurrentAuthState();
    var shouldShow = !!(
      els.workspacePlanManage &&
      authState &&
      authState.isAuthenticated &&
      state.hasBillingPortal &&
      (state.normalizedPlan === "pro" || state.billingCancelAtPeriodEnd || !!state.stripeSubscriptionStatus)
    );

    if (!els.workspacePlanManage) {
      return;
    }

    els.workspacePlanManage.hidden = !shouldShow;
    els.workspacePlanManage.textContent = state.billingCancelAtPeriodEnd ? "契約を確認" : "プラン管理";
    els.workspacePlanManage.title = state.billingCancelAtPeriodEnd
      ? "解約予定日や契約内容を確認できます。"
      : "支払い方法や解約設定を確認できます。";
  }

  function hasUnlimitedPdfAccess() {
    return state.isBetaUnlocked || state.normalizedPlan === "pro";
  }

  function getBillingPeriodEndDateText() {
    if (!state.billingCurrentPeriodEnd) {
      return "";
    }

    try {
      var date = new Date(state.billingCurrentPeriodEnd);

      if (!date || Number.isNaN(date.getTime())) {
        return "";
      }

      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(date);
    } catch (error) {
      return "";
    }
  }

  function getRemainingPdfExports() {
    var dailyLimit = Number(state.dailyLimit) || FREE_DAILY_PDF_LIMIT;

    if (hasUnlimitedPdfAccess()) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.max(0, dailyLimit - (Number(state.pdfExportsToday) || 0));
  }

  function isPdfExportLocked() {
    return !hasUnlimitedPdfAccess() && getRemainingPdfExports() <= 0;
  }

  function updatePlanMeter() {
    var authState = getCurrentAuthState();
    var planValue = String(state.accountProfile && state.accountProfile.plan || "").toLowerCase();
    var label = "無料";
    var usage = "";

    if (!els.workspacePlanMeter || !els.workspacePlanLabel || !els.workspacePlanUsage) {
      return;
    }

    if (!authState || !authState.isAuthenticated) {
      els.workspacePlanMeter.hidden = true;
      els.workspacePlanMeter.classList.remove("is-pro", "is-beta", "is-limit");
      return;
    }

    if (state.isBetaUnlocked || planValue === "beta_pro") {
      label = "無料β";
      usage = "フル機能を利用可能";
    } else if (state.normalizedPlan === "pro") {
      label = "PRO";
      if (state.billingCancelAtPeriodEnd) {
        usage = getBillingPeriodEndDateText()
          ? getBillingPeriodEndDateText() + "まで利用可能"
          : "解約予約中";
      } else {
        usage = "無制限";
      }
    } else {
      label = "無料";
      usage = getRemainingPdfExports() > 0
        ? "本日あと" + getRemainingPdfExports() + "回"
        : "本日の無料枠を利用済み";
    }

    els.workspacePlanMeter.hidden = false;
    els.workspacePlanLabel.textContent = label;
    els.workspacePlanUsage.textContent = usage;
    els.workspacePlanMeter.classList.toggle("is-pro", state.normalizedPlan === "pro" && !state.isBetaUnlocked);
    els.workspacePlanMeter.classList.toggle("is-beta", state.isBetaUnlocked || planValue === "beta_pro");
    els.workspacePlanMeter.classList.toggle("is-limit", isPdfExportLocked());
    els.workspacePlanMeter.classList.toggle("is-canceling", state.normalizedPlan === "pro" && state.billingCancelAtPeriodEnd);
    updateWorkspacePlanManageAction();
    updateWorkspaceBillingAction();
    updateBookmarkHint();
  }

  function onWorkspaceBillingActionClick() {
    var checkoutStarter = state.hasCampaignCheckout ? "startCampaignCheckout" : "startProCheckout";

    if (window.luminaAuth && typeof window.luminaAuth[checkoutStarter] === "function") {
      window.luminaAuth[checkoutStarter]().catch(function (error) {
        console.error("Failed to start checkout from workspace bar", error);
        showToast("決済画面を開けませんでした。しばらくしてからお試しください。", "warning");
      });
      return;
    }

    window.location.href = state.hasCampaignCheckout ? "./login.html?intent=campaign" : "./login.html?intent=pro";
  }

  function onWorkspacePlanManageClick() {
    if (window.luminaAuth && typeof window.luminaAuth.startBillingPortal === "function") {
      window.luminaAuth.startBillingPortal().catch(function (error) {
        console.error("Failed to open billing portal", error);
        showToast("プラン管理ページを開けませんでした。しばらくしてからお試しください。", "warning");
      });
      return;
    }

    showToast("プラン管理ページを開けませんでした。しばらくしてからお試しください。", "warning");
  }

  function refreshPdfUsageCount() {
    if (!window.luminaDb || typeof window.luminaDb.getPdfExportsTodayCount !== "function") {
      state.pdfExportsToday = 0;
      updatePlanMeter();
      updatePdfButtons();
      return Promise.resolve(0);
    }

    return window.luminaDb.getPdfExportsTodayCount()
      .then(function (count) {
        state.pdfExportsToday = Number(count) || 0;
        updatePlanMeter();
        updatePdfButtons();
        return state.pdfExportsToday;
      })
      .catch(function (error) {
        console.warn("Failed to refresh pdf export usage", error);
        updatePlanMeter();
        updatePdfButtons();
        return state.pdfExportsToday;
      });
  }

  function ensurePdfExportAvailable() {
    if (!isPdfExportLocked()) {
      return Promise.resolve(true);
    }

    showToast(PDF_LIMIT_REACHED_MESSAGE, "warning");
    updatePlanMeter();
    updatePdfButtons();
    return Promise.resolve(false);
  }

  function setControlsEnabled(enabled) {
    var playbackEnabled = enabled && state.mediaType === "video";

    els.playToggle.disabled = !playbackEnabled;
    els.frameBack.disabled = !playbackEnabled;
    els.frameForward.disabled = !playbackEnabled;
    els.timeline.disabled = !playbackEnabled;
    els.clearFlagsButton.disabled = !enabled || !state.flags.length;
    els.clearFlagsButton.title = state.flags.length ? "今のチェック記録をすべて削除します。" : HINT_NEEDS_RECORDS;
    updatePdfButtons();
    syncInlineGuide();
  }

  function updatePdfButtons() {
    var hasCurrentPdf = hasMediaLoaded() && state.flags.length > 0;
    var shouldSuggestCurrentPdf = hasCurrentPdf && state.pdfNeedsAttention;
    var isLocked = isPdfExportLocked();
    var currentTitle = hasCurrentPdf ? "今のチェック内容を共有ページで開きます。" : HINT_NEEDS_RECORDS;

    if (els.exportCurrentPdfButton) {
      els.exportCurrentPdfButton.disabled = !hasCurrentPdf || isLocked;
      els.exportCurrentPdfButton.title = hasCurrentPdf && isLocked ? PDF_LIMIT_REACHED_MESSAGE : currentTitle;
      els.exportCurrentPdfButton.classList.toggle("is-suggested", shouldSuggestCurrentPdf && !isLocked);
      els.exportCurrentPdfButton.classList.toggle("is-locked", !!(hasCurrentPdf && isLocked));
    }
  }

  function togglePlayback() {
    if (!hasMediaLoaded()) {
      showToast("先に素材を読み込んでください。", "warning");
      return;
    }

    if (!hasActiveSelection()) {
      showToast("確認するSNSを1つ以上選んでください。", "warning");
      return;
    }

    if (state.mediaType !== "video") {
      showToast("静止画では再生できません。画面をクリックして記録できます。", "info");
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
    if (!hasMediaLoaded() || state.mediaType !== "video") {
      return;
    }

    jumpToTime(els.video.currentTime + seconds, false);
  }

  function stepFrame(direction) {
    if (!hasMediaLoaded() || state.mediaType !== "video") {
      return;
    }

    els.video.pause();
    jumpToTime(els.video.currentTime + (direction * (1 / (state.frameRate || DEFAULT_FRAME_RATE))), true);
    updateTransportState();
  }

  function onTimelineInput(event) {
    if (!hasMediaLoaded() || state.mediaType !== "video") {
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
    var duration = state.mediaType === "video" && isFinite(els.video.duration) ? els.video.duration : 0;
    var currentTime = state.mediaType === "video" && duration ? clamp(els.video.currentTime, 0, duration) : 0;
    var progress = duration ? (currentTime / duration) * 100 : 0;

    els.currentTime.textContent = formatDuration(currentTime);
    els.totalTime.textContent = formatDuration(duration);
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
    var isPlaying = state.mediaType === "video" && !els.video.paused;

    if (isPlaying) {
      state.hasPlaybackStarted = true;
    }

    els.playToggle.classList.toggle("is-playing", isPlaying);
    els.playToggleLabel.textContent = state.mediaType === "image" ? "静止画" : (isPlaying ? "停止" : "再生");

    if (isPlaying) {
      armAutoStopTarget();
      syncInlineGuide();
      return;
    }

    state.autoStopTargetTime = null;
    syncInlineGuide();
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

    if (!state.autoStopEnabled || !hasMediaLoaded() || state.mediaType !== "video" || els.video.paused) {
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

    if (!state.autoStopEnabled || state.mediaType !== "video" || els.video.paused || state.autoStopTargetTime === null) {
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
      showToast("確認するSNSを1つ以上選んでください。", "warning");
      return;
    }

    if (event.target.closest("[data-flag-pin]")) {
      return;
    }

    rect = els.stageSurface.getBoundingClientRect();
    xRatio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    yRatio = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    if (state.mediaType === "video") {
      els.video.pause();
    }

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
    if (state.mediaType === "video") {
      els.video.pause();
    }
    updateTransportState();
  }

  function preventDefaultDrag(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onKeydown(event) {
    var activeTag = document.activeElement && document.activeElement.tagName;

    if (state.isOnboardingOpen && event.key === "Escape") {
      event.preventDefault();
      closeOnboarding();
      return;
    }

    if (state.isOnboardingOpen) {
      if (event.key === "Enter") {
        event.preventDefault();
        advanceOnboarding();
      }
      return;
    }

    if (state.isHistoryOpen && event.key === "Escape") {
      event.preventDefault();
      closeHistoryModal();
      return;
    }

    if (state.isPlatformInfoOpen && event.key === "Escape") {
      event.preventDefault();
      closePlatformInfoModal();
      return;
    }

    if (state.isConfirmOpen && event.key === "Escape") {
      event.preventDefault();
      closeConfirmModal();
      return;
    }

    if (state.isHistoryOpen || state.isPlatformInfoOpen || state.isConfirmOpen) {
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

  function openOnboarding(stepIndex) {
    state.onboardingStep = clamp(stepIndex || 0, 0, ONBOARDING_STEPS.length - 1);
    state.isOnboardingOpen = true;
    els.onboardingOverlay.hidden = false;
    els.onboardingOverlay.classList.remove("is-ready");
    renderOnboardingStep(true);
  }

  function closeOnboarding() {
    els.onboardingOverlay.hidden = true;
    els.onboardingOverlay.classList.remove("is-ready");
    state.isOnboardingOpen = false;
  }

  function advanceOnboarding() {
    if (state.onboardingStep >= ONBOARDING_STEPS.length - 1) {
      closeOnboarding();
      return;
    }

    state.onboardingStep += 1;
    renderOnboardingStep();
  }

  function renderOnboardingStep(shouldFadeIn) {
    var step = ONBOARDING_STEPS[state.onboardingStep];
    var target = step ? document.querySelector(step.selector) : null;
    var targetRect = null;

    if (!step || !target) {
      closeOnboarding();
      return;
    }

    els.onboardingStepLabel.textContent = step.label;
    els.onboardingTitle.textContent = step.title;
    els.onboardingBody.textContent = step.body;
    els.onboardingNext.textContent = state.onboardingStep === ONBOARDING_STEPS.length - 1 ? "使ってみる" : "次へ";

    targetRect = getOnboardingTargetRect(target);
    positionOnboardingSpotlight(target, targetRect);
    positionOnboardingCard(targetRect);

    if (shouldFadeIn) {
      window.requestAnimationFrame(function () {
        if (state.isOnboardingOpen) {
          els.onboardingOverlay.classList.add("is-ready");
        }
      });
      return;
    }

    els.onboardingOverlay.classList.add("is-ready");
  }

  function getOnboardingTargetRect(target) {
    var rect = target.getBoundingClientRect();
    var padding = target.id === "stageSurface" ? 12 : 10;
    var left = Math.max(12, rect.left - padding);
    var top = Math.max(12, rect.top - padding);
    var maxWidth = Math.max(120, window.innerWidth - left - 12);
    var maxHeight = Math.max(120, window.innerHeight - top - 12);

    return {
      top: top,
      left: left,
      width: Math.min(maxWidth, rect.width + padding * 2),
      height: Math.min(maxHeight, rect.height + padding * 2)
    };
  }

  function positionOnboardingSpotlight(target, rect) {
    var targetStyle = window.getComputedStyle(target);

    els.onboardingSpotlight.style.top = rect.top + "px";
    els.onboardingSpotlight.style.left = rect.left + "px";
    els.onboardingSpotlight.style.width = rect.width + "px";
    els.onboardingSpotlight.style.height = rect.height + "px";
    els.onboardingSpotlight.style.borderRadius = targetStyle.borderRadius || "24px";
  }

  function positionOnboardingCard(targetRect) {
    var cardRect = null;
    var padding = 16;
    var gap = 18;
    var x = 0;
    var y = 0;

    els.onboardingCard.style.top = padding + "px";
    els.onboardingCard.style.left = padding + "px";
    cardRect = els.onboardingCard.getBoundingClientRect();

    if (targetRect.left + targetRect.width + gap + cardRect.width <= window.innerWidth - padding) {
      x = targetRect.left + targetRect.width + gap;
      y = clamp(targetRect.top, padding, window.innerHeight - cardRect.height - padding);
    } else if (targetRect.left - gap - cardRect.width >= padding) {
      x = targetRect.left - cardRect.width - gap;
      y = clamp(targetRect.top, padding, window.innerHeight - cardRect.height - padding);
    } else if (targetRect.top + targetRect.height + gap + cardRect.height <= window.innerHeight - padding) {
      x = clamp(targetRect.left, padding, window.innerWidth - cardRect.width - padding);
      y = targetRect.top + targetRect.height + gap;
    } else {
      x = clamp(targetRect.left, padding, window.innerWidth - cardRect.width - padding);
      y = Math.max(padding, targetRect.top - cardRect.height - gap);
    }

    els.onboardingCard.style.left = Math.round(x) + "px";
    els.onboardingCard.style.top = Math.round(y) + "px";
  }

  function openHistoryModal() {
    renderHistoryList();
    els.historyModal.hidden = false;
    state.isHistoryOpen = true;
    refreshRemoteHistory();
    track("history_open");
  }

  function closeHistoryModal() {
    els.historyModal.hidden = true;
    state.isHistoryOpen = false;
  }

  function openPlatformInfoModal() {
    if (!els.platformInfoModal) {
      return;
    }

    els.platformInfoModal.hidden = false;
    state.isPlatformInfoOpen = true;
    track("platform_info_open");
  }

  function closePlatformInfoModal() {
    if (!els.platformInfoModal) {
      return;
    }

    els.platformInfoModal.hidden = true;
    state.isPlatformInfoOpen = false;
  }

  function onPlatformInfoModalClick(event) {
    if (event.target && event.target.getAttribute("data-close-platform-info") === "true") {
      closePlatformInfoModal();
    }
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
    state.pdfNeedsAttention = true;
    sortFlags();
    persistFlags();
    startFreshFlagGuidance(flag.id);
    syncTimeline();
    track("marker_add", {
      zone: flag.zone,
      platform: flag.platform,
      marker_count: state.flags.length
    });
    showToast(formatDuration(flag.time) + " / " + FLAG_LABELS[flag.zone] + " を記録しました。", "success");
  }

  function createPointRecord(xRatio, yRatio) {
    return {
      id: createFlagId(),
      kind: "point",
      time: roundToHundredths(state.mediaType === "video" ? (els.video.currentTime || 0) : 0),
      zone: detectZone(xRatio, yRatio),
      x: roundToThousandths(xRatio),
      y: roundToThousandths(yRatio),
      platform: normalizePlatformKey(state.activePlatform),
      category: "",
      templateText: "",
      customNote: "",
      finalNote: "",
      comment: "",
      createdAt: Date.now()
    };
  }

  function detectZone(xRatio, yRatio) {
    var metrics = getEffectivePlatformSettings(state.activePlatform || "all");
    var areaZone = "";
    var caution = metrics.caution;
    var topBound = percentToNumber(caution.top);
    var rightBound = 100 - percentToNumber(caution.right);
    var bottomBound = 100 - percentToNumber(caution.bottom);
    var leftBound = percentToNumber(caution.left || "6%");
    var upperRightBound = 100 - percentToNumber(caution.rightUpper || caution.right);
    var stepY = percentToNumber(caution.stepY || caution.top);
    var x = xRatio * 100;
    var y = yRatio * 100;
    var violations = [];

    if (metrics.areaModel === "blocks") {
      areaZone = detectZoneFromAreas(metrics, x, y);
      return areaZone || "center";
    }

    if (
      (y >= topBound && y < stepY && x >= leftBound && x <= upperRightBound) ||
      (y >= stepY && y <= bottomBound && x >= leftBound && x <= rightBound)
    ) {
      return "center";
    }

    if (y < topBound) {
      violations.push({ zone: "top", delta: topBound - y });
    }

    if (y < stepY && x > upperRightBound) {
      violations.push({ zone: "right", delta: x - upperRightBound });
    } else if (y >= stepY && x > rightBound) {
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

  function detectZoneFromAreas(metrics, x, y) {
    var highZone = findMatchingAreaZone(metrics.highRiskAreas || [], x, y);
    if (highZone) {
      return highZone;
    }
    return findMatchingAreaZone(metrics.cautionAreas || [], x, y);
  }

  function findMatchingAreaZone(areas, x, y) {
    var index = 0;
    for (index = 0; index < areas.length; index += 1) {
      if (isPointInsideArea(areas[index], x, y)) {
        return areas[index].zone || "center";
      }
    }
    return "";
  }

  function isPointInsideArea(area, x, y) {
    var left = area.left !== undefined ? percentToNumber(area.left) : 100 - percentToNumber(area.right || "0%") - percentToNumber(area.width || "0%");
    var top = area.top !== undefined ? percentToNumber(area.top) : 100 - percentToNumber(area.bottom || "0%") - percentToNumber(area.height || "0%");
    var width = percentToNumber(area.width || "0%");
    var height = percentToNumber(area.height || "0%");

    return x >= left && x <= left + width && y >= top && y <= top + height;
  }

  function getFlagStartTime(flag) {
    return flag ? flag.time : 0;
  }

  function getFlagTitle(flag) {
    return formatDuration(getFlagStartTime(flag));
  }

  function getDisplayedFlags() {
    return state.flags.slice().sort(function (left, right) {
      return (right.createdAt || 0) - (left.createdAt || 0);
    });
  }

  function clearFreshFlagGuidance() {
    if (state.freshFlagTimer) {
      window.clearTimeout(state.freshFlagTimer);
      state.freshFlagTimer = 0;
    }
    state.freshFlagId = "";
  }

  function startFreshFlagGuidance(flagId) {
    clearFreshFlagGuidance();
    state.freshFlagId = flagId;
    renderFlags();
    renderCommentEditor();
    syncInlineGuide();
    state.freshFlagTimer = window.setTimeout(function () {
      state.freshFlagId = "";
      state.freshFlagTimer = 0;
      renderFlags();
      renderCommentEditor();
      syncInlineGuide();
    }, 4000);
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
      state.isCommentEditorOpen = false;
      resetCommentDraft();
      updateFlagHighlights();
      renderCommentEditor();
      return;
    }

    state.selectedFlagId = flagId;
    setCommentDraftFromFlag(findFlagById(flagId));
    updateFlagHighlights();
    renderCommentEditor();
  }

  function openCommentEditor(flagId) {
    if (!flagId || !findFlagById(flagId)) {
      return;
    }

    state.isCommentEditorOpen = true;
    selectFlag(flagId);
  }

  function closeCommentEditor() {
    state.isCommentEditorOpen = false;
    renderCommentEditor();
  }

  function resetCommentDraft() {
    state.commentDraft = {
      category: "",
      templateText: "",
      customNote: ""
    };
  }

  function setCommentDraftFromFlag(flag) {
    if (!flag) {
      resetCommentDraft();
      return;
    }

    var category = normalizeCommentCategory(flag.category || "");
    state.commentDraft = {
      category: category,
      templateText: String(flag.templateText || ""),
      customNote: category ? String(flag.customNote || "") : String(flag.customNote || flag.finalNote || flag.comment || "")
    };
  }

  function normalizeCommentCategory(category) {
    category = String(category || "");
    return COMMENT_CATEGORIES.indexOf(category) >= 0 ? category : "";
  }

  function getFlagFinalNote(flag) {
    if (!flag) {
      return "";
    }

    return String(flag.finalNote || flag.comment || "");
  }

  function getCommentCategoryLabel(flag) {
    return normalizeCommentCategory(flag && flag.category) || "";
  }

  function isOtherCommentCategory(category) {
    return category === "その他";
  }

  function buildFinalNoteFromDraft() {
    var category = normalizeCommentCategory(state.commentDraft.category);
    var templateText = String(state.commentDraft.templateText || "").trim();
    var customNote = String(state.commentDraft.customNote || "").trim();

    if (isOtherCommentCategory(category)) {
      return customNote;
    }

    if (!customNote) {
      return templateText;
    }

    return templateText + "\n補足：" + customNote;
  }

  function getCommentDraftError() {
    var category = normalizeCommentCategory(state.commentDraft.category);
    var templateText = String(state.commentDraft.templateText || "").trim();
    var customNote = String(state.commentDraft.customNote || "").trim();

    if (!category) {
      return "カテゴリを選択してください";
    }

    if (isOtherCommentCategory(category)) {
      return customNote ? "" : "修正内容を入力してください";
    }

    return templateText ? "" : "テンプレを選択してください";
  }

  function renderCommentChoiceButtons(container, items, activeValue, buttonClass, dataName) {
    if (!container) {
      return;
    }

    container.innerHTML = items.map(function (item) {
      var value = typeof item === "string" ? item : item.value;
      var label = typeof item === "string" ? item : item.label;
      var isActive = value === activeValue;

      return (
        '<button class="' + buttonClass + (isActive ? " is-active" : "") + '" type="button" data-' + dataName + '="' + escapeHtml(value) + '" aria-pressed="' + (isActive ? "true" : "false") + '">' +
          escapeHtml(label) +
        "</button>"
      );
    }).join("");
  }

  function renderCommentTemplateSelect(templates, activeValue) {
    if (!els.commentTemplateSelect) {
      return;
    }

    els.commentTemplateSelect.innerHTML = (
      '<option value="">修正指示を選択</option>' +
      templates.map(function (templateText) {
        var selected = templateText === activeValue ? " selected" : "";
        return '<option value="' + escapeHtml(templateText) + '"' + selected + ">" + escapeHtml(templateText) + "</option>";
      }).join("")
    );

    if (els.commentTemplatePreview) {
      els.commentTemplatePreview.textContent = activeValue || "";
      els.commentTemplatePreview.hidden = !activeValue;
    }
  }

  function renderCommentControls(flag) {
    var category = normalizeCommentCategory(state.commentDraft.category);
    var templates = COMMENT_TEMPLATES[category] || [];
    var validationError = getCommentDraftError();
    var hasSelection = !!flag;
    var hasSavedNote = !!(flag && getFlagFinalNote(flag).trim());

    renderCommentChoiceButtons(els.commentCategoryButtons, COMMENT_CATEGORIES, category, "comment-choice-button", "comment-category");

    if (els.commentTemplateGroup) {
      els.commentTemplateGroup.hidden = !hasSelection || !category || isOtherCommentCategory(category);
    }

    renderCommentTemplateSelect(templates, state.commentDraft.templateText);
    if (els.commentTemplateSelect) {
      els.commentTemplateSelect.disabled = !hasSelection || !templates.length;
    }

    els.flagCommentInput.value = state.commentDraft.customNote || "";
    els.flagCommentInput.disabled = !hasSelection;
    els.saveCommentButton.disabled = !hasSelection || !!validationError;
    els.clearCommentButton.disabled = !hasSavedNote && !state.commentDraft.category && !state.commentDraft.templateText && !state.commentDraft.customNote;

    if (els.commentEditorError) {
      els.commentEditorError.textContent = hasSelection ? validationError : "";
      els.commentEditorError.hidden = !hasSelection || !validationError;
    }
  }

  function updateCommentValidationState(flag) {
    var validationError = flag ? getCommentDraftError() : "";
    var hasSavedNote = !!(flag && getFlagFinalNote(flag).trim());

    els.saveCommentButton.disabled = !flag || !!validationError;
    els.clearCommentButton.disabled = !hasSavedNote && !state.commentDraft.category && !state.commentDraft.templateText && !state.commentDraft.customNote;

    if (els.commentEditorError) {
      els.commentEditorError.textContent = flag ? validationError : "";
      els.commentEditorError.hidden = !flag || !validationError;
    }
  }

  function renderCommentEditor() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var isOpen = !!(flag && state.isCommentEditorOpen);

    if (els.resultsCard) {
      els.resultsCard.classList.toggle("is-editing-comment", isOpen);
    }

    els.commentEditor.classList.toggle("is-disabled", !isOpen);
    els.commentEditor.classList.toggle("has-selection", isOpen);
    els.commentEditor.classList.toggle("is-guided", isOpen && flag.id === state.freshFlagId);

    if (!isOpen) {
      resetCommentDraft();
      els.commentEditorTitle.textContent = "チェック一覧から選択";
      if (els.commentEditorLead) {
        els.commentEditorLead.textContent = "メモ追加を押すと、修正内容を入力できます。";
      }
      els.commentTargetTime.textContent = "一覧から選択";
      renderCommentControls(null);
      return;
    }

    els.commentEditorTitle.textContent = getFlagTitle(flag) + " / " + FLAG_LABELS[flag.zone] + " / " + getPlatformMeta(flag.platform).label + " の修正指示";
    if (els.commentEditorLead) {
      els.commentEditorLead.textContent = "このチェックに対して修正内容を追加します。";
    }
    els.commentTargetTime.textContent = getFlagTitle(flag);
    renderCommentControls(flag);
  }

  function onFlagCommentInputKeydown(event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    saveSelectedFlagComment();
  }

  function onCommentCategoryClick(event) {
    var button = event.target.closest("[data-comment-category]");
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var category = "";

    if (!button || !flag) {
      return;
    }

    category = normalizeCommentCategory(button.getAttribute("data-comment-category"));
    state.commentDraft.category = category;
    state.commentDraft.templateText = "";
    renderCommentEditor();
  }

  function onCommentTemplateChange(event) {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;

    if (!event.target || !flag) {
      return;
    }

    state.commentDraft.templateText = String(event.target.value || "");
    renderCommentEditor();
  }

  function onFlagCommentInputChange() {
    state.commentDraft.customNote = String(els.flagCommentInput.value || "").slice(0, 160);
    updateCommentValidationState(state.selectedFlagId ? findFlagById(state.selectedFlagId) : null);
  }

  function saveSelectedFlagComment() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var errorMessage = "";
    var nextComment = "";

    if (!flag) {
      return;
    }

    state.commentDraft.customNote = String(els.flagCommentInput.value || "").trim();
    errorMessage = getCommentDraftError();
    if (errorMessage) {
      if (els.commentEditorError) {
        els.commentEditorError.textContent = errorMessage;
        els.commentEditorError.hidden = false;
      }
      showToast(errorMessage, "warning");
      return;
    }

    nextComment = buildFinalNoteFromDraft();
    flag.category = normalizeCommentCategory(state.commentDraft.category);
    flag.templateText = isOtherCommentCategory(flag.category) ? "" : String(state.commentDraft.templateText || "").trim();
    flag.customNote = String(state.commentDraft.customNote || "").trim();
    flag.finalNote = nextComment;
    flag.comment = nextComment;
    persistFlags();
    renderFlags();
    renderCommentEditor();
    track("memo_save", {
      has_comment: !!nextComment.length,
      comment_length: nextComment.length,
      zone: flag.zone,
      platform: flag.platform
    });
    showToast(nextComment ? "メモを保存しました。" : "メモを空にしました。", "success");
  }

  function clearSelectedFlagComment() {
    var flag = state.selectedFlagId ? findFlagById(state.selectedFlagId) : null;
    var hasDraft = !!(state.commentDraft.category || state.commentDraft.templateText || state.commentDraft.customNote);

    if (!flag || !(getFlagFinalNote(flag) || flag.category || flag.templateText || flag.customNote || hasDraft)) {
      return;
    }

    flag.category = "";
    flag.templateText = "";
    flag.customNote = "";
    flag.finalNote = "";
    flag.comment = "";
    resetCommentDraft();
    persistFlags();
    renderFlags();
    renderCommentEditor();
    showToast("メモを削除しました。", "info");
  }

  function onFlagsListClick(event) {
    var item = event.target.closest("[data-flag-id]");
    var jumpButton = event.target.closest("[data-flag-jump]");
    var deleteButton = event.target.closest("[data-flag-delete]");
    var commentButton = event.target.closest("[data-flag-comment]");
    var flag = null;

    if (commentButton) {
      flag = findFlagById(commentButton.getAttribute("data-flag-comment"));
      if (!flag) {
        return;
      }

      jumpToTime(getFlagStartTime(flag), true);
      if (state.mediaType === "video") {
        els.video.pause();
      }
      updateTransportState();
      openCommentEditor(flag.id);
      return;
    }

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
      state.isCommentEditorOpen = false;
    }
    if (!state.flags.length) {
      state.pdfNeedsAttention = false;
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
      acceptLabel: "リセット"
    });
  }

  function performClearAllFlags() {
    state.flags = [];
    state.selectedFlagId = "";
    state.isCommentEditorOpen = false;
    state.autoStopTargetTime = null;
    state.pdfNeedsAttention = false;
    clearFreshFlagGuidance();
    persistFlags();
    renderFlags();
    syncTimeline();
    renderCommentEditor();
    syncInlineGuide();
    showToast("チェック記録をすべてクリアしました。", "info");
  }

  function renderFlags() {
    var activeFlagId = getFocusedFlagId(els.video.currentTime || 0);
    var displayedFlags = getDisplayedFlags();

    els.flagsCount.textContent = state.flags.length + "件";
    els.flagsCount.classList.toggle("is-empty", !state.flags.length);
    els.flagsEmpty.hidden = state.flags.length > 0;
    els.clearFlagsButton.disabled = !hasMediaLoaded() || !state.flags.length;
    els.clearFlagsButton.title = state.flags.length ? "今のチェック記録をすべて削除します。" : "記録ができると使えます。";
    updateAutoStopButton();

    if (!state.flags.length) {
      els.flagsList.innerHTML = "";
      els.flagMarkers.innerHTML = "";
      els.flagPins.innerHTML = "";
      renderCommentEditor();
      syncInlineGuide();
      return;
    }

    els.flagsList.innerHTML = displayedFlags.map(function (flag) {
      var isActive = flag.id === activeFlagId;
      var isFresh = flag.id === state.freshFlagId;
      var timeLabel = getFlagTitle(flag);
      var categoryLabel = getCommentCategoryLabel(flag);
      var finalNote = getFlagFinalNote(flag).trim();

      return (
        '<article class="flag-item' + (isActive ? " is-active" : "") + (isFresh ? " is-fresh" : "") + '" data-flag-id="' + escapeHtml(flag.id) + '">' +
          '<div class="flag-main-row">' +
            '<button class="flag-time-button" type="button" data-flag-jump="' + escapeHtml(flag.id) + '" data-time="' + getFlagStartTime(flag) + '">' +
              escapeHtml(timeLabel) +
            "</button>" +
            '<div class="flag-meta">' +
              '<span class="flag-zone-badge" data-zone="' + escapeHtml(flag.zone) + '">' + escapeHtml(FLAG_LABELS[flag.zone]) + "</span>" +
              getPlatformInlineMarkup(flag.platform, "flag-platform-badge") +
            "</div>" +
            '<div class="flag-actions">' +
              '<button class="flag-comment-action" type="button" data-flag-comment="' + escapeHtml(flag.id) + '">' + (finalNote.length ? "編集" : "メモ追加") + "</button>" +
              '<button class="flag-delete" type="button" data-flag-delete="' + escapeHtml(flag.id) + '" aria-label="削除" title="削除">' +
                '<svg class="flag-delete-icon" viewBox="0 0 24 24" aria-hidden="true">' +
                  '<path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-2 6h10l-.7 11H7.7L7 9Zm3 2v7h1.5v-7H10Zm2.5 0v7H14v-7h-1.5Z"></path>' +
                "</svg>" +
              "</button>" +
            "</div>" +
          "</div>" +
          (finalNote.length ? '<div class="flag-note-row">' + (categoryLabel ? '<span class="flag-category-badge">' + escapeHtml(categoryLabel) + "</span>" : '<span class="flag-comment-badge">メモ</span>') + '<span class="flag-note-preview">' + escapeHtml(finalNote) + "</span></div>" : "") +
        "</article>"
      );
    }).join("");

    renderFlagMarkers(activeFlagId);
    renderFlagPins(activeFlagId);
    updateFlagHighlights();
    renderCommentEditor();
    syncInlineGuide();
  }

  function renderFlagMarkers(activeFlagId) {
    var duration = isFinite(els.video.duration) ? els.video.duration : 0;

    if (!state.flags.length || !duration) {
      els.flagMarkers.innerHTML = "";
      return;
    }

    els.flagMarkers.innerHTML = state.flags.map(function (flag) {
      var position = clamp((getFlagStartTime(flag) / duration) * 100, 0, 100);
      var isActive = flag.id === activeFlagId;
      var title = getFlagTitle(flag) + " / " + FLAG_LABELS[flag.zone];

      return (
        '<button class="flag-marker' + (isActive ? " is-active" : "") + '" type="button"' +
        ' data-flag-id="' + escapeHtml(flag.id) + '"' +
        ' data-zone="' + escapeHtml(flag.zone) + '"' +
        ' data-marker-time="' + getFlagStartTime(flag) + '"' +
        ' style="left:' + position + '%;"' +
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
        '<button class="flag-pin' + (isActive ? " is-active" : "") + '" type="button"' +
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

  function mapFlagPointForProfile(flag, profileKey) {
    var x = clamp(flag.x, 0, 1);
    var y = clamp(flag.y, 0, 1);
    var targetRatio = 0;
    var visibleFraction = 0;
    var cropInset = 0;

    if (profileKey !== "iphoneTall") {
      return { x: x, y: y };
    }

    targetRatio = DISPLAY_PROFILES.iphoneTall.ratio;
    visibleFraction = clamp(targetRatio / (state.stageRatio || DEFAULT_RATIO), 0, 1);
    cropInset = (1 - visibleFraction) / 2;

    return {
      x: clamp((x - cropInset) / visibleFraction, 0, 1),
      y: y
    };
  }

  function getActiveFlagId(currentTime) {
    var activeFlag = null;
    var closestDelta = Number.POSITIVE_INFINITY;

    state.flags.forEach(function (flag) {
      var delta = 0;

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
      persistProjectSnapshotToDb();
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
      time: clamp(parseFloat(flag.time) || 0, 0, Number.MAX_SAFE_INTEGER),
      zone: flag.zone,
      x: clamp(parseFloat(flag.x) || 0, 0, 1),
      y: clamp(parseFloat(flag.y) || 0, 0, 1),
      platform: normalizePlatformKey(flag.platform),
      category: normalizeCommentCategory(flag.category || ""),
      templateText: String(flag.templateText || ""),
      customNote: String(flag.customNote || ""),
      finalNote: String(flag.finalNote || flag.comment || ""),
      comment: String(flag.finalNote || flag.comment || ""),
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

  async function buildHistoryReportEntry(entry, flags) {
    var reportFlags = buildReportFlags(flags || []);
    var reportPlatformKey = buildReportPlatformKey(reportFlags, "");
    var canPreviewCurrentMedia = entry.mediaKey === state.mediaKey && hasMediaLoaded();
    var previewImageDataUrl = canPreviewCurrentMedia ? createReportPreviewImageDataUrl(reportPlatformKey, reportFlags) : "";
    var previewFrames = canPreviewCurrentMedia ? await createReportPreviewFrames(reportPlatformKey, reportFlags) : [];

    return {
      mediaKey: entry.mediaKey,
      fileName: entry.fileName,
      durationText: entry.durationText,
      resolutionText: entry.resolutionText,
      settingsKey: reportPlatformKey,
      settingsLabel: buildReportSettingsLabel(reportFlags, reportPlatformKey),
      lastOpened: entry.lastOpened,
      flags: reportFlags,
      previewImageDataUrl: previewImageDataUrl,
      previewFrames: previewFrames,
      previewCaption: canPreviewCurrentMedia ? "現在開いている素材の表示イメージ" : "",
      previewUnavailable: !canPreviewCurrentMedia
    };
  }

  function renderHistoryList() {
    var entries = readHistoryEntries();
    var isLocked = isPdfExportLocked();
    var exportDisabledMarkup = isLocked ? ' disabled title="' + escapeHtml(PDF_LIMIT_REACHED_MESSAGE) + '"' : "";

    els.historyEmpty.hidden = entries.length > 0;

    if (!entries.length) {
      els.historyList.innerHTML = "";
      updatePdfButtons();
      updateHistoryAwareness();
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
            '<div class="history-item-actions">' +
              '<span class="history-date">' + escapeHtml(formatHistoryDate(entry.lastOpened)) + "</span>" +
              '<button class="action-button action-button-ghost history-item-export' + (isLocked ? " is-locked" : "") + '" type="button" data-history-export-entry="' + escapeHtml(entry.mediaKey) + '"' + exportDisabledMarkup + '>この素材を共有</button>' +
            "</div>" +
          "</div>" +
          '<div class="history-chip-row">' +
            entry.flags.map(function (flag) {
              return (
                '<div class="history-chip-group">' +
                  '<button class="history-flag-chip" type="button"' +
                  ' data-history-key="' + escapeHtml(entry.mediaKey) + '"' +
                  ' data-history-time="' + getFlagStartTime(flag) + '">' +
                    '<span class="history-chip-time">' + escapeHtml(getFlagTitle(flag)) + "</span>" +
                    '<span class="history-chip-meta">' +
                      ((flag.comment || "").length ? '<span class="history-chip-kind">メモ</span>' : "") +
                      '<span class="history-chip-zone" data-zone="' + escapeHtml(flag.zone) + '">' + escapeHtml(FLAG_LABELS[flag.zone]) + "</span>" +
                      getPlatformInlineMarkup(flag.platform, "history-chip-platform") +
                    "</span>" +
                    ((flag.comment || "").length ? '<span class="history-chip-note">' + escapeHtml(flag.comment) + "</span>" : "") +
                  "</button>" +
                "</div>"
              );
            }).join("") +
          "</div>" +
        "</article>"
      );
    }).join("");
    updatePdfButtons();
    updateHistoryAwareness();
  }

  function updateHistoryAwareness() {
    var entries = readHistoryEntries();

    if (els.historyToggle) {
      els.historyToggle.textContent = "履歴を見る";
      els.historyToggle.disabled = entries.length === 0;
      els.historyToggle.title = entries.length
        ? "保存されたチェック履歴を開きます。"
        : "履歴が保存されると、ここから開けます。";
    }
  }

  function readLocalHistoryEntries() {
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

  function readHistoryEntries() {
    return mergeHistoryEntries(readLocalHistoryEntries(), state.remoteHistoryEntries || []);
  }

  function mergeHistoryEntries(localEntries, remoteEntries) {
    var merged = {};

    localEntries.forEach(function (entry) {
      merged[entry.mediaKey] = entry;
    });

    remoteEntries.forEach(function (entry) {
      merged[entry.mediaKey] = entry;
    });

    return Object.keys(merged).map(function (key) {
      return merged[key];
    }).sort(function (left, right) {
      return right.lastOpened - left.lastOpened;
    });
  }

  function onHistoryListClick(event) {
    var exportButton = event.target.closest("[data-history-export-entry]");
    var chip = event.target.closest("[data-history-time]");
    var time = 0;
    var mediaKey = "";

    if (exportButton) {
      exportHistoryEntryPdf(exportButton.getAttribute("data-history-export-entry") || "");
      return;
    }

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

  async function exportCurrentPdf() {
    var reportEntry = null;
    var report = null;
    var shareWindow = null;
    var sharePayload = null;
    var shareResult = null;
    var copied = false;

    if (!hasMediaLoaded()) {
      showToast("先に動画を読み込んでください。", "warning");
      return;
    }

    if (!state.flags.length) {
      showToast("共有する記録がありません。", "warning");
      return;
    }

    if (!(await ensurePdfExportAvailable())) {
      return;
    }

    shareWindow = openShareLoadingWindow();
    setShareButtonBusy(true);

    try {
      updateShareLoadingWindow(shareWindow, "チェック位置を準備しています", "動画から必要な確認フレームを取り出しています。", 0.12);
      reportEntry = await buildCurrentReportEntry(function (current, total) {
        updateShareLoadingWindow(
          shareWindow,
          "チェック位置を準備しています",
          current + " / " + total + " の確認フレームを準備中です。",
          0.12 + (total ? (current / total) * 0.34 : 0)
        );
      });
      report = {
        documentTitle: buildReportFileName(reportEntry.fileName, false),
        reportTitle: "修正指示書",
        sections: [reportEntry]
      };
      updateShareLoadingWindow(shareWindow, "画像を軽量化しています", "共有ページを開きやすいサイズに整えています。", 0.5);
      sharePayload = await buildSharePayloadFromReport(report, function (current, total) {
        updateShareLoadingWindow(
          shareWindow,
          "画像を軽量化しています",
          current + " / " + total + " の画像を軽量化しています。",
          0.5 + (total ? (current / total) * 0.22 : 0)
        );
      });
      updateShareLoadingWindow(shareWindow, "共有URLを発行しています", "共有ページを保存しています。少しだけお待ちください。", 0.78);
      shareResult = await createShareUrl(sharePayload);

      if (!shareResult || !shareResult.url) {
        throw new Error("共有URLを取得できませんでした。");
      }

      updateShareLoadingWindow(shareWindow, "共有ページを開いています", "まもなく共有ページに切り替わります。", 1);
      openGeneratedSharePage(shareWindow, shareResult.url);
      copied = await copyShareText(shareResult.url);

      state.pdfNeedsAttention = false;
      updatePdfButtons();
      await recordPdfExportToDb({
        reportType: "current",
        exportFileName: report.documentTitle,
        markerCount: state.flags.length,
        projectCount: 1,
        meta: {
          mediaKey: state.mediaKey,
          fileName: state.fileName || "未命名素材",
          shareToken: shareResult.token || "",
          shareUrl: shareResult.url
        }
      });
      track("pdf_export", {
        report_type: "current",
        marker_count: state.flags.length
      });
      showToast(copied ? "共有ページを開きました。URLもコピーしました。" : "共有ページを開きました。", "success");
    } catch (error) {
      closeShareLoadingWindow(shareWindow);
      console.error("Failed to create share page", error);
      window.alert("共有URLの発行に失敗しました。\n\n原因: " + getErrorMessage(error));
    } finally {
      setShareButtonBusy(false);
    }
  }

  async function exportHistoryReport(entries, options) {
    var report = null;
    var totalFlags = 0;
    var settings = options || {};
    var shareWindow = null;
    var shareResult = null;
    var sharePayload = null;
    var copied = false;

    if (!entries.length) {
      showToast("共有する履歴がありません。", "warning");
      return;
    }

    if (!(await ensurePdfExportAvailable())) {
      return;
    }

    entries.forEach(function (entry) {
      totalFlags += entry.flags.length;
    });

    report = {
      documentTitle: settings.documentTitle || buildReportFileName("", true),
      exportDateText: formatReportDateTime(Date.now()),
      reportTitle: settings.reportTitle || "確認履歴レポート",
      summary:
        '<section class="report-summary">' +
          '<div class="report-summary-item"><span>出力日</span><strong>' + escapeHtml(formatReportDateLabel(Date.now())) + "</strong></div>" +
          '<div class="report-summary-item"><span>素材数</span><strong>' + entries.length + "件</strong></div>" +
          '<div class="report-summary-item"><span>チェック数</span><strong>' + totalFlags + "件</strong></div>" +
        "</section>",
      sections: entries
    };

    shareWindow = openShareLoadingWindow();

    try {
      updateShareLoadingWindow(shareWindow, "画像を軽量化しています", "共有ページを開きやすいサイズに整えています。", 0.16);
      sharePayload = await buildSharePayloadFromReport(report, function (current, total) {
        updateShareLoadingWindow(
          shareWindow,
          "画像を軽量化しています",
          current + " / " + total + " の画像を軽量化しています。",
          0.16 + (total ? (current / total) * 0.56 : 0)
        );
      });
      updateShareLoadingWindow(shareWindow, "共有URLを発行しています", "共有ページを保存しています。少しだけお待ちください。", 0.8);
      shareResult = await createShareUrl(sharePayload);

      if (!shareResult || !shareResult.url) {
        throw new Error("共有URLを取得できませんでした。");
      }

      updateShareLoadingWindow(shareWindow, "共有ページを開いています", "まもなく共有ページに切り替わります。", 1);
      openGeneratedSharePage(shareWindow, shareResult.url);
      copied = await copyShareText(shareResult.url);

      await recordPdfExportToDb({
        reportType: settings.reportType || "history_all",
        exportFileName: report.documentTitle,
        markerCount: totalFlags,
        projectCount: entries.length,
        meta: {
          mediaKeys: entries.map(function (entry) {
            return entry.mediaKey;
          }),
          shareToken: shareResult.token || "",
          shareUrl: shareResult.url
        }
      });
      track("pdf_export", {
        report_type: settings.reportType || "history_all",
        item_count: entries.length,
        marker_count: totalFlags
      });
      showToast(copied ? "共有ページを開きました。URLもコピーしました。" : (settings.toastMessage || "共有ページを開きました。"), "success");
    } catch (error) {
      closeShareLoadingWindow(shareWindow);
      console.error("Failed to create share page", error);
      window.alert("共有URLの発行に失敗しました。\n\n原因: " + getErrorMessage(error));
    }
  }

  function exportHistoryEntryPdf(mediaKey) {
    var entry = readHistoryEntries().find(function (item) {
      return item.mediaKey === mediaKey;
    });

    if (!entry) {
      showToast("この素材の履歴を見つけられませんでした。", "warning");
      return;
    }

    buildHistoryReportEntry(entry, entry.flags).then(function (reportEntry) {
      return exportHistoryReport([reportEntry], {
        reportType: "history_entry",
        reportTitle: "修正指示書",
        toastMessage: "この素材の共有ページを開きました。"
      });
    });
  }

  async function buildCurrentReportEntry(onProgress) {
    var platformKey = buildReportPlatformKey(state.flags, state.activePlatform);
    var reportFlags = buildReportFlags(state.flags);
    var previewImageDataUrl = createReportPreviewImageDataUrl(platformKey, reportFlags);
    var previewFrames = await createReportPreviewFrames(platformKey, reportFlags, onProgress);

    return {
      fileName: state.fileName || "未命名素材",
      durationText: els.metaDuration.textContent || "00:00",
      resolutionText: els.metaResolution.textContent || "-- × --",
      settingsKey: platformKey,
      settingsLabel: buildReportSettingsLabel(state.flags, platformKey),
      flags: reportFlags,
      previewImageDataUrl: previewImageDataUrl,
      previewFrames: previewFrames,
      previewCaption: ""
    };
  }

  function buildReportSettingsLabel(flags, fallbackPlatformKey) {
    var labels = [];

    if (fallbackPlatformKey) {
      return getPlatformMeta(fallbackPlatformKey).label;
    }

    flags.forEach(function (flag) {
      var label = getPlatformMeta(flag.platform).label;

      if (labels.indexOf(label) === -1) {
        labels.push(label);
      }
    });

    return labels.length ? labels.join(" / ") : "未選択";
  }

  function buildReportPlatformKey(flags, fallbackPlatformKey) {
    var platformKeys = [];

    if (fallbackPlatformKey) {
      return normalizePlatformKey(fallbackPlatformKey);
    }

    (flags || []).forEach(function (flag) {
      getPlatformKeys(flag.platform).forEach(function (key) {
        if (platformKeys.indexOf(key) === -1) {
          platformKeys.push(key);
        }
      });
    });

    return normalizePlatformKey(platformKeys.length ? platformKeys : "all");
  }

  function sortFlagsForReport(flags) {
    return (flags || []).slice().sort(function (left, right) {
      var timeDelta = getFlagStartTime(left) - getFlagStartTime(right);
      if (timeDelta !== 0) {
        return timeDelta;
      }

      var createdAtDelta = (left.createdAt || 0) - (right.createdAt || 0);
      if (createdAtDelta !== 0) {
        return createdAtDelta;
      }

      return String(left.id || "").localeCompare(String(right.id || ""));
    });
  }

  function buildReportFlags(flags) {
    return sortFlagsForReport(flags).map(function (flag, index) {
      var severity = getReportSeverityMeta(flag);
      var status = getReportStatusMeta(flag.reportStatus);
      return Object.assign({}, flag, {
        reportNo: index + 1,
        reportTitle: getFlagTitle(flag),
        reportPositionLabel: getReportPositionLabel(flag),
        reportPositionShort: getReportPositionBaseLabel(flag),
        reportPlatformLabel: getPlatformMeta(flag.platform).label,
        comment: getFlagFinalNote(flag),
        reportSeverity: severity.key,
        reportSeverityLabel: severity.label,
        reportSeverityColor: severity.color,
        reportSeverityTextColor: severity.textColor,
        reportStatus: status.key,
        reportStatusLabel: status.label,
        reportStatusColor: status.color,
        reportStatusTextColor: status.textColor,
        reportStatusBackground: status.background,
        reportStatusBorder: status.border
      });
    });
  }

  function getReportSeverityMeta(flag) {
    var metrics = getEffectivePlatformSettings(flag.platform || "all");
    var x = (flag.x || 0) * 100;
    var y = (flag.y || 0) * 100;

    if (isPointInsideRiskLevel(metrics, "highRisk", x, y)) {
      return {
        key: "high",
        label: "高",
        color: "#ef4444",
        textColor: "#ffffff"
      };
    }

    if (isPointInsideRiskLevel(metrics, "caution", x, y)) {
      return {
        key: "medium",
        label: "中",
        color: "#f59e0b",
        textColor: "#ffffff"
      };
    }

    return {
      key: "low",
      label: "低",
      color: "#64748b",
      textColor: "#ffffff"
    };
  }

  function normalizeReportStatus(status) {
    return status === "done" ? "done" : "pending";
  }

  function getReportStatusMeta(status) {
    if (normalizeReportStatus(status) === "done") {
      return {
        key: "done",
        label: "対応済み",
        color: "#16a34a",
        textColor: "#ffffff",
        background: "rgba(22, 163, 74, 0.14)",
        border: "rgba(22, 163, 74, 0.24)"
      };
    }

    return {
      key: "pending",
      label: "未対応",
      color: "#475569",
      textColor: "#ffffff",
      background: "rgba(71, 85, 105, 0.12)",
      border: "rgba(71, 85, 105, 0.2)"
    };
  }

  function isPointInsideRiskLevel(metrics, levelKey, x, y) {
    var areasKey = levelKey + "Areas";
    if ((metrics.areaModel || "bands") === "blocks") {
      return (metrics[areasKey] || []).some(function (area) {
        return isPointInsideArea(area, x, y);
      });
    }

    return isPointInsideRiskBands(metrics[levelKey] || createEmptyRiskProfile()[levelKey], x, y);
  }

  function isPointInsideRiskBands(level, x, y) {
    var topBound = percentToNumber(level.top || "0%");
    var rightBound = 100 - percentToNumber(level.right || "0%");
    var bottomBound = 100 - percentToNumber(level.bottom || "0%");
    var leftBound = percentToNumber(level.left || "0%");
    var upperRightBound = 100 - percentToNumber(level.rightUpper || level.right || "0%");
    var stepY = percentToNumber(level.stepY || level.top || "48%");

    return (
      y < topBound ||
      x < leftBound ||
      y > bottomBound ||
      (y < stepY && x > upperRightBound) ||
      (y >= stepY && x > rightBound)
    );
  }

  function getReportPositionLabel(flag) {
    var baseLabel = getReportPositionBaseLabel(flag);
    var zoneHint = "";

    if (flag.zone === "right") {
      zoneHint = "UI上";
    } else if (flag.zone === "bottom") {
      zoneHint = "CTA付近";
    } else if (flag.zone === "top") {
      zoneHint = "上部UI付近";
    } else if (flag.zone === "left") {
      zoneHint = "左UI付近";
    }

    return zoneHint ? (baseLabel + "（" + zoneHint + "）") : baseLabel;
  }

  function getReportPositionBaseLabel(flag) {
    var xBucket = "center";
    var yBucket = "center";
    var x = flag.x || 0;
    var y = flag.y || 0;

    if (x < 1 / 3) {
      xBucket = "left";
    } else if (x > 2 / 3) {
      xBucket = "right";
    }

    if (y < 1 / 3) {
      yBucket = "top";
    } else if (y > 2 / 3) {
      yBucket = "bottom";
    }

    if (yBucket === "top" && xBucket === "left") {
      return "左上";
    }
    if (yBucket === "top" && xBucket === "center") {
      return "上中央";
    }
    if (yBucket === "top" && xBucket === "right") {
      return "右上";
    }
    if (yBucket === "center" && xBucket === "left") {
      return "左中央";
    }
    if (yBucket === "center" && xBucket === "center") {
      return "中央";
    }
    if (yBucket === "center" && xBucket === "right") {
      return "右中央";
    }
    if (yBucket === "bottom" && xBucket === "left") {
      return "左下";
    }
    if (yBucket === "bottom" && xBucket === "center") {
      return "下中央";
    }
    return "右下";
  }

  function createReportPreviewImageDataUrl(platformKey, flags) {
    var width = 0;
    var height = 0;
    var canvas = null;
    var ctx = null;
    var reportFlags = flags && flags.length && flags[0].reportNo ? flags : buildReportFlags(flags);

    if (!hasMediaLoaded()) {
      return "";
    }

    if (state.mediaType === "image") {
      width = els.previewImage.naturalWidth || Math.round(els.stageSurface.clientWidth);
      height = els.previewImage.naturalHeight || Math.round(els.stageSurface.clientHeight);
    } else {
      width = els.video.videoWidth || Math.round(els.stageSurface.clientWidth);
      height = els.video.videoHeight || Math.round(els.stageSurface.clientHeight);
    }

    if (!width || !height) {
      return "";
    }

    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");

    if (state.mediaType === "image") {
      ctx.drawImage(els.previewImage, 0, 0, width, height);
    } else {
      ctx.drawImage(els.video, 0, 0, width, height);
    }
    drawExportOverlay(ctx, width, height, platformKey);

    return canvas.toDataURL("image/png");
  }

  function seekVideoForReportCapture(seconds) {
    var targetTime = 0;

    if (state.mediaType !== "video" || !hasMediaLoaded()) {
      return Promise.resolve();
    }

    targetTime = clamp(seconds, 0, els.video.duration || 0);

    if (Math.abs((els.video.currentTime || 0) - targetTime) < 0.02) {
      return new Promise(function (resolve) {
        window.requestAnimationFrame(resolve);
      });
    }

    return new Promise(function (resolve) {
      var handled = false;

      function finish() {
        if (handled) {
          return;
        }
        handled = true;
        els.video.removeEventListener("seeked", finish);
        resolve();
      }

      els.video.addEventListener("seeked", finish, { once: true });
      els.video.currentTime = targetTime;
    });
  }

  async function createReportPreviewFrames(platformKey, flags, onProgress) {
    var reportFlags = flags && flags.length && flags[0].reportNo ? flags : buildReportFlags(flags);
    var fallbackImage = createReportPreviewImageDataUrl(platformKey, reportFlags);
    var previousTime = 0;
    var wasPaused = true;
    var frames = [];

    if (!hasMediaLoaded() || !reportFlags.length) {
      return [];
    }

    if (state.mediaType === "image") {
      if (typeof onProgress === "function") {
        onProgress(reportFlags.length, reportFlags.length);
      }
      return reportFlags.map(function (flag) {
        return {
          id: String(flag.id || ""),
          previewImageDataUrl: fallbackImage
        };
      });
    }

    previousTime = clamp(els.video.currentTime || 0, 0, els.video.duration || 0);
    wasPaused = els.video.paused;
    els.video.pause();

    try {
      for (var index = 0; index < reportFlags.length; index += 1) {
        var flag = reportFlags[index];
        await seekVideoForReportCapture(getFlagStartTime(flag));
        frames.push({
          id: String(flag.id || ""),
          previewImageDataUrl: createReportPreviewImageDataUrl(platformKey, reportFlags)
        });
        if (typeof onProgress === "function") {
          onProgress(index + 1, reportFlags.length);
        }
      }
    } finally {
      await seekVideoForReportCapture(previousTime);
      if (!wasPaused) {
        els.video.play().catch(function () {
          return null;
        });
      }
      syncTimeline();
      renderFlags();
      renderCommentEditor();
      updateTransportState();
    }

    return frames;
  }

  function getTodayHistoryEntries() {
    var today = new Date();

    return readHistoryEntries().filter(function (entry) {
      return isSameLocalDay(entry.lastOpened, today);
    }).map(function (entry) {
      return {
        fileName: entry.fileName,
        durationText: entry.durationText,
        resolutionText: entry.resolutionText,
        settingsLabel: buildReportSettingsLabel(entry.flags, ""),
        lastOpened: entry.lastOpened,
        flags: buildReportFlags(entry.flags)
      };
    });
  }

  function isSameLocalDay(timestamp, date) {
    var target = new Date(timestamp);
    var current = date instanceof Date ? date : new Date(date);

    return (
      target.getFullYear() === current.getFullYear() &&
      target.getMonth() === current.getMonth() &&
      target.getDate() === current.getDate()
    );
  }

  function openReportWindow(report, options) {
    var reportWindow = window.open("", "_blank", "width=1080,height=900");
    var settings = options || {};

    if (!reportWindow) {
      showToast("レポート画面を開けませんでした。ポップアップ設定をご確認ください。", "warning");
      return false;
    }

    reportWindow.document.open();
    reportWindow.document.write(buildReportDocumentHtml(report, settings));
    reportWindow.document.close();
    return true;
  }

  function openShareLoadingWindow() {
    var shareWindow = window.open("", "_blank", "width=1080,height=900");

    if (!shareWindow) {
      showToast("共有ページを開けませんでした。ポップアップ設定をご確認ください。", "warning");
      return null;
    }

    try {
      shareWindow.document.open();
      shareWindow.document.write([
        "<!DOCTYPE html>",
        '<html lang="ja">',
        "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        "<title>共有ページを作成中...</title>",
        "<style>",
        'body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f7fc;color:#0f172a;font-family:"SF Pro Display","Hiragino Sans","Yu Gothic",sans-serif;}',
        ".share-loading-card{width:min(420px,calc(100vw - 40px));padding:34px 30px;border-radius:28px;background:#fff;border:1px solid rgba(15,23,42,.08);box-shadow:0 24px 50px rgba(15,23,42,.12);text-align:center;}",
        ".share-loading-brand{margin:0 0 10px;color:#2563eb;font-weight:800;letter-spacing:.02em;}",
        ".share-loading-title{margin:0;color:#0f172a;font-size:1.2rem;font-weight:800;}",
        ".share-loading-copy{margin:12px 0 0;color:#64748b;font-size:.9rem;line-height:1.7;}",
        ".share-loading-progress{height:8px;margin:22px 0 0;border-radius:999px;background:#e8eef8;overflow:hidden;}",
        ".share-loading-progress-fill{display:block;width:8%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#60a5fa,#22c55e);transition:width .28s ease;}",
        ".share-loading-status{margin:12px 0 0;color:#64748b;font-size:.78rem;font-weight:700;}",
        "</style>",
        "</head>",
        "<body>",
        '<main class="share-loading-card">',
        '<p class="share-loading-brand">Lumina Zone</p>',
        '<h1 id="shareLoadingTitle" class="share-loading-title">共有ページを作成しています</h1>',
        '<p id="shareLoadingCopy" class="share-loading-copy">チェック内容を整理して、共有できるURLを発行しています。</p>',
        '<div class="share-loading-progress" aria-hidden="true"><span id="shareLoadingProgress" class="share-loading-progress-fill"></span></div>',
        '<p id="shareLoadingStatus" class="share-loading-status">準備中...</p>',
        "</main>",
        "</body>",
        "</html>"
      ].join(""));
      shareWindow.document.close();
    } catch (error) {
      console.warn("Failed to render share loading window", error);
    }

    return shareWindow;
  }

  function updateShareLoadingWindow(shareWindow, title, copy, progress) {
    var clampedProgress = clamp(Number(progress) || 0, 0.05, 1);
    var percentText = Math.round(clampedProgress * 100) + "%";
    var doc = null;
    var titleNode = null;
    var copyNode = null;
    var progressNode = null;
    var statusNode = null;

    if (!shareWindow || shareWindow.closed) {
      return;
    }

    try {
      doc = shareWindow.document;
      titleNode = doc.getElementById("shareLoadingTitle");
      copyNode = doc.getElementById("shareLoadingCopy");
      progressNode = doc.getElementById("shareLoadingProgress");
      statusNode = doc.getElementById("shareLoadingStatus");

      if (titleNode && title) {
        titleNode.textContent = title;
      }
      if (copyNode && copy) {
        copyNode.textContent = copy;
      }
      if (progressNode) {
        progressNode.style.width = percentText;
      }
      if (statusNode) {
        statusNode.textContent = percentText;
      }
    } catch (error) {
      // The window may already have navigated to the generated share URL.
    }
  }

  function closeShareLoadingWindow(shareWindow) {
    if (!shareWindow || shareWindow.closed) {
      return;
    }

    try {
      shareWindow.close();
    } catch (error) {
      // The share window may be cross-origin after a navigation attempt.
    }
  }

  function openGeneratedSharePage(shareWindow, url) {
    if (shareWindow && !shareWindow.closed) {
      try {
        shareWindow.location.replace(url);
        return;
      } catch (error) {
        console.warn("Failed to redirect prepared share window", error);
      }
    }

    if (!window.open(url, "_blank")) {
      window.location.href = url;
    }
  }

  function setShareButtonBusy(isBusy) {
    if (!els.exportCurrentPdfButton) {
      return;
    }

    if (isBusy) {
      if (!els.exportCurrentPdfButton.dataset.idleLabel) {
        els.exportCurrentPdfButton.dataset.idleLabel = els.exportCurrentPdfButton.textContent || "チェック内容を共有";
      }
      els.exportCurrentPdfButton.disabled = true;
      els.exportCurrentPdfButton.textContent = "共有ページを作成中...";
      els.exportCurrentPdfButton.classList.add("is-loading");
      return;
    }

    els.exportCurrentPdfButton.textContent = els.exportCurrentPdfButton.dataset.idleLabel || "チェック内容を共有";
    els.exportCurrentPdfButton.classList.remove("is-loading");
    updatePdfButtons();
  }

  function getShareApiBase() {
    if (window.location && /^https?:$/i.test(window.location.protocol || "")) {
      return window.location.origin.replace(/\/+$/, "");
    }

    return "https://luminazone.jp";
  }

  function getErrorMessage(error) {
    var rawMessage = error && error.message ? error.message : error;

    if (typeof rawMessage === "string") {
      return rawMessage;
    }

    try {
      return JSON.stringify(rawMessage);
    } catch (_error) {
      return String(rawMessage);
    }
  }

  function safeFetchJson(response) {
    return response.text().then(function (text) {
      if (!text) {
        return {};
      }

      try {
        return JSON.parse(text);
      } catch (error) {
        return { raw: text };
      }
    });
  }

  async function copyShareText(value) {
    var text = String(value || "");
    var input = null;
    var copied = false;

    if (!text) {
      return true;
    }

    try {
      window.focus();
    } catch (_focusError) {}

    if (navigator.clipboard && window.isSecureContext !== false) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_clipboardError) {}
    }

    try {
      input = document.createElement("input");
      input.value = text;
      input.setAttribute("readonly", "readonly");
      input.style.position = "fixed";
      input.style.top = "-1000px";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      copied = document.execCommand("copy");
      input.remove();
      return copied;
    } catch (_execCommandError) {
      if (input && input.parentNode) {
        input.remove();
      }
      return false;
    }
  }

  function fitShareImageSize(srcW, srcH, maxW, maxH) {
    var scale = Math.min(maxW / srcW, maxH / srcH);

    return {
      width: srcW * scale,
      height: srcH * scale
    };
  }

  function loadShareImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();

      image.onload = function () {
        resolve(image);
      };
      image.onerror = function (error) {
        reject(error);
      };
      image.src = src;
    });
  }

  async function compressShareImageDataUrl(dataUrl, maxWidth, maxHeight, quality) {
    var image = null;
    var fitted = null;
    var canvas = null;
    var ctx = null;

    if (!dataUrl) {
      return "";
    }

    try {
      image = await loadShareImage(dataUrl);
      fitted = fitShareImageSize(image.width, image.height, maxWidth, maxHeight);
      canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(fitted.width));
      canvas.height = Math.max(1, Math.round(fitted.height));
      ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", quality);
    } catch (error) {
      console.warn("Failed to compress shared report image", error);
      return dataUrl;
    }
  }

  async function buildSharePayloadFromReport(report, onProgress) {
    var reportPages = buildReportPages(report.sections || []);
    var firstPage = reportPages[0] || {};
    var labels = [];
    var pages = [];
    var totalImages = reportPages.reduce(function (sum, page) {
      return sum + 1 + ((page && page.previewFrames) || []).length;
    }, 0);
    var processedImages = 0;

    function reportImageProgress() {
      processedImages += 1;
      if (typeof onProgress === "function") {
        onProgress(processedImages, totalImages || 1);
      }
    }

    reportPages.forEach(function (page) {
      var label = String(page.settingsLabel || "").trim();

      if (label && labels.indexOf(label) === -1) {
        labels.push(label);
      }
    });

    for (var pageIndex = 0; pageIndex < reportPages.length; pageIndex += 1) {
      var page = reportPages[pageIndex] || {};
      var compressedPreviewImage = await compressShareImageDataUrl(page.previewImageDataUrl || "", 576, 1024, 0.56);
      var compressedPreviewFrames = [];
      reportImageProgress();

      compressedPreviewFrames = await Promise.all((page.previewFrames || []).map(async function (frameInput) {
        var frame = frameInput || {};
        var sourceDataUrl = frame.previewImageDataUrl || page.previewImageDataUrl || "";
        var compressedFrameImage = sourceDataUrl === String(page.previewImageDataUrl || "")
          ? compressedPreviewImage
          : await compressShareImageDataUrl(sourceDataUrl, 378, 671, 0.46);

        reportImageProgress();
        return {
          id: frame.id || "",
          previewImageDataUrl: compressedFrameImage || compressedPreviewImage || ""
        };
      }));

      pages.push({
        pageIndex: Number(page.pageIndex || 0),
        pageCount: Number(page.pageCount || 1),
        previewImageDataUrl: compressedPreviewImage,
        flags: (page.flags || []).map(function (flag) {
          return {
            id: flag.id || "",
            reportNo: Number(flag.reportNo || 0),
            reportTitle: flag.reportTitle || "",
            reportPositionShort: flag.reportPositionShort || "",
            reportPositionLabel: flag.reportPositionLabel || "",
            reportSeverity: flag.reportSeverity || "low",
            reportStatus: flag.reportStatus || "pending",
            reportStatusLabel: flag.reportStatusLabel || "未対応",
            comment: flag.comment || "",
            timeLabel: flag.timeLabel || "",
            x: typeof flag.x === "number" ? flag.x : 0,
            y: typeof flag.y === "number" ? flag.y : 0
          };
        }),
        previewFrames: compressedPreviewFrames
      });
    }

    return {
      fileName: firstPage.fileName || report.documentTitle || "未命名素材",
      durationText: firstPage.durationText || "00:00",
      resolutionText: firstPage.resolutionText || "-- × --",
      settingsKey: firstPage.settingsKey || "all",
      settingsLabel: firstPage.settingsLabel || "未選択",
      platformLabels: labels.length ? labels : [String(firstPage.settingsLabel || "未選択")],
      instructionCount: reportPages.reduce(function (sum, page) {
        return sum + (((page && page.flags) || []).length);
      }, 0),
      pages: pages
    };
  }

  async function createShareUrl(sharePayload) {
    var response = await fetch(getShareApiBase() + "/api/share-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(sharePayload)
    });
    var payload = await safeFetchJson(response);

    if (!response.ok || !payload || !payload.url) {
      throw new Error(getErrorMessage((payload && (payload.detail || payload.error || payload.raw)) || ("HTTP " + response.status)));
    }

    return payload;
  }

  function buildReportDocumentHtml(report, options) {
    var reportPages = buildReportPages(report.sections || []);
    var headerEntry = reportPages[0] || {};
    var logoSrc = new URL("./assets/logo_new_blue.PNG", window.location.href).href;
    var shareApiBase = "https://luminazone.jp";
    if (window.location && /^https?:$/i.test(window.location.protocol || "")) {
      shareApiBase = window.location.origin;
    }
    var totalInstructionCount = reportPages.reduce(function (sum, entry) {
      return sum + (((entry && entry.flags) || []).length);
    }, 0);
    var platformLabels = [];
    reportPages.forEach(function (entry) {
      var label = String(entry.settingsLabel || "").trim();
      if (label && platformLabels.indexOf(label) === -1) {
        platformLabels.push(label);
      }
    });
    var headerMetaLine = [
      "長さ " + (headerEntry.durationText || "00:00"),
      "サイズ " + (headerEntry.resolutionText || "-- × --"),
      "対象SNS " + (platformLabels.join(" / ") || headerEntry.settingsLabel || "未選択"),
      "修正指示 " + (totalInstructionCount + "件")
    ].join(" / ");
    var headerMetaHtml =
      '<div class="report-header-meta-row">' +
        '<span class="report-header-meta-item"><span class="report-header-meta-label">長さ</span><span class="report-header-meta-value">' + escapeHtml(headerEntry.durationText || "00:00") + '</span></span>' +
        '<span class="report-header-meta-divider" aria-hidden="true">/</span>' +
        '<span class="report-header-meta-item"><span class="report-header-meta-label">サイズ</span><span class="report-header-meta-value">' + escapeHtml(headerEntry.resolutionText || "-- × --") + '</span></span>' +
        '<span class="report-header-meta-divider" aria-hidden="true">/</span>' +
        '<span class="report-header-meta-item"><span class="report-header-meta-label">対象SNS</span>' + getPlatformInlineMarkup(headerEntry.settingsKey || "all", "report-header-platform-icons") + '</span>' +
        '<span class="report-header-meta-divider" aria-hidden="true">/</span>' +
        '<span class="report-header-meta-item"><span class="report-header-meta-label">修正指示</span><span class="report-header-meta-value">' + escapeHtml(String(totalInstructionCount) + "件") + '</span></span>' +
      '</div>';
    var sectionsHtml = reportPages.map(function (entry, index) {
      return buildReportSectionHtml(entry, index, reportPages.length);
    }).join("");

    return [
      "<!DOCTYPE html>",
      '<html lang="ja">',
      "<head>",
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      "<title>" + escapeHtml(report.documentTitle) + "</title>",
      "<style>" + buildReportStyles() + "</style>",
      "</head>",
      '<body class="report-body">',
      '<div class="report-shell">',
      '<div class="report-topbar" data-print-hide="true">',
      '<div class="report-page-brand">' +
      '<img src="' + escapeHtml(logoSrc) + '" alt="Lumina Zone" class="report-page-brand-mark" width="90" height="90">' +
      "</div>",
      '<div class="report-actions">',
      '<button id="reportCopyLink" type="button">共有URLをコピー</button>',
      '<p class="report-share-note">共有URLは発行日から7日後に失効します。</p>',
      "</div>",
      "</div>",
      '<header class="report-header">',
      '<div class="report-header-meta-block">' +
        '<p class="report-header-inline" title="' + escapeHtml((headerEntry.fileName || report.documentTitle || "report") + " / " + headerMetaLine) + '">' +
          '<span class="report-header-file">' + escapeHtml(headerEntry.fileName || report.documentTitle || "report") + "</span>" +
        "</p>" +
        headerMetaHtml +
      "</div>",
      "</header>",
      '<main class="report-main">',
      sectionsHtml,
      "</main>",
      '<footer class="report-footer">このレポートは Lumina Zone で作成されました。</footer>',
      "</div>",
      buildReportDownloadScript(
        report.documentTitle || "lumina-zone-report",
        report.reportTitle || "修正指示書",
        headerMetaLine,
        reportPages,
        shareApiBase
      ),
      "</body>",
      "</html>"
    ].join("");
  }

  function buildReportDownloadScript(documentTitle, reportTitle, headerMetaLine, reportPages, shareApiBase) {
    return [
      '<script>(function(){',
      'var copyButton=document.getElementById("reportCopyLink");',
      'var documentTitle=' + JSON.stringify(documentTitle) + ';',
      'var reportTitle=' + JSON.stringify(reportTitle) + ';',
      'var headerMetaLine=' + JSON.stringify(headerMetaLine) + ';',
      'var reportPages=' + JSON.stringify(reportPages) + ';',
      'var shareApiBase=' + JSON.stringify(shareApiBase || "https://luminazone.jp") + ';',
      'var pageWidthPx=1680;',
      'var pageHeightPx=1188;',
      'function safeFetchJson(response){return response.text().then(function(text){if(!text){return {};}try{return JSON.parse(text);}catch(error){return {raw:text};}});}',
      'async function copyText(value){var text=String(value||"");if(!text){return true;}try{window.focus();}catch(_focusError){}if(navigator.clipboard&&window.isSecureContext!==false){try{await navigator.clipboard.writeText(text);return true;}catch(_clipboardError){}}try{var input=document.createElement("input");input.value=text;input.setAttribute("readonly","readonly");input.style.position="fixed";input.style.top="-1000px";input.style.opacity="0";document.body.appendChild(input);input.focus();input.select();var copied=document.execCommand("copy");input.remove();if(copied){return true;}}catch(_execCommandError){}window.prompt("共有URLをコピーしてください",text);return false;}',
      'async function compressShareImageDataUrl(dataUrl,maxWidth,maxHeight,quality){if(!dataUrl){return "";}try{var image=await loadImage(dataUrl);var fitted=fitSize(image.width,image.height,maxWidth,maxHeight);var canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(fitted.width));canvas.height=Math.max(1,Math.round(fitted.height));var ctx=canvas.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL("image/jpeg",quality);}catch(error){console.warn("Failed to compress shared report image",error);return dataUrl;}}',
      'async function buildSharePayload(){var firstPage=reportPages[0]||{};var labels=[];reportPages.forEach(function(page){var label=String(page.settingsLabel||"").trim();if(label&&labels.indexOf(label)===-1){labels.push(label);}});var pages=[];for(var pageIndex=0;pageIndex<reportPages.length;pageIndex+=1){var page=reportPages[pageIndex]||{};var compressedPreviewImage=await compressShareImageDataUrl(page.previewImageDataUrl||"",640,1138,0.68);var compressedPreviewFrames=[];for(var frameIndex=0;frameIndex<(page.previewFrames||[]).length;frameIndex+=1){var frame=(page.previewFrames||[])[frameIndex]||{};var sourceDataUrl=frame.previewImageDataUrl||page.previewImageDataUrl||"";var compressedFrameImage=sourceDataUrl===String(page.previewImageDataUrl||"")?compressedPreviewImage:await compressShareImageDataUrl(sourceDataUrl,420,746,0.58);compressedPreviewFrames.push({id:frame.id||"",previewImageDataUrl:compressedFrameImage||compressedPreviewImage||""});}pages.push({pageIndex:Number(page.pageIndex||0),pageCount:Number(page.pageCount||1),previewImageDataUrl:compressedPreviewImage,flags:(page.flags||[]).map(function(flag){return {id:flag.id||"",reportNo:Number(flag.reportNo||0),reportTitle:flag.reportTitle||"",reportPositionShort:flag.reportPositionShort||"",reportPositionLabel:flag.reportPositionLabel||"",reportSeverity:flag.reportSeverity||"low",reportStatus:flag.reportStatus||"pending",reportStatusLabel:flag.reportStatusLabel||"未対応",comment:flag.comment||"",timeLabel:flag.timeLabel||"",x:typeof flag.x==="number"?flag.x:0,y:typeof flag.y==="number"?flag.y:0};}),previewFrames:compressedPreviewFrames});}return {fileName:firstPage.fileName||documentTitle||"未命名素材",durationText:firstPage.durationText||"00:00",resolutionText:firstPage.resolutionText||"-- × --",settingsKey:firstPage.settingsKey||"all",settingsLabel:firstPage.settingsLabel||"未選択",platformLabels:labels.length?labels:[String(firstPage.settingsLabel||"未選択")],instructionCount:reportPages.reduce(function(sum,page){return sum+(((page&&page.flags)||[]).length);},0),pages:pages};}',
      'function dataUrlToBytes(dataUrl){var base64=dataUrl.split(",")[1]||"";var binary=window.atob(base64);var length=binary.length;var bytes=new Uint8Array(length);for(var i=0;i<length;i+=1){bytes[i]=binary.charCodeAt(i);}return bytes;}',
      'function buildPdfBlob(images){var parts=[];var offsets=[0];var offset=0;function pushAscii(text){var bytes=new TextEncoder().encode(text);parts.push(bytes);offset+=bytes.length;}function pushBinary(bytes){parts.push(bytes);offset+=bytes.length;}function markObject(id){offsets[id]=offset;}var pageWidth=841.89;var pageHeight=595.28;var objectId=1;var catalogId=objectId++;var pagesId=objectId++;var pageIds=[];var contentIds=[];var imageIds=[];images.forEach(function(){pageIds.push(objectId++);contentIds.push(objectId++);imageIds.push(objectId++);});pushAscii("%PDF-1.4\\n%\\xE2\\xE3\\xCF\\xD3\\n");markObject(catalogId);pushAscii(catalogId+" 0 obj\\n<< /Type /Catalog /Pages "+pagesId+" 0 R >>\\nendobj\\n");markObject(pagesId);pushAscii(pagesId+" 0 obj\\n<< /Type /Pages /Count "+images.length+" /Kids ["+pageIds.map(function(id){return id+" 0 R";}).join(" ")+"] >>\\nendobj\\n");images.forEach(function(image,index){var pageId=pageIds[index];var contentId=contentIds[index];var imageId=imageIds[index];var contentStream="q\\n"+pageWidth+" 0 0 "+pageHeight+" 0 0 cm\\n/Im1 Do\\nQ";markObject(pageId);pushAscii(pageId+" 0 obj\\n<< /Type /Page /Parent "+pagesId+" 0 R /MediaBox [0 0 "+pageWidth+" "+pageHeight+"] /Resources << /XObject << /Im1 "+imageId+" 0 R >> >> /Contents "+contentId+" 0 R >>\\nendobj\\n");markObject(contentId);pushAscii(contentId+" 0 obj\\n<< /Length "+contentStream.length+" >>\\nstream\\n"+contentStream+"\\nendstream\\nendobj\\n");markObject(imageId);pushAscii(imageId+" 0 obj\\n<< /Type /XObject /Subtype /Image /Width "+image.width+" /Height "+image.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Interpolate true /Length "+image.bytes.length+" >>\\nstream\\n");pushBinary(image.bytes);pushAscii("\\nendstream\\nendobj\\n");});var xrefOffset=offset;pushAscii("xref\\n0 "+objectId+"\\n");pushAscii("0000000000 65535 f \\n");for(var i=1;i<objectId;i+=1){pushAscii(String(offsets[i]||0).padStart(10,"0")+" 00000 n \\n");}pushAscii("trailer\\n<< /Size "+objectId+" /Root "+catalogId+" 0 R >>\\nstartxref\\n"+xrefOffset+"\\n%%EOF");return new Blob(parts,{type:"application/pdf"});}',
      'function roundRect(ctx,x,y,w,h,r){var radius=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+radius,y);ctx.arcTo(x+w,y,x+w,y+h,radius);ctx.arcTo(x+w,y+h,x,y+h,radius);ctx.arcTo(x,y+h,x,y,radius);ctx.arcTo(x,y,x+w,y,radius);ctx.closePath();}',
      'function drawCard(ctx,x,y,w,h,r,fill,stroke){ctx.save();ctx.fillStyle=fill;roundRect(ctx,x,y,w,h,r);ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}ctx.restore();}',
      'function drawText(ctx,text,x,y,font,color,baseline,align){ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textBaseline=baseline||"alphabetic";ctx.textAlign=align||"left";ctx.fillText(text,x,y);ctx.restore();}',
      'function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight,maxLines,font,color){ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textBaseline="top";ctx.textAlign="left";var words=String(text||"").split(/\\s+/);var line="";var lineCount=0;for(var i=0;i<words.length;i+=1){var testLine=line?line+" "+words[i]:words[i];if(ctx.measureText(testLine).width>maxWidth&&line){ctx.fillText(line,x,y+lineCount*lineHeight);line=words[i];lineCount+=1;if(maxLines&&lineCount>=maxLines-1){break;}}else{line=testLine;}}if(line&&(maxLines===0||lineCount<maxLines)){ctx.fillText(line,x,y+lineCount*lineHeight);lineCount+=1;}ctx.restore();return y+lineCount*lineHeight;}',
      'function loadImage(src){return new Promise(function(resolve,reject){var img=new Image();img.onload=function(){resolve(img);};img.onerror=function(error){reject(error);};img.src=src;});}',
      'function fitSize(srcW,srcH,maxW,maxH){var scale=Math.min(maxW/srcW,maxH/srcH);return {width:srcW*scale,height:srcH*scale};}',
      'function getSectionFlags(section){return Array.prototype.slice.call(section.querySelectorAll(".report-instruction-item[data-flag-id]"));}',
      'function getReportStatusMeta(status){if(status==="done"){return {key:"done",label:"対応済み",buttonClass:"report-status-toggle report-status-toggle-done"};}return {key:"pending",label:"未対応",buttonClass:"report-status-toggle report-status-toggle-pending"};}',
      'function renderStatusToggleLabel(label){return \'<span class="report-status-toggle-label">\'+label+\'</span><span class="report-status-toggle-icon" aria-hidden="true">▾</span>\';}',
      'function updateInstructionStatusUi(item,status){var meta=getReportStatusMeta(status);var button=item.querySelector("[data-flag-status-toggle]");item.setAttribute("data-report-status",meta.key);if(button){button.className=meta.buttonClass;button.innerHTML=renderStatusToggleLabel(meta.label);button.setAttribute("aria-pressed",meta.key==="done"?"true":"false");button.setAttribute("aria-label",meta.label+" に切り替え");}}',
      'function updateReportPageStatus(section,flagId,nextStatus){var pageIndex=parseInt(section.getAttribute("data-report-page-index")||"-1",10);if(pageIndex<0||!reportPages[pageIndex]){return;}var page=reportPages[pageIndex];(page.flags||[]).forEach(function(flag){if(String(flag.id||"")===String(flagId||"")){flag.reportStatus=nextStatus;flag.reportStatusLabel=getReportStatusMeta(nextStatus).label;}});}',
      'function updateSectionSelection(section,nextIndex){var items=getSectionFlags(section);if(!items.length){return;}var total=items.length;var index=Math.max(0,Math.min(nextIndex,total-1));var activeItem=items[index];var activeId=activeItem.getAttribute("data-flag-id")||"";var nextPreviewSrc=activeItem.getAttribute("data-preview-src")||"";var pins=Array.prototype.slice.call(section.querySelectorAll(".report-preview-pin[data-flag-id]"));items.forEach(function(item,itemIndex){var isActive=itemIndex===index;item.classList.toggle("is-active",isActive);item.setAttribute("aria-current",isActive?"true":"false");});pins.forEach(function(pin,pinIndex){var isActive=pinIndex===index||pin.getAttribute("data-flag-id")===activeId;pin.classList.toggle("is-active",isActive);});var stage=section.querySelector(".report-preview-stage");if(stage){stage.setAttribute("data-active-flag-id",activeId);}var previewImage=section.querySelector(".report-preview-image");if(previewImage&&nextPreviewSrc&&previewImage.getAttribute("src")!==nextPreviewSrc){previewImage.setAttribute("src",nextPreviewSrc);}var currentLabel=section.querySelector("[data-nav-current]");if(currentLabel){currentLabel.textContent=String(index+1);}var prevButton=section.querySelector(\'[data-nav-direction="prev"]\');var nextButton=section.querySelector(\'[data-nav-direction="next"]\');if(prevButton){prevButton.disabled=index<=0;}if(nextButton){nextButton.disabled=index>=total-1;}if(activeItem&&typeof activeItem.scrollIntoView==="function"){activeItem.scrollIntoView({block:"nearest",behavior:"smooth"});}}',
      'function wireSection(section){var items=getSectionFlags(section);if(!items.length){return;}items.forEach(function(item,itemIndex){var statusButton=item.querySelector("[data-flag-status-toggle]");item.addEventListener("click",function(){updateSectionSelection(section,itemIndex);});item.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();updateSectionSelection(section,itemIndex);}});if(statusButton){statusButton.addEventListener("click",function(event){var currentStatus=item.getAttribute("data-report-status")==="done"?"done":"pending";var nextStatus=currentStatus==="done"?"pending":"done";event.stopPropagation();updateInstructionStatusUi(item,nextStatus);updateReportPageStatus(section,item.getAttribute("data-flag-id"),nextStatus);});}});Array.prototype.slice.call(section.querySelectorAll(".report-preview-pin[data-flag-id]")).forEach(function(pin,pinIndex){pin.addEventListener("click",function(){updateSectionSelection(section,pinIndex);});});Array.prototype.slice.call(section.querySelectorAll(".report-preview-nav-button")).forEach(function(button){button.addEventListener("click",function(){var current=parseInt((section.querySelector("[data-nav-current]")||{}).textContent||"1",10)-1;if(button.getAttribute("data-nav-direction")==="prev"){updateSectionSelection(section,current-1);}else{updateSectionSelection(section,current+1);}});});updateSectionSelection(section,0);}',
      'async function copyShareUrl(){if(!copyButton){return;}var originalLabel=copyButton.textContent;copyButton.disabled=true;copyButton.textContent="発行中...";try{var sharePayload=await buildSharePayload();var response=await fetch(String(shareApiBase||"").replace(/\\/+$/,"")+"/api/share-create",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(sharePayload)});var payload=await safeFetchJson(response);if(!response.ok||!payload||!payload.url){var detail=(payload&&payload.detail)||(payload&&payload.error)||(payload&&payload.raw)||("HTTP "+response.status);var detailText=(typeof detail==="string")?detail:function(){try{return JSON.stringify(detail);}catch(_error){return String(detail);}}();throw new Error(detailText);}var copied=await copyText(payload.url);copyButton.textContent=copied?"コピーしました":"URLを表示しました";setTimeout(function(){copyButton.textContent=originalLabel;copyButton.disabled=false;},1800);return;}catch(error){console.error("Failed to create share report",error);var rawMessage=(error&&error.message)?error.message:error;var message=(typeof rawMessage==="string")?rawMessage:function(){try{return JSON.stringify(rawMessage);}catch(_error){return String(rawMessage);}}();window.alert("共有URLの発行に失敗しました。\\n\\n原因: "+message);copyButton.textContent=originalLabel;copyButton.disabled=false;}}',
      'function renderInstructionItem(ctx,flag,index,x,y,w){var itemH=flag.comment?156:92;var statusLabel=flag.reportStatus==="done"?"対応済み":"未対応";var statusFill=flag.reportStatus==="done"?"#dcfce7":"#eef2f7";var statusText=flag.reportStatus==="done"?"#166534":"#475569";drawCard(ctx,x,y,w,itemH,22,"#ffffff","rgba(15,23,42,0.08)");ctx.save();ctx.fillStyle=flag.reportSeverityColor||"#64748b";roundRect(ctx,x+18,y+18,66,44,22);ctx.fill();ctx.restore();drawText(ctx,String(flag.reportNo||index+1),x+51,y+41,"800 30px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#ffffff","middle","center");drawText(ctx,flag.reportTitle||"",x+104,y+48,"700 36px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#0f172a","middle","left");drawText(ctx,"（"+(flag.reportPositionShort||"中央")+"）",x+220,y+49,"600 22px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#64748b","middle","left");ctx.save();ctx.fillStyle=statusFill;roundRect(ctx,x+w-138,y+18,120,40,20);ctx.fill();ctx.restore();drawText(ctx,statusLabel,x+w-78,y+39,"800 18px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif",statusText,"middle","center");if(flag.comment){drawCard(ctx,x+18,y+78,w-36,60,16,(flag.reportSeverity==="high"?"rgba(239,68,68,0.06)":flag.reportSeverity==="medium"?"rgba(245,158,11,0.08)":"rgba(100,116,139,0.08)"),null);drawText(ctx,"修正内容",x+34,y+99,"700 16px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#64748b","middle","left");drawWrappedText(ctx,flag.comment,x+34,y+112,w-68,24,2,"600 22px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#1f2937");}return y+itemH+16;}',
      'async function renderPdfPage(page){var canvas=document.createElement("canvas");canvas.width=pageWidthPx;canvas.height=pageHeightPx;var ctx=canvas.getContext("2d");ctx.fillStyle="#f3f7fc";ctx.fillRect(0,0,canvas.width,canvas.height);drawCard(ctx,24,24,1632,148,28,"#ffffff","rgba(15,23,42,0.08)");drawText(ctx,"Lumina Zone",58,66,"700 24px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#2563eb");drawText(ctx,reportTitle,58,122,"800 56px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#0f172a");drawWrappedText(ctx,page.fileName||documentTitle,372,44,1220,46,1,"700 44px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#0f172a");drawText(ctx,headerMetaLine,372,118,"600 24px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#64748b");drawCard(ctx,24,194,1632,930,28,"#ffffff","rgba(15,23,42,0.08)");drawCard(ctx,48,220,712,878,24,"#f8fbff","rgba(37,99,235,0.1)");var previewImage=await loadImage(page.previewImageDataUrl);var fitted=fitSize(previewImage.width,previewImage.height,640,804);var previewX=48+((712-fitted.width)/2);var previewY=252+((804-fitted.height)/2);ctx.save();ctx.shadowColor="rgba(15,23,42,0.13)";ctx.shadowBlur=28;ctx.shadowOffsetY=12;roundRect(ctx,previewX,previewY,fitted.width,fitted.height,24);ctx.clip();ctx.drawImage(previewImage,previewX,previewY,fitted.width,fitted.height);ctx.restore();ctx.save();ctx.translate(previewX,previewY);drawExportFlags(ctx,page.flags||[],fitted.width,fitted.height,"");ctx.restore();drawCard(ctx,792,220,840,878,22,"#f8fafc","rgba(15,23,42,0.08)");drawText(ctx,"修正指示",820,268,"800 24px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#0f172a");if(page.pageCount>1){drawCard(ctx,1502,240,96,38,19,"rgba(37,99,235,0.12)",null);drawText(ctx,(page.pageIndex+1)+"/"+page.pageCount,1550,259,"800 18px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#2563eb","middle","center");}var itemY=300;(page.flags||[]).forEach(function(flag,index){itemY=renderInstructionItem(ctx,flag,index,820,itemY,784);});drawText(ctx,"このレポートは Lumina Zone で作成されました。",1320,1142,"500 16px SF Pro Display, Hiragino Sans, Yu Gothic, sans-serif","#64748b","alphabetic","left");return {dataUrl:canvas.toDataURL("image/jpeg",0.94),width:canvas.width,height:canvas.height};}',
      'if(copyButton){copyButton.addEventListener("click",function(){copyShareUrl();});}',
      'Array.prototype.slice.call(document.querySelectorAll(".report-section")).forEach(function(section){wireSection(section);});',
      '}());<\/script>'
    ].join("");
  }

  function buildReportPages(entries) {
    var pages = [];
    var maxFlagsPerPage = 5;

    (entries || []).forEach(function (entry) {
      var flags = entry.flags || [];
      var previewFrames = entry.previewFrames || [];
      var chunkCount = Math.max(1, Math.ceil(flags.length / maxFlagsPerPage));

      if (!flags.length) {
        pages.push(Object.assign({}, entry, {
          flags: [],
          previewFrames: [],
          pageIndex: 0,
          pageCount: 1
        }));
        return;
      }

      for (var index = 0; index < chunkCount; index += 1) {
        var pageFlags = flags.slice(index * maxFlagsPerPage, (index + 1) * maxFlagsPerPage);
        var pagePreviewFrames = pageFlags.map(function (flag) {
          var flagId = String(flag.id || "");
          var matchedFrame = previewFrames.find(function (frame) {
            return String(frame.id || "") === flagId;
          });

          return matchedFrame || {
            id: flagId,
            previewImageDataUrl: entry.previewImageDataUrl || ""
          };
        });

        pages.push(Object.assign({}, entry, {
          flags: pageFlags,
          previewFrames: pagePreviewFrames,
          previewImageDataUrl: (pagePreviewFrames[0] && pagePreviewFrames[0].previewImageDataUrl) || entry.previewImageDataUrl || "",
          pageIndex: index,
          pageCount: chunkCount
        }));
      }
    });

    return pages;
  }

  function buildReportSectionHtml(entry, index, totalSections) {
    var defaultActiveFlagId = entry.flags.length ? String(entry.flags[0].id || "") : "";
    var previewFrameLookup = {};
    (entry.previewFrames || []).forEach(function (frame) {
      previewFrameLookup[String(frame.id || "")] = frame.previewImageDataUrl || "";
    });
    var instructionHtml = entry.flags.map(function (flag, flagIndex) {
      var noBadgeClass = "report-no-badge report-no-badge-" + escapeHtml(flag.reportSeverity || "low");
      var noteClass = "report-instruction-note report-instruction-note-" + escapeHtml(flag.reportSeverity || "low");
      var memo = (flag.comment || "").trim();
      var flagId = String(flag.id || "");
      var itemClassName = "report-instruction-item" + (flagId === defaultActiveFlagId ? " is-active" : "");
      return (
        '<article class="' + itemClassName + '" data-flag-id="' + escapeHtml(flagId) + '" data-flag-index="' + escapeHtml(String(flagIndex)) + '" data-report-status="' + escapeHtml(flag.reportStatus || "pending") + '" data-preview-src="' + escapeHtml(previewFrameLookup[flagId] || entry.previewImageDataUrl || "") + '" role="button" tabindex="0" aria-current="' + (flagId === defaultActiveFlagId ? "true" : "false") + '">' +
          '<div class="report-instruction-head">' +
            '<div class="report-instruction-main">' +
              '<span class="' + noBadgeClass + '">' + escapeHtml(String(flag.reportNo || "")) + "</span>" +
              "<strong>" + escapeHtml(getFlagTitle(flag)) + "</strong>" +
              '<span class="report-instruction-position">（' + escapeHtml(flag.reportPositionShort || flag.reportPositionLabel || FLAG_LABELS[flag.zone]) + "）</span>" +
            "</div>" +
            '<div class="report-instruction-aside">' +
              '<button type="button" class="report-status-toggle report-status-toggle-' + escapeHtml(flag.reportStatus || "pending") + '" data-flag-status-toggle data-flag-id="' + escapeHtml(flagId) + '" aria-pressed="' + ((flag.reportStatus || "pending") === "done" ? "true" : "false") + '" aria-label="' + escapeHtml((flag.reportStatusLabel || "未対応") + " に切り替え") + '">' +
                '<span class="report-status-toggle-label">' + escapeHtml(flag.reportStatusLabel || "未対応") + '</span>' +
                '<span class="report-status-toggle-icon" aria-hidden="true">▾</span>' +
              "</button>" +
            "</div>" +
          "</div>" +
          (memo ? ('<div class="' + noteClass + '"><span>修正内容</span><p>' + escapeHtml(memo) + "</p></div>") : "") +
        "</article>"
      );
    }).join("");
    var previewPinsHtml = entry.flags.map(function (flag, flagIndex) {
      var severityKey = escapeHtml(flag.reportSeverity || "low");
      var flagId = String(flag.id || "");
      var pinClassName = "report-preview-pin report-preview-pin-" + severityKey + (flagId === defaultActiveFlagId ? " is-active" : "");
      return (
        '<button type="button" class="' + pinClassName + '" data-flag-id="' + escapeHtml(flagId) + '" data-flag-index="' + escapeHtml(String(flagIndex)) + '" style="left:' + escapeHtml(String((flag.x || 0) * 100)) + "%;top:" + escapeHtml(String((flag.y || 0) * 100)) + '%;">' +
          '<span>' + escapeHtml(String(flag.reportNo || (flagIndex + 1))) + '</span>' +
        '</button>'
      );
    }).join("");
    var sectionClassName = totalSections > 1 && index > 0 ? "report-section report-section-break" : "report-section";
    var previewHtml = entry.previewImageDataUrl
      ? (
        '<div class="report-preview-shell">' +
          ((entry.flags || []).length > 1
            ? (
              '<div class="report-preview-nav" data-print-hide="true">' +
                '<button type="button" class="report-preview-nav-button" data-nav-direction="prev">前へ</button>' +
                '<div class="report-preview-nav-count"><span data-nav-current>1</span> / <span data-nav-total>' + escapeHtml(String(entry.flags.length)) + '</span></div>' +
                '<button type="button" class="report-preview-nav-button" data-nav-direction="next">次へ</button>' +
              '</div>'
            )
            : "") +
          '<div class="report-preview-media">' +
            '<div class="report-preview-stage" data-active-flag-id="' + escapeHtml(defaultActiveFlagId) + '">' +
              '<img class="report-preview-image" src="' + escapeHtml(entry.previewImageDataUrl) + '" alt="' + escapeHtml(entry.fileName + " の確認イメージ") + '">' +
              '<div class="report-preview-pins">' + previewPinsHtml + '</div>' +
            '</div>' +
          "</div>" +
          ((entry.previewCaption || "").trim() ? ('<p class="report-preview-caption">' + escapeHtml(entry.previewCaption) + "</p>") : "") +
        "</div>"
      )
      : (
        '<div class="report-preview-shell report-preview-shell-empty">' +
          '<div class="report-preview-empty">' +
            '<div class="report-preview-empty-icon" aria-hidden="true">i</div>' +
            '<h4>プレビューは保存されていません</h4>' +
            '<p>履歴から開いた素材は、チェック内容のみを読み込んでいます。</p>' +
            '<p>同じ素材をもう一度読み込むと、プレビュー付きで確認できます。</p>' +
          '</div>' +
        '</div>'
      );
    var overviewHtml =
      '<div class="report-overview">' +
        '<div class="report-preview-column">' +
          previewHtml +
        "</div>" +
        '<div class="report-info-column">' +
          '<div class="report-instruction-shell">' +
            '<div class="report-instruction-header">' +
              '<h3 class="report-instruction-title">修正指示</h3>' +
              '<div class="report-instruction-header-meta">' +
                '<span class="report-instruction-count">' + escapeHtml(String((entry.flags || []).length)) + '件</span>' +
                (entry.pageCount > 1 ? ('<span class="report-page-chip">' + escapeHtml((entry.pageIndex + 1) + "/" + entry.pageCount) + "</span>") : "") +
              '</div>' +
            '</div>' +
            '<div class="report-instruction-list">' + instructionHtml + "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    return (
      '<section class="' + sectionClassName + '" data-report-page-index="' + escapeHtml(String(index)) + '">' +
        overviewHtml +
      "</section>"
    );
  }

  function buildReportStyles() {
    return [
      '@page { size: A4 landscape; margin: 10mm; }',
      'body { margin: 0; font-family: "SF Pro Display", "Hiragino Sans", "Yu Gothic", sans-serif; background: #f3f7fc; color: #111827; }',
      '.report-body { padding: 18px; }',
      '.report-shell { max-width: 1080px; margin: 0 auto; }',
      '.report-topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }',
      '.report-page-brand { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 90px; height: 90px; overflow: hidden; }',
      '.report-page-brand-mark { display: block; width: 90px; height: 90px; object-fit: cover; object-position: center top; }',
      '.report-actions { display: flex; justify-content: flex-end; align-items: center; gap: 12px; flex: 1 1 auto; }',
      '.report-actions button { appearance: none; border: 0; border-radius: 999px; padding: 11px 18px; font: inherit; font-weight: 600; cursor: pointer; color: #ffffff; background: linear-gradient(135deg, #9bc7ff, #4b7cff); box-shadow: 0 14px 30px rgba(75, 124, 255, 0.2); }',
      '.report-actions button:first-child { background: linear-gradient(135deg, #6fdc8c, #2fbf71); color: #ffffff; box-shadow: 0 14px 30px rgba(47, 191, 113, 0.2); }',
      '.report-share-note { margin: 0; color: #64748b; font-size: 12px; line-height: 1.5; text-align: right; white-space: nowrap; }',
      '.report-header { display: block; padding: 18px 22px; border-radius: 24px; background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08); }',
      '.report-header-meta-block { min-width: 0; text-align: left; }',
      '.report-header-inline { display: block; margin: 0 0 8px; white-space: nowrap; overflow: hidden; }',
      '.report-header-file { color: #0f172a; font-size: 1.34rem; line-height: 1.16; font-weight: 700; overflow: hidden; text-overflow: ellipsis; display: block; }',
      '.report-header-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: #64748b; }',
      '.report-header-meta-item { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }',
      '.report-header-meta-label { color: #94a3b8; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.02em; }',
      '.report-header-meta-value { color: #64748b; font-size: 0.84rem; line-height: 1.4; font-weight: 600; }',
      '.report-header-meta-divider { color: rgba(100, 116, 139, 0.55); font-size: 0.78rem; font-weight: 700; }',
      '.report-header-platform-icons { min-width: 0; }',
      '.report-summary-item, .report-meta-item { padding: 14px 16px; border-radius: 18px; background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); }',
      '.report-summary-item span, .report-meta-item span { display: block; color: #64748b; font-size: 0.82rem; margin-bottom: 6px; }',
      '.report-summary-item strong, .report-meta-item strong { font-size: 1rem; font-weight: 700; color: #0f172a; }',
      '.report-main { display: grid; gap: 14px; margin-top: 14px; }',
      '.report-section { border-radius: 24px; background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08); padding: 18px; }',
      '.report-section-break { break-before: page; page-break-before: always; }',
      '.report-overview { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr); gap: 18px; align-items: start; }',
      '.report-preview-column { min-width: 0; }',
      '.report-info-column { display: grid; gap: 12px; align-content: start; min-width: 0; }',
      '.report-preview-shell { padding: 10px; border-radius: 22px; background: linear-gradient(180deg, #edf4ff, #f8fbff); border: 1px solid rgba(37, 99, 235, 0.1); }',
      '.report-preview-shell-empty { min-height: 156mm; display: grid; place-items: center; }',
      '.report-preview-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }',
      '.report-preview-nav-button { appearance: none; border: 1px solid rgba(15, 23, 42, 0.1); border-radius: 999px; padding: 7px 14px; background: #ffffff; color: #0f172a; font: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: background 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease; }',
      '.report-preview-nav-button:hover:not(:disabled) { background: #f8fafc; border-color: rgba(37, 99, 235, 0.22); color: #2563eb; transform: translateY(-1px); }',
      '.report-preview-nav-button:disabled { opacity: 0.38; cursor: default; transform: none; }',
      '.report-preview-nav-count { color: #64748b; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.01em; }',
      '.report-preview-media { display: grid; place-items: center; min-height: 156mm; }',
      '.report-preview-stage { position: relative; display: inline-block; line-height: 0; isolation: isolate; }',
      '.report-preview-image { display: block; width: auto; max-width: 100%; max-height: 152mm; height: auto; border-radius: 22px; box-shadow: 0 16px 30px rgba(15, 23, 42, 0.13); }',
      '.report-preview-pins { position: absolute; inset: 0; pointer-events: none; }',
      '.report-preview-pin { position: absolute; transform: translate(-50%, -50%) scale(0.76); width: 36px; height: 36px; border-radius: 999px; border: 3px solid rgba(255, 255, 255, 0.96); color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font: inherit; font-size: 1rem; font-weight: 800; line-height: 1; box-shadow: 0 10px 18px rgba(15, 23, 42, 0.18); cursor: pointer; opacity: 0.24; transition: transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease, filter 180ms ease; pointer-events: auto; }',
      '.report-preview-pin span { display: block; line-height: 1; }',
      '.report-preview-pin.is-active { transform: translate(-50%, -50%) scale(1); opacity: 1; box-shadow: 0 14px 24px rgba(15, 23, 42, 0.22), 0 0 0 10px rgba(37, 99, 235, 0.12); filter: saturate(1.08); }',
      '.report-preview-pin-high { background: #ef4444; }',
      '.report-preview-pin-medium { background: #f59e0b; }',
      '.report-preview-pin-low { background: #64748b; }',
      '.report-preview-caption { margin: 8px 0 0; color: #94a3b8; font-size: 0.74rem; letter-spacing: 0.01em; text-align: center; }',
      '.report-preview-empty { width: min(100%, 420px); padding: 26px 24px; border-radius: 22px; border: 1px dashed rgba(148, 163, 184, 0.32); background: rgba(255, 255, 255, 0.82); text-align: center; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32); }',
      '.report-preview-empty-icon { width: 34px; height: 34px; margin: 0 auto 14px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: rgba(37, 99, 235, 0.1); color: #2563eb; font-size: 0.95rem; font-weight: 800; }',
      '.report-preview-empty h4 { margin: 0 0 10px; color: #0f172a; font-size: 1rem; font-weight: 800; }',
      '.report-preview-empty p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.7; }',
      '.report-preview-empty p + p { margin-top: 8px; }',
      '.report-instruction-shell { border-radius: 18px; border: 1px solid rgba(15, 23, 42, 0.08); background: #f8fafc; padding: 14px; }',
      '.report-instruction-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 12px; }',
      '.report-instruction-title { margin: 0; font-size: 0.92rem; font-weight: 800; color: #0f172a; letter-spacing: 0.01em; }',
      '.report-instruction-header-meta { display: inline-flex; align-items: center; gap: 8px; color: #64748b; }',
      '.report-instruction-count { font-size: 0.76rem; font-weight: 700; }',
      '.report-page-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 42px; padding: 5px 10px; border-radius: 999px; background: rgba(37, 99, 235, 0.12); color: #2563eb; font-size: 0.76rem; font-weight: 800; line-height: 1; }',
      '.report-instruction-list { display: grid; gap: 12px; }',
      '.report-instruction-item { padding: 12px 14px; border-radius: 16px; background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); cursor: pointer; transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background 180ms ease; }',
      '.report-instruction-item:hover { border-color: rgba(37, 99, 235, 0.22); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06); transform: translateY(-1px); }',
      '.report-instruction-item.is-active { border-color: rgba(37, 99, 235, 0.28); box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12); background: linear-gradient(180deg, #ffffff, #f8fbff); }',
      '.report-instruction-item:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.22); outline-offset: 2px; }',
      '.report-instruction-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }',
      '.report-instruction-main { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0; }',
      '.report-instruction-main strong { font-size: 0.98rem; line-height: 1.2; color: #0f172a; }',
      '.report-instruction-position { color: #64748b; font-size: 0.86rem; font-weight: 600; }',
      '.report-instruction-aside { display: inline-flex; align-items: center; gap: 10px; flex: 0 0 auto; }',
      '.report-instruction-note { margin-top: 10px; padding: 10px 12px; border-radius: 14px; border-left: 4px solid #cbd5e1; background: #f8fafc; }',
      '.report-instruction-note span { display: block; margin: 0 0 4px; color: #64748b; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; }',
      '.report-instruction-note p { margin: 0; color: #1f2937; line-height: 1.55; font-size: 0.92rem; }',
      '.report-instruction-note-high { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.06); }',
      '.report-instruction-note-medium { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.08); }',
      '.report-instruction-note-low { border-left-color: #64748b; background: rgba(100, 116, 139, 0.08); }',
      '.report-status-toggle { appearance: none; border: 1px solid transparent; border-radius: 999px; padding: 8px 12px; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.01em; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, color 180ms ease, border-color 180ms ease; }',
      '.report-status-toggle:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1); }',
      '.report-status-toggle:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.18); outline-offset: 2px; }',
      '.report-status-toggle-label { display: inline-block; line-height: 1; }',
      '.report-status-toggle-icon { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 999px; background: rgba(255, 255, 255, 0.58); font-size: 0.76rem; line-height: 1; transition: transform 180ms ease, background 180ms ease, opacity 180ms ease; opacity: 0.82; }',
      '.report-status-toggle:hover .report-status-toggle-icon { transform: translateY(1px) scale(1.04); opacity: 1; }',
      '.report-status-toggle-pending { background: rgba(71, 85, 105, 0.12); border-color: rgba(71, 85, 105, 0.2); color: #475569; }',
      '.report-status-toggle-done { background: rgba(22, 163, 74, 0.14); border-color: rgba(22, 163, 74, 0.24); color: #166534; }',
      '.report-instruction-item[data-report-status="done"] { border-color: rgba(22, 163, 74, 0.16); background: linear-gradient(180deg, #ffffff, #f6fff9); }',
      '.report-no-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 34px; padding: 0 10px; border-radius: 999px; font-size: 0.92rem; font-weight: 800; color: #ffffff; border: 2px solid rgba(255, 255, 255, 0.95); box-shadow: 0 8px 16px rgba(15, 23, 42, 0.14); }',
      '.report-no-badge-high { background: #ef4444; }',
      '.report-no-badge-medium { background: #f59e0b; }',
      '.report-no-badge-low { background: #64748b; }',
      '.platform-inline-group { display: inline-flex; align-items: center; gap: 7px; flex-wrap: nowrap; vertical-align: middle; }',
      '.platform-inline-plus { color: #64748b; font-size: 0.82rem; font-weight: 700; line-height: 1; }',
      '.platform-inline-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 999px; flex: 0 0 auto; }',
      '.platform-inline-svg { width: 12px; height: 12px; fill: currentColor; overflow: visible; }',
      '.platform-inline-icon-all { background: linear-gradient(180deg, #5fe172, #34c759); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.34); }',
      '.platform-inline-all-text { font-size: 0.52rem; font-weight: 800; letter-spacing: 0.08em; line-height: 1; }',
      '.platform-inline-icon-tiktok { background: radial-gradient(circle at 30% 20%, rgba(120,255,240,0.16), transparent 44%), linear-gradient(180deg, #132531, #0f172a 74%); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.16); }',
      '.platform-inline-icon-instagram { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 7%, #fd5949 34%, #d6249f 61%, #285aeb 100%); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.22); }',
      '.platform-inline-icon-youtube { background: linear-gradient(180deg, #ff4d67, #ff2d55); color: #ffffff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.22); }',
      '.platform-inline-icon-tiktok .tiktok-cyan { fill: #25f4ee; }',
      '.platform-inline-icon-tiktok .tiktok-red { fill: #fe2c55; }',
      '.platform-inline-icon-tiktok .tiktok-main { fill: #ffffff; }',
      '.report-platform-icons { min-width: 0; }',
      '.report-footer { margin-top: 10px; color: #64748b; font-size: 0.72rem; text-align: right; }',
      '@media print { body { background: #ffffff; } .report-body { padding: 0; } .report-topbar { display: none !important; } .report-header, .report-section, .report-summary-item, .report-meta-item { box-shadow: none; } .report-preview-nav { display: none !important; } }',
      '@media (max-width: 860px) { .report-overview { grid-template-columns: 1fr; } .report-section { padding: 18px; } .report-header { padding: 22px; } .report-header-inline { white-space: normal; } .report-header-meta-row { gap: 8px; } .report-preview-shell { padding: 14px; } .report-preview-nav { gap: 10px; } .report-preview-media { min-height: auto; } .report-preview-image { width: 100%; max-height: none; } .report-topbar { align-items: flex-start; flex-direction: column; } .report-actions { justify-content: space-between; flex-wrap: wrap; width: 100%; } .report-share-note { white-space: normal; text-align: left; } .report-instruction-header { align-items: flex-start; flex-direction: column; } }'
    ].join("");
  }

  function buildReportFileName(fileName, isHistoryReport) {
    var dateText = formatReportDateLabel(Date.now());
    var safeBaseName = sanitizeFileNamePart((fileName || "report").replace(/\.[^/.]+$/, ""));

    if (isHistoryReport) {
      return "lumina-zone-report-" + dateText;
    }

    return "lumina-zone-" + safeBaseName + "-" + dateText;
  }

  function sanitizeFileNamePart(value) {
    return String(value || "report")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "report";
  }

  function formatReportDateLabel(timestamp) {
    var date = new Date(timestamp);

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-");
  }

  function formatReportDateTime(timestamp) {
    var date = new Date(timestamp);

    return (
      date.getFullYear() + "年" +
      pad(date.getMonth() + 1) + "月" +
      pad(date.getDate()) + "日 " +
      pad(date.getHours()) + ":" +
      pad(date.getMinutes())
    );
  }

  function drawExportOverlay(ctx, width, height, platformSelection) {
    var platformKey = normalizePlatformKey(platformSelection || state.activePlatform || "all");
    var metrics = getEffectivePlatformSettings(platformKey);
    var highRisk = metrics.highRisk;
    var caution = metrics.caution;
    var highLeft = width * (percentToNumber(highRisk.left || "0%") / 100);
    var highTop = height * (percentToNumber(highRisk.top || "0%") / 100);
    var highRightWidth = width * (percentToNumber(highRisk.right || "0%") / 100);
    var highBottomHeight = height * (percentToNumber(highRisk.bottom || "0%") / 100);
    var highUpperRightWidth = width * (percentToNumber(highRisk.rightUpper || highRisk.right || "0%") / 100);
    var highStepY = height * (percentToNumber(highRisk.stepY || "48%") / 100);
    var cautionLeft = width * (percentToNumber(caution.left || "0%") / 100);
    var cautionTop = height * (percentToNumber(caution.top || "0%") / 100);
    var cautionRightWidth = width * (percentToNumber(caution.right || "0%") / 100);
    var cautionBottomHeight = height * (percentToNumber(caution.bottom || "0%") / 100);
    var cautionUpperRightWidth = width * (percentToNumber(caution.rightUpper || caution.right || "0%") / 100);
    var cautionStepY = height * (percentToNumber(caution.stepY || "48%") / 100);
    var safeTop = cautionTop;
    var safeLeft = cautionLeft;
    var safeRight = width - cautionRightWidth;
    var safeBottom = height - cautionBottomHeight;
    var lineWidth = Math.max(4, Math.round(width * 0.0038));

    ctx.save();
    if (metrics.areaModel === "blocks") {
      drawExportOverlayAreas(ctx, width, height, metrics.highRiskAreas || [], "rgba(226, 79, 79, 0.54)");
      drawExportOverlayAreas(ctx, width, height, metrics.cautionAreas || [], "rgba(77, 201, 255, 0.32)");
      ctx.restore();
      return;
    }

    ctx.fillStyle = "rgba(226, 79, 79, 0.54)";
    ctx.fillRect(0, 0, width, highTop);
    ctx.fillRect(0, highTop, highLeft, height - highTop - highBottomHeight);
    ctx.fillRect(width - highUpperRightWidth, highTop, highUpperRightWidth, Math.max(0, highStepY - highTop));
    ctx.fillRect(width - highRightWidth, highStepY, highRightWidth, Math.max(0, height - highStepY - highBottomHeight));
    ctx.fillRect(0, height - highBottomHeight, width, highBottomHeight);

    ctx.fillStyle = "rgba(255, 171, 72, 0.28)";
    ctx.fillRect(cautionLeft, highTop, Math.max(0, width - cautionLeft - cautionUpperRightWidth), Math.max(0, cautionTop - highTop));
    ctx.fillRect(highLeft, cautionTop, Math.max(0, cautionLeft - highLeft), Math.max(0, height - cautionTop - cautionBottomHeight));
    ctx.fillRect(width - cautionUpperRightWidth, cautionTop, Math.max(0, cautionUpperRightWidth - highUpperRightWidth), Math.max(0, cautionStepY - cautionTop));
    ctx.fillRect(width - cautionRightWidth, cautionStepY, Math.max(0, cautionRightWidth - highRightWidth), Math.max(0, height - cautionStepY - cautionBottomHeight));
    ctx.fillRect(cautionLeft, height - cautionBottomHeight, Math.max(0, width - cautionLeft - cautionRightWidth), Math.max(0, cautionBottomHeight - highBottomHeight));

    ctx.strokeStyle = "rgba(120, 240, 212, 0.92)";
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(safeLeft, safeTop, Math.max(0, width - cautionUpperRightWidth - safeLeft), Math.max(0, cautionStepY - safeTop));
    ctx.strokeRect(safeLeft, cautionStepY, Math.max(0, safeRight - safeLeft), Math.max(0, safeBottom - cautionStepY));

    ctx.restore();
  }

  function drawExportOverlayAreas(ctx, width, height, areas, fillStyle) {
    areas.forEach(function (area) {
      var left = area.left !== undefined
        ? width * (percentToNumber(area.left) / 100)
        : width - width * (percentToNumber(area.right || "0%") / 100) - width * (percentToNumber(area.width || "0%") / 100);
      var top = area.top !== undefined
        ? height * (percentToNumber(area.top) / 100)
        : height - height * (percentToNumber(area.bottom || "0%") / 100) - height * (percentToNumber(area.height || "0%") / 100);
      var areaWidth = width * (percentToNumber(area.width || "0%") / 100);
      var areaHeight = height * (percentToNumber(area.height || "0%") / 100);
      var radius = parseAreaRadius(area.radius, areaWidth, areaHeight);

      ctx.fillStyle = fillStyle;
      drawRoundedRect(ctx, left, top, areaWidth, areaHeight, radius);
      ctx.fill();
    });
  }

  function parseAreaRadius(radiusValue, width, height) {
    if (!radiusValue) {
      return 0;
    }

    if (radiusValue.indexOf("%") !== -1) {
      return Math.min(width, height) * (percentToNumber(radiusValue) / 100);
    }

    return parseFloat(radiusValue) || 0;
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    var safeRadius = Math.max(0, Math.min(radius || 0, width / 2, height / 2));

    ctx.beginPath();
    if (!safeRadius) {
      ctx.rect(x, y, width, height);
      return;
    }

    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
  }

  function drawExportFlags(ctx, flags, width, height, activeFlagId) {
    flags.forEach(function (flag, index) {
      var x = flag.x * width;
      var y = flag.y * height;
      var badgeRadius = Math.max(86, Math.min(118, Math.round(width * 0.092)));
      var outerRadius = badgeRadius + 10;
      var badgeColor = flag.reportSeverityColor || "#64748b";
      var label = String(flag.reportNo || (index + 1));
      var isActive = activeFlagId && flag.id === activeFlagId;
      var fontSize = label.length > 1 ? badgeRadius * 1.04 : badgeRadius * 1.18;

      ctx.save();
      ctx.shadowColor = isActive ? "rgba(79, 70, 229, 0.28)" : "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = isActive ? 28 : 20;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.beginPath();
      ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(x, y, badgeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
      ctx.beginPath();
      ctx.arc(x, y, badgeRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 " + Math.round(fontSize) + 'px "SF Pro Display", "Hiragino Sans", "Yu Gothic", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 1);
      ctx.restore();
    });
  }

  function buildMediaKey(file) {
    return [file.name, file.size, file.lastModified].join("__");
  }

  function syncUserAndRefreshHistory() {
    if (!window.luminaDb || typeof window.luminaDb.syncCurrentUserProfile !== "function") {
      return;
    }

    return window.luminaDb.syncCurrentUserProfile()
      .then(function (profile) {
        applyAccountProfile(profile || (window.luminaDb.getCurrentProfile ? window.luminaDb.getCurrentProfile() : null));
        return refreshPdfUsageCount();
      })
      .then(function () {
        return refreshRemoteHistory();
      })
      .catch(function (error) {
        console.warn("Failed to sync app user", error);
        updatePlanMeter();
      });
  }

  function maybeLoadRemoteProjectSnapshot(mediaKey) {
    if (!mediaKey || !window.luminaDb || typeof window.luminaDb.loadProjectSnapshot !== "function") {
      return;
    }

    if (state.flags.length) {
      return;
    }

    window.luminaDb.loadProjectSnapshot(mediaKey)
      .then(function (entry) {
        if (!entry || state.mediaKey !== mediaKey || state.flags.length) {
          return;
        }

        state.currentProjectId = entry.projectId || "";
        state.flags = entry.flags.slice();
        state.pdfNeedsAttention = state.flags.length > 0;
        renderFlags();
        renderCommentEditor();
        syncTimeline();

        if (state.isHistoryOpen) {
          renderHistoryList();
        }

        if (entry.flags.length) {
          showToast("過去のチェック履歴を読み込みました。", "info");
        }
      })
      .catch(function (error) {
        console.warn("Failed to load remote project snapshot", error);
      });
  }

  function refreshRemoteHistory() {
    if (!window.luminaDb || typeof window.luminaDb.loadHistoryEntries !== "function") {
      return Promise.resolve([]);
    }

    return window.luminaDb.loadHistoryEntries()
      .then(function (entries) {
        state.remoteHistoryEntries = Array.isArray(entries) ? entries : [];
        state.remoteHistoryLoaded = true;
        updatePdfButtons();
        updateHistoryAwareness();
        if (state.isHistoryOpen) {
          renderHistoryList();
        }
        return state.remoteHistoryEntries;
      })
      .catch(function (error) {
        console.warn("Failed to load remote history entries", error);
        updatePdfButtons();
        updateHistoryAwareness();
        return [];
      });
  }

  function buildProjectSnapshotPayload() {
    return {
      mediaKey: state.mediaKey,
      fileName: state.fileName || "未命名素材",
      fileSizeBytes: state.fileSize || 0,
      durationText: els.metaDuration.textContent || "00:00",
      resolutionText: els.metaResolution.textContent || "-- × --",
      flags: state.flags.map(function (flag) {
        return {
          id: flag.id,
          time: getFlagStartTime(flag),
          zone: flag.zone,
          x: flag.x,
          y: flag.y,
          platform: normalizePlatformKey(flag.platform),
          category: normalizeCommentCategory(flag.category || ""),
          templateText: flag.templateText || "",
          customNote: flag.customNote || "",
          finalNote: getFlagFinalNote(flag),
          comment: getFlagFinalNote(flag)
        };
      })
    };
  }

  function persistProjectSnapshotToDb() {
    if (!window.luminaDb || typeof window.luminaDb.saveProjectSnapshot !== "function") {
      return;
    }

    window.luminaDb.saveProjectSnapshot(buildProjectSnapshotPayload())
      .then(function (result) {
        state.currentProjectId = result && result.projectId ? result.projectId : "";
        refreshRemoteHistory();
      })
      .catch(function (error) {
        console.warn("Failed to persist project snapshot", error);
      });
  }

  function recordPdfExportToDb(payload) {
    if (!window.luminaDb || typeof window.luminaDb.recordPdfExport !== "function") {
      return Promise.resolve(false);
    }

    return window.luminaDb.recordPdfExport({
      projectId: state.currentProjectId || null,
      reportType: payload.reportType,
      exportFileName: payload.exportFileName,
      markerCount: payload.markerCount,
      projectCount: payload.projectCount,
      meta: payload.meta || {}
    }).then(function (result) {
      return refreshPdfUsageCount().then(function () {
        return result;
      });
    }).catch(function (error) {
      console.warn("Failed to record pdf export", error);
      return false;
    });
  }

  function jumpToTime(seconds, pauseVideo) {
    if (!hasMediaLoaded()) {
      return;
    }

    if (state.mediaType !== "video") {
      syncTimeline();
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

  function resetPreviewMediaElement() {
    els.video.pause();
    els.video.removeAttribute("src");
    els.video.load();
    els.previewImage.removeAttribute("src");
  }

  function hasMediaLoaded() {
    return !!state.objectUrl && !!state.mediaLoaded;
  }

  function requestStageFit() {
    window.requestAnimationFrame(fitStageSurface);
  }

  function initStageResizeObserver() {
    if (!window.ResizeObserver) {
      return;
    }

    stageResizeObserver = new ResizeObserver(function () {
      requestStageFit();
    });

    [els.previewColumn, els.viewerDock, els.stageFrame].forEach(function (element) {
      if (element) {
        stageResizeObserver.observe(element);
      }
    });
  }

  function fitStageSurface() {
    fitSingleStage(els.stageFrame, els.stageSurface, state.stageRatio || DEFAULT_RATIO);

    if (state.isOnboardingOpen) {
      renderOnboardingStep();
    }
  }

  function fitSingleStage(frameEl, surfaceEl, ratio) {
    var availableWidth = 0;
    var availableHeight = 0;
    var width = 0;
    var height = 0;
    var columnHeight = 0;
    var headingHeight = 0;
    var dockHeight = 0;
    var columnAvailableHeight = 0;
    var frameHeight = 0;
    var stageChromeReserve = 26;

    if (!frameEl || !surfaceEl) {
      return;
    }

    availableWidth = Math.max(frameEl.clientWidth, 240);
    frameHeight = frameEl.clientHeight;
    availableHeight = frameHeight;
    columnHeight = els.previewColumn ? els.previewColumn.clientHeight : 0;
    dockHeight = els.viewerDock ? els.viewerDock.offsetHeight : 0;
    headingHeight = frameEl.previousElementSibling ? frameEl.previousElementSibling.offsetHeight : 0;

    if (columnHeight > 0) {
      columnAvailableHeight = columnHeight - dockHeight - headingHeight - stageChromeReserve;
    }

    if (frameHeight > 0 && columnAvailableHeight > 0) {
      availableHeight = Math.min(frameHeight, columnAvailableHeight);
    } else if (columnAvailableHeight > 0) {
      availableHeight = columnAvailableHeight;
    } else if (frameHeight > 0) {
      availableHeight = frameHeight;
    }

    availableHeight = Math.max(availableHeight - 2, 280);
    width = Math.min(availableWidth, availableHeight * ratio);
    height = width / ratio;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * ratio;
    }

    surfaceEl.style.width = Math.floor(width) + "px";
    surfaceEl.style.height = Math.floor(height) + "px";
  }

  function looksLikeVideo(file) {
    if (file.type && file.type.indexOf("video/") === 0) {
      return true;
    }

    return /\.(mp4|mov|m4v|webm|ogv)$/i.test(file.name);
  }

  function looksLikeImage(file) {
    if (file.type && file.type.indexOf("image/") === 0) {
      return true;
    }

    return /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)$/i.test(file.name);
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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

  function getPlatformProfileSettings(platformSelection, profileKey) {
    var platformKeys = getPlatformKeys(platformSelection);
    var normalizedProfileKey = DISPLAY_PROFILES[profileKey] ? profileKey : "standard";

    if (platformKeys.length === PLATFORM_ORDER.length) {
      return platforms.all[normalizedProfileKey];
    }

    if (platformKeys.length === 1 && platforms[platformKeys[0]] && platforms[platformKeys[0]][normalizedProfileKey]) {
      return platforms[platformKeys[0]][normalizedProfileKey];
    }

    return buildCompositeProfileSettings(platformKeys, normalizedProfileKey, platforms);
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

  function getPlatformInlineIconMarkup(key) {
    if (key === "tiktok") {
      return (
        '<span class="platform-inline-icon platform-inline-icon-tiktok" aria-hidden="true">' +
          '<svg class="platform-inline-svg" viewBox="0 0 24 24">' +
            '<path class="tiktok-shadow tiktok-cyan" d="M13.8 3.8c.4 1.6 1.4 2.8 2.9 3.6 1 .5 1.8.7 2.4.7v2.5c-.8 0-1.9-.2-3.2-.8-.6-.3-1.3-.7-1.9-1.3v7c0 3.1-2.4 5.5-5.5 5.5s-5.4-2.4-5.4-5.5 2.4-5.5 5.4-5.5c.4 0 .8 0 1.2.1v2.6a4 4 0 0 0-1.2-.2c-1.6 0-2.8 1.2-2.8 2.9 0 1.6 1.2 2.8 2.8 2.8 1.6 0 2.9-1.2 2.9-2.8V3.8h2.4Z"></path>' +
            '<path class="tiktok-shadow tiktok-red" d="M14.9 3c.4 1.5 1.5 2.8 3 3.6 1 .5 1.9.7 2.5.7v2.7c-.8 0-2-.2-3.4-.9-.7-.3-1.4-.8-2-1.4v7.2c0 3.1-2.5 5.6-5.6 5.6S3.8 18 3.8 14.9s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.6Z"></path>' +
            '<path class="tiktok-main" d="M14.4 3.3c.4 1.6 1.5 2.9 3 3.7 1 .5 1.9.7 2.4.7v2.6c-.8 0-2-.2-3.3-.9-.7-.3-1.4-.8-2-1.4v7.1c0 3.1-2.5 5.6-5.6 5.6S3.5 18.2 3.5 15.1s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.2-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3S7.5 18 9.1 18s2.9-1.3 2.9-2.9V3.3h2.4Z"></path>' +
          "</svg>" +
        "</span>"
      );
    }

    if (key === "reels") {
      return (
        '<span class="platform-inline-icon platform-inline-icon-instagram" aria-hidden="true">' +
          '<svg class="platform-inline-svg" viewBox="0 0 24 24">' +
            '<path d="M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3Zm0 2.2a2 2 0 0 0-2 2v9.6a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V7.2a2 2 0 0 0-2-2H7.2Zm4.8 2.3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2.2A2.3 2.3 0 1 0 14.3 12 2.3 2.3 0 0 0 12 9.7Zm4.7-3.4a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z"></path>' +
          "</svg>" +
        "</span>"
      );
    }

    if (key === "shorts") {
      return (
        '<span class="platform-inline-icon platform-inline-icon-youtube" aria-hidden="true">' +
          '<svg class="platform-inline-svg" viewBox="0 0 24 24">' +
            '<path d="M20.4 7.2c-.2-.9-.9-1.6-1.8-1.8C17 5 12 5 12 5s-5 0-6.6.4c-.9.2-1.6.9-1.8 1.8C3.2 8.8 3.2 12 3.2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 6.6.4 6.6.4s5 0 6.6-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10.2 15.4V8.6L15.9 12l-5.7 3.4Z"></path>' +
          "</svg>" +
        "</span>"
      );
    }

    return (
      '<span class="platform-inline-icon platform-inline-icon-all" aria-hidden="true">' +
        '<span class="platform-inline-all-text">ALL</span>' +
      "</span>"
    );
  }

  function getPlatformInlineMarkup(platformSelection, className) {
    var platformKey = normalizePlatformKey(platformSelection || "all");
    var platformKeys = getPlatformKeys(platformKey);
    var markup = [];
    var classes = "platform-inline-group" + (className ? " " + className : "");

    if (platformKey === "all" || platformKeys.length === PLATFORM_ORDER.length) {
      markup.push(getPlatformInlineIconMarkup("all"));
    } else {
      platformKeys.forEach(function (key, index) {
        if (index > 0) {
          markup.push('<span class="platform-inline-plus" aria-hidden="true">+</span>');
        }
        markup.push(getPlatformInlineIconMarkup(key));
      });
    }

    return (
      '<span class="' + classes + '" aria-label="' + escapeHtml(getPlatformMeta(platformKey).label) + '">' +
        markup.join("") +
      "</span>"
    );
  }

  function getPlatformIconMarkup(key, meta) {
    if (key === "tiktok") {
      return (
        '<span class="platform-token-icon platform-token-icon-brand platform-token-icon-tiktok">' +
        '<svg class="platform-token-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path class="tiktok-shadow tiktok-cyan" d="M13.8 3.8c.4 1.6 1.4 2.8 2.9 3.6 1 .5 1.8.7 2.4.7v2.5c-.8 0-1.9-.2-3.2-.8-.6-.3-1.3-.7-1.9-1.3v7c0 3.1-2.4 5.5-5.5 5.5s-5.4-2.4-5.4-5.5 2.4-5.5 5.4-5.5c.4 0 .8 0 1.2.1v2.6a4 4 0 0 0-1.2-.2c-1.6 0-2.8 1.2-2.8 2.9 0 1.6 1.2 2.8 2.8 2.8 1.6 0 2.9-1.2 2.9-2.8V3.8h2.4Z"></path>' +
        '<path class="tiktok-shadow tiktok-red" d="M14.9 3c.4 1.5 1.5 2.8 3 3.6 1 .5 1.9.7 2.5.7v2.7c-.8 0-2-.2-3.4-.9-.7-.3-1.4-.8-2-1.4v7.2c0 3.1-2.5 5.6-5.6 5.6S3.8 18 3.8 14.9s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V3h2.6Z"></path>' +
        '<path class="tiktok-main" d="M14.4 3.3c.4 1.6 1.5 2.9 3 3.7 1 .5 1.9.7 2.4.7v2.6c-.8 0-2-.2-3.3-.9-.7-.3-1.4-.8-2-1.4v7.1c0 3.1-2.5 5.6-5.6 5.6S3.5 18.2 3.5 15.1s2.5-5.6 5.6-5.6c.4 0 .8 0 1.2.1v2.7c-.4-.2-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3S7.5 18 9.1 18s2.9-1.3 2.9-2.9V3.3h2.4Z"></path>' +
        "</svg>" +
        "</span>"
      );
    }

    if (key === "reels") {
      return (
        '<span class="platform-token-icon platform-token-icon-brand platform-token-icon-instagram">' +
        '<svg class="platform-token-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M7.2 3h9.6A4.2 4.2 0 0 1 21 7.2v9.6a4.2 4.2 0 0 1-4.2 4.2H7.2A4.2 4.2 0 0 1 3 16.8V7.2A4.2 4.2 0 0 1 7.2 3Zm0 2.2a2 2 0 0 0-2 2v9.6a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V7.2a2 2 0 0 0-2-2H7.2Zm4.8 2.3A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2.2A2.3 2.3 0 1 0 14.3 12 2.3 2.3 0 0 0 12 9.7Zm4.7-3.4a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z"></path>' +
        "</svg>" +
        "</span>"
      );
    }

    if (key === "shorts") {
      return (
        '<span class="platform-token-icon platform-token-icon-brand platform-token-icon-youtube">' +
        '<svg class="platform-token-svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M20.4 7.2c-.2-.9-.9-1.6-1.8-1.8C17 5 12 5 12 5s-5 0-6.6.4c-.9.2-1.6.9-1.8 1.8C3.2 8.8 3.2 12 3.2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 6.6.4 6.6.4s5 0 6.6-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10.2 15.4V8.6L15.9 12l-5.7 3.4Z"></path>' +
        "</svg>" +
        "</span>"
      );
    }

    if (key === "all") {
      return (
        '<span class="platform-token-icon platform-token-icon-brand platform-token-icon-all">' +
        '<span class="platform-token-icon-all-text">ALL</span>' +
        "</span>"
      );
    }

    return (
      '<span class="platform-token-icon platform-token-icon-grid">' +
      '<svg class="platform-token-svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="4" y="4" width="6" height="6" rx="1.6" fill="' + meta.accent + '"></rect>' +
      '<rect x="14" y="4" width="6" height="6" rx="1.6" fill="' + meta.accentSecondary + '"></rect>' +
      '<rect x="4" y="14" width="6" height="6" rx="1.6" fill="' + meta.accentSecondary + '"></rect>' +
      '<rect x="14" y="14" width="6" height="6" rx="1.6" fill="' + meta.accent + '"></rect>' +
      "</svg>" +
      "</span>"
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
