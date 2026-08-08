(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function section(p) {
    if (p.includes("/news") || p.includes("into-the-wild")) return "news";
    if (p.includes("/settings")) return "settings";
    if (p.includes("/rules")) return "rules";
    return "home";
  }

  const active = section(path);
  const sub = path.includes("/news/") || path.includes("/settings/") || path.includes("/rules/");
  const root = sub ? "../" : "";
  const href = {
    home: root + "index.html",
    news: root + "news/index.html",
    settings: root + "settings/index.html",
    rules: root + "rules/index.html",
  };

  const mount = document.querySelector("[data-nav]");
  if (mount) {
    mount.innerHTML =
      '<a class="logo" href="' +
      href.home +
      '">ОСТРОВ <b>СУДЬБЫ</b></a>' +
      '<nav class="menu" aria-label="Меню">' +
      '<a href="' + href.home + '"' + (active === "home" ? ' class="on"' : "") + ">Главная</a>" +
      '<a href="' + href.news + '"' + (active === "news" ? ' class="on"' : "") + ">Новости</a>" +
      '<a href="' + href.settings + '"' + (active === "settings" ? ' class="on"' : "") + ">Настройки</a>" +
      '<a href="' + href.rules + '"' + (active === "rules" ? ' class="on"' : "") + ">Правила</a>" +
      "</nav>";
  }

  const top = document.querySelector(".top");
  function scroll() {
    if (top) top.classList.toggle("stuck", window.scrollY > 12);
  }
  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  document.documentElement.classList.add("ready");

  const nodes = document.querySelectorAll(".fade, .item, .block, .card, .stat, .way, .hud, .links");
  if (reduce) {
    nodes.forEach(function (el) { el.classList.add("in"); });
  } else {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    nodes.forEach(function (el) { io.observe(el); });
  }
})();
