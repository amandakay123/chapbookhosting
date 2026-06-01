// =============================================
// POEMS LIST — add, remove, or reorder here
// =============================================
const POEMS = [
  'poems/cover.html',
  'poems/01.html',
  'poems/02.html',
  'poems/03.html',
  'poems/04.html',
  'poems/05.html',
  'poems/06.html',
  'poems/07.html',
  'poems/08.html',
  'poems/09.html',
  'poems/10.html',
  'poems/11.html',
  'poems/12.html',
  'poems/13.html',
  'poems/14.html',
  'poems/15.html',
  'poems/16.html',
  'poems/17.html',
  'poems/18.html',
  'poems/19.html',
  'poems/20.html',
  'poems/21.html',
  'poems/22.html',
  'poems/23.html',
  'poems/24.html',
  // add all 60 here...
];

// =============================================
// ENGINE — no need to edit below this line
// =============================================
const container = document.getElementById('chapbook');
const btnPrev   = document.getElementById('navPrev');
const btnNext   = document.getElementById('navNext');
const counter   = document.getElementById('pageCounter');

let pages   = [];
let current = 0;

async function loadPoems() {
  const htmls = await Promise.all(
    POEMS.map(path =>
      fetch(path).then(r => r.text()).catch(() => `<article class="page poem"><div class="page-inner"><p>Could not load ${path}</p></div></article>`)
    )
  );

  container.innerHTML = htmls.join('\n');
  pages = Array.from(container.querySelectorAll('.page'));

  // Apply per-poem data attributes
  pages.forEach(page => {
    if (page.dataset.bg)    page.style.background = page.dataset.bg;
    if (page.dataset.color) page.style.color       = page.dataset.color;

    const body = page.querySelector('.poem-body');
    if (body) {
      if (page.dataset.spacing) body.style.lineHeight = page.dataset.spacing;
      if (page.dataset.size)    body.style.fontSize   = page.dataset.size;
    }

    const inner = page.querySelector('.page-inner');
    if (inner && page.dataset.align) inner.style.textAlign = page.dataset.align;
  });

  // Stagger line transition delays
  pages.forEach(page => {
    if (page.dataset.customDelay) return; // skip if poem manages its own delays
    page.querySelectorAll('.stanza').forEach(stanza => {
      stanza.querySelectorAll('.line').forEach((line, i) => {
        line.style.transitionDelay = `${0.2 + i * 0.11}s`;
      });
    });
  });

  goTo(0);
}

function animateIn(page) {
  // Animate header
  const header = page.querySelector('.poem-header');
  if (header) {
    header.style.transitionDelay = '0s';
    requestAnimationFrame(() => header.classList.add('visible'));
  }

  // Animate lines
  page.querySelectorAll('.line').forEach(line => {
    requestAnimationFrame(() => line.classList.add('visible'));
  });

  // Animate colophon
  const colophon = page.querySelector('.colophon-inner');
  if (colophon) {
    requestAnimationFrame(() => colophon.classList.add('visible'));
  }
}

function animateOut(page) {
  const header = page.querySelector('.poem-header');
  if (header) header.classList.remove('visible');

  page.querySelectorAll('.line').forEach(line => line.classList.remove('visible'));

  const colophon = page.querySelector('.colophon-inner');
  if (colophon) colophon.classList.remove('visible');
}

function goTo(index) {
  if (pages[current]) {
    pages[current].classList.remove('active');
    animateOut(pages[current]);
  }

  current = Math.max(0, Math.min(index, pages.length - 1));
  pages[current].classList.add('active');

  // Small delay so display:flex has painted before transitions fire
  setTimeout(() => animateIn(pages[current]), 20);

  btnPrev.classList.toggle('hidden', current === 0);
  btnNext.classList.toggle('hidden', current === pages.length - 1);
  counter.textContent = `${current + 1} / ${pages.length}`;

  const col = pages[current].dataset.color || getComputedStyle(document.documentElement).getPropertyValue('--color-muted-light').trim();
  btnPrev.style.color = col;
  btnNext.style.color = col;
  counter.style.color = col;
}

btnPrev.addEventListener('click', () => goTo(current - 1));
btnNext.addEventListener('click', () => goTo(current + 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
});

['left', 'right'].forEach(side => {
  const zone = document.createElement('div');
  zone.className = `tap-zone tap-zone-${side}`;
  zone.addEventListener('click', () => side === 'left' ? goTo(current - 1) : goTo(current + 1));
  document.body.appendChild(zone);
});

let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) dx < 0 ? goTo(current + 1) : goTo(current - 1);
}, { passive: true });

loadPoems();