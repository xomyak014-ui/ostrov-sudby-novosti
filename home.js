(function () {
  const BM_URL = "https://api.battlemetrics.com/servers/39271967";

  const elPlayers = document.getElementById("bm-players");
  const elMax = document.getElementById("bm-max");
  const elDot = document.getElementById("bm-dot");
  const elLive = document.getElementById("live-online");

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

  async function refresh() {
    try {
      const res = await fetch(BM_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const json = await res.json();
      const a = (json.data && json.data.attributes) || {};
      const online = String(a.status || "").toLowerCase() === "online";
      const players = Number(a.players || 0);
      const max = Number(a.maxPlayers || 0) || 50;

      if (elDot) elDot.className = "status-dot " + (online ? "is-online" : "is-offline");
      if (elLive) {
        elLive.classList.toggle("is-online", online);
        elLive.classList.toggle("is-offline", !online);
      }
      animateNumber(elPlayers, players);
      if (elMax) elMax.textContent = String(max);
    } catch (e) {
      if (elPlayers) elPlayers.textContent = "—";
      if (elMax) elMax.textContent = "—";
      if (elDot) elDot.className = "status-dot is-offline";
      if (elLive) {
        elLive.classList.add("is-offline");
        elLive.classList.remove("is-online");
      }
    }
  }

  refresh();
  setInterval(refresh, 60000);
})();
