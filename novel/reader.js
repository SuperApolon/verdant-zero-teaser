/* VERDANT//ZERO reader (decision 64): settings, resume, read marks, progress, lightbox. Own storage key; no network. */
(() => {
  /* X profile URL: undecided. Set here, or via <html data-x-url="…">; empty => X link hidden. */
  const X_URL = '';
  const KEY = 'vz.reader.v1', d = document.documentElement, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); return obj(v) ? v : {}; } catch { return {}; } };
  const fix = o => { if (!obj(o.s)) o.s = {}; if (!obj(o.pos)) o.pos = {}; if (!Array.isArray(o.read)) o.read = []; return o; };
  let st = fix(load());
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };
  const DEF = { theme: 'auto', size: '1', font: 'mincho', wm: 'h' };
  const OK = { theme: ['auto', 'white', 'kinari', 'dark'], size: ['0', '1', '2', '3'], font: ['mincho', 'gothic'], wm: ['h', 'v'] };
  for (const k in st.s) if (!OK[k] || !OK[k].includes(st.s[k])) delete st.s[k];
  let apply = () => { for (const k in DEF) d.dataset[k] = st.s[k] || DEF[k]; const q = $('#vz-wm'); if (q) { const v = d.dataset.wm === 'v'; q.textContent = v ? '横' : '縦'; q.setAttribute('aria-label', v ? '横書きにする' : '縦書きにする'); } $$('[data-set]').forEach(b => b.setAttribute('aria-pressed', String((st.s[b.dataset.set] || DEF[b.dataset.set]) === b.dataset.val))); };
  apply();
  // quick vertical/horizontal toggle (D64: default horizontal)
  const barEl = $('.bar'), setEl = $('#vz-settings');
  if (barEl && $('.text') && !$('#vz-wm')) { const q = document.createElement('button'); q.type = 'button'; q.className = 'btn wm'; q.id = 'vz-wm';
    barEl.insertBefore(q, setEl || null); q.addEventListener('click', () => { const r = ratio(); st.s.wm = d.dataset.wm === 'v' ? 'h' : 'v'; save(); apply(); requestAnimationFrame(() => { goto(r); if (vert()) { const t = $('.text'); if (t.getBoundingClientRect().top < 0 || t.getBoundingClientRect().bottom > innerHeight) t.scrollIntoView({ block: 'start' }); } }); }); apply(); }
  // settings panel
  const panel = $('#vz-panel'), tog = $('#vz-settings');
  if (tog && panel) {
    const setP = open => { panel.hidden = !open; tog.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('panel-open', open); };
    tog.addEventListener('click', () => setP(panel.hidden));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setP(false); });
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target) && !tog.contains(e.target) && !e.target.closest('.resume')) setP(false); });
    panel.addEventListener('click', e => { const b = e.target.closest('[data-set]'); if (!b) return;
      const r = ratio(); st.s[b.dataset.set] = b.dataset.val; save(); apply(); requestAnimationFrame(() => goto(r)); });
  }
  const ep = d.dataset.ep, text = $('.text');
  const vert = () => d.dataset.wm === 'v' && text;
  function ratio() {
    if (!text) return 0;
    if (vert()) { const m = text.scrollWidth - text.clientWidth; return m > 0 ? Math.min(1, Math.abs(text.scrollLeft) / m) : 0; }
    const r = text.getBoundingClientRect(), h = r.height - innerHeight * .6; return h > 0 ? Math.min(1, Math.max(0, -r.top / h)) : 1;
  }
  function goto(x) {
    if (!text) return;
    if (vert()) { const m = text.scrollWidth - text.clientWidth; if (x <= 0) { toStart(); return; } text.scrollLeft = -x * m; return; }
    const r = text.getBoundingClientRect(); scrollTo(0, scrollY + r.top + x * (r.height - innerHeight * .6));
  }
  // vertical-rl start = right edge. Spec: scrollLeft 0 (range -max..0); legacy WebKit: max (range 0..max). Clamp handles both.
  function toStart() { if (!text) return; text.scrollLeft = text.scrollWidth; if (text.scrollLeft !== 0 && text.scrollLeft < text.scrollWidth - text.clientWidth - 1) text.scrollLeft = 0; }
  fit(); if (vert()) { toStart(); addEventListener('load', () => { if (vert() && Math.abs(text.scrollLeft) < 2) toStart(); }, { once: true }); }
  // keep the page itself from scrolling sideways; wheel (vertical) moves text horizontally in vertical mode
  if (text) text.addEventListener('wheel', e => { if (!vert() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const m = text.scrollWidth - text.clientWidth, a = Math.abs(text.scrollLeft); if (m <= 0) return;
    if ((e.deltaY > 0 && a >= m - 1) || (e.deltaY < 0 && a <= 1)) return; e.preventDefault(); text.scrollLeft -= e.deltaY * (e.deltaMode === 1 ? 32 : 1); }, { passive: false });
  addEventListener('scroll', () => { if (scrollX) scrollTo(0, scrollY); }, { passive: true });
  // D64 vertical: fit the whole text box in the viewport at page top (hero moves into the text flow; height from space below box top)
  var hero = $('main .hero'), heroHome = hero && hero.parentNode, heroNext = hero && hero.nextSibling;
  function fit() { if (!text) return;
    if (vert()) { if (hero && hero.parentNode !== text) text.prepend(hero);
      const top = text.getBoundingClientRect().top + scrollY, avail = Math.floor(innerHeight - top - 12);
      d.style.setProperty('--vz-vh', Math.max(avail, 0) + 'px'); }
    else { if (hero && hero.parentNode === text) heroHome.insertBefore(hero, heroNext); d.style.removeProperty('--vz-vh'); } }
  fit(); addEventListener('resize', () => fit()); addEventListener('load', () => fit()); if (window.ResizeObserver) { const ro = new ResizeObserver(() => fit()); $$('.head,.resume').forEach(e => ro.observe(e)); }
  const _apply = apply; apply = function () { _apply(); fit(); };
  const bar = $('.progress i');
  if (ep && text) {
    const saved = st.pos[ep];
    if (saved > .03 && saved < .97) { const rb = $('.resume'); if (rb) { rb.classList.add('on'); rb.querySelector('button').onclick = () => { goto(saved); rb.classList.remove('on'); }; } }
    let t = 0; const tick = () => { const x = ratio(); if (bar) bar.style.width = (x * 100).toFixed(1) + '%';
      clearTimeout(t); t = setTimeout(() => { st = fix(Object.assign(load(), { s: st.s }));
        st.pos[ep] = Math.round(x * 1000) / 1000; st.last = ep; if (x > .95 && !st.read.includes(ep)) st.read.push(ep); save(); }, 250); };
    addEventListener('scroll', tick, { passive: true }); text.addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); if (bar) bar.style.width = (ratio() * 100).toFixed(1) + '%';
  }
  // TOC marks
  $$('.toc li[data-ep]').forEach(li => { const id = li.dataset.ep; if (!st.read.includes(id) && st.pos[id] > .03) li.classList.add('reading'); });
  const cont = $('.continue');
  if (cont && st.last && $(`.toc li[data-ep="${st.last}"]`)) { cont.hidden = false; cont.querySelector('a').href = `./${st.last}.html`; }
  // TOC badges: newest published = last entry in the TOC (TOC lists published eps only). Read state: vz.reader.v1 + vz.shared.v1 readEpisodes (read-only).
  const sharedRead = (() => { try { const v = JSON.parse(localStorage.getItem('vz.shared.v1')); return v && Array.isArray(v.readEpisodes) ? v.readEpisodes.filter(n => Number.isInteger(n)).map(n => 'ep' + String(n).padStart(2, '0')) : []; } catch { return []; } })();
  const tocLis = $$('.toc li[data-ep]');
  tocLis.forEach((li, i) => { const id = li.dataset.ep, a = li.querySelector('a'); if (!a) return;
    const isRead = st.read.includes(id) || sharedRead.includes(id), reading = !isRead && st.pos[id] > .03; if (isRead) li.classList.add('read');
    const bs = document.createElement('span'); bs.className = 'badges';
    const add = (cls, t) => { const b = document.createElement('span'); b.className = 'badge ' + cls; b.textContent = t; bs.append(b); };
    if (i === tocLis.length - 1) add('new', 'NEW');
    if (!isRead && !reading) add('unread', '未読');
    if (bs.childNodes.length) a.append(bs); });
  // end of the latest published episode: no next link exists (empty p.next[data-next], no rel=next)
  const xUrl = (d.dataset.xUrl || X_URL || '').trim();
  const outro = $('.outro'), nx = $('.outro .next[data-next]');
  if (ep && outro && nx && !nx.querySelector('a') && !$('a[rel=next]') && !$('.outro .soon')) {
    const box = document.createElement('div'); box.className = 'soon'; box.setAttribute('role', 'note');
    const p = document.createElement('p'); p.textContent = '続きは準備中です'; const acts = document.createElement('div'); acts.className = 'acts';
    const lk = (href, t, ext) => { const a = document.createElement('a'); a.href = href; a.textContent = t; if (ext) { a.rel = 'noopener'; a.target = '_blank'; } acts.append(a); };
    lk('./', '目次へ'); if (/^https:\/\/(x|twitter)\.com\//.test(xUrl) && !outro.querySelector(`a[href="${CSS.escape(xUrl)}"]`)) lk(xUrl, 'X で最新情報を見る', true);
    box.append(p, acts); nx.replaceWith(box); }
  // lightbox
  const lb = $('#vz-lb');
  if (lb) { const im = new Image(); lb.prepend(im);
    $$('.hero img,.illust img').forEach(i => { i.tabIndex = 0; const open = () => { im.src = i.currentSrc || i.src; im.alt = i.alt; lb.hidden = false; lb.querySelector('button').focus(); };
      i.addEventListener('click', open); i.addEventListener('keydown', e => { if (e.key === 'Enter') open(); }); });
    lb.addEventListener('click', () => { lb.hidden = true; im.removeAttribute('src'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) lb.click(); }); }
})();
