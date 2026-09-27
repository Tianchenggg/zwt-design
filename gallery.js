(() => {
  'use strict';

  const artworks = [
    ['spring-redrawn', '瑶池春晓', '水岸亭廊', '蓝绿色亭顶、临水平台与花木环绕的水岸景观'],
    ['spring-canopy-detail', '瑶池春晓', '一叶成亭', '青绿色亭顶与纤细立柱'],
    ['spring-water-detail', '瑶池春晓', '与水相望', '荷叶、水面倒影与临水平台'],
    ['spring-planting-detail', '瑶池春晓', '春色有层次', '粉紫、金黄与青绿植物的层次'],
    ['rust-redrawn', '锈色记忆·活力新生', '流动的轮廓', '红色曲线亭廊环抱中心花池的空间透视图'],
    ['rust-frame-detail', '锈色记忆·活力新生', '流动的轮廓 · 构筑', '曲线结构与中央圆形花池'],
    ['rust-water-detail', '锈色记忆·活力新生', '水边的日常', '沿曲线延伸的水面与步道'],
    ['rust-planting-detail', '锈色记忆·活力新生', '给生活一点暖色', '粉色与金黄色的树冠交织'],
  ];
  const dialog = document.querySelector('.art-dialog');
  const stage = dialog.querySelector('.viewer-stage');
  const image = dialog.querySelector('.viewer-image');
  const error = dialog.querySelector('.image-error');
  const zoomButton = dialog.querySelector('.zoom-button');
  let current = 0;
  let opener = null;

  function setZoom(zoomed) {
    stage.classList.toggle('is-zoomed', zoomed);
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.textContent = zoomed ? '适合屏幕 −' : '放大细看 ＋';
    stage.scrollTo(0, 0);
  }

  function renderImage() {
    const [key, series, title, alt] = artworks[current];
    dialog.querySelector('#viewer-series').textContent = series;
    dialog.querySelector('#viewer-title').textContent = title;
    dialog.querySelector('.viewer-counter').textContent = `${String(current + 1).padStart(2, '0')} / ${artworks.length}`;
    error.hidden = true;
    image.hidden = false;
    image.alt = alt;
    image.src = `assets/${key}.webp`;
    setZoom(false);
  }

  function changeImage(step) {
    current = (current + step + artworks.length) % artworks.length;
    renderImage();
  }

  document.querySelectorAll('[data-viewer]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      current = artworks.findIndex(item => item[0] === link.dataset.viewer);
      if (current < 0) return;
      opener = link;
      renderImage();
      dialog.showModal();
      document.documentElement.classList.add('gallery-open');
      dialog.querySelector('.viewer-close').focus({ preventScroll: true });
    });
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.previous-image').addEventListener('click', () => changeImage(-1));
  dialog.querySelector('.next-image').addEventListener('click', () => changeImage(1));
  zoomButton.addEventListener('click', () => setZoom(!stage.classList.contains('is-zoomed')));
  image.addEventListener('error', () => { error.hidden = false; image.hidden = true; });
  dialog.addEventListener('keydown', event => {
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

  // Native document scrolling: never replace wheel/touch events or animate scroll position.
  // Entrance effects run once; reading backwards does not hide already viewed work.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-seen');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      // Only opt in below the first viewport so direct anchor visits remain visible.
      if (element.getBoundingClientRect().top > innerHeight) {
        element.classList.add('will-reveal');
        revealObserver.observe(element);
      }
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        revealObserver.disconnect();
        document.querySelectorAll('.will-reveal').forEach(element => element.classList.add('is-seen'));
      }
    });
  }
})();
