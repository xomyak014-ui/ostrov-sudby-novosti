(function () {
  const elPlayers = document.getElementById("bm-players");
  const elMax = document.getElementById("bm-max");
  const elDot = document.getElementById("bm-dot");
  const elLive = document.getElementById("live-online");

  function applyStatus(data) {
    if (!data || typeof data !== "object") return;
    const online = !!data.running;
    const players = Number(data.players);
    const max = Number(data.maxPlayers) || 50;

    if (elDot) {
      elDot.className = "status-dot " + (online ? "is-online" : "is-offline");
    }
    if (elLive) {
      elLive.classList.toggle("is-online", online);
      elLive.classList.toggle("is-offline", !online);
    }
    if (elPlayers) {
      elPlayers.textContent = Number.isFinite(players) ? String(players) : "—";
    }
    if (elMax) {
      elMax.textContent = String(max);
    }
  }

  async function refresh() {
    try {
      const url = new URL("status.json", window.location.href);
      url.searchParams.set("t", String(Date.now()));
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("status " + res.status);
      const data = await res.json();
      applyStatus(data);
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
  setInterval(refresh, 15000);
})();
