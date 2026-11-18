// Рисует фасад и планировку дома по параметрам проекта (SVG).
const LOOK = {
  brus:   { wall: '#c08a52', line: 'rgba(80,45,15,.28)', trim: '#7a4e2a', base: '#6b6258', win: '#2e3d45', frame: '#f3ede4', dir: 'h' },
  gaz:    { wall: '#ece8e0', line: null, trim: '#5b625d', base: '#8c8f8a', win: '#2e3d45', frame: '#ffffff', dir: null },
  karkas: { wall: '#4f6f6a', line: 'rgba(255,255,255,.13)', trim: '#f1f1ee', base: '#3b3f42', win: '#25333a', frame: '#f1f1ee', dir: 'v' },
};
const ROOFS = ['#3e3a36', '#5e3328', '#2f3b35'];

function facadeSVG(p, opt = {}) {
  const L = LOOK[p.mat];
  const roofC = ROOFS[p.id % 3];
  const VW = 400, VH = 250, G = 214;
  const terW = p.terrace ? 2.6 : 0, garW = p.garage ? 4.6 : 0;
  const s = Math.min(19, 300 / (p.w + terW + garW));
  const W = p.w * s;
  const bodyH = (p.floors === 1 ? 3.1 : p.floors === 1.5 ? 3.8 : 6.2) * s;
  const roofH = W * (p.floors === 1.5 ? 0.5 : p.roof === 'hip' ? 0.24 : 0.34);
  const x0 = (VW - (W + (terW + garW) * s)) / 2 + terW * s;
  const top = G - bodyH;
  const id = 'h' + p.id + (opt.big ? 'b' : '');
  let o = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Фасад проекта ${p.name}">`;
  o += `<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6e3e7"/><stop offset="1" stop-color="#eef2ee"/></linearGradient>`;
  o += `<clipPath id="${id}c"><rect x="${x0}" y="${top}" width="${W}" height="${bodyH}"/></clipPath></defs>`;
  o += `<rect width="${VW}" height="${VH}" fill="url(#${id}s)"/>`;
  // деревья
  const tree = (x, h, c) => `<path d="M${x} ${G - h}l${h * .28} ${h * .62}h${-h * .12}l${h * .16} ${h * .38}h${-h * .64}l${h * .16} ${-h * .38}h${-h * .12}z" fill="${c}"/>`;
  o += tree(28, 120, '#a9bba6') + tree(60, 86, '#94ab93') + tree(372, 104, '#a9bba6');
  o += `<rect y="${G}" width="${VW}" height="${VH - G}" fill="#c9d4c0"/><rect y="${G}" width="${VW}" height="3" fill="#b3c0aa"/>`;
  // гараж
  if (p.garage) {
    const gx = x0 + W, gw = garW * s, gh = 2.7 * s;
    o += `<rect x="${gx}" y="${G - gh}" width="${gw}" height="${gh}" fill="${L.wall}"/>`;
    o += `<rect x="${gx + gw * .14}" y="${G - gh * .78}" width="${gw * .72}" height="${gh * .78}" fill="${L.base}"/>`;
    for (let i = 1; i < 6; i++) o += `<rect x="${gx + gw * .14}" y="${G - gh * .78 + i * gh * .13}" width="${gw * .72}" height="1" fill="rgba(255,255,255,.18)"/>`;
    o += `<path d="M${gx - 2} ${G - gh}h${gw + 8}l-6 -${s * .7}h${-gw + 4}z" fill="${roofC}"/>`;
  }
  // стены
  o += `<rect x="${x0}" y="${top}" width="${W}" height="${bodyH}" fill="${L.wall}"/>`;
  if (L.dir === 'h') { o += `<g clip-path="url(#${id}c)">`; for (let y = top + 6; y < G; y += 6) o += `<rect x="${x0}" y="${y}" width="${W}" height="1" fill="${L.line}"/>`; o += `</g>`; }
  if (L.dir === 'v') { o += `<g clip-path="url(#${id}c)">`; for (let x = x0 + 7; x < x0 + W; x += 7) o += `<rect x="${x}" y="${top}" width="1" height="${bodyH}" fill="${L.line}"/>`; o += `</g>`; }
  o += `<rect x="${x0 - 2}" y="${G - s * .55}" width="${W + 4}" height="${s * .55}" fill="${L.base}"/>`;
  // кровля
  const ov = s * .6;
  if (p.roof === 'hip' && p.floors !== 1.5) {
    o += `<path d="M${x0 - ov} ${top}H${x0 + W + ov}L${x0 + W * .74} ${top - roofH}H${x0 + W * .26}z" fill="${roofC}"/>`;
  } else {
    o += `<path d="M${x0 - ov} ${top + ov * .5}L${x0 + W / 2} ${top - roofH}L${x0 + W + ov} ${top + ov * .5}z" fill="${roofC}"/>`;
    o += `<path d="M${x0 + s * .5} ${top}L${x0 + W / 2} ${top - roofH + s * .9}L${x0 + W - s * .5} ${top}z" fill="${L.wall}"/>`;
    if (L.dir === 'h') for (let y = top - roofH + s * 1.6; y < top; y += 6) {
      const half = (y - (top - roofH + s * .9)) / (roofH - s * .9) * (W / 2 - s * .5);
      o += `<rect x="${x0 + W / 2 - half}" y="${y}" width="${half * 2}" height="1" fill="${L.line}"/>`;
    }
    // окно во фронтоне
    if (p.floors === 1.5 || p.light) {
      const ww = s * 1.6, wh = s * 1.3;
      o += `<rect x="${x0 + W / 2 - ww / 2 - 2}" y="${top - wh - s * .5 - 2}" width="${ww + 4}" height="${wh + 4}" fill="${L.frame}"/><rect x="${x0 + W / 2 - ww / 2}" y="${top - wh - s * .5}" width="${ww}" height="${wh}" fill="${L.win}"/>`;
    }
  }
  // окна
  const win = (x, y, w, h) => `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="${L.frame}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${L.win}"/><rect x="${x + w / 2 - .75}" y="${y}" width="1.5" height="${h}" fill="${L.frame}"/>`;
  const levels = p.floors === 2 ? 2 : 1;
  const n = Math.max(2, Math.round(p.w / 3.2));
  const step = W / n;
  const doorI = Math.floor(n / 2) - (n % 2 ? 0 : 1);
  for (let lv = 0; lv < levels; lv++) {
    const fy = G - (lv + 1) * 3.05 * s;
    for (let i = 0; i < n; i++) {
      const cx = x0 + step * (i + .5);
      if (p.light && i === doorI + 1 && levels === 2) { if (lv === 0) o += win(cx - s * .8, G - 5.6 * s, s * 1.6, 4.6 * s); continue; }
      if (lv === 0 && i === doorI) {
        o += `<rect x="${cx - s * .55}" y="${G - s * 2.6}" width="${s * 1.1}" height="${s * 2.05}" fill="${L.trim}"/><circle cx="${cx + s * .32}" cy="${G - s * 1.5}" r="1.4" fill="#e7c48d"/>`;
      } else {
        o += win(cx - s * .7, fy + s * .9, s * 1.4, s * 1.45);
      }
    }
  }
  // терраса
  if (p.terrace) {
    const tx = x0 - terW * s, tw = terW * s + W * .3, th = 2.6 * s;
    o += `<rect x="${tx}" y="${G - s * .5}" width="${tw}" height="${s * .5}" fill="#8b6a48"/>`;
    o += `<path d="M${tx - 4} ${G - th}H${x0 + W * .3}V${G - th + s * .35}H${tx - 4}z" fill="${roofC}"/>`;
    for (const px of [tx + 2, tx + terW * s * .55]) o += `<rect x="${px}" y="${G - th + s * .3}" width="${Math.max(2, s * .2)}" height="${th - s * .8}" fill="#7a5a3a"/>`;
    o += `<rect x="${tx}" y="${G - s * 1.4}" width="${terW * s}" height="2" fill="#7a5a3a"/>`;
  }
  return o + '</svg>';
}

