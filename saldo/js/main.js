// Меню на телефоне
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

// Маска телефона +7 (___) ___-__-__
function maskPhone(input) {
  input.addEventListener('input', () => {
    let d = input.value.replace(/\D/g, '');
    if (!d) { input.value = ''; return; }
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let v = '+7';
    if (p[0]) v += ' (' + p[0];
    if (p[0].length === 3) v += ')';
    if (p[1]) v += ' ' + p[1];
    if (p[2]) v += '-' + p[2];
    if (p[3]) v += '-' + p[3];
    input.value = v;
  });
}
document.querySelectorAll('input[type=tel]').forEach(maskPhone);

// Формы: проверка полей. В демо заявка никуда не уходит, на боевом сайте здесь отправка в Telegram.
document.querySelectorAll('form.form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[data-req]').forEach(inp => {
      const field = inp.closest('.field');
      const bad = inp.type === 'tel' ? inp.value.replace(/\D/g, '').length !== 11 : !inp.value.trim();
      field.classList.toggle('is-err', bad);
      if (bad && ok) { inp.focus(); ok = false; }
    });
    const agree = form.querySelector('[name=agree]');
    if (ok && agree && !agree.checked) { agree.focus(); ok = false; }
    if (ok) form.classList.add('is-sent');
  });
});

// Калькулятор стоимости обслуживания
const calc = document.getElementById('calc');
if (calc) {
  const BASE = { ip: { usn6: 2500, usn15: 3500, patent: 2000, osno: 7000 }, ooo: { usn6: 6000, usn15: 7500, osno: 12000 } };
  const OPS = { 30: 0, 100: 2500, 300: 6500, 600: 12000 };
  const PER_EMP = 900;
  const fmt = n => n.toLocaleString('ru-RU');
  const $ = id => document.getElementById(id);
  function update() {
    const form = calc.elements.form.value;
    const patent = calc.querySelector('input[value=patent]');
    patent.disabled = form === 'ooo';
    if (form === 'ooo' && patent.checked) calc.querySelector('input[value=usn6]').checked = true;
    const reg = calc.elements.regime.value;
    const emp = +calc.elements.emp.value;
    const opsCost = OPS[calc.elements.ops.value];
    const ved = calc.elements.ved.checked ? 3000 : 0;
    const base = BASE[form][reg];
    const empCost = emp * PER_EMP;
    $('emp-out').value = emp;
    $('c-base').textContent = fmt(base) + ' ₽';
    $('c-emp').textContent = emp ? fmt(empCost) + ' ₽' : 'нет';
    $('c-ops').textContent = opsCost ? fmt(opsCost) + ' ₽' : 'входит';
    $('c-ved-row').hidden = !ved;
    $('c-ved').textContent = fmt(ved) + ' ₽';
    $('c-sum').innerHTML = fmt(base + empCost + opsCost + ved) + ' <small>₽/мес</small>';
  }
  calc.addEventListener('input', update);
  update();
}
