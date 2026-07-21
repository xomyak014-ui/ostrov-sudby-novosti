/**
 * Rebuild HTML pages + index from news/_source/meta-ru.json (no re-translate).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "news", "_source", "steam-2026.json");
const META = path.join(ROOT, "news", "_source", "meta-ru.json");
const OUT_DIR = path.join(ROOT, "news");

const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatDateRu(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_RU[m - 1]} ${y}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitize(html) {
  return String(html || "")
    .replace(/СКАМ/g, "SCUM")
    .replace(/Скам/g, "SCUM")
    .replace(/<ul class="reveal feature-list"><\/li>/g, '<ul class="reveal feature-list">')
    .replace(/href=""([^"]+)""/g, 'href="$1"');
}

function articleTemplate({ titleRu, dateRu, summaryRu, bodyHtml, heroImg, steamUrl }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(titleRu)} — Остров Судьбы</title>
  <meta name="description" content="${escapeHtml(summaryRu)}" />
  <link rel="stylesheet" href="../styles.css?v=6" />
</head>
<body>
  <header class="site-nav" data-site-nav></header>

  <section class="news-hero">
    <div class="hero-media">
      <img src="${heroImg}" alt="" fetchpriority="high" />
      <div class="hero-mist" aria-hidden="true"></div>
      <div class="hero-vignette" aria-hidden="true"></div>
    </div>
    <div class="news-hero-content">
      <p class="section-kicker">Новости · ${escapeHtml(dateRu)}</p>
      <h1 class="page-title">${escapeHtml(titleRu)}</h1>
      <p class="page-sub">${escapeHtml(summaryRu)}</p>
    </div>
  </section>

  <main class="article" id="news">
${bodyHtml}
    <p class="reveal" style="color: var(--muted); font-size: 0.9rem; margin-top: 2.5rem;">
      Источник:
      <a href="${steamUrl}" target="_blank" rel="noopener">новость Steam SCUM</a>
      · перевод для сервера «Остров Судьбы»
    </p>
  </main>

  <footer class="footer">
    <strong>ОСТРОВ СУДЬБЫ</strong>
    <a href="index.html">Все новости</a>
  </footer>

  <script src="../site.js?v=6"></script>
</body>
</html>
`;
}

function indexTemplate(cards) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Новости — Остров Судьбы</title>
  <meta name="description" content="Новости SCUM 2026 с переводом для сервера Остров Судьбы." />
  <link rel="stylesheet" href="../styles.css?v=6" />
</head>
<body>
  <header class="site-nav" data-site-nav></header>

  <section class="news-hero">
    <div class="hero-media">
      <img src="../assets/hero.png" alt="" />
      <div class="hero-mist" aria-hidden="true"></div>
      <div class="hero-vignette" aria-hidden="true"></div>
    </div>
    <div class="news-hero-content">
      <p class="section-kicker">SCUM · Лента 2026</p>
      <h1 class="page-title">Новости</h1>
      <p class="page-sub">Официальные новости игры с начала года — по датам, с переводом для игроков Острова Судьбы.</p>
    </div>
  </section>

  <main class="page">
    <div class="news-list">
${cards}
    </div>
  </main>

  <footer class="footer">
    <strong>ОСТРОВ СУДЬБЫ</strong>
    Новости игры · источник Steam app 513710
  </footer>

  <script src="../site.js?v=6"></script>
</body>
</html>
`;
}

const { items } = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const meta = JSON.parse(fs.readFileSync(META, "utf8"));

let written = 0;
for (const item of items) {
  const m = meta[item.slug];
  if (!m) continue;
  if (m.href && m.href !== `${item.slug}.html` && !m.bodyHtml) {
    // reused polished page
    continue;
  }
  if (!m.bodyHtml) continue;

  const page = articleTemplate({
    titleRu: m.titleRu,
    dateRu: formatDateRu(item.date),
    summaryRu: m.summaryRu,
    bodyHtml: sanitize(m.bodyHtml),
    heroImg: m.heroImg || "../assets/hero.png",
    steamUrl: m.steamUrl || `https://store.steampowered.com/news/app/513710/view/${item.gid}?l=russian`,
  });
  fs.writeFileSync(path.join(OUT_DIR, `${item.slug}.html`), page, "utf8");
  written++;
}

const cards = items
  .map((item) => {
    const m = meta[item.slug];
    if (!m) return null;
    const href = m.href || `${item.slug}.html`;
    return `      <a class="news-item reveal" href="${href}">
        <time datetime="${item.date}">${formatDateRu(item.date)}</time>
        <h2>${escapeHtml(m.titleRu)}</h2>
        <p>${escapeHtml(m.summaryRu)}</p>
        <span class="news-more">Читать →</span>
      </a>`;
  })
  .filter(Boolean)
  .join("\n");

fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexTemplate(cards), "utf8");
console.log("rewrote pages:", written, "index cards:", items.filter((i) => meta[i.slug]).length);
