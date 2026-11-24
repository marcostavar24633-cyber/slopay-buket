(() => {
  const data = window.SB_DATA;
  const main = document.querySelector('#main');
  if (!data?.page || !main) return;
  const preview = /\/editor-preview(?:\.html)?$/.test(location.pathname) && window.parent !== window && new URLSearchParams(location.search).get('edit') === '1';
  const ids = { hits: 'hits', catalog: 'catalog', occasions: 'occasions', why: 'why', howto: 'how', process: 'maria', reviews: 'reviews', corporate: 'corporate', delivery: 'delivery', faq: 'faq' };
  const builtins = new Map(Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]));
  const slots = [...builtins.values()].map((section) => {
    const slot = document.createComment('storefront block');
    section.before(slot);
    return slot;
  });
  const end = document.createComment('end of editable storefront blocks');
  slots.at(-1).after(end);
  const hero = document.querySelector('#top');
  const heroTitle = hero.querySelector('h1');
  const originalHero = [...heroTitle.childNodes].map((node) => node.cloneNode(true));
  const initial = new WeakMap();
  const custom = new Set();
  const post = (message) => window.parent.postMessage(message, location.origin);
  let previousPage;
  let previousHero;
  let selected;
  let interactive = false;

  function el(tag, text, cls) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }

  function textOverride(node, value) {
    if (!node) return;
    if (!initial.has(node)) initial.set(node, [...node.childNodes].map((child) => child.cloneNode(true)));
    if (value?.trim()) node.textContent = value;
    else node.replaceChildren(...initial.get(node).map((child) => child.cloneNode(true)));
  }

  function subtitle(section, value) {
    let node = section.querySelector('.section__lead');
    if (!node && value?.trim()) {
      node = el('p', '', 'section__lead');
      node.dataset.editorSubtitle = '';
      section.querySelector('h2')?.after(node);
    }
    if (node?.hasAttribute('data-editor-subtitle') && !value?.trim()) node.remove();
    else textOverride(node, value);
  }

  function photo(source, alt) {
    if (!source) return null;
    let url;
    try { url = new URL(source, location.href); } catch { return null; }
    if (url.protocol !== 'https:' && url.origin !== location.origin && !(preview && url.protocol === 'blob:')) return null;
    const image = el('img');
    image.src = url.href;
    image.alt = alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    return image;
  }

  function customBlock(block) {
    const section = el('section', '', `section storefront-custom storefront-custom--${block.type}`);
    const wrap = el('div', '', 'container');
    const copy = el('div', '', block.center ? 'storefront-custom__center' : 'storefront-custom__copy');
    if (block.eyebrow) copy.append(el('p', block.eyebrow, 'eyebrow'));
    copy.append(el('h2', block.title || '', 'h2'));
    if (block.body) copy.append(el('p', block.body, 'section__lead storefront-custom__body'));
    if (block.cta === 'catalog' || block.cta === 'quiz') {
      const action = el(block.cta === 'quiz' ? 'button' : 'a', block.cta === 'quiz' ? 'Подобрать букет' : 'Смотреть каталог', 'btn btn--primary');
      if (block.cta === 'quiz') { action.type = 'button'; action.dataset.open = 'quiz'; }
      else action.href = '#catalog';
      copy.append(action);
    } else if (block.cta === 'messengers') {
      const phone = String(data.site.phone || '').replace(/\D/g, '').replace(/^8(?=\d{10}$)/, '7');
      if (/^7\d{10}$/.test(phone)) {
        const contact = el('a', 'Написать в Telegram', 'btn btn--primary');
        contact.href = `https://t.me/+${phone}`;
        contact.target = '_blank';
        contact.rel = 'noopener';
        copy.append(contact);
      }
      const max = /^https:\/\/max\.ru\//.test(data.site.maxUrl || '') && el('a', 'Написать в MAX', 'btn btn--ghost');
      if (max) { max.href = data.site.maxUrl; max.target = '_blank'; max.rel = 'noopener'; copy.append(max); }
    }
    const image = photo(block.image, block.title);
    if (image && !block.imageRight) wrap.append(image);
    wrap.append(copy);
    if (image && block.imageRight) wrap.append(image);
    const grid = el('div', '', 'storefront-custom__grid');
    for (const item of block.images || []) {
      const picture = photo(item.image, item.caption);
      if (!picture) continue;
      const figure = el('figure');
      figure.append(picture);
      if (item.caption) figure.append(el('figcaption', item.caption));
      grid.append(figure);
    }
    for (const item of block.cards || []) {
      const card = el('article', '', 'storefront-custom__card');
      card.append(el('h3', [item.icon, item.title].filter(Boolean).join(' ')), el('p', item.text));
      grid.append(card);
    }
    section.append(wrap);
    if (grid.childElementCount) {
      const gallery = el('div', '', 'container');
      gallery.append(grid);
      section.append(gallery);
    }
    return section;
  }

  const color = (value) => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '';
  const pixels = (value) => typeof value === 'number' && Number.isFinite(value) ? `${Math.max(0, Math.min(value, 400))}px` : '';
  function styles(section, style = {}) {
    section.style.backgroundColor = color(style.bg);
    section.style.setProperty('--cream', color(style.text));
    section.style.setProperty('--gold', color(style.accent));
    section.style.setProperty('--gold-2', color(style.accent));
    section.style.setProperty('--muted', color(style.text));
    section.style.paddingTop = pixels(style.padTop);
    section.style.paddingBottom = pixels(style.padBottom);
    section.dataset.editorWidth = ['narrow', 'wide'].includes(style.width) ? style.width : '';
    const titleSize = style.titleSize ? pixels(style.titleSize) : '';
    section.toggleAttribute('data-editor-title', !!titleSize);
    section.style.setProperty('--editor-title-size', titleSize);
  }

  function apply(page, firstScreen, theme = {}) {
    const pageKey = JSON.stringify(page);
    if (pageKey !== previousPage) {
      previousPage = pageKey;
      custom.forEach((node) => node.remove());
      custom.clear();
      const placed = new Set();
      let position = 0;
      page.forEach((block, index) => {
        const builtin = block.type === 'builtin';
        const section = builtin ? builtins.get(block.section) : customBlock(block);
        if (!section || placed.has(section)) return;
        if (!builtin) custom.add(section);
        else {
          textOverride(section.querySelector('.eyebrow'), block.eyebrow);
          textOverride(section.querySelector('h2'), block.title);
          subtitle(section, block.sub);
        }
        placed.add(section);
        const placeholder = !builtin && block.title === 'Новый блок — кликните, чтобы изменить' && !block.body && !block.image;
        section.hidden = block.show === false || (!preview && placeholder);
        section.dataset.bi = String(index);
        styles(section, block.style);
        const slot = slots[position];
        if (slot) slot.before(section); else end.before(section);
        if (builtin) position++;
      });
      for (const section of builtins.values()) {
        if (!placed.has(section)) { section.hidden = true; delete section.dataset.bi; }
      }
      window.ScrollTrigger?.refresh();
    }
    const heroKey = JSON.stringify(firstScreen);
    if (firstScreen && heroKey !== previousHero) {
      previousHero = heroKey;
      if (firstScreen.title === data.hero.title && firstScreen.titleAccent === data.hero.titleAccent) heroTitle.replaceChildren(...originalHero.map((node) => node.cloneNode(true)));
      else {
        heroTitle.replaceChildren(el('span', firstScreen.title));
        if (firstScreen.titleAccent) heroTitle.append(document.createTextNode(' '), el('em', firstScreen.titleAccent, 'gold'));
      }
      hero.querySelector('.hero__lead').textContent = firstScreen.subtitle;
      const label = hero.querySelector('.hero__cta .btn--primary').firstChild;
      label.textContent = firstScreen.quizButton;
      if (preview) {
        const picture = hero.querySelector('.hero__frame img');
        const defaults = ['src', 'srcset', 'sizes'];
        if (!initial.has(picture)) initial.set(picture, defaults.map((name) => picture.getAttribute(name)));
        const source = firstScreen.photoProduct !== data.hero.photoProduct && firstScreen.photoUrl;
        if (source) {
          picture.removeAttribute('srcset');
          picture.removeAttribute('sizes');
          picture.src = source;
        } else defaults.forEach((name, index) => {
          const original = initial.get(picture)[index];
          if (original === null) picture.removeAttribute(name); else picture.setAttribute(name, original);
        });
      }
    }
    for (const [field, variables] of Object.entries({ accent: ['--gold', '--gold-2'], bg: ['--bg'], surface: ['--bg-2', '--bg-3'], text: ['--cream', '--muted'] })) {
      variables.forEach((variable) => document.documentElement.style.setProperty(variable, color(theme[field])));
    }
    if (preview) {
      main.querySelectorAll('[data-bi]').forEach((node) => node.classList.toggle('editor-selected', !interactive && node.dataset.bi === String(selected)));
      document.documentElement.classList.toggle('storefront-editor', !interactive);
    }
  }

  hero.dataset.bi = 'hero';
  apply(data.page.blocks, data.hero, data.site.theme);
  if (!preview) return;
  document.querySelector('.cookie-consent').remove();
  const indexOf = (node) => node.dataset.bi === 'hero' ? 'hero' : Number(node.dataset.bi);
  let dragged = null;
  const handle = el('button', 'Перетащить блок', 'editor-drag');
  handle.type = 'button';
  handle.draggable = true;
  handle.addEventListener('dragstart', (event) => {
    dragged = indexOf(handle.parentElement);
    event.dataTransfer.setData('text/plain', String(dragged));
    event.dataTransfer.effectAllowed = 'move';
  });
  handle.addEventListener('dragend', () => { dragged = null; });
  main.addEventListener('dragover', (event) => {
    if (dragged !== null && event.target.closest('[data-bi]:not(#top)')) event.preventDefault();
  });
  main.addEventListener('drop', (event) => {
    const target = event.target.closest('[data-bi]:not(#top)');
    if (dragged === null || !target) return;
    event.preventDefault();
    const bounds = target.getBoundingClientRect();
    const to = indexOf(target) + (event.clientY > bounds.top + bounds.height / 2 ? 1 : 0);
    if (to !== dragged && to !== dragged + 1) post({ type: 'slopay:move', from: dragged, to });
    dragged = null;
  });
  document.addEventListener('click', (event) => {
    const external = event.target.closest('a[href]');
    if (interactive && ((external && external.origin !== location.origin) || event.target.closest('[data-send], #send-tg, #send-max, #quiz-max'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const node = event.target.closest('[data-bi]');
    if (!node || interactive || event.target.closest('[contenteditable]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    post({ type: 'slopay:select', index: indexOf(node) });
  }, true);
  document.addEventListener('submit', (event) => { event.preventDefault(); event.stopImmediatePropagation(); }, true);
  document.addEventListener('dblclick', (event) => {
    if (interactive) return;
    const target = event.target.closest('h2, .hero__lead');
    const section = target?.closest('[data-bi]');
    if (!section) return;
    const index = indexOf(section);
    const original = target.textContent;
    target.contentEditable = 'plaintext-only';
    target.focus();
    target.onkeydown = (key) => {
      if (key.key === 'Enter' || key.key === 'Escape') { key.preventDefault(); if (key.key === 'Escape') target.textContent = original; target.blur(); }
    };
    target.onblur = () => {
      target.removeAttribute('contenteditable');
      target.onkeydown = null;
      target.onblur = null;
      if (target.textContent !== original) post({ type: 'slopay:text', index, field: index === 'hero' ? 'subtitle' : 'title', value: target.textContent.trim() });
    };
  });
  addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    const message = event.data;
    if (message?.type === 'slopay:live' && Array.isArray(message.page)) {
      selected = message.selected;
      interactive = !!message.interactive;
      apply(message.page, message.hero, message.theme);
      const active = main.querySelector('.editor-selected:not(#top)');
      if (active) active.append(handle); else handle.remove();
    } else if (message?.type === 'slopay:scroll' && Number.isFinite(message.y)) scrollTo(0, message.y);
  });
  addEventListener('scroll', () => post({ type: 'slopay:scrollpos', y: scrollY }), { passive: true });
  post({ type: 'slopay:ready' });
})();
