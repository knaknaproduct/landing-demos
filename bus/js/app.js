// Мобильное меню
const header = document.querySelector('.header');
const burger = document.querySelector('.burger');
burger?.addEventListener('click', () => {
  const open = header.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

// Поиск рейса на главной -> список маршрутов с фильтром
const search = document.querySelector('.search');
search?.addEventListener('submit', (e) => {
  e.preventDefault();
  const params = new URLSearchParams();
  if (search.from.value) params.set('from', search.from.value);
  if (search.to.value) params.set('to', search.to.value);
  location.href = 'routes.html' + (params.size ? '?' + params : '');
});

// Фильтр маршрутов: по чипу города или по запросу «откуда-куда» из URL
const list = document.querySelector('[data-routes]');
if (list) {
  const routes = [...list.querySelectorAll('.route')];
  const chips = document.querySelectorAll('.chip');
  const empty = document.querySelector('[data-empty]');
  const note = document.querySelector('[data-search-note]');

  const show = (match) => {
    routes.forEach((r) => { r.hidden = !match(r.dataset.cities.split(',')); });
    empty.hidden = routes.some((r) => !r.hidden);
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    note.hidden = true;
    history.replaceState(null, '', location.pathname);
    const city = chip.dataset.city;
    show((cities) => city === 'all' || cities.includes(city));
  }));

  const params = new URLSearchParams(location.search);
  const from = params.get('from');
  const to = params.get('to');
  if (from || to) {
    note.hidden = false;
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    note.querySelector('b').textContent = [from, to].filter(Boolean).join(' - ');
    show((cities) => (!from || cities.includes(from)) && (!to || cities.includes(to))
      && (!from || !to || cities.indexOf(from) < cities.indexOf(to)));
  }
}

// Галерея автопарка
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const img = lightbox.querySelector('img');
  document.querySelectorAll('.gallery button').forEach((btn) => btn.addEventListener('click', () => {
    const thumb = btn.querySelector('img');
    img.src = thumb.dataset.full;
    img.alt = thumb.alt;
    lightbox.showModal();
  }));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
}

// Форма обратной связи (в демо не отправляется)
const form = document.querySelector('.form');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  form.classList.add('is-sent');
  form.reset();
  form.querySelector('.form__ok').focus();
});
