/**
 * Build SCUM 2026 news pages: BBCode → HTML + RU via google-translate-api-x.
 * Usage:
 *   node tools/build-news-pages.js
 *   node tools/build-news-pages.js --limit=5
 *   node tools/build-news-pages.js --force
 *   node tools/build-news-pages.js --no-translate
 */
const fs = require("fs");
const path = require("path");
const { translate } = require("google-translate-api-x");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "news", "_source", "steam-2026.json");
const OUT_DIR = path.join(ROOT, "news");
const META_OUT = path.join(ROOT, "news", "_source", "meta-ru.json");

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

function steamImg(url) {
  return String(url || "")
    .replace(/\{STEAM_CLAN_IMAGE\}/g, "https://clan.fastly.steamstatic.com/images")
    .replace(
      /\{STEAM_CLAN_LOC_IMAGE\}/g,
      "https://shared.fastly.steamstatic.com/store_item_assets/steamcommunity/public/images/clans"
    );
}

function bbcodeToHtml(raw) {
  let s = steamImg(raw || "");
  s = s.replace(/\r\n/g, "\n");

  // YouTube
  s = s.replace(
    /\[previewyoutube=([a-zA-Z0-9_-]+)(?:;[^\]]*)?\](?:\[\/previewyoutube\])?/gi,
    (_, id) =>
      `<div class="video-wrap reveal"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1" title="Видео" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`
  );

  // Images
  s = s.replace(/\[img\s+src="([^"]+)"[^\]]*\](?:\[\/img\])?/gi, (_, src) => {
    const u = steamImg(src);
    const isGif = /\.gif($|\?)/i.test(u);
    return `<figure class="media${isGif ? " gif" : ""} reveal"><img src="${u}" alt="" loading="lazy" /></figure>`;
  });
  s = s.replace(/\[img\]([^\[]+)\[\/img\]/gi, (_, src) => {
    const u = steamImg(src.trim());
    const isGif = /\.gif($|\?)/i.test(u);
    return `<figure class="media${isGif ? " gif" : ""} reveal"><img src="${u}" alt="" loading="lazy" /></figure>`;
  });

  // URLs — keep href clean (single quotes in attr to avoid quote doubling later)
  s = s.replace(/\[url=["']?([^\]"']+)["']?\]([\s\S]*?)\[\/url\]/gi, (_, href, text) => {
    const h = steamImg(href.trim()).replace(/"/g, "");
    return `<a href="${h}" target="_blank" rel="noopener">${text}</a>`;
  });

  // Headers / emphasis before lists
  s = s.replace(/\[h1\]([\s\S]*?)\[\/h1\]/gi, (_, t) => `<h2 class="section-title reveal">${t.trim()}</h2>`);
  s = s.replace(/\[h2\]([\s\S]*?)\[\/h2\]/gi, (_, t) => `<h2 class="section-title reveal">${t.trim()}</h2>`);
  s = s.replace(/\[h3\]([\s\S]*?)\[\/h3\]/gi, (_, t) => `<h2 class="section-title reveal">${t.trim()}</h2>`);
  s = s.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>");
  s = s.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>");
  s = s.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>");
  s = s.replace(/\[strike\]([\s\S]*?)\[\/strike\]/gi, "<s>$1</s>");

  // Paragraphs with optional attrs
  s = s.replace(/\[p[^\]]*\]/gi, "@@@P@@@");
  s = s.replace(/\[\/p\]/gi, "@@@/P@@@");

  // Lists: Steam uses [*] ... [/*]
  s = s.replace(/\[\/\*\]/gi, "");
  s = s.replace(/\[list\]/gi, "@@@UL@@@");
  s = s.replace(/\[\/list\]/gi, "@@@/UL@@@");
  s = s.replace(/\[olist\]/gi, "@@@OL@@@");
  s = s.replace(/\[\/olist\]/gi, "@@@/OL@@@");
  s = s.replace(/\[\*\]/gi, "@@@LI@@@");

  // Convert list markers in order (nested-friendly enough for Steam posts)
  // Turn @@@LI@@@... into <li>...</li> until next LI or list end
  function convertLists(input) {
    let out = input;
    // repeatedly convert innermost-ish by replacing LI chunks
    let prev;
    do {
      prev = out;
      out = out.replace(
        /@@@LI@@@([\s\S]*?)(?=@@@LI@@@|@@@\/UL@@@|@@@\/OL@@@)/g,
        (_, body) => {
          let b = body.trim();
          // unwrap paragraph wrappers inside li for cleaner HTML
          b = b.replace(/^@@@P@@@([\s\S]*?)@@@\/P@@@$/g, "$1").trim();
          b = b.replace(/@@@P@@@/g, "").replace(/@@@\/P@@@/g, "");
          return `<li>${b.trim()}</li>`;
        }
      );
    } while (out !== prev);
    out = out.replace(/@@@UL@@@/g, '<ul class="reveal feature-list">');
    out = out.replace(/@@@\/UL@@@/g, "</ul>");
    out = out.replace(/@@@OL@@@/g, '<ol class="reveal feature-list">');
    out = out.replace(/@@@\/OL@@@/g, "</ol>");
    return out;
  }
  s = convertLists(s);

  s = s.replace(/@@@P@@@/g, '<p class="reveal">');
  s = s.replace(/@@@\/P@@@/g, "</p>");

  s = s.replace(
    /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
    '<details class="reveal"><summary>Подробнее</summary><div>$1</div></details>'
  );
  s = s.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote class="reveal">$1</blockquote>');
  s = s.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "<pre class=\"reveal\"><code>$1</code></pre>");
  s = s.replace(/\[br\]/gi, "<br />");

  s = s.replace(/\[table\]/gi, '<div class="table-wrap reveal"><table>').replace(/\[\/table\]/gi, "</table></div>");
  s = s.replace(/\[tr\]/gi, "<tr>").replace(/\[\/tr\]/gi, "</tr>");
  s = s.replace(/\[th\]([\s\S]*?)\[\/th\]/gi, "<th>$1</th>");
  s = s.replace(/\[td\]([\s\S]*?)\[\/td\]/gi, "<td>$1</td>");

  // Strip any leftover BBCode tags
  s = s.replace(/\[[^\]]+\]/g, "");

  // Remove empty paragraphs and weird nesting of figure inside p
  s = s.replace(/<p class="reveal">\s*<\/p>/g, "");
  s = s.replace(/<p class="reveal">\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/gi, "$1");
  s = s.replace(/<p class="reveal">\s*(<div class="video-wrap[\s\S]*?<\/div>)\s*<\/p>/gi, "$1");
  s = s.replace(/<li>\s*<p class="reveal">([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

function firstImage(html) {
  const m = html.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : "../assets/hero.png";
}

function plainExcerpt(html, max = 180) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function classify(item) {
  const t = item.title.toLowerCase();
  if (/showcase/.test(t)) return "showcase";
  if (/hotfix|hot fix/.test(t)) return "hotfix";
  return "update";
}

const MANUAL = {
  "into-the-wild-july-update-1-3-2-0-134527": {
    titleRu: "Into the Wild — июльское обновление 1.3.2.0",
    summaryRu:
      "TEC1, мутанты, Мастер-охотник, официальные серверы до 80 игроков и полный перевод патча.",
    reuseFile: "into-the-wild-july-2026.html",
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateText(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (!/[A-Za-z]/.test(t)) return t;
  if (/^https?:\/\//i.test(t)) return t;

  if (t.length > 3500) {
    const chunks = [];
    let i = 0;
    while (i < t.length) {
      let end = Math.min(i + 3200, t.length);
      if (end < t.length) {
        const cut = t.lastIndexOf(". ", end);
        if (cut > i + 500) end = cut + 1;
      }
      chunks.push(t.slice(i, end).trim());
      i = end;
    }
    const out = [];
    for (const c of chunks) {
      out.push(await translateText(c));
      await sleep(160);
    }
    return out.join(" ");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await translate(t, { from: "en", to: "ru", forceBatch: false });
      return res.text;
    } catch (e) {
      await sleep(700 * (attempt + 1));
    }
  }
  return t;
}

async function translateHtml(html) {
  const tags = [];
  const masked = html.replace(/<[^>]+>/g, (tag) => {
    const i = tags.length;
    tags.push(tag);
    return `⟦T${i}⟧`;
  });

  // Chunk on placeholders / sentence ends, keep under ~2800 chars
  const chunks = [];
  let buf = "";
  const tokens = masked.split(/(⟦T\d+⟧)/);
  for (const tok of tokens) {
    if ((buf + tok).length > 2800 && buf.length > 400) {
      chunks.push(buf);
      buf = tok;
    } else {
      buf += tok;
    }
  }
  if (buf) chunks.push(buf);

  const translatedChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    if (!/[A-Za-z]/.test(c)) {
      translatedChunks.push(c);
      continue;
    }
    translatedChunks.push(await translateText(c));
    await sleep(150);
  }

  let out = translatedChunks.join("");
  out = out.replace(/⟦T(\d+)⟧/g, (_, n) => tags[Number(n)] || "");
  // Fix occasional spaces Google inserts inside markers leftovers
  out = out.replace(/⟦\s*T\s*(\d+)\s*⟧/gi, (_, n) => tags[Number(n)] || "");
  return out;
}

function guessTitleRu(title) {
  return title
    .replace(/^SCUM\s*[-|:]\s*/i, "")
    .replace(/INTO THE WILD/gi, "Into the Wild")
    .replace(/Hotfix/gi, "Хотфикс")
    .replace(/Community [Ss]howcase/gi, "Витрина сообщества")
    .replace(/Update Preview/gi, "Превью обновления")
    .replace(/July Update/gi, "Июльское обновление")
    .replace(/June Update/gi, "Июньское обновление")
    .replace(/May Update/gi, "Майское обновление")
    .replace(/April patch/gi, "Апрельский патч")
    .replace(/March QoL patch/gi, "Мартовский QoL-патч")
    .replace(/Lunar New year update/gi, "Обновление к Лунному Новому году")
    .replace(/Development update/gi, "Новости разработки")
    .replace(/Looking Ahead/gi, "Взгляд вперёд")
    .replace(/A New Chapter Begins/gi, "Начинается новая глава")
    .replace(/Public Alpha Update:.*/i, "Публичная альфа: свободные животные уже в игре")
    .replace(/Free-Roaming Animals Return/gi, "Свободные животные возвращаются")
    .replace(/is officially live!/gi, "официально вышел!")
    .replace(/available now!/gi, "уже доступен!")
    .replace(/coming next week!/gi, "на следующей неделе")
    .replace(/Update on PlaySafe ID/gi, "Обновление по PlaySafe ID")
    .replace(
      /New Tutorial, Master Hunter Quests & Mutant Animals/gi,
      "новый туториал, Мастер-охотник и мутанты"
    )
    .trim();
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

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
  const skipTranslate = process.argv.includes("--no-translate");
  const force = process.argv.includes("--force");

  const { items } = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  let meta = {};
  if (fs.existsSync(META_OUT) && !force) {
    try {
      meta = JSON.parse(fs.readFileSync(META_OUT, "utf8"));
    } catch (_) {
      meta = {};
    }
  }
  if (force) {
    // keep only manual reuse entries
    meta = {};
  }

  const list = items.slice(0, limit);
  console.log(`Building ${list.length} articles… force=${force}`);

  for (let idx = 0; idx < list.length; idx++) {
    const item = list[idx];
    const manual = MANUAL[item.slug];
    const kind = classify(item);
    const dateRu = formatDateRu(item.date);
    const steamView = `https://store.steampowered.com/news/app/513710/view/${item.gid}?l=russian`;

    console.log(`[${idx + 1}/${list.length}] ${item.slug} (${kind})`);

    if (manual && manual.reuseFile) {
      meta[item.slug] = {
        titleRu: manual.titleRu,
        summaryRu: manual.summaryRu,
        href: manual.reuseFile,
        date: item.date,
        kind,
      };
      fs.writeFileSync(META_OUT, JSON.stringify(meta, null, 2), "utf8");
      continue;
    }

    const cached = meta[item.slug];
    const enHtml = bbcodeToHtml(item.contents);
    const heroImg = firstImage(enHtml);

    let titleRu = (!force && cached && cached.titleRu) || guessTitleRu(item.title);
    let summaryRu = (!force && cached && cached.summaryRu) || "";
    let bodyHtml = (!force && cached && cached.bodyHtml) || "";

    if (!skipTranslate) {
      if (force || !cached || !cached.titleRu) {
        titleRu = await translateText(guessTitleRu(item.title));
        await sleep(80);
      }
      if (force || !summaryRu) {
        summaryRu = await translateText(plainExcerpt(enHtml, 170));
        await sleep(80);
      }
      if (force || !bodyHtml) {
        console.log(`  translating body (${enHtml.length} chars)…`);
        bodyHtml = await translateHtml(enHtml);
      }
    } else {
      bodyHtml = bodyHtml || enHtml;
      summaryRu = summaryRu || plainExcerpt(enHtml, 170);
    }

    // Final sanitize
    bodyHtml = bodyHtml
      .replace(/\[[^\]]+\]/g, "")
      .replace(/href=""([^"]+)""/g, 'href="$1"')
      .replace(/href=""+/g, 'href="');

    meta[item.slug] = {
      titleRu,
      summaryRu,
      href: `${item.slug}.html`,
      date: item.date,
      kind,
      bodyHtml,
      heroImg,
      steamUrl: steamView,
    };
    fs.writeFileSync(META_OUT, JSON.stringify(meta, null, 2), "utf8");

    const page = articleTemplate({
      titleRu,
      dateRu,
      summaryRu,
      bodyHtml,
      heroImg,
      steamUrl: steamView,
    });
    fs.writeFileSync(path.join(OUT_DIR, `${item.slug}.html`), page, "utf8");
  }

  const allCards = items
    .map((item) => {
      const m = meta[item.slug] || MANUAL[item.slug];
      if (!m) return null;
      const href = m.href || m.reuseFile || `${item.slug}.html`;
      const titleRu = m.titleRu || guessTitleRu(item.title);
      const summaryRu = m.summaryRu || "";
      return `      <a class="news-item reveal" href="${href}">
        <time datetime="${item.date}">${formatDateRu(item.date)}</time>
        <h2>${escapeHtml(titleRu)}</h2>
        <p>${escapeHtml(summaryRu)}</p>
        <span class="news-more">Читать →</span>
      </a>`;
    })
    .filter(Boolean)
    .join("\n");

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexTemplate(allCards), "utf8");
  console.log("Done. Index + pages written.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
