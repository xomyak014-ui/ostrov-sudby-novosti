(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");

  function sectionOf(p) {
    if (p.includes("/news") || p.endsWith("news.html") || p.includes("into-the-wild")) return "news";
    if (p.includes("/settings")) return "settings";
    if (p.includes("/rules")) return "rules";
    return "home";
  }

  const active = sectionOf(path);
  const inSub =
    path.includes("/news/") || path.includes("/settings/") || path.includes("/rules/");
  const root = inSub ? "../" : "";

  const links = {
    home: root + "index.html",
    news: root + "news/index.html",
    settings: root + "settings/index.html",
    rules: root + "rules/index.html",
  };

  const mount = document.querySelector("[data-site-nav]");
  if (mount) {
    mount.innerHTML =
      '<nav class="tabs" aria-label="Разделы сайта">' +
      '<span class="tabs-pill" aria-hidden="true"></span>' +
      '<a class="tab' +
      (active === "home" ? " is-active" : "") +
      '" href="' +
      links.home +
      '" data-tab="home">Главная</a>' +
      '<a class="tab' +
      (active === "news" ? " is-active" : "") +
      '" href="' +
      links.news +
      '" data-tab="news">Новости</a>' +
      '<a class="tab' +
      (active === "settings" ? " is-active" : "") +
      '" href="' +
      links.settings +
      '" data-tab="settings">Настройки</a>' +
      '<a class="tab' +
      (active === "rules" ? " is-active" : "") +
      '" href="' +
      links.rules +
      '" data-tab="rules">Правила</a>' +
      "</nav>";

    const tabs = mount.querySelector(".tabs");
    const pill = mount.querySelector(".tabs-pill");

    function movePill(target) {
      if (!tabs || !pill || !target) return;
      const tabRect = target.getBoundingClientRect();
      const tabsRect = tabs.getBoundingClientRect();
      pill.style.width = tabRect.width + "px";
      pill.style.height = tabRect.height + "px";
      pill.style.transform = "translateX(" + (tabRect.left - tabsRect.left) + "px)";
      pill.classList.add("is-ready");
    }

    function syncPill() {
      const current = tabs.querySelector(".tab.is-active") || tabs.querySelector(".tab");
      movePill(current);
    }

    tabs.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("mouseenter", function () {
        movePill(tab);
      });
      tab.addEventListener("focus", function () {
        movePill(tab);
      });
    });
    tabs.addEventListener("mouseleave", syncPill);
    window.addEventListener("resize", syncPill);
    requestAnimationFrame(function () {
      requestAnimationFrame(syncPill);
    });
  }

  const nav = document.querySelector(".site-nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.documentElement.classList.add("is-ready");

  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  document
    .querySelectorAll(
      ".reveal, .media, .video-wrap, .server-row, .news-card, .feature-row li, .info-block, .rule-block, .info-card, .stat-chip"
    )
    .forEach(function (el) {
      io.observe(el);
    });
})();
