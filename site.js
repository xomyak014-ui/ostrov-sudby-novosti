(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* Split brand title into characters */
  document.querySelectorAll("[data-split]").forEach(function (title) {
    title.querySelectorAll(".line").forEach(function (line, lineIndex) {
      const text = line.textContent || "";
      line.textContent = "";
      Array.prototype.forEach.call(text, function (ch, i) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.animationDelay = 0.18 + lineIndex * 0.18 + i * 0.045 + "s";
        line.appendChild(span);
      });
    });
  });

  const nav = document.querySelector(".site-nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.documentElement.classList.add("is-ready");

  /* Reveal on scroll */
  const revealSelector =
    ".reveal, .media, .video-wrap, .server-row, .news-card, .feature-row li, .info-block, .rule-block, .info-card, .stat-chip, .news-item, .explore-card, .live-panel, .connect-links";

  if (reduceMotion) {
    document.querySelectorAll(revealSelector).forEach(function (el) {
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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(revealSelector).forEach(function (el) {
      io.observe(el);
    });
  }

  /* Soft parallax on hero */
  const parallax = document.querySelector("[data-parallax] img");
  if (parallax && !reduceMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          const y = Math.min(window.scrollY, 700);
          parallax.style.transform =
            "scale(1.12) translate3d(0, " + y * 0.18 + "px, 0)";
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* Cursor glow */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;
    let raf = 0;

    function loop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = "translate3d(" + gx + "px, " + gy + "px, 0)";
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener(
      "pointermove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        glow.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      function () {
        glow.classList.remove("is-on");
      },
      { passive: true }
    );
  }

  /* Magnetic buttons */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".btn, .link-chip").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.12 + "px, " + (y * 0.16 - 2) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  }
})();
