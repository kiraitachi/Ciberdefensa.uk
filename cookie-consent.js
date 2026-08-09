/* cookie-consent.js
 * Minimal GDPR/PECR-style cookie consent handler.
 * - No analytics/tracking script is requested from the network until the
 *   visitor clicks "Accept".
 * - Choice is stored in localStorage and respected on every future visit.
 * - Include this file + the #cookie-banner markup + the .cookie-banner CSS
 *   (already added to style.css) on every page of the site.
 */
(function () {
  "use strict";

  var CONSENT_KEY = "cookie_consent"; // "granted" | "declined"
  var GA_ID = "G-QYJPB53VMV";
  var CLARITY_ID = "w9et8531ye";

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(CONSENT_KEY + "_date", new Date().toISOString());
    } catch (e) {
      /* localStorage unavailable (private mode etc.) — consent just won't persist */
    }
  }

  function loadAnalytics() {
    // Google Analytics (gtag.js)
    var ga = document.createElement("script");
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(ga);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });

    // Microsoft Clarity
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  function showBanner() {
    var banner = document.getElementById("cookie-banner");
    if (banner) banner.classList.add("visible");
  }

  function hideBanner() {
    var banner = document.getElementById("cookie-banner");
    if (banner) banner.classList.remove("visible");
  }

  function init() {
    var consent = getConsent();

    if (consent === "granted") {
      loadAnalytics();
    } else if (consent !== "declined") {
      // no stored choice yet — ask
      showBanner();
    }

    var acceptBtn = document.getElementById("cookie-accept");
    var declineBtn = document.getElementById("cookie-decline");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setConsent("granted");
        loadAnalytics();
        hideBanner();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        setConsent("declined");
        hideBanner();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Lets a "Cookie settings" link in the footer reopen the banner so
  // visitors can change their mind later.
  window.reopenCookieBanner = function () {
    showBanner();
  };
})();
