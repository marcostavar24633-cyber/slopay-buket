/* =========================================================
   «Слопай букет» — интерактив и анимации
   Все фишки включаются/выключаются в FEATURES ниже.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- ФИШКИ: true — включено, false — выключено ---------- */
  const FEATURES = {
    preloader: true,        // золотая прорисовка логотипа + шторка (полный показ — раз за сессию)
    smoothScroll: true,     // Lenis
    seasonBar: true,        // плашка с отсчётом до 5 декабря
    headerAutoHide: true,   // шапка прячется при скролле вниз
    splitHeadings: true,    // заголовки выезжают из-под маски
    imageReveal: true,      // фото раскрываются шторкой (clip-path) с зумом
    heroParallax: true,     // слои ягод/роз/листьев реагируют на курсор
    floaters: true,         // плавающие ягоды и лепестки при скролле
    marqueeVelocity: true,  // скорость бегущей строки зависит от скорости скролла
    cursor: true,           // кастомный курсор («Смотреть», «Тяни», сердечко)
    magnetic: true,         // магнитные кнопки
    tilt: true,             // 3D-наклон карточек за курсором
    flyToCart: true,        // миниатюра летит в корзину
    flipFilter: true,       // плавная перестановка карточек при фильтрации (GSAP Flip)
    timelineDraw: true,     // линия «Как это работает» прорисовывается при скролле
    stackCards: true,       // карточки гарантий накладываются друг на друга
    confetti: true,         // конфетти после отправки заявки
    status: true,           // «Сейчас на связи» по времени Ульяновска
  };

  /* ---------- Константы бизнеса ---------- */
  const D = window.SB_DATA || { items: [], reviews: [], site: {} };
  const SITE = D.site;
  const CONFIG = {
    phoneDigits: '79631282556',
    maxUrl: SITE.maxUrl || 'https://max.ru/',
    avitoUrl: SITE.reviewsUrl || 'https://www.avito.ru/',
    siteUrl: 'https://xn--80acmogcvipsi.xn--p1ai/',
    photoBase: 'https://xn--80acmogcvipsi.xn--p1ai/tg/', // публичные JPG — Telegram покажет превью
    freeDeliveryFrom: 8000,
    corpDeadline: { month: 12, day: 5 },  // 5 декабря
    seasonFrom: { month: 10, day: 15 },   // плашку показываем с 15 октября
    tz: 'Europe/Ulyanovsk',
    openHour: 8, closeHour: 21,
    pageSize: 12,
    sourceTag: '(с сайта)',
  };
  const MSG = {
    default: 'Здравствуйте! Хочу подобрать букет',
    corp: 'Здравствуйте! Интересует корпоративный заказ: … шт., дата …',
    faq: 'Здравствуйте! У меня вопрос:',
    final: 'Здравствуйте! Помогите подобрать букет.',
  };

  const CATS = {
    berry: { name: 'Ягодные букеты и корзины', short: 'Ягодные', who: 'her', imgs: ['yag-17', 'yag-24'] },
    meat:  { name: 'Мясные букеты', short: 'Мясные', who: 'him', imgs: ['k-36', 'k-14'] },
    sea:   { name: 'Раки и морепродукты', short: 'Раки', who: 'him', imgs: ['m-1', 'm-5'] },
    dried: { name: 'Сухофрукты и орехи', short: 'Сухофрукты', who: 'her', imgs: ['suh-11', 'suh-19'] },
    sweet: { name: 'Сладкие боксы', short: 'Сладкие', who: 'her', imgs: ['sl-25', 'sl-5'] },
    snack: { name: 'Снеки и закуски', short: 'Снеки', who: 'him', imgs: ['sn-3'] },
  };
  /* Хиты — порядок и описания из ТЗ */
  const HITS = [
    { id: 'yag-17', desc: 'Сердце из клубники, малины, кустовых роз и зелени' },
    { id: 'yag-24', desc: 'Сердце из клубники, ежевики и кустовых роз' },
    { id: 'k-36', desc: 'Колбаски, розы из салями, черри, чёрная упаковка' },
    { id: 'm-1', desc: 'Варёные раки, лимон, зелень, чёрная упаковка' },
    { id: 'suh-11', desc: 'Курага, финики, чернослив, цукаты, орехи' },
    { id: 'sl-25', desc: 'Розы и Ferrero Rocher в коробке' },
  ];
  const OCCASIONS = [
    { t: '8 Марта', d: 'ягодные сердца и корзины', img: 'yag-20', set: { cat: 'berry' } },
    { t: '14 Февраля', d: 'клубника и розы', img: 'yag-24', set: { cat: 'berry' } },
    { t: 'День рождения', d: 'сердца, корзины, мясные', img: 'yag-22', set: {} },
    { t: '23 Февраля', d: 'мясные и раковые букеты', img: 'k-36', set: { who: 'him' } },
    { t: 'День мамы', d: 'сухофрукты, орехи, сладкое', img: 'suh-10', set: { cat: 'dried' } },
    { t: 'Новый год', d: 'праздничные наборы — заказы до 5 декабря', img: 'suh-12', set: { cat: 'dried' } },
    { t: '1 сентября', d: 'учителю: боксы и колокольчики', img: 'sl-29', set: { cat: 'sweet' } },
    { t: 'Коллегам', d: 'корпоративные подарки, скидка до 15%', img: 'sl-16', href: '#corporate' },
  ];
  /* Ценовые фильтры: до 3 000 / 3 000–5 000 / 5 000–8 000 / от 8 000 ₽ */
  const PRICE = { all: [0, Infinity], p1: [0, 3000], p2: [3001, 5000], p3: [5001, 7999], p4: [8000, Infinity] };
  const inPrice = (key, p) => { const [lo, hi] = PRICE[key || 'all']; return p >= lo && p <= hi; };

  /* ---------- Утилиты ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  const rub = (n) => `${fmt(n)} ₽`;
  const plural = (n, f) => f[(n % 10 === 1 && n % 100 !== 11) ? 0 : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const REDUCE = mqReduce.matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const HAS_GSAP = !!window.gsap;
  const ANIM = HAS_GSAP && !REDUCE;
  if (!ANIM) document.documentElement.classList.add('no-anim');
  if (HAS_GSAP) { gsap.registerPlugin(ScrollTrigger); if (window.Flip) gsap.registerPlugin(Flip); gsap.defaults({ ease: 'power3.out', duration: 0.8 }); }

  const ITEMS = D.items;
  const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));
  const thumbOf = (id) => BY_ID.get(id)?.thumb || '';
  const imgOf = (id) => BY_ID.get(id)?.img || '';
  const hitRank = new Map(HITS.map((h, i) => [h.id, i]));
  const whoOf = (cat) => CATS[cat].who;
  for (const c of Object.keys(CATS)) {
    const list = ITEMS.filter((i) => i.cat === c);
    CATS[c].count = list.length;
    CATS[c].min = Math.min(...list.map((i) => i.price));
  }

  /* ---------- Ссылки на мессенджеры ---------- */
  const withSource = (t) => { const i = t.indexOf('\n'); return i < 0 ? `${t} ${CONFIG.sourceTag}` : `${t.slice(0, i)} ${CONFIG.sourceTag}${t.slice(i)}`; };
  const tgLink = (text) => `https://t.me/+${CONFIG.phoneDigits}${text ? `?text=${encodeURIComponent(withSource(text))}` : ''}`;
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { /* */ } ta.remove(); return ok;
    }
  }
  const goal = (name) => { try { if (typeof window.ym === 'function') window.ym(114134059, 'reachGoal', name); } catch { /* */ } };
  /** MAX не принимает текст в ссылке — копируем его в буфер и открываем чат. */
  function sendMax(text, fromLink) {
    if (!fromLink) goal('click_max');
    copy(withSource(text)).then((ok) => toast(ok ? 'Текст скопирован — вставьте его в чат MAX' : 'Откройте чат MAX и опишите заказ'));
    window.open(CONFIG.maxUrl, '_blank', 'noopener');
  }
  function bindMessengers() {
    $$('[data-tg]').forEach((a) => { a.href = tgLink(MSG[a.dataset.msg] || MSG.default); });
    $$('[data-max]').forEach((a) => {
      a.href = CONFIG.maxUrl;
      a.addEventListener('click', (e) => { e.preventDefault(); sendMax(MSG[a.dataset.msg] || MSG.default, true); });
    });
    $$('[data-avito]').forEach((a) => { a.href = CONFIG.avitoUrl; });
    $('#avito-link').href = CONFIG.avitoUrl;
    const mail = $('#footer-mail');
    if (SITE.email) { mail.href = `mailto:${SITE.email}`; mail.textContent = SITE.email; } else mail.parentElement.remove();
    $('#legal-line').textContent = [SITE.ownerName, SITE.inn && `ИНН ${SITE.inn}`].filter(Boolean).join(', ');
    $('#year').textContent = new Date().getFullYear();
  }

  /* ---------- Тост ---------- */
  let toastT;
  function toast(text) {
    const t = $('#toast'); t.textContent = text; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 3600);
  }

  /* ---------- Время Ульяновска ---------- */
  function ulyNow() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: CONFIG.tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute };
  }
  function initStatus() {
    if (!FEATURES.status) { $$('[data-status]').forEach((e) => e.remove()); return; }
    const upd = () => {
      const { h } = ulyNow(); const on = h >= CONFIG.openHour && h < CONFIG.closeHour;
      $$('[data-status]').forEach((el) => {
        el.classList.toggle('is-off', !on);
        $('.status__text', el).textContent = on ? 'Сейчас на связи · ответим за 15 минут' : 'Ответим утром с 8:00';
      });
    };
    upd(); setInterval(upd, 60_000);
  }

  /* ---------- 2. Сезонная плашка ---------- */
  function initSeason() {
    const bar = $('#season');
    if (!FEATURES.seasonBar) return;
    try { if (sessionStorage.getItem('sb-season-closed')) return; } catch { /* */ }
    const n = ulyNow();
    const today = Date.UTC(n.y, n.m - 1, n.d);
    const end = Date.UTC(n.y, CONFIG.corpDeadline.month - 1, CONFIG.corpDeadline.day);
    const start = Date.UTC(n.y, CONFIG.seasonFrom.month - 1, CONFIG.seasonFrom.day);
    if (today < start || today > end) return;           // после 5 декабря плашка скрыта
    const days = Math.round((end - today) / 864e5);
    $('#season-days').textContent = days === 0 ? 'последний день' : `${plural(days, ['остался', 'осталось', 'осталось'])} ${days} ${plural(days, ['день', 'дня', 'дней'])}`;
    bar.hidden = false;
    document.documentElement.style.setProperty('--season-h', `${bar.offsetHeight}px`);
    $('.season__close', bar).addEventListener('click', () => {
      bar.hidden = true; document.documentElement.style.setProperty('--season-h', '0px');
      try { sessionStorage.setItem('sb-season-closed', '1'); } catch { /* */ }
      if (HAS_GSAP) ScrollTrigger.refresh();
    });
  }

  /* ---------- Плавный скролл ---------- */
  let lenis = null;
  function initLenis() {
    if (!FEATURES.smoothScroll || !ANIM || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(target) {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    const off = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 70) + 1;
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: REDUCE ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    if (Panels.active) Panels.close();
    if (Menu.open) Menu.toggle(false);
    setTimeout(() => scrollToEl(el), Panels.active || Menu.open ? 350 : 0);
  });

  /* ---------- 3. Шапка ---------- */
  function initHeader() {
    const h = $('#header'); let last = scrollY;
    const fab = $('.fab');
    const onScroll = () => {
      const y = scrollY;
      h.classList.toggle('is-scrolled', y > 20);
      if (FEATURES.headerAutoHide && !Menu.open && !megaOpen) h.classList.toggle('is-hidden', y > last && y > 300);
      fab.classList.toggle('is-hidden', y < 500);
      last = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Mega-menu (десктоп) */
  let megaOpen = false;
  function initMega() {
    const grid = $('#mega-grid');
    grid.innerHTML = Object.entries(CATS).map(([k, c]) => `
      <a class="mega__card" href="#catalog" data-cat-link="${k}">
        <img src="${thumbOf(c.imgs[0])}" alt="" loading="lazy" width="440" height="440">
        <span><b>${c.short}</b><small>${c.count} ${plural(c.count, ['работа', 'работы', 'работ'])} · от ${rub(c.min)}</small></span>
      </a>`).join('');
    const btn = $('.nav__item--mega > .nav__link'); const mega = $('#mega'); const li = btn.parentElement;
    let t;
    const set = (v) => { megaOpen = v; mega.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', v); };
    btn.addEventListener('click', () => set(!megaOpen));
    if (FINE) {
      li.addEventListener('mouseenter', () => { clearTimeout(t); t = setTimeout(() => set(true), 120); });
      li.addEventListener('mouseleave', () => { clearTimeout(t); t = setTimeout(() => set(false), 200); });
    }
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && megaOpen) { set(false); btn.focus(); } });
    grid.addEventListener('click', () => set(false));
  }

  /* ---------- Полноэкранное меню ---------- */
  const Menu = {
    open: false,
    init() {
      const list = $('#menu-cats');
      list.innerHTML = Object.entries(CATS).map(([k, c], i) => `<li style="--i:${i}"><a href="#catalog" data-cat-link="${k}" data-photo="${imgOf(c.imgs[0])}">${c.short}<small>от ${rub(c.min)}</small></a></li>`).join('');
      $$('.menu__links li').forEach((li, i) => li.style.setProperty('--i', i + 5));
      const photo = $('#menu-photo');
      photo.style.backgroundImage = `url(${imgOf('yag-17')})`;
      $$('[data-photo]', list).forEach((a) => {
        const show = () => { photo.style.opacity = 0; setTimeout(() => { photo.style.backgroundImage = `url(${a.dataset.photo})`; photo.style.opacity = ''; }, 200); };
        a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
      });
      $('#burger').addEventListener('click', () => this.toggle());
      $('#menu').addEventListener('keydown', (e) => trapFocus(e, $('#menu'), true));
    },
    toggle(force) {
      const v = force ?? !this.open; if (v === this.open) return;
      const menu = $('#menu'); const b = $('#burger'); this.open = v;
      b.setAttribute('aria-expanded', v); b.setAttribute('aria-label', v ? 'Закрыть меню' : 'Открыть меню');
      if (v) {
        const r = b.getBoundingClientRect();
        menu.style.setProperty('--cx', `${r.left + r.width / 2}px`); menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
        menu.hidden = false; lock(true); $('#header').classList.remove('is-hidden'); document.documentElement.classList.add('menu-open');
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
        setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 400);
      } else {
        menu.classList.remove('is-open'); lock(false);
        setTimeout(() => { if (!this.open) { menu.hidden = true; document.documentElement.classList.remove('menu-open'); } }, REDUCE ? 0 : 700);
        b.focus({ preventScroll: true });
      }
    },
  };

  /* ---------- Блокировка прокрутки и фокус ---------- */
  function lock(v) {
    document.body.classList.toggle('is-locked', v);
    if (lenis) v ? lenis.stop() : lenis.start();
  }
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function trapFocus(e, root, withBurger) {
    if (e.key === 'Escape') { withBurger ? Menu.toggle(false) : Panels.close(); return; }
    if (e.key !== 'Tab') return;
    const f = $$(FOCUSABLE, root).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (withBurger) f.push($('#burger'));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && Menu.open) Menu.toggle(false); });

  /* ---------- Панели: корзина, быстрый просмотр, квиз, фильтры ---------- */
  const Panels = {
    active: null, opener: null,
    init() {
      $('#overlay').addEventListener('click', () => this.close());
      document.addEventListener('click', (e) => {
        const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); this.open(o.dataset.open, o); return; }
        if (e.target.closest('[data-close]') && this.active) { if (!e.target.closest('a[href^="#"]')) e.preventDefault(); this.close(); }
      });
      document.addEventListener('keydown', (e) => { if (this.active) trapFocus(e, this.active); });
      // свайп для закрытия: вправо у боковых панелей, вниз у шторки и окна на телефоне
      ['cart', 'quiz', 'sheet', 'quick'].forEach((id) => this.swipe($(`#${id}`)));
    },
    open(id, opener) {
      if (this.active) this.close(true);
      const p = $(`#${id}`); if (!p) return;
      if (id === 'quiz') Quiz.start();
      if (id === 'sheet') Catalog.fillSheet();
      this.opener = opener || document.activeElement; this.active = p;
      const ov = $('#overlay'); ov.hidden = false; p.hidden = false; lock(true);
      requestAnimationFrame(() => requestAnimationFrame(() => { ov.classList.add('is-open'); p.classList.add('is-open'); }));
      setTimeout(() => ($('[data-autofocus]', p) || $(FOCUSABLE, p))?.focus({ preventScroll: true }), 120);
    },
    close(instant) {
      const p = this.active; if (!p) return; this.active = null;
      const ov = $('#overlay');
      p.classList.remove('is-open'); ov.classList.remove('is-open'); p.style.transform = '';
      const done = () => { if (this.active !== p) p.hidden = true; if (!this.active) ov.hidden = true; };
      instant || REDUCE ? done() : setTimeout(done, 650);
      if (!instant) { lock(false); this.opener?.focus?.({ preventScroll: true }); }
    },
    swipe(p) {
      let x0, y0, dx = 0, dy = 0, axis = null;
      const side = p.classList.contains('drawer');
      p.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; dx = dy = 0; axis = null; }, { passive: true });
      p.addEventListener('touchmove', (e) => {
        dx = e.touches[0].clientX - x0; dy = e.touches[0].clientY - y0;
        if (!axis) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        const scroller = e.target.closest('.drawer__body, .sheet__body, .modal');
        if (side && axis === 'x' && dx > 0) { p.classList.add('is-dragging'); p.style.transition = 'none'; p.style.transform = `translateX(${dx}px)`; }
        if (!side && axis === 'y' && dy > 0 && (!scroller || scroller.scrollTop <= 0)) { p.style.transition = 'none'; p.style.transform = `translateY(${dy}px)`; }
      }, { passive: true });
      p.addEventListener('touchend', () => {
        p.style.transition = ''; p.classList.remove('is-dragging');
        if ((side && axis === 'x' && dx > 90) || (!side && axis === 'y' && dy > 110)) this.close(); else p.style.transform = '';
      });
    },
  };

  /* ---------- Каталог ---------- */
  const Catalog = {
    st: { cat: 'all', who: 'all', price: 'all', sort: 'pop', fav: false, shown: CONFIG.pageSize },
    els: new Map(),
    init() {
      const tabs = $('#cat-tabs');
      tabs.innerHTML = `<button class="cat-tab" role="tab" aria-selected="true" data-cat="all">Все работы<small>${ITEMS.length}</small></button>` +
        Object.entries(CATS).map(([k, c]) => `<button class="cat-tab" role="tab" aria-selected="false" data-cat="${k}">${c.short}<small>${c.count}</small></button>`).join('');
      tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) this.set({ cat: b.dataset.cat }); });
      $('#filters').addEventListener('click', (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        if (c.hasAttribute('data-fav-filter')) return this.set({ fav: !this.st.fav });
        const k = c.closest('[data-filter]').dataset.filter; this.set({ [k]: c.dataset.v });
      });
      $('#sort').addEventListener('change', (e) => this.set({ sort: e.target.value }));
      $('#more').addEventListener('click', () => { this.st.shown += CONFIG.pageSize; this.render(true); });
      document.addEventListener('click', (e) => {
        const l = e.target.closest('[data-cat-link]'); if (!l) return;
        this.set({ cat: l.dataset.catLink, who: 'all', price: 'all', fav: false });
      });
      $('#grid').addEventListener('click', (e) => {
        const card = e.target.closest('.card'); if (!card) return; const id = card.dataset.id;
        if (e.target.closest('.card__fav')) return Fav.toggle(id);
        if (e.target.closest('.add-btn')) return Cart.add(id, e.target.closest('.add-btn'));
        if (e.target.closest('.card__media, .card__title')) Quick.open(id, e.target.closest('button'));
      });
      this.render(false);
    },
    set(patch) {
      Object.assign(this.st, patch); this.st.shown = CONFIG.pageSize;
      this.syncUI(); this.render(true);
    },
    syncUI() {
      const s = this.st;
      $$('#cat-tabs .cat-tab').forEach((b) => b.setAttribute('aria-selected', b.dataset.cat === s.cat));
      $$('[data-filter]').forEach((g) => $$('.chip', g).forEach((c) => { const on = c.dataset.v === s[g.dataset.filter]; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); }));
      $$('[data-fav-filter]').forEach((b) => b.setAttribute('aria-pressed', s.fav));
      $$('select[data-sort], #sort').forEach((el) => { el.value = s.sort; });
      const n = (s.cat !== 'all') + (s.who !== 'all') + (s.price !== 'all') + (s.fav ? 1 : 0);
      $('#filters-n').textContent = n || '';
    },
    list() {
      const s = this.st; const favs = Fav.set;
      let l = ITEMS.filter((i) => (s.cat === 'all' || i.cat === s.cat) && (s.who === 'all' || whoOf(i.cat) === s.who) &&
        inPrice(s.price, i.price) && (!s.fav || favs.has(i.id)));
      if (s.sort === 'asc') l = [...l].sort((a, b) => a.price - b.price);
      else if (s.sort === 'desc') l = [...l].sort((a, b) => b.price - a.price);
      else l = [...l].sort((a, b) => (hitRank.get(a.id) ?? 99) - (hitRank.get(b.id) ?? 99));
      return l;
    },
    card(i) {
      const li = document.createElement('li'); li.className = 'card'; li.dataset.id = i.id;
      const fav = Fav.set.has(i.id);
      li.innerHTML = `
        <button class="card__media" type="button" data-cursor="view" aria-label="Быстрый просмотр: ${esc(i.name)}">
          <img src="${i.thumb}" alt="${esc(i.name)}: ${esc(i.desc)}" loading="lazy" decoding="async" width="440" height="440">
          <span class="card__glow"></span>
        </button>
        ${hitRank.has(i.id) ? '<span class="card__badge">Хит</span>' : ''}
        <button class="card__fav" type="button" aria-pressed="${fav}" aria-label="В избранное: ${esc(i.name)}"><svg class="ico"><use href="#i-heart"/></svg></button>
        <div class="card__body">
          <span class="card__cat">${CATS[i.cat].short}</span>
          <h3 class="card__title">${esc(i.name)}</h3>
          <p class="card__desc">${esc(i.desc)}</p>
          <div class="card__foot">
            <span class="price"><small>от</small>${rub(i.price)}</span>
            <button class="add-btn" type="button" aria-label="В корзину: ${esc(i.name)}" data-cursor="heart"><svg class="ico"><use href="#i-plus"/></svg></button>
          </div>
        </div>`;
      return li;
    },
    render(animate) {
      const grid = $('#grid'); const all = this.list(); const l = all.slice(0, this.st.shown);
      const state = animate && ANIM && FEATURES.flipFilter && window.Flip ? Flip.getState($$('.card', grid)) : null;
      const frag = document.createDocumentFragment();
      l.forEach((i) => { let el = this.els.get(i.id); if (!el) { el = this.card(i); this.els.set(i.id, el); Effects.bindCard(el); } frag.appendChild(el); });
      grid.replaceChildren(frag);
      if (!l.length) grid.innerHTML = `<li class="grid__empty">${this.st.fav ? 'В избранном пока пусто — отмечайте букеты сердечком.' : 'Под такие фильтры работ нет. Попробуйте другую цену — или напишите Марии, соберём под ваш бюджет.'}</li>`;
      $('#catalog-count').textContent = `${all.length} ${plural(all.length, ['работа', 'работы', 'работ'])}`;
      $('#more').hidden = all.length <= this.st.shown;
      if (state) {
        Flip.from(state, {
          duration: 0.75, ease: 'power3.out', absolute: false, nested: true, prune: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.03 }),
        });
      }
      if (HAS_GSAP) ScrollTrigger.refresh();
    },
    fillSheet() {
      const b = $('#sheet-body');
      b.innerHTML = `
        <div class="filters__group"><span class="filters__label">Категория</span><div class="chips" data-sf="cat">
          <button class="chip" data-v="all">Все</button>${Object.entries(CATS).map(([k, c]) => `<button class="chip" data-v="${k}">${c.short}</button>`).join('')}</div></div>
        ${$$('#filters [data-filter]').map((g) => `<div class="filters__group"><span class="filters__label">${g.closest('.filters__group').querySelector('.filters__label').textContent}</span><div class="chips" data-sf="${g.dataset.filter}">${$$('.chip', g).map((c) => `<button class="chip" data-v="${c.dataset.v}">${c.textContent}</button>`).join('')}</div></div>`).join('')}
        <div class="filters__group"><span class="filters__label">Сортировка</span><div class="chips" data-sf="sort">
          <button class="chip" data-v="pop">Популярные</button><button class="chip" data-v="asc">Дешевле</button><button class="chip" data-v="desc">Дороже</button></div></div>
        <div class="filters__group"><span class="filters__label">Избранное</span><div class="chips"><button class="chip chip--fav" data-sfav><svg class="ico"><use href="#i-heart"/></svg>Только избранное</button></div></div>`;
      const sync = () => {
        $$('[data-sf]', b).forEach((g) => $$('.chip', g).forEach((c) => { const on = this.st[g.dataset.sf] === c.dataset.v; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); }));
        $('[data-sfav]', b).setAttribute('aria-pressed', this.st.fav);
        $('#sheet-apply').textContent = `Показать ${this.list().length}`;
      };
      b.onclick = (e) => {
        const c = e.target.closest('.chip'); if (!c) return;
        if (c.hasAttribute('data-sfav')) this.st.fav = !this.st.fav; else this.st[c.closest('[data-sf]').dataset.sf] = c.dataset.v;
        this.st.shown = CONFIG.pageSize; this.syncUI(); this.render(false); sync();
      };
      sync();
    },
  };

  /* ---------- Избранное ---------- */
  const Fav = {
    set: new Set(store.get('sb-fav', [])),
    toggle(id) {
      this.set.has(id) ? this.set.delete(id) : this.set.add(id);
      store.set('sb-fav', [...this.set]); this.sync();
      toast(this.set.has(id) ? 'Добавили в избранное' : 'Убрали из избранного');
      if (Catalog.st.fav) Catalog.render(true);
    },
    sync() {
      $$('.card').forEach((c) => $('.card__fav', c)?.setAttribute('aria-pressed', this.set.has(c.dataset.id)));
      $$('[data-fav-count]').forEach((e) => { e.textContent = this.set.size; });
    },
  };

  /* ---------- Корзина ---------- */
  const Cart = {
    items: store.get('sb-cart', {}),
    form: store.get('sb-order', {}),
    init() {
      const f = $('#cart-form');
      Object.entries(this.form).forEach(([k, v]) => { const el = f.elements[k]; if (!el) return; el.type === 'checkbox' ? (el.checked = v) : (el.value = v); });
      f.addEventListener('input', () => {
        this.form = Object.fromEntries([...f.elements].filter((e) => e.name).map((e) => [e.name, e.type === 'checkbox' ? e.checked : e.value]));
        store.set('sb-order', this.form); this.links();
      });
      $('#o-date').min = new Date().toISOString().slice(0, 10);
      $('#cart-list').addEventListener('click', (e) => {
        const li = e.target.closest('[data-id]'); if (!li) return; const id = li.dataset.id;
        if (e.target.closest('[data-inc]')) this.qty(id, 1);
        if (e.target.closest('[data-dec]')) this.qty(id, -1);
        if (e.target.closest('[data-rm]')) this.qty(id, -Infinity);
      });
      $('#send-max').addEventListener('click', (e) => { e.preventDefault(); if (!this.count()) return toast('Добавьте букет в корзину'); sendMax(this.text()); });
      $('#send-tg').addEventListener('click', (e) => { if (!this.count()) { e.preventDefault(); toast('Добавьте букет в корзину'); } else Effects.confetti(); });
      this.render();
    },
    count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },
    total() { return Object.entries(this.items).reduce((a, [id, q]) => a + (BY_ID.get(id)?.price || 0) * q, 0); },
    save() { store.set('sb-cart', this.items); this.render(); },
    add(id, btn) {
      this.items[id] = (this.items[id] || 0) + 1; this.save();
      const item = BY_ID.get(id);
      Effects.fly(btn?.closest('.card, .hit, .qv, .res')?.querySelector('img') || null, item.thumb);
      if (btn?.classList.contains('add-btn')) { btn.classList.add('is-added'); setTimeout(() => btn.classList.remove('is-added'), 1200); }
      toast(`«${item.name}» в корзине`);
    },
    qty(id, d) { const q = (this.items[id] || 0) + d; if (q <= 0) delete this.items[id]; else this.items[id] = q; this.save(); },
    render() {
      const n = this.count(), total = this.total();
      const c = $('#cart-count'); c.textContent = n; c.dataset.n = n;
      $('.cart-btn').setAttribute('aria-label', `Корзина, букетов: ${n}`);
      $('#cart-list').innerHTML = Object.entries(this.items).map(([id, q]) => {
        const i = BY_ID.get(id); if (!i) return '';
        return `<li class="cart-item" data-id="${id}">
          <img src="${i.thumb}" alt="" width="76" height="76" loading="lazy">
          <div><p class="cart-item__t">${esc(i.name)}</p><p class="cart-item__p">от ${rub(i.price)}</p>
            <div class="qty"><button type="button" data-dec aria-label="Меньше"><svg class="ico"><use href="#i-minus"/></svg></button><span aria-live="polite">${q}</span><button type="button" data-inc aria-label="Больше"><svg class="ico"><use href="#i-plus"/></svg></button></div></div>
          <button class="cart-item__rm" type="button" data-rm aria-label="Убрать ${esc(i.name)}"><svg class="ico"><use href="#i-close"/></svg></button>
        </li>`;
      }).join('');
      $('#cart-empty').hidden = n > 0;
      $('#cart-total').textContent = `от ${rub(total)}`;
      const left = CONFIG.freeDeliveryFrom - total;
      $('#free-text').innerHTML = left > 0
        ? `До бесплатной доставки по Новому городу осталось <b>${rub(left)}</b>`
        : '<b>Доставка по Новому городу — бесплатно</b>. В другие районы — по тарифу Яндекс Go.';
      $('#free-fill').style.transform = `scaleX(${Math.min(1, total / CONFIG.freeDeliveryFrom)})`;
      $('#free-bar').hidden = n === 0;
      this.links();
    },
    text() {
      const f = this.form; const lines = ['Здравствуйте! Хочу заказать букет'];
      Object.entries(this.items).forEach(([id, q], k) => { const i = BY_ID.get(id); if (i) lines.push(`${k + 1}. «${i.name}» × ${q} — от ${rub(i.price * q)} (фото: ${CONFIG.photoBase}${id}.jpg)`); });
      lines.push(`Итого: от ${rub(this.total())}`);
      if (f.date) lines.push(`Дата: ${new Date(f.date + 'T12:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`);
      if (f.time) lines.push(`Время: ${f.time}`);
      if (f.addr) lines.push(`Адрес: ${f.addr}`);
      if (f.note) lines.push(`Записка: «${f.note}»`);
      if (f.anon) lines.push('Доставка анонимно');
      lines.push('Жду согласования состава и суммы.');
      return lines.join('\n');
    },
    links() { $('#send-tg').href = tgLink(this.text()); },
  };

  /* ---------- Быстрый просмотр ---------- */
  const Quick = {
    id: null, gallery: [], touchX: 0, touchY: 0,
    init() {
      $('#qv-add').addEventListener('click', (e) => Cart.add(this.id, e.currentTarget));
      $('#qv-thumbs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-id]'); if (b) this.show(b.dataset.id);
      });
      const main = $('.qv__main');
      main.addEventListener('touchstart', (e) => {
        this.touchX = e.changedTouches[0].clientX;
        this.touchY = e.changedTouches[0].clientY;
      }, { passive: true });
      main.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - this.touchX;
        const dy = e.changedTouches[0].clientY - this.touchY;
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        this.move(dx < 0 ? 1 : -1);
      }, { passive: true });
    },
    fill(id) {
      const item = BY_ID.get(id); if (!item) return;
      const similar = ITEMS.filter((x) => x.cat === item.cat && x.id !== id)
        .sort((a, b) => Math.abs(a.price - item.price) - Math.abs(b.price - item.price)).slice(0, 4);
      this.gallery = [item, ...similar];
      this.renderThumbs();
      this.show(id);
    },
    renderThumbs() {
      $('#qv-thumbs').innerHTML = this.gallery.map((x) =>
        `<button type="button" data-id="${x.id}" aria-label="Показать фото «${esc(x.name)}»"><img src="${x.thumb}" alt="" loading="lazy" width="440" height="440"></button>`
      ).join('');
    },
    show(id) {
      const item = BY_ID.get(id); if (!item) return;
      this.id = id;
      const img = $('#qv-img'); img.src = item.img; img.alt = `${item.name}: ${item.desc}`;
      $('#qv-cat').textContent = CATS[item.cat].name;
      $('#qv-title').textContent = item.name;
      $('#qv-price').textContent = `от ${rub(item.price)}`;
      $('#qv-desc').textContent = HITS.find((h) => h.id === id)?.desc || item.desc;
      $('#qv-swap').href = tgLink(`Здравствуйте! Хочу такой, но заменить…\n«${item.name}» — ${CONFIG.photoBase}${id}.jpg\nЧто заменить: `);
      $$('#qv-thumbs [data-id]').forEach((button) => {
        const active = button.dataset.id === id;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', active ? 'true' : 'false');
      });
      if (ANIM) gsap.fromTo('.qv__main img', { scale: 1.04, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 0.45 });
    },
    move(direction) {
      if (this.gallery.length < 2) return;
      const index = this.gallery.findIndex((item) => item.id === this.id);
      const next = (index + direction + this.gallery.length) % this.gallery.length;
      this.show(this.gallery[next].id);
    },
    open(id, opener) { this.fill(id); Panels.open('quick', opener); },
  };

  /* ---------- Квиз ---------- */
  const Quiz = {
    i: 0, a: {},
    steps: [
      { k: 'to', q: 'Кому дарим?', opts: [['her', 'Любимой'], ['him', 'Любимому'], ['mom', 'Маме'], ['friend', 'Другу или подруге'], ['team', 'Коллегам'], ['teacher', 'Учителю']] },
      { k: 'why', q: 'Какой повод?', opts: [['8m', '8 Марта'], ['14f', '14 Февраля'], ['bd', 'День рождения'], ['23f', '23 Февраля'], ['mday', 'День мамы'], ['ny', 'Новый год'], ['1s', '1 сентября'], ['just', 'Просто так']] },
      { k: 'budget', q: 'Какой бюджет?', opts: [['p1', 'до 3 000 ₽'], ['p2', '3 000–5 000 ₽'], ['p3', '5 000–8 000 ₽'], ['p4', 'от 8 000 ₽']] },
      { k: 'taste', q: 'Что любит получатель?', hint: 'Можно выбрать несколько', multi: true, opts: [['berry', 'Ягоды и фрукты'], ['meat', 'Мясо и сыр'], ['sea', 'Раки и морепродукты'], ['dried', 'Сухофрукты и орехи'], ['sweet', 'Сладкое']] },
      { k: 'ex', q: 'Что исключить?', hint: 'Можно выбрать несколько', multi: true, opts: [['nuts', 'Орехи'], ['sea', 'Морепродукты'], ['meat', 'Мясо'], ['choc', 'Шоколад и конфеты'], ['none', 'Ничего не исключать']] },
    ],
    init() {
      $('#quiz-next').addEventListener('click', () => this.next());
      $('#quiz-back').addEventListener('click', () => { if (this.i > 0) { this.i--; this.draw(); } });
      $('#quiz-body').addEventListener('click', (e) => {
        const o = e.target.closest('.opt'); if (!o) return;
        const s = this.steps[this.i]; const v = o.dataset.v;
        if (s.multi) {
          let arr = this.a[s.k] || [];
          if (v === 'none') arr = arr.includes('none') ? [] : ['none'];
          else { arr = arr.filter((x) => x !== 'none'); arr = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }
          this.a[s.k] = arr; this.draw();
        } else { this.a[s.k] = v; this.draw(); setTimeout(() => this.next(), 260); }
      });
    },
    start() { this.i = 0; this.a = {}; this.draw(); },
    next() {
      const s = this.steps[this.i];
      if (s && !s.multi && !this.a[s.k]) return toast('Выберите вариант');
      this.i++; this.draw();
    },
    draw() {
      const b = $('#quiz-body'); const total = this.steps.length;
      $('#quiz-bar').style.transform = `scaleX(${Math.min(1, (this.i + 1) / (total + 1))})`;
      $('#quiz-back').hidden = this.i === 0 || this.i > total - 1;
      if (this.i >= total) return this.result();
      const s = this.steps[this.i]; const sel = this.a[s.k];
      $('#quiz-next').hidden = false; $('#quiz-next').textContent = this.i === total - 1 ? 'Показать букеты' : 'Дальше';
      b.innerHTML = `<div class="quiz__step"><p class="eyebrow">Шаг ${this.i + 1} из ${total}</p><h3 class="quiz__q">${s.q}</h3><p class="quiz__hint">${s.hint || 'Выберите один вариант'}</p>
        <div class="quiz__opts" role="group" aria-label="${s.q}">${s.opts.map(([v, l]) => `<button type="button" class="opt" data-v="${v}" aria-pressed="${s.multi ? (sel || []).includes(v) : sel === v}">${l}</button>`).join('')}</div></div>`;
    },
    pick() {
      const a = this.a; const tastes = a.taste || []; const ex = a.ex || [];
      const toWho = { her: 'her', him: 'him', mom: 'her', teacher: 'her' }[a.to];
      const occCat = { '8m': 'berry', '14f': 'berry', '23f': 'meat', mday: 'dried', ny: 'dried', '1s': 'sweet' }[a.why];
      const [lo, hi] = PRICE[a.budget || 'all'];
      const rx = { nuts: /орех|фисташ|арахис|миндал/i, choc: /шоколад|конфет|ferrero|трюфел/i };
      let pool = ITEMS.filter((i) => !(ex.includes('sea') && (i.cat === 'sea' || /раки|креветк|краб/i.test(i.desc))) &&
        !(ex.includes('meat') && (i.cat === 'meat' || /колбас|салями|ветчин|мяс/i.test(i.desc))) &&
        !(ex.includes('nuts') && rx.nuts.test(i.desc)) && !(ex.includes('choc') && rx.choc.test(i.desc)));
      const score = (i) => (tastes.includes(i.cat) ? 4 : 0) + (toWho && whoOf(i.cat) === toWho ? 2 : 0) + (occCat === i.cat ? 2 : 0) +
        (a.to === 'teacher' && /учител|сентябр|звонок/i.test(i.name + i.desc) ? 3 : 0) + (a.to === 'mom' && /мам/i.test(i.name + i.desc) ? 3 : 0) +
        (inPrice(a.budget, i.price) ? 5 : -Math.min(Math.abs(i.price - lo), Math.abs(i.price - hi)) / 1000) + (hitRank.has(i.id) ? 0.5 : 0);
      pool = pool.map((i) => [i, score(i)]).sort((x, y) => y[1] - x[1]).map((x) => x[0]);
      return pool.slice(0, 3);
    },
    result() {
      const res = this.pick(); const lab = (k) => { const s = this.steps.find((x) => x.k === k); const v = this.a[k]; return [].concat(v || []).map((x) => s.opts.find((o) => o[0] === x)?.[1]).filter(Boolean).join(', ') || '—'; };
      const text = `Здравствуйте! Подберите букет:\nКому: ${lab('to')}\nПовод: ${lab('why')}\nБюджет: ${lab('budget')}\nЛюбит: ${lab('taste')}\nИсключить: ${lab('ex')}\nПонравились: ${res.map((i) => `«${i.name}»`).join(', ')}`;
      $('#quiz-next').hidden = true; $('#quiz-back').hidden = false;
      $('#quiz-body').innerHTML = `<div class="quiz__step"><p class="eyebrow">Готово</p><h3 class="quiz__q">Вот что подойдёт</h3><p class="quiz__hint">Все цены «от» — зависят от размера и сезона. Мария подстроит состав.</p>
        <div class="quiz__res">${res.map((i) => `<div class="res"><img src="${i.thumb}" alt="" width="96" height="96" loading="lazy"><div><b>${esc(i.name)}</b><span>${esc(i.desc)}</span><span class="price"><small>от</small>${rub(i.price)}</span>
          <div style="display:flex;gap:8px;margin-top:8px"><button class="chip" type="button" data-qadd="${i.id}">В корзину</button><button class="chip" type="button" data-qview="${i.id}">Смотреть</button></div></div></div>`).join('')}</div>
        <div style="display:grid;gap:8px;margin-top:20px"><a class="btn btn--primary" href="${tgLink(text)}" target="_blank" rel="noopener">Отправить ответы Марии в Telegram</a><button type="button" class="btn btn--ghost" id="quiz-max">Отправить в MAX</button></div></div>`;
      $('#quiz-max').onclick = () => sendMax(text);
      $$('[data-qadd]').forEach((b) => b.addEventListener('click', () => Cart.add(b.dataset.qadd, b)));
      $$('[data-qview]').forEach((b) => b.addEventListener('click', () => { Panels.close(true); Quick.open(b.dataset.qview, $('.quiz-open')); }));
      $('#quiz-bar').style.transform = 'scaleX(1)';
    },
  };

  /* ---------- Рендер статичных блоков из данных ---------- */
  function renderBlocks() {
    // Категории
    $('#cats').innerHTML = Object.entries(CATS).map(([k, c]) => `
      <a class="cat" href="#catalog" data-cat-link="${k}" data-cursor="view" data-tilt>
        <span class="cat__media reveal-img">
          <img src="${imgOf(c.imgs[0])}" alt="${c.name}" loading="lazy" decoding="async" width="1100" height="1100">
          <img src="${imgOf(c.imgs[1])}" alt="" loading="lazy" decoding="async" width="1100" height="1100">
        </span>
        <span class="cat__count">${c.count} ${plural(c.count, ['работа', 'работы', 'работ'])}</span>
        <span class="cat__body">
          <span><span class="cat__title">${c.name}</span><span class="cat__meta"><span>от <b>${rub(c.min)}</b></span></span></span>
          <span class="cat__arrow" aria-hidden="true"><svg class="ico"><use href="#i-arrow"/></svg></span>
        </span>
      </a>`).join('');
    // Хиты
    $('#hits-list').innerHTML = HITS.map((h, n) => { const i = BY_ID.get(h.id); return `
      <div class="swiper-slide"><article class="hit" data-id="${i.id}">
        <button class="hit__media" type="button" data-cursor="view" aria-label="Быстрый просмотр: ${esc(i.name)}" data-qv="${i.id}">
          <img src="${i.img}" alt="${esc(i.name)}: ${esc(h.desc)}" loading="lazy" decoding="async" width="1100" height="1100"><span class="hit__n">${String(n + 1).padStart(2, '0')}</span></button>
        <div class="hit__body"><h3 class="hit__title">${esc(i.name)}</h3><p class="hit__desc">${esc(h.desc)}</p>
          <div class="hit__foot"><span class="price"><small>от</small>${rub(i.price)}</span><button class="add-btn" type="button" data-add="${i.id}" aria-label="В корзину: ${esc(i.name)}" data-cursor="heart"><svg class="ico"><use href="#i-plus"/></svg></button></div></div>
      </article></div>`; }).join('');
    $('#hits-list').addEventListener('click', (e) => {
      const q = e.target.closest('[data-qv]'); if (q) return Quick.open(q.dataset.qv, q);
      const a = e.target.closest('[data-add]'); if (a) Cart.add(a.dataset.add, a);
    });
    // Поводы
    $('#bento').innerHTML = OCCASIONS.map((o, n) => `
      <a class="occ" href="${o.href || '#catalog'}" data-occ="${n}" data-cursor="view">
        <img src="${n === 0 ? imgOf(o.img) : thumbOf(o.img)}" alt="" loading="lazy" decoding="async" width="${n === 0 ? 1100 : 440}" height="${n === 0 ? 1100 : 440}">
        <span><span class="occ__t">${o.t}</span><span class="occ__d">${o.d}</span></span>
      </a>`).join('');
    $('#bento').addEventListener('click', (e) => {
      const a = e.target.closest('[data-occ]'); if (!a) return; const o = OCCASIONS[+a.dataset.occ];
      if (!o.href) Catalog.set({ cat: 'all', who: 'all', price: 'all', fav: false, ...o.set });
    });
    // Отзывы — тексты с Авито без правок
    $('#reviews-list').innerHTML = D.reviews.map((r) => `
      <figure class="review"><div class="review__stars" aria-label="5 из 5">★★★★★</div>
        <blockquote class="review__q">${esc(r.text)}</blockquote>
        <figcaption class="review__meta"><span><b>${esc(r.name)}</b> · ${esc(r.item)}</span><span>${esc(r.date)}</span></figcaption></figure>`).join('');
    const shots = ['101', '102', '108', '110', 'img-20230506-160507', 'img-20230506-160613', 'img-20230506-160711', 'img-20230506-160823', 'img-20230506-160848', 'img-20230506-160917', 'img-20230506-160945', 'img-20230506-232550', 'img-20230506-232645', 'img-20230506-232715', 'img-20230506-232746', 'img-20230506-233432'];
    $('#shots').innerHTML = shots.map((s) => `<img src="img/real/reviews/${s}.webp" alt="Скриншот отзыва на Авито" loading="lazy" decoding="async" width="900" height="770">`).join('');
    dragScroll($('#shots'));
  }

  function dragScroll(el) {
    let down = false, x0 = 0, s0 = 0;
    el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = el.scrollLeft; el.style.scrollSnapType = 'none'; });
    addEventListener('pointerup', () => { if (down) { down = false; el.style.scrollSnapType = ''; } });
    el.addEventListener('pointermove', (e) => { if (down) el.scrollLeft = s0 - (e.clientX - x0); });
    el.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /* ---------- Swiper: хиты ---------- */
  function initHits() {
    if (!window.Swiper) { const w = $('.hits'); w.style.overflowX = 'auto'; return; }
    const bar = $('#hits-progress');
    // eslint-disable-next-line no-new
    new Swiper('.hits', {
      slidesPerView: 'auto', spaceBetween: 18, grabCursor: true, speed: 700,
      freeMode: { enabled: true, momentumRatio: 0.6, sticky: false },
      keyboard: { enabled: true, onlyInViewport: true }, mousewheel: { forceToAxis: true },
      navigation: { prevEl: '#hits-prev', nextEl: '#hits-next' },
      a11y: { prevSlideMessage: 'Предыдущий букет', nextSlideMessage: 'Следующий букет' },
      on: { progress(s, p) { bar.style.transform = `scaleX(${0.1 + Math.max(0, Math.min(1, p)) * 0.9})`; } },
    });
  }

  /* ---------- Сравнение «розы vs съедобный» ---------- */
  function initCompare() {
    const c = $('#compare'); const r = $('.compare__range', c);
    const set = (v) => { v = Math.max(0, Math.min(100, v)); c.style.setProperty('--pos', `${v}%`); r.value = v; };
    r.addEventListener('input', () => set(+r.value));
    r.style.pointerEvents = 'none';
    let drag = false;
    const fromEvt = (e) => { const b = c.getBoundingClientRect(); set(((e.clientX - b.left) / b.width) * 100); };
    c.addEventListener('pointerdown', (e) => { drag = true; c.setPointerCapture(e.pointerId); fromEvt(e); });
    c.addEventListener('pointermove', (e) => { if (drag) fromEvt(e); });
    c.addEventListener('pointerup', () => { drag = false; });
    c.addEventListener('pointercancel', () => { drag = false; });
    if (ANIM) {
      const o = { v: 50 };
      gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 70%', once: true } })
        .to(o, { v: 78, duration: 1, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 50, duration: 1, ease: 'power3.out', onUpdate: () => set(o.v) });
    }
  }

  /* ---------- Форма «Свой букет» ---------- */
  function maskPhone(input) {
    const f = () => {
      let d = input.value.replace(/\D/g, ''); if (d.startsWith('8')) d = '7' + d.slice(1); if (d && !d.startsWith('7')) d = '7' + d; d = d.slice(0, 11);
      const p = d.slice(1);
      let out = d ? '+7' : '';
      if (p.length) out += ` (${p.slice(0, 3)}`; if (p.length >= 3) out += ')'; if (p.length > 3) out += ` ${p.slice(3, 6)}`;
      if (p.length > 6) out += `-${p.slice(6, 8)}`; if (p.length > 8) out += `-${p.slice(8, 10)}`;
      input.value = out;
    };
    input.addEventListener('input', f);
    input.addEventListener('focus', () => { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', () => { if (input.value.replace(/\D/g, '').length <= 1) input.value = ''; });
  }
  function initCustomForm() {
    const form = $('#custom-form'); $$('[data-mask="phone"]').forEach(maskPhone);
    const up = $('.upload', form); const file = $('#cf-photo'); const prev = $('.upload__preview', form); let picked = null;
    const show = (f) => { if (!f || !f.type.startsWith('image/')) return; picked = f; prev.src = URL.createObjectURL(f); prev.hidden = false; up.classList.add('has-file'); };
    file.addEventListener('change', () => show(file.files[0]));
    ['dragenter', 'dragover'].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.add('is-drag'); }));
    ['dragleave', 'drop'].forEach((t) => up.addEventListener(t, (e) => { e.preventDefault(); up.classList.remove('is-drag'); }));
    up.addEventListener('drop', (e) => show(e.dataTransfer.files[0]));
    let via = 'tg';
    $$('[data-send]', form).forEach((b) => b.addEventListener('click', () => { via = b.dataset.send; }));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ph = $('#cf-phone'); const field = ph.closest('.field'); const ok = ph.value.replace(/\D/g, '').length === 11;
      field.classList.toggle('is-error', !ok); $('.field__err', field).textContent = ok ? '' : 'Проверьте номер: нужно 10 цифр после +7';
      if (!ok) { ph.focus(); return; }
      const text = `Здравствуйте! Хочу индивидуальный букет.\nИмя: ${$('#cf-name').value || '—'}\nТелефон: ${ph.value}\nПожелания: ${$('#cf-wish').value || '—'}${picked ? '\nФото-пример пришлю в чат.' : ''}`;
      // На телефоне с фото — системное «Поделиться»: фото и текст уйдут в выбранный мессенджер
      if (picked && navigator.canShare?.({ files: [picked] })) {
        try { await navigator.share({ files: [picked], text: withSource(text) }); Effects.confetti(); toast('Готово! Мария ответит в течение 15 минут'); return; } catch { /* отменили */ }
      }
      if (via === 'max') sendMax(text); else { goal('click_telegram'); window.open(tgLink(text), '_blank', 'noopener'); }
      Effects.confetti();
      toast(picked ? 'Текст готов — прикрепите фото в чате' : 'Готово! Мария ответит в течение 15 минут');
    });
  }

  /* ---------- Эффекты ---------- */
  const Effects = {
    bindCard(el) {
      if (!FINE || !FEATURES.tilt || REDUCE) return;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${px * 100}%`); el.style.setProperty('--my', `${py * 100}%`);
        if (HAS_GSAP) gsap.to(el, { rotateY: (px - 0.5) * 8, rotateX: (0.5 - py) * 8, transformPerspective: 900, duration: 0.6, overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => { if (HAS_GSAP) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.9 }); });
    },
    fly(fromImg, src) {
      const btn = $('.cart-btn'); const count = $('#cart-count');
      const bump = () => { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); };
      if (!FEATURES.flyToCart || !ANIM || !fromImg) return bump();
      if ($('#header').classList.contains('is-hidden')) $('#header').classList.remove('is-hidden');
      const a = fromImg.getBoundingClientRect(); const b = btn.getBoundingClientRect();
      const f = document.createElement('img'); f.className = 'fly'; f.src = src; f.alt = '';
      document.body.appendChild(f);
      const x0 = a.left + a.width / 2 - 32, y0 = a.top + a.height / 2 - 32, x1 = b.left + b.width / 2 - 32, y1 = b.top + b.height / 2 - 32;
      gsap.set(f, { x: x0, y: y0, scale: 1.4, opacity: 0 });
      const tl = gsap.timeline({ onComplete: () => { f.remove(); bump(); gsap.fromTo(count, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, .4)' }); } });
      tl.to(f, { opacity: 1, scale: 1, duration: 0.25 })
        .to(f, { x: x1, duration: 0.85, ease: 'power2.inOut' }, '<')
        .to(f, { y: Math.min(y0, y1) - 140, duration: 0.42, ease: 'power2.out' }, '<')
        .to(f, { y: y1, duration: 0.43, ease: 'power2.in' }, '>')
        .to(f, { scale: 0.3, opacity: 0.2, duration: 0.25 }, '-=.2');
    },
    confetti() {
      if (!FEATURES.confetti || REDUCE) return;
      const cv = $('#confetti'); const ctx = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
      const cols = ['#e8517a', '#b3143f', '#f1dcaa', '#d9b779', '#f3e9dc', '#6b9a52'];
      const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.6, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 18 - 8, s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0], heart: Math.random() < 0.25 }));
      const t0 = performance.now();
      const tick = (t) => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ps.forEach((p) => { p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
          if (p.heart) { ctx.font = `${p.s * 2.2}px serif`; ctx.fillText('♥', 0, 0); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
          ctx.restore(); });
        if (t - t0 < 2200) requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
      };
      requestAnimationFrame(tick);
    },
  };

  /* ---------- Курсор ---------- */
  function initCursor() {
    if (!FEATURES.cursor || !FINE || REDUCE || !HAS_GSAP) return;
    document.documentElement.classList.add('has-cursor');
    const c = $('#cursor'); const label = $('.cursor__label', c);
    const xSet = gsap.quickSetter(c, 'x', 'px'); const ySet = gsap.quickSetter(c, 'y', 'px');
    addEventListener('pointermove', (e) => { c.classList.add('is-on'); xSet(e.clientX); ySet(e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, input, textarea, select, label');
      c.classList.remove('is-label', 'is-heart', 'is-link');
      if (!t) return;
      const k = t.dataset.cursor;
      if (k === 'heart') c.classList.add('is-heart');
      else if (k === 'view') { label.textContent = 'Смотреть'; c.classList.add('is-label'); }
      else if (k === 'drag') { label.textContent = 'Тяни'; c.classList.add('is-label'); }
      else if (!/INPUT|TEXTAREA|SELECT/.test(t.tagName)) c.classList.add('is-link');
    });
  }

  /* ---------- Магнитные кнопки ---------- */
  function initMagnetic() {
    if (!FEATURES.magnetic || !FINE || !ANIM) return;
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5 }); });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }));
    });
  }

  /* ---------- Hero: параллакс слоёв ---------- */
  function initHeroParallax() {
    if (!FEATURES.heroParallax || !ANIM) return;
    const v = $('#hero-visual'); const layers = $$('.layer', v);
    if (FINE) {
      const tos = layers.map((l) => ({ d: +l.dataset.depth, x: gsap.quickTo(l, 'x', { duration: 1, ease: 'power3.out' }), y: gsap.quickTo(l, 'y', { duration: 1, ease: 'power3.out' }) }));
      $('.hero').addEventListener('pointermove', (e) => {
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        tos.forEach((t) => { t.x(nx * 40 * t.d); t.y(ny * 40 * t.d); });
      });
    } else {
      // на телефонах — простой сдвиг при скролле
      layers.forEach((l) => gsap.to(l, { yPercent: -12 * +l.dataset.depth, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
    }
  }

  /* ---------- Бегущая строка ---------- */
  function initMarquee() {
    $$('[data-marquee]').forEach((m) => {
      const track = $('.marquee__track', m); const base = track.innerHTML;
      while (track.scrollWidth < innerWidth * 2.2) track.insertAdjacentHTML('beforeend', base);
      track.insertAdjacentHTML('beforeend', track.innerHTML);
      if (REDUCE || !HAS_GSAP) return;
      let x = 0, boost = 0; const half = () => track.scrollWidth / 2;
      gsap.ticker.add((t, dt) => {
        const vel = FEATURES.marqueeVelocity && lenis ? lenis.velocity : 0;
        boost += (Math.abs(vel) * 0.6 - boost) * 0.08;
        const dir = vel < -0.5 ? -1 : 1;
        x -= (0.04 * dt + boost) * dir; const h = half();
        if (x <= -h) x += h; if (x > 0) x -= h;
        track.style.transform = `translate3d(${x}px,0,0)`;
      });
    });
  }

  /* ---------- Анимации при скролле ---------- */
  function splitWords(el) {
    const out = [];
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) out.push(document.createTextNode(' ')); else { const s = document.createElement('span'); s.className = 'w'; s.innerHTML = `<span>${esc(w)}</span>`; out.push(s); } });
      else { const s = document.createElement('span'); s.className = 'w'; const inner = document.createElement('span'); inner.appendChild(n.cloneNode(true)); s.appendChild(inner); out.push(s); }
    });
    el.replaceChildren(...out);
    return $$('.w > span', el);
  }
  function initScrollFx() {
    if (!ANIM) { $$('.reveal-img').forEach((e) => e.classList.add('is-revealed')); return; }
    if (FEATURES.splitHeadings) $$('.split').forEach((h) => {
      const words = splitWords(h);
      gsap.from(words, { yPercent: 115, rotate: 3, duration: 1, stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 86%' } });
    });
    $$('.section__lead, .section .eyebrow, .ways li, .compare-facts > div, .corp__list li, .del-card, .qa, .review, .maria__lead, .maria__facts li, .step').forEach((el) => {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.9, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    if (FEATURES.imageReveal) {
      $$('.reveal-img').forEach((el) => {
        const img = $('img', el);
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
          .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut' })
        ;
        if (img) gsap.from(img, { scale: 1.25, duration: 1.4, clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 85%' } });
      });
      $$('.occ, .hit').forEach((el, i) => gsap.from(el, { opacity: 0, y: 50, duration: 0.9, delay: (i % 4) * 0.06, scrollTrigger: { trigger: el, start: 'top 92%' } }));
      // мягкое свечение за букетами при появлении
      gsap.from('.compare', { boxShadow: '0 50px 120px -50px rgba(214, 38, 84, 0)', duration: 1.6, scrollTrigger: { trigger: '.compare', start: 'top 80%' } });
    }
    if (FEATURES.floaters) $$('.floater').forEach((f) => {
      gsap.to(f, { y: () => +f.dataset.speed * document.body.scrollHeight * 0.25, rotate: `+=${+f.dataset.speed * 400}`, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 } });
    });
    else $('.floaters')?.remove();
    if (FEATURES.timelineDraw) {
      const tl = $('#timeline'); const steps = $$('.step', tl); const vertical = () => innerWidth <= 1100;
      ScrollTrigger.create({
        trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: 0.6,
        onUpdate: (s) => {
          $('.timeline__line span').style.transform = vertical() ? `scaleY(${s.progress})` : `scaleX(${s.progress})`;
          steps.forEach((st, i) => st.classList.toggle('is-on', s.progress >= i / steps.length + 0.02));
        },
      });
    } else $$('.step').forEach((s) => s.classList.add('is-on'));
    if (FEATURES.stackCards) {
      const cards = $$('.stack__card');
      cards.forEach((c, i) => {
        c.style.setProperty('--i', i);
        const next = cards[i + 1]; if (!next) return;
        gsap.to(c, { scale: 0.92 - (cards.length - i) * 0.005, ease: 'none', scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true } });
        gsap.to(c.children, { opacity: 0.25, ease: 'none', scrollTrigger: { trigger: next, start: 'top 70%', end: 'top 35%', scrub: true } });
      });
    }
    gsap.from('.final__glow', { scale: 0.5, opacity: 0, duration: 2, scrollTrigger: { trigger: '.final', start: 'top 80%' } });
  }

  /* ---------- 1. Прелоадер и интро ---------- */
  function intro() {
    const pre = $('#preloader');
    const heroIn = () => {
      document.body.classList.remove('is-loading');
      if (!ANIM) return;
      gsap.timeline()
        .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power3.out' })
        .from('.hero .reveal-up', { y: 28, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=.7')
        .from('.hero__frame', { scale: 0.85, opacity: 0, duration: 1.3, ease: 'power3.out' }, 0)
        .from('.hero__halo', { scale: 0.4, opacity: 0, duration: 1.8 }, 0)
        .from('.deco, .hero__badge', { scale: 0, opacity: 0, rotate: -30, duration: 1, stagger: 0.07, ease: 'back.out(1.6)' }, 0.4);
    };
    let seen = false; try { seen = !!sessionStorage.getItem('sb-intro'); sessionStorage.setItem('sb-intro', '1'); } catch { /* */ }
    if (!FEATURES.preloader || !ANIM) { pre.classList.add('is-done'); heroIn(); return; }
    const tl = gsap.timeline({ onComplete: () => { pre.classList.add('is-done'); } });
    if (seen) {
      tl.to(pre, { opacity: 0, duration: 0.5, onStart: heroIn });
      return;
    }
    tl.to('.preloader__mark .draw', { strokeDashoffset: 0, duration: 1.3, stagger: 0.12, ease: 'power2.inOut' })
      .to('.preloader__word', { opacity: 1, y: 0, duration: 0.6 }, '-=.5')
      .to('.preloader__inner', { opacity: 0, y: -20, duration: 0.5, delay: 0.25 })
      .to('.preloader__curtain', { scaleY: 1, duration: 0.6, ease: 'power3.inOut' }, '<')
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'power3.inOut', onStart: heroIn });
  }

  /* ---------- SEO: Product-разметка хитов ---------- */
  function seoProducts() {
    const data = {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Хиты «Слопай букет»',
      itemListElement: HITS.map((h, n) => { const i = BY_ID.get(h.id); return {
        '@type': 'ListItem', position: n + 1,
        item: { '@type': 'Product', name: i.name, description: h.desc, image: `${CONFIG.photoBase}${i.id}.jpg`, brand: { '@type': 'Brand', name: 'Слопай букет' },
          offers: { '@type': 'Offer', price: i.price, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', url: `${CONFIG.siteUrl}#catalog`, seller: { '@id': `${CONFIG.siteUrl}#business` } } },
      }; }),
    };
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }

  /* ---------- Старт ---------- */
  function boot() {
    bindMessengers();
    initSeason();
    renderBlocks();
    initLenis();
    initHeader();
    initMega();
    Menu.init();
    Panels.init();
    Catalog.init();
    Fav.sync();
    Cart.init();
    Quick.init();
    Quiz.init();
    initHits();
    initCompare();
    initCustomForm();
    initStatus();
    initCursor();
    initMagnetic();
    if (FINE && FEATURES.tilt && !REDUCE) $$('[data-tilt], .hit').forEach((el) => Effects.bindCard(el));
    initHeroParallax();
    initMarquee();
    initScrollFx();
    seoProducts();
    intro();
    if (HAS_GSAP) addEventListener('load', () => ScrollTrigger.refresh());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
