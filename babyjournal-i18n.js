(function () {
  const SUPPORTED_LANGS = [
    "ar", "cs", "de", "el", "en", "es", "fr", "hu",
    "it", "ja", "nl", "pl", "pt", "ru", "sk", "zh"
  ];

  const LANG_LABELS = {
    ar: "العربية",
    cs: "Čeština",
    de: "Deutsch",
    el: "Ελληνικά",
    en: "English",
    es: "Español",
    fr: "Français",
    hu: "Magyar",
    it: "Italiano",
    ja: "日本語",
    nl: "Nederlands",
    pl: "Polski",
    pt: "Português",
    ru: "Русский",
    sk: "Slovenčina",
    zh: "中文"
  };

  const languageSelect = document.getElementById("language-select");
  if (!languageSelect) return;

  function normalizeLang(value) {
    if (!value) return null;
    const base = value.toLowerCase().split("-")[0];
    return SUPPORTED_LANGS.includes(base) ? base : null;
  }

  function resolveInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = normalizeLang(params.get("lang"));
    if (urlLang) return urlLang;

    const savedLang = normalizeLang(localStorage.getItem("legalLang"));
    if (savedLang) return savedLang;

    const browserLang = normalizeLang(navigator.language);
    if (browserLang) return browserLang;

    return "en";
  }

  function setById(id, value) {
    const el = document.getElementById(id);
    if (el && typeof value === "string") el.textContent = value;
  }

  function renderOptions(activeLang) {
    languageSelect.innerHTML = "";
    SUPPORTED_LANGS.forEach(function (lang) {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = LANG_LABELS[lang] || lang;
      option.selected = lang === activeLang;
      languageSelect.appendChild(option);
    });
  }

  function updateLangAwareLinks(lang) {
    document.querySelectorAll("a[data-lang-link='true']").forEach(function (anchor) {
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:")) return;

      const url = new URL(href, window.location.origin + "/");
      url.searchParams.set("lang", lang);
      anchor.setAttribute("href", url.pathname.replace(/^\//, "") + "?" + url.searchParams.toString());
    });
  }

  function persistLang(lang) {
    localStorage.setItem("legalLang", lang);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    window.history.replaceState({}, "", window.location.pathname + "?" + params.toString());
  }

  function applyContent(content, lang) {
    setById("lang-label", content.langLabel);
    setById("nav-features", content.navFeatures);
    setById("nav-privacy", content.navPrivacy);
    setById("nav-legal", content.navLegal);

    setById("hero-eyebrow", content.heroEyebrow);
    setById("hero-title", content.heroTitle);
    setById("hero-body", content.heroBody);
    setById("hero-cta", content.heroCta);

    setById("info-fast-title", content.infoFastTitle);
    setById("info-fast-body", content.infoFastBody);
    setById("info-privacy-title", content.infoPrivacyTitle);
    setById("info-privacy-body", content.infoPrivacyBody);
    setById("info-global-title", content.infoGlobalTitle);
    setById("info-global-body", content.infoGlobalBody);

    setById("features-eyebrow", content.featuresEyebrow);
    setById("features-title", content.featuresTitle);

    setById("card1-title", content.card1Title);
    setById("card1-li1", content.card1Li1);
    setById("card1-li2", content.card1Li2);
    setById("card1-li3", content.card1Li3);
    setById("card1-li4", content.card1Li4);

    setById("card2-title", content.card2Title);
    setById("card2-li1", content.card2Li1);
    setById("card2-li2", content.card2Li2);
    setById("card2-li3", content.card2Li3);
    setById("card2-li4", content.card2Li4);

    setById("card3-title", content.card3Title);
    setById("card3-li1", content.card3Li1);
    setById("card3-li2", content.card3Li2);
    setById("card3-li3", content.card3Li3);

    setById("card4-title", content.card4Title);
    setById("card4-li1", content.card4Li1);
    setById("card4-li2", content.card4Li2);
    setById("card4-li3", content.card4Li3);

    setById("privacy-eyebrow", content.privacyEyebrow);
    setById("privacy-title", content.privacyTitle);
    setById("privacy-body", content.privacyBody);

    setById("legal-eyebrow", content.legalEyebrow);
    setById("legal-title", content.legalTitle);
    setById("legal-privacy-btn", content.legalPrivacyBtn);
    setById("legal-terms-btn", content.legalTermsBtn);

    setById("footer-disclaimer", content.footerDisclaimer);
    setById("footer-company-note", content.footerCompanyNote);
    setById("footer-rights", content.footerRights);
    setById("footer-privacy-link", content.footerPrivacyLink);
    setById("footer-terms-link", content.footerTermsLink);

    document.title = content.pageTitle || "Baby Journal | PM-NEXT s.r.o.";
    const description = document.querySelector('meta[name="description"]');
    if (description && content.pageDescription) {
      description.setAttribute("content", content.pageDescription);
    }

    document.documentElement.lang = lang;
    renderOptions(lang);
    persistLang(lang);
    updateLangAwareLinks(lang);
  }

  function initWithData(data) {
    const localizations = data.localizations || {};
    const fallback = data.defaultLang || "en";

    function render(lang) {
      const selected = localizations[lang] || localizations[fallback] || {};
      applyContent(selected, lang);
    }

    const initial = resolveInitialLanguage();
    render(initial);

    languageSelect.addEventListener("change", function (event) {
      const lang = normalizeLang(event.target.value) || fallback;
      render(lang);
    });
  }

  if (window.BABYJOURNAL_I18N || window.BABYDIARY_I18N) {
    initWithData(window.BABYJOURNAL_I18N || window.BABYDIARY_I18N);
    return;
  }

  fetch("i18n/babyjournal.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load translations");
      return response.json();
    })
    .then(initWithData)
    .catch(function () {
      renderOptions("en");
      updateLangAwareLinks("en");
    });
})();
