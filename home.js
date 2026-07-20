(function () {
  const IP = "37.150.212.7:7790";
  const copyBtn = document.getElementById("copy-ip");

  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      try {
        await navigator.clipboard.writeText(IP);
        copyBtn.textContent = "Скопировано";
        copyBtn.classList.add("is-copied");
        setTimeout(function () {
          copyBtn.textContent = "Скопировать IP";
          copyBtn.classList.remove("is-copied");
        }, 1600);
      } catch (e) {
        copyBtn.textContent = IP;
      }
    });
  }
})();
