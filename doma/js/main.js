const $ = (s, r = document) => r.querySelector(s);
const fmtMln = n => (n / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' млн ₽';
const fmt = n => n.toLocaleString('ru-RU');
const beds = n => n + ' ' + (n === 1 ? 'спальня' : n < 5 ? 'спальни' : 'спален');

// Меню на телефоне
const burger = $('#burger'), nav = $('#nav');
burger?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

// Маска телефона
document.querySelectorAll('input[type=tel]').forEach(input => input.addEventListener('input', () => {
  let d = input.value.replace(/\D/g, '');
  if (!d) { input.value = ''; return; }
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let v = '+7';
  if (p[0]) v += ' (' + p[0] + (p[0].length === 3 ? ')' : '');
  if (p[1]) v += ' ' + p[1];
  if (p[2]) v += '-' + p[2];
  if (p[3]) v += '-' + p[3];
  input.value = v;
}));

// Формы заявки (в демо не отправляются)
document.querySelectorAll('form.form').forEach(form => form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[data-req]').forEach(inp => {
    const bad = inp.type === 'tel' ? inp.value.replace(/\D/g, '').length !== 11 : !inp.value.trim();
    inp.closest('.field').classList.toggle('is-err', bad);
    if (bad && ok) { inp.focus(); ok = false; }
  });
  const agree = form.querySelector('[name=agree]');
  if (ok && agree && !agree.checked) { agree.focus(); ok = false; }
  if (ok) form.classList.add('is-sent');
}));

function card(p) {
  return `<article class="card">
    <a class="card__pic" href="project.html?id=${p.id}" tabindex="-1" aria-hidden="true">${facadeSVG(p)}</a>
    <div class="card__body">
      <div class="card__top"><h3><a href="project.html?id=${p.id}">${p.name}</a></h3><span class="tag tag--${p.mat}">${MATERIALS[p.mat].short}</span></div>
      <p class="card__meta">${p.area} м², ${FLOORS[p.floors]}, ${beds(p.beds)}</p>
      <p class="card__price">от <b>${fmtMln(p.price)}</b></p>
    </div>
  </article>`;
}

// Главная: популярные проекты и быстрый подбор
const popular = $('#popular');
if (popular) popular.innerHTML = [1, 2, 3].map(id => card(PROJECTS[id - 1])).join('');
const heroPic = $('#hero-pic');
if (heroPic) heroPic.innerHTML = facadeSVG(PROJECTS[0], { big: true });
document.querySelectorAll('[data-count]').forEach(el => {
  const m = el.dataset.count;
  el.textContent = PROJECTS.filter(p => !m || p.mat === m).length;
});

