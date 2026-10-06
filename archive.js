const diagram = document.querySelector('.diagram');
const svg = document.querySelector('.connections');
const preview = document.querySelector('.preview');
const cards = document.querySelector('.cards');
const positions = {
  'reading form': [50, 8],
  type: [24, 17], grid: [50, 17], layout: [76, 17],
  form: [24, 24], action: [50, 24], archive: [76, 24],
  'reading by making': [50, 31],
  learning: [24, 40], making: [50, 40], experiment: [76, 40],
  structure: [24, 47], material: [50, 47], play: [76, 47],
  'reading by rebuilding': [50, 54],
  code: [24, 63], web: [50, 63], history: [76, 63],
  rebuild: [35, 71], rewrite: [65, 71],
  'open-source': [50, 79],
  tools: [24, 87], publishing: [50, 87], practice: [76, 87],
  access: [24, 94], authorship: [50, 94], collaboration: [76, 94]
};
const perspectives = {
  history: { group: 'reading by rebuilding', question: 'What can rebuilding reveal about the tools, conventions, and constraints of a design’s historical context?' },
  rebuild: { group: 'reading by rebuilding', question: 'What must be recovered to reconstruct a design, and what remains uncertain?' },
  rewrite: { group: 'reading by rebuilding', question: 'How does a design change when its rules, medium, or position are rewritten today?', connects: ['authorship'] },
  access: { group: 'open-source', question: 'Who can see, understand, use, and modify the design’s source?' },
  authorship: { group: 'open-source', question: 'How is authorship shared between the original designer, tool makers, and people who modify the work?', connects: ['rewrite'] },
  collaboration: { group: 'open-source', question: 'How do multiple contributors shape the design and its decisions?' },
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
  placeNodes();
}

function placeNodes() {
  const narrow = window.matchMedia('(max-width: 800px)').matches;
  const graphWidth = narrow ? diagram.clientWidth : diagram.clientWidth - 460;
  const graphHeight = 780;
  svg.style.height = `${graphHeight}px`;
  const previewTop = narrow ? 820 : 30;
  diagram.style.height = `${Math.max(narrow ? 1200 : graphHeight, preview.hidden ? 0 : previewTop + preview.offsetHeight + 24)}px`;
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
  if (perspectives[term]) {
    const perspective = perspectives[term];
    const question = document.createElement('p');
    question.className = 'perspective-question';
    question.textContent = perspective.question;
    cards.append(question);
    preview.hidden = false;
    if (!related.length) {
      highlight([{ groups: [perspective.group], terms: [term, ...(perspective.connects || [])] }]);
      placeNodes();
      return;
    }
  }
  related.forEach(work => {
    const link = document.createElement('a');
    link.className = work.own ? 'card own-work' : 'card';
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
      cover.textContent = `${work.title} ↗`;
      link.append(cover);
    }
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = work.own ? `**${work.title}**` : work.title;
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
  node.textContent = archiveWorks.some(work => work.groups.includes(term)) ? `[${term}]` : perspectives[term] ? `${term}?` : term;
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
window.addEventListener('resize', () => {
  placeNodes();
  if (selected) highlight(related.length ? related : [{ groups: [perspectives[selected].group], terms: [selected, ...(perspectives[selected].connects || [])] }]);
});
placeNodes();
new ResizeObserver(placeNodes).observe(preview);
document.getElementById('title').addEventListener('click', event => {
  const button = event.currentTarget;
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  document.getElementById('introduction').hidden = expanded;
});
