(function () {
  const path = (location.pathname || "").replace(/\\/g, "/");
  const onNews =
    path.includes("/news") ||
    path.endsWith("news.html") ||
    path.includes("into-the-wild");
  const active = onNews ? "news" : "servers";

  const brandHref = onNews && path.includes("/news/") ? "../index.html" : "index.html";
  const serversHref = brandHref;
  const newsHref = onNews && path.includes("/news/") ? "index.html" : "news/index.html";

  const mount = document.querySelector("[data-site-nav]");
  if (mount) {
    mount.innerHTML =
      '<a class="brand" href="' + brandHref + '">ОСТРОВ <span>СУДЬБЫ</span></a>' +
      '<nav class="tabs" aria-label="Разделы сайта">' +
      '<a class="tab' + (active === "servers" ? " is-active" : "") + '" href="' + serversHref + '">Серверы</a>' +
      '<a class="tab' + (active === "news" ? " is-active" : "") + '" href="' + newsHref + '">Новости</a>' +
      "</nav>";
  }

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
  document.querySelectorAll(".reveal, .media, .video-wrap, .server-row").forEach(function (el) {
    io.observe(el);
  });
})();