// Планировка первого этажа: упрощённая схема с площадями комнат
function planSVG(p) {
  const S = 34, W = p.w * S, D = p.d * S, pad = 30;
  const rooms = [];
  const half = Math.round(p.w * .52 * 2) / 2;
  rooms.push({ n: 'Кухня-гостиная', x: 0, y: 0, w: half, h: p.d * .62 });
  rooms.push({ n: 'Прихожая', x: 0, y: p.d * .62, w: half * .5, h: p.d * .38 });
  rooms.push({ n: 'Санузел', x: half * .5, y: p.d * .62, w: half * .5, h: p.d * .38 });
  const rest = p.floors === 1 ? Array.from({ length: p.beds }, (_, i) => 'Спальня') : ['Гостевая спальня', 'Кабинет'];
  if (p.floors === 1 && p.baths > 1) rest.push('Санузел');
  const cols = rest.length > 3 ? 2 : 1, rows = Math.ceil(rest.length / cols);
  const rw = (p.w - half) / cols, rh = p.d / rows;
  rest.forEach((n, i) => rooms.push({ n, x: half + (i % cols) * rw, y: Math.floor(i / cols) * rh, w: rw, h: rh }));
  let o = `<svg viewBox="0 0 ${W + pad * 2} ${D + pad * 2 + (p.terrace ? 60 : 0)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Планировка первого этажа проекта ${p.name}" font-family="Golos Text, sans-serif">`;
  o += `<g transform="translate(${pad} ${pad})">`;
  for (const r of rooms) {
    const x = r.x * S, y = r.y * S, w = r.w * S, h = r.h * S;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#23272a" stroke-width="3"/>`;
    const fs = Math.min(15, w / 6.5);
    o += `<text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#23272a">${r.n}</text>`;
    o += `<text x="${x + w / 2}" y="${y + h / 2 + fs + 2}" text-anchor="middle" font-size="${fs * .85}" fill="#66706a">${(r.w * r.h * .92).toFixed(1).replace('.', ',')} м²</text>`;
  }
  o += `<rect x="0" y="0" width="${W}" height="${D}" fill="none" stroke="#23272a" stroke-width="7"/>`;
  if (p.terrace) {
    o += `<rect x="0" y="${D + 8}" width="${W * .6}" height="48" fill="#efe3d3" stroke="#b9783f" stroke-width="2" stroke-dasharray="6 4"/>`;
    o += `<text x="${W * .3}" y="${D + 37}" text-anchor="middle" font-size="14" fill="#7a4e2a">Терраса</text>`;
  }
  o += `<text x="${W / 2}" y="-10" text-anchor="middle" font-size="13" fill="#66706a">${String(p.w).replace('.', ',')} м</text>`;
  o += `<text x="${-12}" y="${D / 2}" text-anchor="middle" font-size="13" fill="#66706a" transform="rotate(-90 -12 ${D / 2})">${String(p.d).replace('.', ',')} м</text>`;
  return o + '</g></svg>';
}