// Каталог
const grid = $('#grid');
if (grid) {
  const F = $('#filters');
  const PAGE = 9;
  let shown = PAGE;
  const sorters = {
    pop: (a, b) => a.pop - b.pop,
    cheap: (a, b) => a.price - b.price,
    exp: (a, b) => b.price - a.price,
    area: (a, b) => a.area - b.area,
  };
  // восстановить фильтры из адреса страницы
  const q = new URLSearchParams(location.search);
  for (const [k, v] of q) {
    v.split(',').forEach(val => {
      const el = F.querySelector(`[name="${k}"][value="${val}"]`);
      if (el) el.checked = true;
      else if (F.elements[k] && F.elements[k].tagName !== 'FIELDSET' && !F.elements[k].length) F.elements[k].value = val;
    });
    if (k === 'sort') $('#sort').value = v;
  }
  function state() {
    const fd = new FormData(F);
    return {
      mat: fd.getAll('mat'), floors: fd.get('floors') || '', beds: +(fd.get('beds') || 0),
      amin: +fd.get('amin') || 0, amax: +fd.get('amax') || 0, pmax: +fd.get('pmax') || 0,
      opt: fd.getAll('opt'), sort: $('#sort').value,
    };
  }
  function render(resetPage) {
    if (resetPage) shown = PAGE;
    const s = state();
    const list = PROJECTS.filter(p =>
      (!s.mat.length || s.mat.includes(p.mat)) &&
      (!s.floors || String(p.floors) === s.floors) &&
      p.beds >= s.beds &&
      (!s.amin || p.area >= s.amin) && (!s.amax || p.area <= s.amax) &&
      (!s.pmax || p.price <= s.pmax) &&
      s.opt.every(o => p[o])
    ).sort(sorters[s.sort]);
    $('#found').textContent = list.length;
    grid.innerHTML = list.length
      ? list.slice(0, shown).map(card).join('')
      : `<div class="empty"><b>Таких проектов пока нет</b><p>Уберите часть фильтров или напишите нам: изменим похожий проект под ваши размеры бесплатно.</p><button class="btn btn--ghost" type="button" id="reset2">Сбросить фильтры</button></div>`;
    $('#more').hidden = list.length <= shown;
    $('#more').textContent = `Показать ещё ${Math.min(PAGE, list.length - shown)}`;
    // адрес подборки
    const p = new URLSearchParams();
    if (s.mat.length) p.set('mat', s.mat.join(','));
    if (s.floors) p.set('floors', s.floors);
    if (s.beds) p.set('beds', s.beds);
    if (s.amin) p.set('amin', s.amin);
    if (s.amax) p.set('amax', s.amax);
    if (s.pmax) p.set('pmax', s.pmax);
    if (s.opt.length) p.set('opt', s.opt.join(','));
    if (s.sort !== 'pop') p.set('sort', s.sort);
    history.replaceState(null, '', p.toString() ? '?' + p : location.pathname);
    $('#reset').hidden = !(s.mat.length || s.floors || s.beds || s.amin || s.amax || s.pmax || s.opt.length);
  }
  F.addEventListener('input', () => render(true));
  $('#sort').addEventListener('change', () => render(true));
  $('#more').addEventListener('click', () => { shown += PAGE; render(false); });
  const reset = () => { F.reset(); render(true); };
  $('#reset').addEventListener('click', reset);
  grid.addEventListener('click', e => { if (e.target.id === 'reset2') reset(); });
  $('#share').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); $('#share').textContent = 'Ссылка скопирована'; }
    catch { $('#share').textContent = 'Скопируйте адрес из строки браузера'; }
    setTimeout(() => $('#share').textContent = 'Скопировать ссылку на подборку', 2200);
  });
  $('#toggle-f')?.addEventListener('click', e => {
    const open = F.classList.toggle('is-open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  render(true);
}

// Страница проекта
const proj = $('#project');
if (proj) {
  const id = +new URLSearchParams(location.search).get('id') || 1;
  const p = PROJECTS.find(x => x.id === id) || PROJECTS[0];
  const M = MATERIALS[p.mat];
  document.title = `Проект дома «${p.name}», ${p.area} м² - Ладный дом`;
  $('#p-crumb').textContent = p.name;
  $('#p-title').textContent = `Проект «${p.name}»`;
  $('#p-sub').textContent = `${M.name}, ${FLOORS[p.floors]}, ${p.area} м²`;
  $('#p-facade').innerHTML = facadeSVG(p, { big: true });
  $('#p-plan').innerHTML = planSVG(p);
  $('#p-plan-note').textContent = p.floors === 1 ? 'Все комнаты на одном этаже.' : `На втором этаже: ${beds(p.beds - 1)}, санузел и холл.`;
  const specs = [
    ['Общая площадь', p.area + ' м²'], ['Размер дома', `${p.w} × ${p.d} м`], ['Этажность', FLOORS[p.floors]],
    ['Спальни', p.beds], ['Санузлы', p.baths], ['Материал стен', M.name],
    ['Терраса', p.terrace ? 'есть' : 'нет'], ['Гараж', p.garage ? 'пристроенный' : 'нет'],
    ['Второй свет', p.light ? 'в гостиной' : 'нет'], ['Срок строительства', `${M.months}-${M.months + 2} мес.`],
  ];
  $('#p-specs').innerHTML = specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('#p-price').textContent = fmtMln(p.price);
  $('#p-kits').innerHTML = KITS.map((k, i) => `<div class="kit${i === 1 ? ' kit--main' : ''}">
    <h3>${k.name}</h3><p class="kit__price">${fmt(Math.round(p.price * k.k / 10000) * 10000)} ₽</p>
    <p class="kit__m2">${fmt(Math.round(M.rate * k.k / 100) * 100)} ₽ за м²</p>
    <ul>${k.items.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('');
  $('#f-project').value = `«${p.name}», ${p.area} м²`;
  $('#form-title').textContent = `Рассчитать «${p.name}» на вашем участке`;
  const sim = PROJECTS.filter(x => x.id !== p.id).sort((a, b) => (a.mat !== p.mat) - (b.mat !== p.mat) || Math.abs(a.area - p.area) - Math.abs(b.area - p.area)).slice(0, 3);
  $('#similar').innerHTML = sim.map(card).join('');
}
