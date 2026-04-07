const landingMobileQuery = window.matchMedia("(max-width: 760px)");
const landingReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const landingHeaderCta = document.querySelector("#landingHeaderCta");
const landingHeroCta = document.querySelector("#landingHeroCta");
const landingCtaLinks = document.querySelectorAll("[data-cta-source]");
const landingHeroLines = document.querySelectorAll(".landing-hero-line");
const landingHeroDemo = document.querySelector(".landing-hero-demo");
const landingHeroSupport = document.querySelector(".landing-hero-support");
const landingSectionHeads = document.querySelectorAll(".landing-section-head");

let landingHeroObserver = null;
let landingRevealObserver = null;

function setLandingHeaderCtaVisible(isVisible) {
  if (!landingHeaderCta) return;
  landingHeaderCta.classList.toggle("is-visible", isVisible);
}

function teardownLandingHeroObserver() {
  if (!landingHeroObserver) return;
  landingHeroObserver.disconnect();
  landingHeroObserver = null;
}

function teardownLandingRevealObserver() {
  if (!landingRevealObserver) return;
  landingRevealObserver.disconnect();
  landingRevealObserver = null;
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

function revealLandingNode(node) {
  if (!node) return;
  node.classList.add("is-revealed");
}

function setupLandingReveal() {
  teardownLandingRevealObserver();

  const revealTargets = [];

  landingHeroLines.forEach((line, index) => {
    line.classList.add("landing-reveal");
    line.style.setProperty("--landing-reveal-delay", `${index * 90}ms`);
    revealTargets.push(line);
  });

  if (landingHeroDemo) {
    landingHeroDemo.classList.add("landing-reveal");
    landingHeroDemo.style.setProperty("--landing-reveal-delay", "180ms");
    revealTargets.push(landingHeroDemo);
  }

  if (landingHeroSupport) {
    landingHeroSupport.classList.add("landing-reveal");
    landingHeroSupport.style.setProperty("--landing-reveal-delay", "260ms");
    revealTargets.push(landingHeroSupport);
  }

  landingSectionHeads.forEach((head) => {
    head.classList.add("landing-reveal");
    revealTargets.push(head);
  });

  if (landingReducedMotionQuery.matches) {
    revealTargets.forEach(revealLandingNode);
    return;
  }

  window.requestAnimationFrame(() => {
    landingHeroLines.forEach(revealLandingNode);
    if (landingHeroDemo) revealLandingNode(landingHeroDemo);
    if (landingHeroSupport) revealLandingNode(landingHeroSupport);
  });

  landingRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealLandingNode(entry.target);
        if (landingRevealObserver) {
          landingRevealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -12% 0px",
    }
  );

  landingSectionHeads.forEach((head) => {
    if (head.classList.contains("is-revealed")) return;
    landingRevealObserver.observe(head);
  });
}

if (typeof landingMobileQuery.addEventListener === "function") {
  landingMobileQuery.addEventListener("change", setupLandingHeroObserver);
} else if (typeof landingMobileQuery.addListener === "function") {
  landingMobileQuery.addListener(setupLandingHeroObserver);
}

if (typeof landingReducedMotionQuery.addEventListener === "function") {
  landingReducedMotionQuery.addEventListener("change", setupLandingReveal);
} else if (typeof landingReducedMotionQuery.addListener === "function") {
  landingReducedMotionQuery.addListener(setupLandingReveal);
}

window.addEventListener("pageshow", setupLandingHeroObserver);
window.addEventListener("resize", setupLandingHeroObserver);

setupLandingHeroObserver();
setupLandingReveal();

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
