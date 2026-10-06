const diagram = document.querySelector('.diagram');
const svg = document.querySelector('.connections');
const preview = document.querySelector('.preview');
const cards = document.querySelector('.cards');
const positions = {
  'reading form': [50, 8],
  'reading by making': [50, 31],
  'reading by rebuilding': [50, 54],
  'open-source': [50, 79],
  typography: [24, 17], grid: [48, 17], layout: [73, 17],
  shapes: [35, 24], symbols: [63, 24],
  teaching: [25, 40], making: [50, 40], experimentation: [75, 40],
  architecture: [25, 47], ink: [50, 47], tape: [75, 47],
  code: [24, 63], web: [49, 63], play: [75, 63], music: [38, 70],
  'open source': [24, 88], tools: [49, 88], publishing: [75, 88]
};
let selected = null;
let related = [];
const nodes = new Map();

function highlight(works) {
  const terms = new Set(works.flatMap(work => [...work.groups, ...work.terms]));
  svg.replaceChildren();
  nodes.forEach((node, term) => {
    node.classList.toggle('active', terms.has(term));
    node.classList.toggle('dim', !!selected && !terms.has(term));
  });
  if (!selected) return;
  terms.forEach(term => {
    if (term === selected) return;
    const from = positions[selected];
    const to = positions[term];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${from[0]}%`);
    line.setAttribute('y1', `${from[1]}%`);
    line.setAttribute('x2', `${to[0]}%`);
    line.setAttribute('y2', `${to[1]}%`);
    svg.append(line);
  });
}

function closePreview() {
  selected = null;
  preview.hidden = true;
  highlight([]);
}

function placeNodes() {
  const narrow = window.matchMedia('(max-width: 800px)').matches;
  const graphWidth = narrow ? diagram.clientWidth : diagram.clientWidth - 460;
  const graphHeight = narrow ? 580 : 720;
  nodes.forEach((node, term) => {
    const [x, y] = positions[term];
    node.style.left = `${graphWidth * x / 100}px`;
    node.style.top = `${graphHeight * y / 100}px`;
  });
}

function openWord(term) {
  selected = term;
  related = archiveWorks.filter(work => work.groups.includes(term) || work.terms.includes(term));
  cards.replaceChildren();
  preview.querySelector('.preview-heading span').textContent = term;
  related.forEach(work => {
    const link = document.createElement('a');
    link.className = 'card';
    link.href = work.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (work.image) {
      const image = document.createElement('img');
      image.src = work.image;
      image.alt = work.title;
      link.append(image);
    } else {
      const cover = document.createElement('span');
      cover.className = 'text-image';
      cover.textContent = 'OpenProcessing ↗';
      link.append(cover);
    }
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = work.title;
    link.append(title);
    const keywords = document.createElement('span');
    keywords.className = 'card-terms';
    keywords.textContent = work.terms.join(' / ');
    link.append(keywords);
    link.addEventListener('pointerenter', () => highlight([work]));
    link.addEventListener('focus', () => highlight([work]));
    link.addEventListener('pointerleave', () => highlight(related));
    link.addEventListener('blur', () => highlight(related));
    cards.append(link);
  });
  preview.hidden = false;
  highlight(related);
  placeNodes();
}

Object.entries(positions).forEach(([term, [x, y]]) => {
  const node = document.createElement('button');
  node.className = 'word';
  if (!archiveWorks.some(work => work.groups.includes(term))) node.classList.add('keyword');
  node.textContent = archiveWorks.some(work => work.groups.includes(term)) ? `[${term}]` : term;
  node.style.left = `${x}%`;
  node.style.top = `${y}%`;
  node.addEventListener('pointerenter', () => openWord(term));
  node.addEventListener('focus', () => openWord(term));
  node.addEventListener('click', () => openWord(term));
  nodes.set(term, node);
  diagram.append(node);
});
preview.querySelector('button').addEventListener('click', closePreview);
diagram.addEventListener('pointerleave', closePreview);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closePreview(); });
window.addEventListener('resize', placeNodes);
placeNodes();
document.getElementById('title').addEventListener('click', event => {
  const button = event.currentTarget;
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  document.getElementById('introduction').hidden = expanded;
});
