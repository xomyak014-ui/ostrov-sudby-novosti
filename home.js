(function () {
  const IP = "37.150.212.7:7790";
  const BM_ID = "39271967";
  const BM_URL = "https://api.battlemetrics.com/servers/" + BM_ID;

  const box = document.getElementById("copy-ip");
  const hint = document.getElementById("copy-hint");
  const elPlayers = document.getElementById("bm-players");
  const elMax = document.getElementById("bm-max");
  const elRank = document.getElementById("bm-rank");
  const elLabel = document.getElementById("bm-label");
  const elDot = document.getElementById("bm-dot");
  const elPill = document.getElementById("bm-pill");
  const elBar = document.getElementById("bm-bar");
  const elName = document.getElementById("bm-name");
  const elCard = document.getElementById("bm-status");

  async function copyIp() {
    try {
      await navigator.clipboard.writeText(IP);
      if (hint) hint.textContent = "Скопировано";
      if (box) box.classList.add("is-copied");
      setTimeout(function () {
        if (hint) hint.textContent = "Скопировать";
        if (box) box.classList.remove("is-copied");
      }, 1600);
    } catch (e) {
      if (hint) hint.textContent = IP;
    }
  }

  if (box) {
    box.addEventListener("click", copyIp);
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyIp();
      }
    });
  }

  function setOffline(msg) {
    if (elCard) elCard.classList.add("is-offline");
    if (elCard) elCard.classList.remove("is-online");
    if (elDot) elDot.className = "status-dot is-offline";
    if (elPill) elPill.classList.add("is-offline");
    if (elLabel) elLabel.textContent = msg || "Нет данных";
    if (elPlayers) elPlayers.textContent = "—";
    if (elMax) elMax.textContent = "—";
    if (elRank) elRank.textContent = "—";
    if (elBar) elBar.style.width = "0%";
  }

  function animateNumber(el, to) {
    if (!el) return;
    const from = Number(el.dataset.value || 0);
    const target = Number(to);
    if (!Number.isFinite(target)) {
      el.textContent = "—";
      return;
    }
    const start = performance.now();
    const dur = 650;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(frame);
      else el.dataset.value = String(target);
    }
    requestAnimationFrame(frame);
  }

  async function refreshBm() {
    if (!elPlayers) return;
    try {
      const res = await fetch(BM_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const json = await res.json();
      const a = (json.data && json.data.attributes) || {};
      const online = String(a.status || "").toLowerCase() === "online";
      const players = Number(a.players || 0);
      const max = Number(a.maxPlayers || 0) || 50;
      const rank = a.rank != null ? Number(a.rank) : null;
      const pct = max > 0 ? Math.min(100, Math.round((players / max) * 100)) : 0;

      if (elCard) {
        elCard.classList.toggle("is-online", online);
        elCard.classList.toggle("is-offline", !online);
      }
      if (elDot) elDot.className = "status-dot " + (online ? "is-online" : "is-offline");
      if (elPill) elPill.classList.toggle("is-offline", !online);
      if (elLabel) elLabel.textContent = online ? "Онлайн" : "Оффлайн";
      animateNumber(elPlayers, players);
      if (elMax) elMax.textContent = String(max);
      if (elRank) elRank.textContent = rank != null ? "#" + rank : "—";
      if (elBar) elBar.style.width = pct + "%";
      if (elName && a.name) elName.textContent = a.name;
    } catch (err) {
      setOffline("Статус позже");
    }
  }

  refreshBm();
  setInterval(refreshBm, 60000);
})();
