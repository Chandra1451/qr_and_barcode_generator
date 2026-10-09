/*
 * Google Analytics, loaded only after consent (Google consent mode, "basic").
 *
 * Google's consent message (AdSense Privacy & messaging) decides per visitor whether EU rules
 * apply (EEA, UK, Switzerland) and, if they do, asks for consent. Once that is known it runs
 * the CONSENT_MODE_DATA_READY callbacks. We load gtag.js only when the analytics-storage purpose
 * is GRANTED, or NOT_APPLICABLE (EU rules don't apply to this visitor). Any other value, or no
 * answer at all (message blocked or not served), means Analytics never loads.
 * API: https://developers.google.com/funding-choices/fc-api-docs
 *
 * The consent message itself is delivered by the AdSense tag at the end of each page.
 * Plain script (not a module), loaded with `defer` in every page's <head>; the callback queue
 * runs functions pushed before or after Google's script has loaded.
 */
(function () {
  var GA_ID = 'G-0MD85STYZT';
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Deep links can carry code content (?data=, ?payload=); Analytics never gets it.
  var PRIVATE_PARAMS = ['data', 'payload'];
  function withoutCodeContent(href) {
    try {
      var url = new URL(href);
      for (var i = 0; i < PRIVATE_PARAMS.length; i++) url.searchParams.delete(PRIVATE_PARAMS[i]);
      return url.href;
    } catch (e) {
      return href ? href.split('?')[0] : '';
    }
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    window.gtag('js', new Date());
    var settings = { page_location: withoutCodeContent(location.href) };
    if (document.referrer) settings.page_referrer = withoutCodeContent(document.referrer);
    window.gtag('config', GA_ID, settings);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];

  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: function () {
      var fc = window.googlefc;
      if (!fc.getGoogleConsentModeValues || !fc.ConsentModePurposeStatusEnum) return;
      var status = fc.getGoogleConsentModeValues().analyticsStoragePurposeConsentStatus;
      var Status = fc.ConsentModePurposeStatusEnum;
      if (status !== Status.GRANTED && status !== Status.NOT_APPLICABLE) return;
      // After the page has rendered, so gtag.js doesn't compete with CSS/fonts on slow connections.
      if (document.readyState === 'complete') loadAnalytics();
      else window.addEventListener('load', loadAnalytics);
    }
  });

  // "Privacy and cookie settings" links (class js-consent-settings) re-open Google's message.
  // They stay hidden unless EU rules apply to this visitor.
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY: function () {
      if (typeof window.__tcfapi !== 'function') return;
      window.__tcfapi('addEventListener', 2.2, function (data, success) {
        if (!success || !data || !data.gdprApplies) return;
        var links = document.querySelectorAll('.js-consent-settings');
        for (var i = 0; i < links.length; i++) {
          links[i].hidden = false;
          links[i].addEventListener('click', openConsentSettings);
        }
        window.__tcfapi('removeEventListener', 2.2, function () {}, data.listenerId);
      });
    }
  });

  function openConsentSettings(e) {
    e.preventDefault();
    if (window.googlefc && typeof window.googlefc.showRevocationMessage === 'function') {
      window.googlefc.showRevocationMessage();
    }
  }
})();
