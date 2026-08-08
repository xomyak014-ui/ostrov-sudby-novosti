(function () {
  const elPlayers = document.getElementById("bm-players");
  const elMax = document.getElementById("bm-max");
  const elDot = document.getElementById("bm-dot");
  const elLive = document.getElementById("live-online");
  const copyIp = document.getElementById("copy-ip");
  const copyHint = copyIp ? copyIp.querySelector("[data-copy-hint]") : null;
  const IP = "37.150.212.7:7790";

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

  async function copyAddress() {
    if (!copyIp) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(IP);
      } else {
        const ta = document.createElement("textarea");
        ta.value = IP;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      copyIp.classList.add("is-copied");
      if (copyHint) copyHint.textContent = "Скопировано";
      setTimeout(function () {
        copyIp.classList.remove("is-copied");
        if (copyHint) copyHint.textContent = "Нажми, чтобы скопировать";
      }, 1600);
    } catch (e) {
      if (copyHint) copyHint.textContent = "Выдели IP вручную";
    }
  }

  if (copyIp) {
    copyIp.addEventListener("click", copyAddress);
    copyIp.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        copyAddress();
      }
    });
  }

  refresh();
  setInterval(refresh, 15000);
})();
