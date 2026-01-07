let currentBg = null;

async function loadBackground(name) {
  if (currentBg?.dispose) {
    currentBg.dispose();
  }

  document.querySelectorAll("canvas").forEach(c => c.remove())
  const module = await import(`./${name}.js`);
  currentBg = module;

  module.init();
}

document.querySelectorAll("button[data-bg]").forEach(btn => {
  btn.addEventListener("click", () => {
    loadBackground(btn.dataset.bg);
  });
});

loadBackground("connectedDots");
