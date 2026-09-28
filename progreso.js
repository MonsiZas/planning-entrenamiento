// Pantalla "Mi progreso": historial de semanas, peso y marcas, con gráficas.
// Usa el estado y las funciones de app.js (se carga después).

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const SVG_NS = 'http://www.w3.org/2000/svg';
const DIA_MS = 86400000;

function etiquetaSemana(lunes) {
  const [, m, d] = lunes.split('-').map(Number);
  return `${d} ${MESES[m - 1]}`;
}

// Lo contrario de numeroSemana: del número al lunes 'a-m-d'.
function lunesDeNumero(n) {
  const d = new Date(n * 7 * DIA_MS + 4 * DIA_MS);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

// Todas las semanas desde la primera con datos hasta hoy, sin huecos.
function semanasSeguidas() {
  const claves = [estado.semana, ...Object.keys(estado.historial), ...Object.keys(estado.pesos), ...Object.keys(estado.marcas)];
  const nums = claves.map(numeroSemana);
  const desde = Math.min(...nums);
  const hasta = Math.max(...nums);
  const res = [];
  for (let n = desde; n <= hasta; n++) res.push(lunesDeNumero(n));
  return res;
}

function hechosDe(lunes) {
  if (lunes === estado.semana) {
    const dias = estado.datos.dias;
    return { hechos: dias.filter((i) => estado.hechos[i]).length, total: dias.length, actual: true };
  }
  return estado.historial[lunes] || null;
}

const fmtPace = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

// Serie de una marca: un valor por semana.
// Ejercicio: el mejor kg (o las mejores reps si no usas peso). Carrera: km totales o el mejor ritmo.
function serieMarca(clave) {
  const semanas = Object.keys(estado.marcas).sort((a, b) => numeroSemana(a) - numeroSemana(b));
  if (clave === 'carrera_km' || clave === 'carrera_ritmo') {
    const puntos = [];
    semanas.forEach((lunes) => {
      const runs = Object.values(estado.marcas[lunes]).map((d) => d[CARRERA]).filter(Boolean);
      if (clave === 'carrera_km') {
        const km = runs.reduce((s, r) => s + (r.km || 0), 0);
        if (km) puntos.push({ lunes, y: km, detalle: `${runs.length} ${runs.length === 1 ? 'carrera' : 'carreras'}` });
      } else {
        const ritmos = runs.filter((r) => r.km && r.min).map((r) => (r.min * 60) / r.km);
        if (ritmos.length) puntos.push({ lunes, y: Math.min(...ritmos), detalle: 'mejor ritmo de la semana' });
      }
    });
    return clave === 'carrera_km'
      ? { puntos, fmt: (v) => `${num(v)} km`, fmtEje: (v) => num(v), desdeCero: true, nota: 'Kilómetros que corriste cada semana.' }
      : { puntos, fmt: (v) => `${fmtPace(v)} min/km`, fmtEje: fmtPace, desdeCero: false, nota: 'Tu mejor ritmo cada semana. Más abajo = más rápido.' };
  }

  const marcas = [];
  semanas.forEach((lunes) => Object.values(estado.marcas[lunes]).forEach((d) => d[clave] && marcas.push({ lunes, m: d[clave] })));
  const usaKg = marcas.some((x) => x.m.kg);
  const puntos = [];
  semanas.forEach((lunes) => {
    const deEsta = marcas.filter((x) => x.lunes === lunes && (usaKg ? x.m.kg : x.m.reps));
    if (!deEsta.length) return;
    const mejor = deEsta.reduce((a, b) => (usaKg ? (b.m.kg > a.m.kg || (b.m.kg === a.m.kg && (b.m.reps || 0) > (a.m.reps || 0))) : b.m.reps > a.m.reps) ? b : a);
    puntos.push({ lunes, y: usaKg ? mejor.m.kg : mejor.m.reps, detalle: textoMarca(mejor.m, clave) });
  });
  return usaKg
    ? { puntos, fmt: (v) => `${num(v)} kg`, fmtEje: (v) => num(v), desdeCero: false, nota: 'El mayor peso que apuntaste cada semana.' }
    : { puntos, fmt: (v) => `${v} reps`, fmtEje: (v) => num(v), desdeCero: true, nota: 'Las mejores repeticiones que apuntaste cada semana.' };
}

// Ejercicios y carreras con alguna marca, para el selector.
function opcionesMarcas() {
  const ids = new Set();
  let carrera = false;
  Object.values(estado.marcas).forEach((dias) => Object.values(dias).forEach((d) => Object.keys(d).forEach((k) => {
    if (k === CARRERA) carrera = true;
    else if (EJERCICIOS[k]) ids.add(k);
  })));
  const ops = [...ids].map((id) => ({ v: id, t: EJERCICIOS[id].nombre })).sort((a, b) => a.t.localeCompare(b.t, 'es'));
  if (carrera) ops.push({ v: 'carrera_km', t: '🏃 Carrera: km por semana' }, { v: 'carrera_ritmo', t: '🏃 Carrera: mejor ritmo' });
  return ops;
}

// ---------- Piezas de las gráficas (SVG a mano, sin librerías) ----------

function el(tag, attrs, padre) {
  const e = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (padre) padre.appendChild(e);
  return e;
}

function pasoBonito(r) {
  const e = Math.pow(10, Math.floor(Math.log10(r)));
  const f = r / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}

function escalaY(valores, desdeCero) {
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (desdeCero) min = 0;
  if (max - min < 1e-9) { const pad = Math.abs(max) * 0.05 || 1; min -= pad; max += pad; }
  if (desdeCero) min = 0;
  const paso = pasoBonito((max - min) / 4);
  const lo = Math.floor(min / paso) * paso;
  const hi = Math.ceil(max / paso) * paso;
  const ticks = [];
  for (let t = lo; t <= hi + paso / 2; t += paso) ticks.push(Math.round(t * 1000) / 1000);
  return { lo, hi, ticks };
}

function marco(cont, alto) {
  cont.innerHTML = '';
  const w = Math.max(280, cont.clientWidth);
  const M = { l: 48, r: 24, t: 22, b: 28 };
  const svg = el('svg', { viewBox: `0 0 ${w} ${alto}`, width: w, height: alto }, cont);
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.hidden = true;
  cont.appendChild(tip);
  return { svg, tip, w, h: alto, M, iw: w - M.l - M.r, ih: alto - M.t - M.b };
}

// Ejes: rejilla fina horizontal y fechas abajo (solo las que caben).
function ejes(f, esc, Y, fmtEje, semanas, X) {
  esc.ticks.forEach((t) => {
    el('line', { x1: f.M.l, x2: f.w - f.M.r, y1: Y(t), y2: Y(t), class: 'rejilla' }, f.svg);
    el('text', { x: f.M.l - 8, y: Y(t) + 4, class: 'eje', 'text-anchor': 'end' }, f.svg).textContent = fmtEje(t);
  });
  const caben = Math.max(1, Math.floor(f.iw / 60));
  const cada = Math.ceil(semanas.length / caben);
  semanas.forEach((s, i) => {
    if ((semanas.length - 1 - i) % cada) return;
    el('text', { x: X(s), y: f.h - 8, class: 'eje', 'text-anchor': 'middle' }, f.svg).textContent = etiquetaSemana(s);
  });
}

// El tooltip: el valor primero (fuerte), la etiqueta después. Siempre con textContent.
function ponerTip(f, x, y, valor, etiqueta) {
  f.tip.replaceChildren();
  const v = document.createElement('strong');
  v.textContent = valor;
  const e = document.createElement('span');
  e.textContent = etiqueta;
  f.tip.append(v, e);
  f.tip.hidden = false;
  const ancho = f.tip.offsetWidth;
  f.tip.style.left = `${Math.min(Math.max(x, ancho / 2 + 4), f.w - ancho / 2 - 4)}px`;
  f.tip.style.top = `${y}px`;
}

function tabla(cont, cabeceras, filas) {
  const t = document.createElement('table');
  const tr = t.createTHead().insertRow();
  cabeceras.forEach((c) => { const th = document.createElement('th'); th.textContent = c; tr.appendChild(th); });
  const tb = t.createTBody();
  filas.forEach((fila) => { const r = tb.insertRow(); fila.forEach((c) => { r.insertCell().textContent = c; }); });
  cont.replaceChildren(t);
}

function vacio(cont, texto) {
  cont.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'vacio';
  p.textContent = texto;
  cont.appendChild(p);
}

// Gráfica de línea: una serie, un valor por semana. Cruz que sigue al puntero y teclado con flechas.
function graficoLinea(cont, puntos, serie, nombre) {
  const semanas = semanasSeguidas().filter((s) => numeroSemana(s) >= numeroSemana(puntos[0].lunes));
  const f = marco(cont, 220);
  const n0 = numeroSemana(semanas[0]);
  const n1 = numeroSemana(semanas[semanas.length - 1]);
  const X = (lunes) => (n1 === n0 ? f.M.l + f.iw / 2 : f.M.l + ((numeroSemana(lunes) - n0) / (n1 - n0)) * f.iw);
  const esc = escalaY(puntos.map((p) => p.y), serie.desdeCero);
  const Y = (v) => f.M.t + f.ih - ((v - esc.lo) / (esc.hi - esc.lo)) * f.ih;
  ejes(f, esc, Y, serie.fmtEje, semanas, X);

  const guia = el('line', { y1: f.M.t, y2: f.M.t + f.ih, class: 'guia', visibility: 'hidden' }, f.svg);
  if (puntos.length > 1) {
    const d = puntos.map((p, i) => `${i ? 'L' : 'M'}${X(p.lunes)},${Y(p.y)}`).join('');
    el('path', { d: `${d}L${X(puntos[puntos.length - 1].lunes)},${f.M.t + f.ih}L${X(puntos[0].lunes)},${f.M.t + f.ih}Z`, class: 'area' }, f.svg);
    el('path', { d, class: 'linea' }, f.svg);
  }
  const dots = puntos.map((p) => el('circle', { cx: X(p.lunes), cy: Y(p.y), r: 4, class: 'punto' }, f.svg));

  // Etiqueta directa solo en el último valor.
  const u = puntos[puntos.length - 1];
  // Si la línea llega bajando, la etiqueta va debajo del punto para no pisar la línea.
  const baja = puntos.length > 1 && Y(puntos[puntos.length - 2].y) < Y(u.y);
  const etqFinal = el('text', { x: Math.min(X(u.lunes), f.w - 4), y: baja ? Y(u.y) + 20 : Y(u.y) - 10, class: 'etq', 'text-anchor': puntos.length > 1 ? 'end' : 'middle' }, f.svg);
  etqFinal.textContent = serie.fmt(u.y);

  const zona = el('rect', { x: f.M.l - 12, y: f.M.t, width: f.iw + 24, height: f.ih, class: 'zona' }, f.svg);
  f.svg.setAttribute('tabindex', '0');
  f.svg.setAttribute('role', 'img');
  f.svg.setAttribute('aria-label', `${nombre}. Último valor: ${serie.fmt(u.y)}. Usa las flechas para ver cada semana.`);

  let actual = puntos.length - 1;
  const ver = (i) => {
    actual = i;
    const p = puntos[i];
    guia.setAttribute('x1', X(p.lunes));
    guia.setAttribute('x2', X(p.lunes));
    guia.setAttribute('visibility', 'visible');
    dots.forEach((c, j) => c.classList.toggle('activo', j === i));
    etqFinal.setAttribute('visibility', 'hidden'); // El tooltip ya enseña el valor: así no se pisan.
    ponerTip(f, X(p.lunes), Y(p.y) - 12, serie.fmt(p.y), `Semana del ${etiquetaSemana(p.lunes)}${p.detalle ? ' · ' + p.detalle : ''}`);
  };
  const ocultar = () => { guia.setAttribute('visibility', 'hidden'); etqFinal.setAttribute('visibility', 'visible'); dots.forEach((c) => c.classList.remove('activo')); f.tip.hidden = true; };
  zona.addEventListener('pointermove', (ev) => {
    const r = f.svg.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * f.w;
    let mejor = 0;
    puntos.forEach((p, i) => { if (Math.abs(X(p.lunes) - x) < Math.abs(X(puntos[mejor].lunes) - x)) mejor = i; });
    ver(mejor);
  });
  zona.addEventListener('pointerleave', ocultar);
  f.svg.addEventListener('focus', () => ver(actual));
  f.svg.addEventListener('blur', ocultar);
  f.svg.addEventListener('keydown', (ev) => {
    if (ev.key === 'ArrowLeft' && actual > 0) { ev.preventDefault(); ver(actual - 1); }
    if (ev.key === 'ArrowRight' && actual < puntos.length - 1) { ev.preventDefault(); ver(actual + 1); }
  });
}

// Barras redondeadas arriba (4px) y rectas en la base.
function barra(x, y, w, h, r = 4) {
  r = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

// Columnas: entrenamientos hechos cada semana, sobre una pista con los que tocaban.
function graficoSemanas(cont) {
  const semanas = semanasSeguidas();
  const f = marco(cont, 200);
  const datos = semanas.map((s) => ({ lunes: s, h: hechosDe(s) }));
  const maxTotal = Math.max(1, ...datos.map((d) => (d.h ? d.h.total : 0)));
  const esc = { lo: 0, hi: maxTotal, ticks: maxTotal <= 4 ? [...Array(maxTotal + 1).keys()] : [0, Math.round(maxTotal / 2), maxTotal] };
  const banda = f.iw / semanas.length;
  const X = (lunes) => f.M.l + (semanas.indexOf(lunes) + 0.5) * banda;
  const Y = (v) => f.M.t + f.ih - (v / maxTotal) * f.ih;
  ejes(f, esc, Y, (v) => String(v), semanas, X);

  const ancho = Math.min(24, banda * 0.6);
  const base = f.M.t + f.ih;
  datos.forEach((d) => {
    if (!d.h || !d.h.total) return;
    const x = X(d.lunes) - ancho / 2;
    el('path', { d: barra(x, Y(d.h.total), ancho, base - Y(d.h.total)), class: 'pista' }, f.svg);
    if (d.h.hechos) el('path', { d: barra(x, Y(d.h.hechos), ancho, base - Y(d.h.hechos)), class: 'col' + (d.h.hechos === d.h.total ? ' completa' : '') }, f.svg);
    if (semanas.length <= 12 && banda >= 30) {
      el('text', { x: X(d.lunes), y: Y(d.h.total) - 6, class: 'etq', 'text-anchor': 'middle' }, f.svg).textContent = `${d.h.hechos}/${d.h.total}`;
    }
    // Zona para tocar: toda la franja de la semana, no solo la barra.
    const zona = el('rect', { x: X(d.lunes) - banda / 2, y: f.M.t, width: banda, height: f.ih, class: 'zona', tabindex: '0', role: 'img',
      'aria-label': `Semana del ${etiquetaSemana(d.lunes)}: ${d.h.hechos} de ${d.h.total} entrenamientos` }, f.svg);
    const ver = () => ponerTip(f, X(d.lunes), Y(d.h.total) - 22, `${d.h.hechos} de ${d.h.total}`,
      `Semana del ${etiquetaSemana(d.lunes)}${d.h.actual ? ' (esta semana)' : ''}`);
    zona.addEventListener('pointerenter', ver);
    zona.addEventListener('focus', ver);
    zona.addEventListener('pointerleave', () => { f.tip.hidden = true; });
    zona.addEventListener('blur', () => { f.tip.hidden = true; });
  });
}

// ---------- Pintar la pantalla ----------

let marcaElegida = null;

function tile(etiqueta, valor, extra) {
  const d = document.createElement('div');
  d.className = 'tile';
  const a = document.createElement('p'); a.className = 'tile-et'; a.textContent = etiqueta;
  const b = document.createElement('p'); b.className = 'tile-val'; b.textContent = valor;
  d.append(a, b);
  if (extra) { const c = document.createElement('p'); c.className = 'tile-extra'; c.textContent = extra; d.appendChild(c); }
  return d;
}

function pintarProgreso() {
  const semanas = semanasSeguidas();
  const conDatos = semanas.map(hechosDe).filter(Boolean);
  const hechosTotal = conDatos.reduce((s, h) => s + h.hechos, 0);
  const completas = conDatos.filter((h) => h.total && h.hechos === h.total).length;
  const pesos = Object.entries(estado.pesos).sort((a, b) => numeroSemana(a[0]) - numeroSemana(b[0]));

  let pesoTxt = '—';
  let pesoExtra = 'Apunta tu peso en el plan';
  if (pesos.length) {
    const ult = pesos[pesos.length - 1][1];
    const dif = Math.round((ult - pesos[0][1]) * 10) / 10;
    pesoTxt = `${num(ult)} kg`;
    pesoExtra = pesos.length < 2 ? 'Primera semana apuntada' : dif === 0 ? 'Igual que al empezar' : `${dif > 0 ? '▲' : '▼'} ${num(Math.abs(dif))} kg desde el ${etiquetaSemana(pesos[0][0])}`;
  }
  $('tiles').replaceChildren(
    tile('Entrenamientos hechos', String(hechosTotal), `en ${conDatos.length} ${conDatos.length === 1 ? 'semana' : 'semanas'}`),
    tile('Semanas completas', String(completas), 'todos los días hechos'),
    tile('Tu peso', pesoTxt, pesoExtra),
  );

  // Semanas
  graficoSemanas($('g-semanas'));
  tabla($('t-semanas'), ['Semana', 'Hechos', 'Peso'], semanas.slice().reverse().map((s) => {
    const h = hechosDe(s);
    return [etiquetaSemana(s), h ? `${h.hechos} de ${h.total}` : '—', estado.pesos[s] ? `${num(estado.pesos[s])} kg` : '—'];
  }));

  // Peso
  const pPeso = pesos.map(([lunes, y]) => ({ lunes, y }));
  if (pPeso.length) {
    graficoLinea($('g-peso'), pPeso, { fmt: (v) => `${num(v)} kg`, fmtEje: (v) => num(v), desdeCero: false }, 'Tu peso por semana');
  } else {
    vacio($('g-peso'), 'Todavía no hay datos. Apunta tu peso arriba, en tu plan.');
  }
  $('nota-peso').textContent = pPeso.length === 1 ? 'Con 2 semanas o más verás la línea.' : '';

  // Marcas
  const ops = opcionesMarcas();
  const sel = $('sel-marca');
  sel.replaceChildren(...ops.map((o) => { const op = document.createElement('option'); op.value = o.v; op.textContent = o.t; return op; }));
  sel.disabled = !ops.length;
  if (!ops.some((o) => o.v === marcaElegida)) marcaElegida = ops.length ? ops[0].v : null;
  if (marcaElegida) sel.value = marcaElegida;
  pintarMarca();
}

function pintarMarca() {
  if (!marcaElegida) {
    vacio($('g-marca'), 'Todavía no hay marcas. Toca un ejercicio en tu plan y apunta los kilos y las repeticiones.');
    $('nota-marca').textContent = '';
    $('t-marca').replaceChildren();
    return;
  }
  const serie = serieMarca(marcaElegida);
  const nombre = $('sel-marca').selectedOptions[0].textContent;
  $('nota-marca').textContent = serie.nota + (serie.puntos.length === 1 ? ' Con 2 semanas o más verás la línea.' : '');
  graficoLinea($('g-marca'), serie.puntos, serie, nombre);
  // Si el detalle ya empieza por el valor (ej. "77 kg × 3"), no lo repetimos.
  const celda = (p) => (!p.detalle ? serie.fmt(p.y) : p.detalle.startsWith(serie.fmt(p.y)) ? p.detalle : `${serie.fmt(p.y)} · ${p.detalle}`);
  tabla($('t-marca'), ['Semana', 'Marca'], serie.puntos.slice().reverse().map((p) => [etiquetaSemana(p.lunes), celda(p)]));
}

$('sel-marca').addEventListener('change', (ev) => { marcaElegida = ev.target.value; pintarMarca(); });
$('btn-progreso').addEventListener('click', () => { mostrar('progreso'); pintarProgreso(); });
$('btn-volver').addEventListener('click', () => mostrar('plan'));

// Al cambiar el tamaño de la ventana, las gráficas se vuelven a dibujar para que quepan.
let esperaResize;
window.addEventListener('resize', () => {
  clearTimeout(esperaResize);
  esperaResize = setTimeout(() => { if (!$('vista-progreso').classList.contains('hidden')) pintarProgreso(); }, 150);
});
