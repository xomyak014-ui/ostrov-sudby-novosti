(function () {
  const STATUS_API = "http://37.150.212.7:8080/api/status";
  const IP = "37.150.212.7:7790";
  const FALLBACK_MAX = 50;

  const elPlayers = document.getElementById("live-players");
  const elMax = document.getElementById("live-max");
  const elLabel = document.getElementById("live-label");
  const elDot = document.getElementById("live-dot");
  const elFeatureMax = document.getElementById("feature-max");
  const elFeatureStatus = document.getElementById("feature-status");
  const copyBtn = document.getElementById("copy-ip");

  function animateCount(el, to) {
    const from = Number(el.dataset.value || 0);
    const target = Number(to);
    if (!Number.isFinite(target)) {
      el.textContent = "—";
      return;
    }
    const start = performance.now();
    const dur = 700;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (target - from) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(frame);
      else el.dataset.value = String(target);
    }
    requestAnimationFrame(frame);
  }

  async function refreshStatus() {
    try {
      const res = await fetch(STATUS_API, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();
      const online = !!data.running;
      const players = Number(data.players || 0);
      const max = Number(data.maxPlayers || FALLBACK_MAX);

      elDot.classList.toggle("is-online", online);
      elDot.classList.toggle("is-offline", !online);
      elLabel.textContent = online ? "Сервер онлайн" : "Сервер оффлайн";
      animateCount(elPlayers, players);
      elMax.textContent = String(max);
      if (elFeatureMax) elFeatureMax.textContent = String(max);
      if (elFeatureStatus) elFeatureStatus.textContent = online ? "Онлайн" : "Оффлайн";
    } catch (err) {
      elDot.classList.remove("is-online");
      elDot.classList.add("is-offline");
      elLabel.textContent = "Статус недоступен";
      elPlayers.textContent = "—";
      if (elFeatureStatus) elFeatureStatus.textContent = "н/д";
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(IP);
        copyBtn.textContent = "Скопировано";
        setTimeout(function () {
          copyBtn.textContent = "Скопировать IP";
        }, 1600);
      } catch (e) {
        copyBtn.textContent = IP;
      }
    });
  }

  refreshStatus();
  setInterval(refreshStatus, 15000);
})();
