(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");
  const onNews =
    path.includes("/news") ||
    path.endsWith("news.html") ||
    path.includes("into-the-wild");
  const active = onNews ? "news" : "home";

  const homeHref = onNews && path.includes("/news/") ? "../index.html" : "index.html";
  const newsHref = onNews && path.includes("/news/") ? "index.html" : "news/index.html";

  const mount = document.querySelector("[data-site-nav]");
  if (mount) {
    mount.innerHTML =
      '<nav class="tabs" aria-label="Разделы сайта">' +
      '<span class="tabs-pill" aria-hidden="true"></span>' +
      '<a class="tab' +
      (active === "home" ? " is-active" : "") +
      '" href="' +
      homeHref +
      '" data-tab="home">Главная</a>' +
      '<a class="tab' +
      (active === "news" ? " is-active" : "") +
      '" href="' +
      newsHref +
      '" data-tab="news">Новости</a>' +
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

  // Nav glass denser on scroll
  const nav = document.querySelector(".site-nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Soft page enter
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
    .querySelectorAll(".reveal, .media, .video-wrap, .server-row, .news-card, .feature-row li")
    .forEach(function (el) {
      io.observe(el);
    });
})();
