let currentBg = null;

async function loadBackground(name) {
  if (currentBg && typeof currentBg.dispose === "function") {
    currentBg.dispose();
  }

  document.querySelectorAll("canvas").forEach(c => c.remove());

  const module = await import(`./public/backgrounds/${name}.js`);
  currentBg = module;

  module.init();
}

document.querySelectorAll("button[data-bg]").forEach(btn => {
  btn.addEventListener("click", function () {
    loadBackground(this.dataset.bg);
  });
});

const controls = document.getElementById('controls');
const toggle = document.getElementById('toggle-controls');

toggle.addEventListener('click', () => {
  controls.classList.toggle('open');
  toggle.textContent = controls.classList.contains('open') ? '<' : '>';
});

loadBackground("connectedDots");
