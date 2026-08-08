(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sectionOf(p) {
    if (p.includes("/news") || p.includes("into-the-wild")) return "news";
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
      '<a class="nav-brand" href="' +
      links.home +
      '">ОСТРОВ <span>СУДЬБЫ</span></a>' +
      '<nav class="tabs" aria-label="Разделы">' +
      '<a class="tab' +
      (active === "home" ? " is-active" : "") +
      '" href="' +
      links.home +
      '">Главная</a>' +
      '<a class="tab' +
      (active === "news" ? " is-active" : "") +
      '" href="' +
      links.news +
      '">Новости</a>' +
      '<a class="tab' +
      (active === "settings" ? " is-active" : "") +
      '" href="' +
      links.settings +
      '">Настройки</a>' +
      '<a class="tab' +
      (active === "rules" ? " is-active" : "") +
      '" href="' +
      links.rules +
      '">Правила</a>' +
      "</nav>";
  }

  const nav = document.querySelector(".site-nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.documentElement.classList.add("is-ready");

  const sel =
    ".reveal, .news-item, .route-card, .status-board, .connect-row, .info-block, .rule-block, .info-card, .stat-chip, .media, .video-wrap";

  if (reduce) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    document.querySelectorAll(sel).forEach(function (el) {
      io.observe(el);
    });
  }
})();
