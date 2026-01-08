let currentBg = null;

async function loadBackground(name) {
  if (currentBg && typeof currentBg.dispose === "function") {
    currentBg.dispose();
  }

  document.querySelectorAll("canvas").forEach(c => c.remove());

  const module = await import(`./${name}.js`);
  currentBg = module;

  module.init();
}

document.querySelectorAll("button[data-bg]").forEach(btn => {
  btn.addEventListener("click", function () {
    loadBackground(this.dataset.bg);
  });
});

loadBackground("connectedDots");
