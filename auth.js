(function () {
  "use strict";

  var config = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};
  var authConfig = config.auth || {};
  var subscribers = [];
  var clerkLoaded = false;
  var appRedirectStarted = false;
  var state = {
    ready: false,
    enabled: false,
    user: null
  };

  function track(eventName, properties) {
    if (typeof window.luminaTrack !== "function") {
      return;
    }

    window.luminaTrack(eventName, properties || {});
  }

  function getAuthSource() {
    if (document.body && document.body.dataset && document.body.dataset.authSource) {
      return document.body.dataset.authSource;
    }

    if (window.location && /login\.html$/.test(window.location.pathname)) {
      return "login";
    }

    return "app";
  }

  function getRedirectTo() {
    if (authConfig.redirectTo) {
      return authConfig.redirectTo;
    }

    if (!window.location || !window.location.origin) {
      return "";
    }

    return window.location.origin + "/app.html";
  }

  function getUserName(user) {
    if (!user) {
      return "";
    }

    if (user.fullName) {
      return user.fullName;
    }

    if (user.firstName || user.lastName) {
      return [user.firstName || "", user.lastName || ""].join(" ").trim();
    }

    return getUserEmail(user) || "Lumina User";
  }

  function getUserEmail(user) {
    if (!user) {
      return "";
    }

    if (user.primaryEmailAddress && user.primaryEmailAddress.emailAddress) {
      return user.primaryEmailAddress.emailAddress;
    }

    if (Array.isArray(user.emailAddresses) && user.emailAddresses[0] && user.emailAddresses[0].emailAddress) {
      return user.emailAddresses[0].emailAddress;
    }

    return "";
  }

  function getUserAvatarUrl(user) {
    if (!user) {
      return "";
    }

    return user.imageUrl || "";
  }

  function getInitials(user) {
    var name = getUserName(user).trim();

    if (!name) {
      return "L";
    }

    return name.slice(0, 1).toUpperCase();
  }

  function getState() {
    return {
      ready: state.ready,
      enabled: state.enabled,
      isAuthenticated: !!state.user,
      user: state.user
        ? {
            id: state.user.id,
            email: getUserEmail(state.user),
            name: getUserName(state.user),
            avatarUrl: getUserAvatarUrl(state.user)
          }
        : null
    };
  }

  function notify() {
    var snapshot = getState();

    subscribers.forEach(function (callback) {
      try {
        callback(snapshot);
      } catch (error) {
        console.warn("Lumina auth subscriber failed", error);
      }
    });

    window.dispatchEvent(new CustomEvent("lumina-auth-change", { detail: snapshot }));
  }

  function syncAnalyticsIdentity() {
    if (!window.posthog) {
      return;
    }

    if (!state.user) {
      if (typeof window.posthog.reset === "function") {
        window.posthog.reset();
      }
      return;
    }

    if (typeof window.posthog.identify !== "function") {
      return;
    }

    try {
      window.posthog.identify(state.user.id, {
        email: getUserEmail(state.user),
        name: getUserName(state.user)
      });
    } catch (error) {
      console.warn("Failed to identify auth user in PostHog", error);
    }
  }

  function setUser(user) {
    state.user = user || null;
    state.ready = true;
    renderAuthPanel();
    maybeRequireAppLogin();
    syncAnalyticsIdentity();
    notify();
  }

  function maybeRequireAppLogin() {
    if (appRedirectStarted) {
      return;
    }

    if (getAuthSource() !== "app") {
      return;
    }

    if (!state.ready || !state.enabled || state.user) {
      return;
    }

    if (!window.location || window.location.protocol === "file:") {
      return;
    }

    appRedirectStarted = true;
    window.location.replace("./login.html");
  }

  function renderAuthPanel() {
    var loadingState = document.getElementById("authLoadingState");
    var loggedOutState = document.getElementById("authLoggedOutState");
    var loggedInState = document.getElementById("authLoggedInState");
    var userName = document.getElementById("authUserName");
    var userEmail = document.getElementById("authUserEmail");
    var avatar = document.getElementById("authAvatar");
    var signInButton = document.getElementById("googleSignInButton");
    var signInButtonLabel = signInButton ? signInButton.querySelector(".google-signin-button-label") : null;

    if (!loadingState || !loggedOutState || !loggedInState) {
      renderAppAccountCard();
      return;
    }

    loadingState.hidden = state.ready;
    loggedOutState.hidden = !state.ready || !!state.user;
    loggedInState.hidden = !state.ready || !state.user;

    if (signInButton) {
      signInButton.disabled = !state.enabled;
      if (signInButtonLabel) {
        signInButtonLabel.textContent = state.enabled ? "Googleでログイン" : "Googleログイン準備中";
      } else {
        signInButton.textContent = state.enabled ? "Googleでログイン" : "Googleログイン準備中";
      }
    }

    if (!state.user) {
      if (!state.enabled) {
        loadingState.hidden = false;
        loadingState.querySelector(".auth-copy").textContent = "Googleログイン設定を確認中です。";
      }
      renderAppAccountCard();
      return;
    }

    if (userName) {
      userName.textContent = getUserName(state.user);
    }

    if (userEmail) {
      userEmail.textContent = getUserEmail(state.user);
    }

    if (avatar) {
      var avatarUrl = getUserAvatarUrl(state.user);

      if (avatarUrl) {
        avatar.innerHTML = '<img src="' + avatarUrl + '" alt="">';
      } else {
        avatar.textContent = getInitials(state.user);
      }
    }

    renderAppAccountCard();
  }

  function renderAppAccountCard() {
    var loggedOutState = document.getElementById("appAuthLoggedOut");
    var loggedInState = document.getElementById("appAuthLoggedIn");
    var status = document.getElementById("appAuthStatus");
    var userName = document.getElementById("appAuthUserName");
    var userEmail = document.getElementById("appAuthUserEmail");
    var avatar = document.getElementById("appAuthAvatar");
    var signOutButton = document.getElementById("appSignOutButton");

    if (!loggedOutState || !loggedInState) {
      return;
    }

    loggedOutState.hidden = !!state.user;
    loggedInState.hidden = !state.user;

    if (!state.user) {
      if (status) {
        status.textContent = state.enabled ? "未ログイン" : "確認中";
        status.classList.add("is-empty");
      }
      if (signOutButton) {
        signOutButton.disabled = true;
      }
      maybeRequireAppLogin();
      return;
    }

    if (status) {
      status.textContent = "ログイン中";
      status.classList.remove("is-empty");
    }

    if (userName) {
      userName.textContent = getUserName(state.user);
    }

    if (userEmail) {
      userEmail.textContent = getUserEmail(state.user);
    }

    if (avatar) {
      var avatarUrl = getUserAvatarUrl(state.user);

      if (avatarUrl) {
        avatar.innerHTML = '<img src="' + avatarUrl + '" alt="">';
      } else {
        avatar.textContent = getInitials(state.user);
      }
    }

    if (signOutButton) {
      signOutButton.disabled = false;
    }
  }

  function loadClerkScript() {
    if (window.Clerk) {
      return Promise.resolve(window.Clerk);
    }

    if (!authConfig.clerkPublishableKey || !authConfig.clerkFrontendApiUrl) {
      return Promise.resolve(null);
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[data-lumina-clerk]");

      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Clerk || null);
        }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.luminaClerk = "true";
      script.dataset.clerkPublishableKey = authConfig.clerkPublishableKey;
      script.src = authConfig.clerkFrontendApiUrl.replace(/\/$/, "") + "/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
      script.onload = function () {
        resolve(window.Clerk || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function bindClerkListener() {
    if (!window.Clerk || typeof window.Clerk.addListener !== "function") {
      return;
    }

    window.Clerk.addListener(function (resources) {
      var nextUser = resources && resources.user ? resources.user : window.Clerk.user;
      setUser(nextUser || null);
    });
  }

  function signInWithGoogle() {
    if (!window.Clerk) {
      return Promise.resolve();
    }

    var redirectTo = getRedirectTo();

    var signInResource =
      (window.Clerk.signIn && typeof window.Clerk.signIn.authenticateWithRedirect === "function"
        ? window.Clerk.signIn
        : null) ||
      (window.Clerk.client &&
      window.Clerk.client.signIn &&
      typeof window.Clerk.client.signIn.authenticateWithRedirect === "function"
        ? window.Clerk.client.signIn
        : null);

    if (!signInResource) {
      return Promise.resolve();
    }

    track("auth_google_click", { source: getAuthSource(), provider: "clerk" });

    return signInResource.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: window.location.origin + "/clerk-callback.html",
      redirectUrlComplete: redirectTo,
      signInForceRedirectUrl: redirectTo,
      signInFallbackRedirectUrl: redirectTo,
      signUpForceRedirectUrl: redirectTo,
      signUpFallbackRedirectUrl: redirectTo
    });
  }

  function signOut() {
    if (!window.Clerk || typeof window.Clerk.signOut !== "function") {
      return Promise.resolve();
    }

    track("auth_sign_out", { source: getAuthSource() });

    return window.Clerk.signOut().then(function () {
      setUser(null);
    });
  }

  function getToken() {
    if (!window.Clerk || !window.Clerk.session || typeof window.Clerk.session.getToken !== "function") {
      return Promise.resolve(null);
    }

    return window.Clerk.session.getToken().catch(function (error) {
      console.warn("Failed to fetch Clerk session token", error);
      return null;
    });
  }

  function bindDomEvents() {
    var signInButton = document.getElementById("googleSignInButton");
    var signOutButton = document.getElementById("authSignOutButton");
    var appSignOutButton = document.getElementById("appSignOutButton");

    if (signInButton) {
      signInButton.addEventListener("click", function () {
        signInWithGoogle().catch(function (error) {
          console.error("Failed to start Clerk Google sign-in", error);
        });
      });
    }

    if (signOutButton) {
      signOutButton.addEventListener("click", function () {
        signOut().catch(function (error) {
          console.error("Failed to sign out from Clerk", error);
        });
      });
    }

    if (appSignOutButton) {
      appSignOutButton.addEventListener("click", function () {
        signOut().catch(function (error) {
          console.error("Failed to sign out from Clerk", error);
        });
      });
    }
  }

  function initAuth() {
    if (!authConfig.clerkPublishableKey || !authConfig.clerkFrontendApiUrl) {
      state.ready = true;
      state.enabled = false;
      renderAuthPanel();
      notify();
      return;
    }

    loadClerkScript()
      .then(function (clerk) {
        if (!clerk) {
          state.ready = true;
          state.enabled = false;
          renderAuthPanel();
          notify();
          return null;
        }

        if (!clerkLoaded) {
          clerkLoaded = true;
          return clerk.load().then(function () {
            state.enabled = true;
            bindClerkListener();
            setUser(clerk.user || null);
            return clerk;
          });
        }

        state.enabled = true;
        bindClerkListener();
        setUser(clerk.user || null);
        return clerk;
      })
      .catch(function (error) {
        console.error("Failed to initialize Clerk auth", error);
        state.ready = true;
        state.enabled = false;
        renderAuthPanel();
        notify();
      });
  }

  function onChange(callback) {
    if (typeof callback !== "function") {
      return function () {};
    }

    subscribers.push(callback);
    callback(getState());

    return function () {
      subscribers = subscribers.filter(function (item) {
        return item !== callback;
      });
    };
  }

  window.luminaAuth = {
    onChange: onChange,
    getState: getState,
    getToken: getToken,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindDomEvents();
      initAuth();
    });
  } else {
    bindDomEvents();
    initAuth();
  }
})();
