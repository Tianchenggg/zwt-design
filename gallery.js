(() => {
  'use strict';

  const dialog = document.querySelector('.art-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') {
    document.querySelectorAll('[data-board]').forEach(button => { button.hidden = true; });
    return;
  }

  // Each entry comes from a genuinely independent drawing on its project board.
  const projects = Object.fromEntries(
    [...document.querySelectorAll('[data-project-board]')].map(board => [
      board.dataset.projectBoard,
      {
        board,
        title: board.querySelector('h4').textContent,
        drawings: [...board.querySelectorAll('[data-viewer]')].map(link => ({
          key: link.dataset.viewer,
          src: link.getAttribute('href'),
          title: link.querySelector('.panel-caption > span').childNodes[1].textContent.trim(),
          alt: link.querySelector('img').alt,
        })),
      },
    ])
  );

  const stage = dialog.querySelector('.viewer-stage');
  const image = dialog.querySelector('.viewer-image');
  const overview = dialog.querySelector('.viewer-overview');
  const error = dialog.querySelector('.image-error');
  const zoomButton = dialog.querySelector('.zoom-button');
  const boardButton = dialog.querySelector('.board-return');
  const nav = dialog.querySelector('.drawing-nav');
  const drawingTitle = dialog.querySelector('.viewer-drawing-title');
  const caption = dialog.querySelector('.viewer-caption');
  const counter = dialog.querySelector('.viewer-counter');
  let project = null;
  let current = null;
  let opener = null;

  function setZoom(zoomed) {
    stage.classList.toggle('is-zoomed', zoomed);
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = zoomed ? '适合屏幕 −' : '放大细看 ＋';
    stage.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  function render() {
    const isOverview = current === null;
    setZoom(false);
    stage.classList.toggle('overview-mode', isOverview);
    error.hidden = true;
    image.hidden = isOverview;
    overview.hidden = !isOverview;
    zoomButton.hidden = isOverview;
    boardButton.setAttribute('aria-pressed', String(isOverview));
    nav.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-current', String(index === current));
    });
    if (dialog.open && current !== null) {
      nav.children[current]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
    if (isOverview) {
      drawingTitle.textContent = '完整展板';
      caption.textContent = '选择画中的一张图纸，展开欣赏。';
      counter.textContent = '总览';
    } else {
      const drawing = project.drawings[current];
      image.alt = drawing.alt;
      image.src = drawing.src;
      drawingTitle.textContent = drawing.title;
      caption.textContent = drawing.alt;
      counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(project.drawings.length).padStart(2, '0');
    }
  }

  function select(index) {
    const focusWasInOverview = overview.contains(document.activeElement);
    current = index;
    render();
    if (focusWasInOverview) stage.focus({ preventScroll: true });
  }

  function openProject(key, index, source) {
    project = projects[key];
    if (!project) return;
    opener = source;
    current = index;
    dialog.querySelector('#viewer-title').textContent = project.title;
    const clone = project.board.cloneNode(true);
    clone.removeAttribute('data-project-board');
    clone.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    overview.replaceChildren(clone);
    nav.replaceChildren(...project.drawings.map((drawing, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'drawing-item';
      button.setAttribute('aria-label', '查看' + drawing.title);
      const thumb = document.createElement('img');
      thumb.src = drawing.src;
      thumb.alt = '';
      thumb.width = 66;
      thumb.height = 49;
      const label = document.createElement('span');
      const number = document.createElement('small');
      number.textContent = String(i + 1).padStart(2, '0');
      label.append(number, document.createTextNode(drawing.title));
      button.append(thumb, label);
      button.addEventListener('click', () => select(i));
      return button;
    }));
    render();
    document.documentElement.classList.add('gallery-open');
    dialog.showModal();
    dialog.querySelector('.viewer-close').focus({ preventScroll: true });
    if (current !== null) nav.children[current]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-viewer], [data-board]');
    if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (target.hasAttribute('data-board')) {
      event.preventDefault();
      openProject(target.dataset.board, null, target);
      return;
    }
    const key = Object.keys(projects).find(name =>
      projects[name].drawings.some(drawing => drawing.key === target.dataset.viewer)
    );
    if (!key) return;
    event.preventDefault();
    const index = projects[key].drawings.findIndex(drawing => drawing.key === target.dataset.viewer);
    if (dialog.open) select(index);
    else openProject(key, index, target);
  });

  function changeImage(step) {
    if (current === null) select(step > 0 ? 0 : project.drawings.length - 1);
    else select((current + step + project.drawings.length) % project.drawings.length);
  }

  boardButton.addEventListener('click', () => select(null));
  zoomButton.addEventListener('click', () => {
    const zoomed = !stage.classList.contains('is-zoomed');
    setZoom(zoomed);
    if (zoomed) stage.focus({ preventScroll: true });
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.previous-image').addEventListener('click', () => changeImage(-1));
  dialog.querySelector('.next-image').addEventListener('click', () => changeImage(1));
  image.addEventListener('error', () => {
    if (current === null) return;
    image.hidden = true;
    error.hidden = false;
  });
  dialog.addEventListener('keydown', event => {
    // Arrow keys pan the enlarged image when its scroll region is focused.
    if (stage.classList.contains('is-zoomed') && event.target === stage) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      changeImage(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('gallery-open');
    opener?.focus({ preventScroll: true });
  });

  // Scroll remains browser-native: no wheel interception, fade-out or scroll locking outside the dialog.
})();
