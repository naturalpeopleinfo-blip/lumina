(function () {
  "use strict";

  var config = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};
  var authConfig = config.auth || {};

  function setStatus(message, isError) {
    var root = document.getElementById("clerkCallbackStatus");
    if (!root) {
      return;
    }

    root.innerHTML =
      (isError ? "" : '<div class="clerk-callback-spinner" aria-hidden="true"></div>') +
      '<p class="auth-copy' + (isError ? ' clerk-callback-error' : '') + '">' + message + "</p>";
  }

  function getRedirectTo() {
    if (authConfig.redirectTo) {
      return authConfig.redirectTo;
    }

    return window.location.origin + "/app.html";
  }

  function loadClerkScript() {
    if (window.Clerk) {
      return Promise.resolve(window.Clerk);
    }

    if (!authConfig.clerkPublishableKey || !authConfig.clerkFrontendApiUrl) {
      return Promise.resolve(null);
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.clerkPublishableKey = authConfig.clerkPublishableKey;
      script.src = authConfig.clerkFrontendApiUrl.replace(/\/$/, "") + "/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
      script.onload = function () {
        resolve(window.Clerk || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function init() {
    loadClerkScript()
      .then(function (clerk) {
        if (!clerk) {
          throw new Error("Clerk is not available.");
        }

        return clerk.load().then(function () {
          if (typeof clerk.handleRedirectCallback !== "function") {
            throw new Error("Clerk redirect callback is not available.");
          }

          return clerk.handleRedirectCallback({
            signInUrl: window.location.origin + "/login.html",
            signUpUrl: window.location.origin + "/login.html",
            signInForceRedirectUrl: getRedirectTo(),
            signUpForceRedirectUrl: getRedirectTo(),
            signInFallbackRedirectUrl: getRedirectTo(),
            signUpFallbackRedirectUrl: getRedirectTo()
          });
        });
      })
      .catch(function (error) {
        console.error("Failed to complete Clerk callback", error);
        setStatus("ログインの完了に失敗しました。もう一度お試しください。", true);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
