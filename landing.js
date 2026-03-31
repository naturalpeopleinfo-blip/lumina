const landingMobileQuery = window.matchMedia("(max-width: 760px)");
const landingHeaderCta = document.querySelector("#landingHeaderCta");
const landingHeroCta = document.querySelector("#landingHeroCta");
const landingCtaLinks = document.querySelectorAll("[data-cta-source]");

let landingHeroObserver = null;

function setLandingHeaderCtaVisible(isVisible) {
  if (!landingHeaderCta) return;
  landingHeaderCta.classList.toggle("is-visible", isVisible);
}

function teardownLandingHeroObserver() {
  if (!landingHeroObserver) return;
  landingHeroObserver.disconnect();
  landingHeroObserver = null;
}

function setupLandingHeroObserver() {
  teardownLandingHeroObserver();

  if (!landingHeaderCta || !landingHeroCta) return;

  if (!landingMobileQuery.matches) {
    landingHeaderCta.classList.remove("is-visible");
    return;
  }

  landingHeroObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const heroCtaIsVisible = entry ? entry.isIntersecting : false;
      setLandingHeaderCtaVisible(!heroCtaIsVisible);
    },
    {
      threshold: 0.2,
      rootMargin: "-12% 0px -40% 0px",
    }
  );

  landingHeroObserver.observe(landingHeroCta);
}

if (typeof landingMobileQuery.addEventListener === "function") {
  landingMobileQuery.addEventListener("change", setupLandingHeroObserver);
} else if (typeof landingMobileQuery.addListener === "function") {
  landingMobileQuery.addListener(setupLandingHeroObserver);
}

window.addEventListener("pageshow", setupLandingHeroObserver);
window.addEventListener("resize", setupLandingHeroObserver);

setupLandingHeroObserver();

landingCtaLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    if (link.target && link.target !== "_self") {
      return;
    }

    event.preventDefault();

    if (typeof window.luminaTrack !== "function") return;
    window.luminaTrack("landing_cta_click", {
      cta_source: link.getAttribute("data-cta-source") || "unknown"
    });

    window.setTimeout(function () {
      window.location.href = link.href;
    }, 180);
  });
});
