const fs = require("fs");
const path = require("path");

const src =
  process.argv[2] ||
  "C:/Users/Олег/.cursor/projects/c-Users-Desktop-Ostrov-Sudby-Novosti/agent-tools/14b5ac0c-a169-4cba-a451-36af2ce58227.txt";
const outDir = path.join(__dirname, "..", "news", "_source");
fs.mkdirSync(outDir, { recursive: true });

const data = JSON.parse(fs.readFileSync(src, "utf8"));
const cutoff = Date.UTC(2026, 0, 1) / 1000;
const used = new Set();

function slugify(title, date) {
  let s = title
    .toLowerCase()
    .replace(/scum\s*[:|-]?\s*/g, "")
    .replace(/into the wild/g, "into-the-wild")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 55);
  if (!s) s = "news";
  if (/showcase/.test(s)) s = "community-showcase-" + date;
  if (used.has(s)) s = s + "-" + date;
  used.add(s);
  return s;
}

const items = data.appnews.newsitems
  .filter((n) => n.date >= cutoff && (n.feedlabel || "") === "Community Announcements")
  .sort((a, b) => b.date - a.date)
  .map((n) => {
    const date = new Date(n.date * 1000).toISOString().slice(0, 10);
    return {
      gid: String(n.gid),
      date,
      dateUnix: n.date,
      title: n.title.trim(),
      url: n.url,
      slug: slugify(n.title.trim(), date),
      contents: n.contents || "",
    };
  });

fs.writeFileSync(path.join(outDir, "steam-2026.json"), JSON.stringify({ items }, null, 2), "utf8");
const man = items
  .map((i) => `${i.date}|${i.gid}|${i.slug}|${i.contents.length}|${i.title}`)
  .join("\n");
fs.writeFileSync(path.join(outDir, "manifest.txt"), man, "utf8");
console.log("count", items.length);
console.log(man);
