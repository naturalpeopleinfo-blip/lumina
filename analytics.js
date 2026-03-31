(function initLuminaAnalytics() {
  if (!window.location || !/^https?:$/.test(window.location.protocol)) {
    return;
  }

  if (window.__luminaAnalyticsLoaded) {
    return;
  }

  window.__luminaAnalyticsLoaded = true;

  window.va =
    window.va ||
    function vercelAnalyticsQueue() {
      (window.vaq = window.vaq || []).push(arguments);
    };

  if (document.querySelector('script[data-lumina-analytics="vercel"]')) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  script.dataset.luminaAnalytics = "vercel";
  document.head.appendChild(script);

  initPostHog();

  function initPostHog() {
    var POSTHOG_KEY = "phc_AR8RUwAmCDygpbeboGdWoWGudZGpQLnfdiio4GGzrFB3";
    var POSTHOG_HOST = "https://us.i.posthog.com";
    var posthogAssetHost = POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com");

    if (window.posthog && window.posthog.__loaded) {
      exposeLuminaTrack();
      return;
    }

    window.posthog = window.posthog || [];

    if (typeof window.posthog.init !== "function") {
      createPostHogStub(window.posthog);
    }

    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-01-30",
      person_profiles: "identified_only"
    });

    if (!document.querySelector('script[data-lumina-analytics="posthog"]')) {
      var posthogScript = document.createElement("script");
      posthogScript.async = true;
      posthogScript.crossOrigin = "anonymous";
      posthogScript.src = posthogAssetHost + "/static/array.js";
      posthogScript.dataset.luminaAnalytics = "posthog";
      document.head.appendChild(posthogScript);
    }

    exposeLuminaTrack();
  }

  function createPostHogStub(target) {
    var methods = (
      "capture identify alias set_config reset isFeatureEnabled reloadFeatureFlags " +
      "onFeatureFlags onSessionId get_distinct_id getGroups get_session_id get_session_replay_url " +
      "register register_once unregister setPersonProperties group resetGroups opt_in_capturing " +
      "opt_out_capturing has_opted_in_capturing has_opted_out_capturing"
    ).split(" ");

    target._i = target._i || [];
    target.__loaded = false;
    target.init = function init(key, config, name) {
      var context = typeof name !== "undefined" ? (target[name] = []) : target;
      var namespace = typeof name !== "undefined" ? name : "posthog";

      function stub(methodName) {
        context[methodName] = function posthogStub() {
          context.push([methodName].concat(Array.prototype.slice.call(arguments, 0)));
        };
      }

      context.people = context.people || [];
      context.toString = function toString(asStub) {
        return namespace + (asStub ? " (stub)" : "");
      };
      context.people.toString = function toStringPeople() {
        return context.toString(true) + ".people (stub)";
      };

      for (var index = 0; index < methods.length; index += 1) {
        stub(methods[index]);
      }

      target._i.push([key, config, name]);
    };
  }

  function exposeLuminaTrack() {
    if (window.luminaTrack) {
      return;
    }

    window.luminaTrack = function luminaTrack(eventName, properties) {
      if (!eventName || !window.posthog || typeof window.posthog.capture !== "function") {
        return;
      }

      try {
        window.posthog.capture(
          eventName,
          Object.assign(
            {
              app_name: "lumina_zone",
              page_type: document.body && document.body.classList.contains("landing-page") ? "landing" : "app",
              page_path: window.location.pathname
            },
            properties || {}
          )
        );
      } catch (error) {
        // Analytics should never interrupt the product experience.
      }
    };
  }
})();
