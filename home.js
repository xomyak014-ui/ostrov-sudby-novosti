(function () {
  const IP = "37.150.212.7:7790";
  const box = document.getElementById("copy-ip");
  const hint = document.getElementById("copy-hint");

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
})();
