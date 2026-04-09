(function () {
  "use strict";

  var POLL_INTERVAL_MS = 2500;
  var MAX_WAIT_MS = 45000;
  var pollTimer = 0;
  var pollStarted = false;
  var startedAt = 0;
  var els = {};

  function normalizePlanValue(plan) {
    var value = String(plan || "free").toLowerCase();

    if (value === "pro" || value === "team" || value === "beta_pro") {
      return "pro";
    }

    return "free";
  }

  function cacheElements() {
    els.status = document.getElementById("billingSuccessStatus");
    els.title = document.getElementById("billingSuccessTitle");
    els.message = document.getElementById("billingSuccessMessage");
    els.appLink = document.getElementById("billingSuccessAppLink");
    els.loginLink = document.getElementById("billingSuccessLoginLink");
  }

  function setStatus(kind, title, message) {
    if (!els.status || !els.title || !els.message) {
      return;
    }

    els.status.classList.remove("billing-success-status-loading", "billing-success-status-ready", "billing-success-status-warning");
    els.status.classList.add(kind);
    els.title.textContent = title;
    els.message.textContent = message;
  }

  function stopPolling() {
    if (pollTimer) {
      window.clearTimeout(pollTimer);
      pollTimer = 0;
    }
  }

  function redirectToAppSoon() {
    window.setTimeout(function () {
      window.location.replace("./app.html");
    }, 900);
  }

  function isProfilePro(profile) {
    return !!(profile && (profile.beta_unlocked || normalizePlanValue(profile.plan) === "pro"));
  }

  function scheduleNextPoll() {
    stopPolling();
    pollTimer = window.setTimeout(runPoll, POLL_INTERVAL_MS);
  }

  function runPoll() {
    if (!window.luminaDb || typeof window.luminaDb.syncCurrentUserProfile !== "function") {
      setStatus("billing-success-status-warning", "反映状況を確認できません。", "ページを再読み込みして、もう一度お試しください。");
      return;
    }

    window.luminaDb.syncCurrentUserProfile()
      .then(function (profile) {
        var currentProfile = profile || (window.luminaDb.getCurrentProfile ? window.luminaDb.getCurrentProfile() : null);

        if (isProfilePro(currentProfile)) {
          setStatus("billing-success-status-ready", "PROの反映が完了しました。", "このままアプリへ進めます。");
          stopPolling();
          redirectToAppSoon();
          return;
        }

        if (Date.now() - startedAt >= MAX_WAIT_MS) {
          setStatus("billing-success-status-warning", "まだ反映待ちです。", "数分たっても切り替わらない場合は、アプリを開き直してください。");
          return;
        }

        scheduleNextPoll();
      })
      .catch(function () {
        if (Date.now() - startedAt >= MAX_WAIT_MS) {
          setStatus("billing-success-status-warning", "確認に時間がかかっています。", "ページを再読み込みするか、アプリを開き直してください。");
          return;
        }

        scheduleNextPoll();
      });
  }

  function startPolling() {
    if (pollStarted) {
      return;
    }

    pollStarted = true;
    startedAt = Date.now();
    setStatus("billing-success-status-loading", "決済内容を確認しています。", "通常は数秒で反映されます。そのままお待ちください。");
    runPoll();
  }

  function handleAuthState(authState) {
    if (!authState || !authState.ready) {
      return;
    }

    if (!authState.isAuthenticated) {
      stopPolling();
      setStatus("billing-success-status-warning", "Googleログインが必要です。", "ログイン後に自動でPROの反映を確認します。");
      if (els.loginLink) {
        els.loginLink.hidden = false;
      }
      return;
    }

    if (els.loginLink) {
      els.loginLink.hidden = true;
    }

    startPolling();
  }

  function init() {
    cacheElements();

    if (!window.luminaAuth || typeof window.luminaAuth.onChange !== "function") {
      setStatus("billing-success-status-warning", "ログイン状態を確認できません。", "ページを再読み込みして、もう一度お試しください。");
      return;
    }

    window.luminaAuth.onChange(handleAuthState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
