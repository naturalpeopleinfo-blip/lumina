(function () {
  "use strict";

  var config = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};
  var authConfig = config.auth || {};
  var supabaseClient = null;
  var subscribers = [];
  var state = {
    ready: false,
    enabled: false,
    session: null,
    user: null
  };

  function getAuthSource() {
    if (document.body && document.body.dataset && document.body.dataset.authSource) {
      return document.body.dataset.authSource;
    }

    if (window.location && /login\.html$/.test(window.location.pathname)) {
      return "login";
    }

    return "app";
  }

  function track(eventName, properties) {
    if (typeof window.luminaTrack !== "function") {
      return;
    }

    window.luminaTrack(eventName, properties || {});
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

  function getState() {
    return {
      ready: state.ready,
      enabled: state.enabled,
      isAuthenticated: !!state.user,
      user: state.user
        ? {
            id: state.user.id,
            email: state.user.email || "",
            name: getUserName(state.user),
            avatarUrl: getUserAvatarUrl(state.user)
          }
        : null
    };
  }

  function getUserName(user) {
    if (!user) {
      return "";
    }

    var meta = user.user_metadata || {};
    return meta.full_name || meta.name || user.email || "Lumina User";
  }

  function getUserAvatarUrl(user) {
    if (!user) {
      return "";
    }

    var meta = user.user_metadata || {};
    return meta.avatar_url || meta.picture || "";
  }

  function getInitials(user) {
    var name = getUserName(user).trim();

    if (!name) {
      return "L";
    }

    return name.slice(0, 1).toUpperCase();
  }

  function setSession(session) {
    state.session = session || null;
    state.user = session && session.user ? session.user : null;
    state.ready = true;
    renderAuthPanel();
    cleanupOAuthParams();
    syncProfile();
    syncAnalyticsIdentity();
    notify();
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
        email: state.user.email || "",
        name: getUserName(state.user)
      });
    } catch (error) {
      console.warn("Failed to identify auth user in PostHog", error);
    }
  }

  function syncProfile() {
    if (!supabaseClient || !state.user) {
      return Promise.resolve();
    }

    return supabaseClient
      .from("profiles")
      .upsert(
        {
          id: state.user.id,
          email: state.user.email || "",
          full_name: getUserName(state.user),
          avatar_url: getUserAvatarUrl(state.user)
        },
        {
          onConflict: "id"
        }
      )
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      })
      .catch(function (error) {
        console.warn("Failed to sync auth profile", error);
      });
  }

  function cleanupOAuthParams() {
    var url = null;

    if (!window.location || !window.location.search) {
      return;
    }

    url = new URL(window.location.href);

    if (
      !url.searchParams.has("code") &&
      !url.searchParams.has("state") &&
      !url.searchParams.has("error") &&
      !url.searchParams.has("error_code")
    ) {
      return;
    }

    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.searchParams.delete("scope");
    url.searchParams.delete("authuser");
    url.searchParams.delete("prompt");
    url.searchParams.delete("error");
    url.searchParams.delete("error_code");
    url.searchParams.delete("error_description");

    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
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
      if (!state.enabled && loadingState) {
        loadingState.hidden = false;
        loadingState.querySelector(".auth-copy").textContent = "Googleログイン設定を確認中です。";
      }
      return;
    }

    if (userName) {
      userName.textContent = getUserName(state.user);
    }

    if (userEmail) {
      userEmail.textContent = state.user.email || "";
    }

    if (avatar) {
      var avatarUrl = getUserAvatarUrl(state.user);

      if (avatarUrl) {
        avatar.innerHTML = '<img src="' + avatarUrl + '" alt="">';
      } else {
        avatar.textContent = getInitials(state.user);
      }
    }
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

  function signInWithGoogle() {
    if (!supabaseClient) {
      return Promise.resolve();
    }

    track("auth_google_click", { source: getAuthSource() });

    return supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectTo(),
        queryParams: {
          prompt: "select_account"
        }
      }
    });
  }

  function signOut() {
    if (!supabaseClient) {
      return Promise.resolve();
    }

    track("auth_sign_out", { source: getAuthSource() });
    return supabaseClient.auth.signOut();
  }

  function bindDomEvents() {
    var signInButton = document.getElementById("googleSignInButton");
    var signOutButton = document.getElementById("authSignOutButton");

    if (signInButton) {
      signInButton.addEventListener("click", function () {
        signInWithGoogle().catch(function (error) {
          console.error("Failed to start Google sign-in", error);
        });
      });
    }

    if (signOutButton) {
      signOutButton.addEventListener("click", function () {
        signOut().catch(function (error) {
          console.error("Failed to sign out", error);
        });
      });
    }
  }

  function initAuth() {
    if (
      !window.supabase ||
      !authConfig.supabaseUrl ||
      !authConfig.supabasePublishableKey
    ) {
      state.ready = true;
      state.enabled = false;
      renderAuthPanel();
      notify();
      return;
    }

    supabaseClient = window.supabase.createClient(
      authConfig.supabaseUrl,
      authConfig.supabasePublishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    state.enabled = true;

    supabaseClient.auth.getSession().then(function (result) {
      setSession(result && result.data ? result.data.session : null);
    }).catch(function (error) {
      console.error("Failed to read auth session", error);
      state.ready = true;
      renderAuthPanel();
      notify();
    });

    supabaseClient.auth.onAuthStateChange(function (eventName, session) {
      if (eventName === "SIGNED_IN") {
        track("auth_signed_in", {
          source: "google",
          surface: getAuthSource()
        });
      }

      setSession(session);
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
