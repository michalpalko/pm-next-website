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

  const params = new URLSearchParams(window.location.search);
  const page = document.body.dataset.legalPage;
  const languageSelect = document.getElementById("language-select");

  if (!page || !languageSelect) {
    return;
  }

  function normalizeLang(value) {
    if (!value) return null;
    const base = value.toLowerCase().split("-")[0];
    return SUPPORTED_LANGS.includes(base) ? base : null;
  }

  function resolveInitialLanguage() {
    const urlLang = normalizeLang(params.get("lang"));
    if (urlLang) return urlLang;

    const savedLang = normalizeLang(localStorage.getItem("legalLang"));
    if (savedLang) return savedLang;

    const browserLang = normalizeLang(navigator.language);
    if (browserLang) return browserLang;

    return "en";
  }

  function renderLanguageOptions(activeLang) {
    languageSelect.innerHTML = "";

    SUPPORTED_LANGS.forEach(function (lang) {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = LANG_LABELS[lang] || lang;
      option.selected = lang === activeLang;
      languageSelect.appendChild(option);
    });
  }

  function setPersistentLanguage(lang) {
    localStorage.setItem("legalLang", lang);
    const updatedParams = new URLSearchParams(window.location.search);
    updatedParams.set("lang", lang);
    window.history.replaceState({}, "", window.location.pathname + "?" + updatedParams.toString());
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

  function applyNavAndFooterText(content) {
    const nav = content.nav || {};
    const footer = content.footer || {};

    const navCompany = document.getElementById("nav-company");
    const navApp = document.getElementById("nav-app");
    const navLegal = document.getElementById("nav-legal");

    if (navCompany) navCompany.textContent = nav.company || "Company";
    if (navApp) navApp.textContent = nav.babyDiary || "Baby Journal";
    if (navLegal) navLegal.textContent = nav.privacy || nav.terms || "Legal";

    const footerCompany = document.getElementById("footer-company");
    const footerApp = document.getElementById("footer-app");
    const footerLegal = document.getElementById("footer-legal");

    if (footerCompany) footerCompany.textContent = footer.companyPage || "Company Page";
    if (footerApp) footerApp.textContent = footer.babyDiary || "Baby Journal";
    if (footerLegal) footerLegal.textContent = footer.privacyPolicy || footer.terms || "Legal";
  }

  function applyPageText(content) {
    const eyebrow = document.getElementById("legal-eyebrow");
    const title = document.getElementById("legal-title");
    const effective = document.getElementById("legal-effective-date");
    const contentRoot = document.getElementById("legal-content");

    if (eyebrow) eyebrow.textContent = content.eyebrow || "Legal Document";
    if (title) title.textContent = content.title || "Legal";
    if (effective) {
      const label = content.effectiveDateLabel || "Effective date";
      const date = content.effectiveDate || "";
      effective.textContent = date ? label + ": " + date : label;
    }
    if (contentRoot) contentRoot.innerHTML = content.contentHtml || "";

    document.title = (content.title || "Legal") + " | PM-NEXT s.r.o.";
  }

  fetch("i18n/legal/" + page + ".json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load language file");
      return response.json();
    })
    .then(function (data) {
      const localizations = data.localizations || {};
      const fallbackLang = data.defaultLang || "en";

      function render(lang) {
        const selected = localizations[lang] || localizations[fallbackLang] || {};
        applyNavAndFooterText(selected);
        applyPageText(selected);
        renderLanguageOptions(lang);
        setPersistentLanguage(lang);
        updateLangAwareLinks(lang);
        document.documentElement.lang = lang;
      }

      const initialLang = resolveInitialLanguage();
      render(initialLang);

      languageSelect.addEventListener("change", function (event) {
        const lang = normalizeLang(event.target.value) || fallbackLang;
        render(lang);
      });
    })
    .catch(function () {
      renderLanguageOptions("en");
    });
})();
