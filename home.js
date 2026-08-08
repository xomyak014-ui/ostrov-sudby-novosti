(function () {
  const elPlayers = document.getElementById("bm-players");
  const elMax = document.getElementById("bm-max");
  const elDot = document.getElementById("bm-dot");
  const elLive = document.getElementById("live-online");
  const elLabel = document.getElementById("bm-label");
  const elUpdated = document.getElementById("bm-updated");
  const copyIp = document.getElementById("copy-ip");
  const copyHint = copyIp ? copyIp.querySelector("[data-copy-hint]") : null;
  const IP = "37.150.212.7:7790";
  const DEFAULT_MAX = 30;
  const STALE_MS = 6 * 60 * 60 * 1000;

  function setOffline() {
    if (elDot) elDot.className = "status-dot is-offline";
    if (elLive) {
      elLive.classList.add("is-offline");
      elLive.classList.remove("is-online");
    }
    if (elLabel) elLabel.textContent = "Сервер оффлайн";
  }

  function setOnline() {
    if (elDot) elDot.className = "status-dot is-online";
    if (elLive) {
      elLive.classList.add("is-online");
      elLive.classList.remove("is-offline");
    }
    if (elLabel) elLabel.textContent = "Онлайн сейчас";
  }

  function setUnknown() {
    setOffline();
    if (elLabel) elLabel.textContent = "Статус недоступен";
    if (elPlayers) elPlayers.textContent = "—";
    if (elMax) elMax.textContent = String(DEFAULT_MAX);
  }

  function formatUpdated(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    try {
      return (
        "обновлено " +
        d.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (e) {
      return "";
    }
  }

  function applyStatus(data) {
    if (!data || typeof data !== "object") {
      setUnknown();
      return;
    }
    const updatedAt = data.updatedAt ? Date.parse(data.updatedAt) : NaN;
    if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > STALE_MS) {
      setUnknown();
      if (elUpdated) elUpdated.textContent = "данные устарели";
      return;
    }

    const players = Number(data.players);
    const max = Number(data.maxPlayers) || DEFAULT_MAX;
    const online = data.running === true || data.online === true || data.status === "online";

    if (online) setOnline();
    else setOffline();

    if (elPlayers) elPlayers.textContent = Number.isFinite(players) ? String(Math.max(0, players)) : "—";
    if (elMax) elMax.textContent = String(max);
    if (elUpdated) elUpdated.textContent = formatUpdated(data.updatedAt);
  }

  async function refresh() {
    try {
      const url = new URL("status.json", window.location.href);
      url.searchParams.set("t", String(Date.now()));
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      applyStatus(await res.json());
    } catch (e) {
      setUnknown();
      if (elUpdated) elUpdated.textContent = "";
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
