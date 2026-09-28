// Copia de seguridad: descargar tus datos en un archivo y cargarlos en otro navegador.
// Usa el estado y las funciones de app.js (se carga después).

const FORMATO_COPIA = 'planEntreno';

// ---------- Limpiar una copia ----------
// Un archivo puede venir roto o cambiado a mano. Solo aceptamos lo que la app sabe usar,
// y siempre como números: así nada raro llega a la pantalla.

const esLunes = (k) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(k);
const numOk = (v, max) => (typeof v === 'number' && isFinite(v) && v > 0 && v <= max ? v : undefined);

function limpiarMarca(clave, m) {
  if (!m || typeof m !== 'object') return null;
  const campos = clave === CARRERA ? { km: 200, min: 1000 } : { kg: 500, reps: 200 };
  const res = {};
  Object.entries(campos).forEach(([c, max]) => { const v = numOk(m[c], max); if (v !== undefined) res[c] = v; });
  return Object.keys(res).length ? res : null;
}

function limpiarCopia(obj) {
  const e = obj && obj.formato === FORMATO_COPIA ? obj.estado : obj;
  const d = e && e.datos;
  if (!d || typeof d !== 'object') throw new Error('El archivo no es una copia de esta app.');

  const dias = Array.isArray(d.dias) ? [...new Set(d.dias.filter((x) => Number.isInteger(x) && x >= 0 && x <= 6))] : [];
  const lugares = Array.isArray(d.lugares) ? d.lugares.filter((x) => ['gym', 'correr', 'casa'].includes(x)) : [];
  const datos = {
    nombre: typeof d.nombre === 'string' ? d.nombre.slice(0, 30) : '',
    edad: numOk(d.edad, 99),
    peso: numOk(d.peso, 250),
    nivel: NIVELES[d.nivel] ? d.nivel : null,
    objetivo: PRIORIDAD[d.objetivo] ? d.objetivo : null,
    dias,
    lugares,
  };
  if (!datos.edad || !datos.peso || !datos.nivel || !datos.objetivo || !dias.length || !lugares.length) {
    throw new Error('Faltan datos en la copia (edad, peso, nivel, objetivo, días o lugares).');
  }

  const hechos = {};
  if (e.hechos && typeof e.hechos === 'object') dias.forEach((i) => { if (e.hechos[i] === true) hechos[i] = true; });

  const marcas = {};
  Object.entries(e.marcas || {}).forEach(([lunes, porDia]) => {
    if (!esLunes(lunes) || !porDia || typeof porDia !== 'object') return;
    Object.entries(porDia).forEach(([dia, lista]) => {
      if (!/^[0-6]$/.test(dia) || !lista || typeof lista !== 'object') return;
      Object.entries(lista).forEach(([clave, m]) => {
        if (clave !== CARRERA && !EJERCICIOS[clave]) return;
        const limpia = limpiarMarca(clave, m);
        if (!limpia) return;
        marcas[lunes] = marcas[lunes] || {};
        marcas[lunes][dia] = marcas[lunes][dia] || {};
        marcas[lunes][dia][clave] = limpia;
      });
    });
  });

  const pesos = {};
  Object.entries(e.pesos || {}).forEach(([lunes, kg]) => { const v = numOk(kg, 250); if (esLunes(lunes) && v) pesos[lunes] = v; });

  const historial = {};
  Object.entries(e.historial || {}).forEach(([lunes, h]) => {
    if (!esLunes(lunes) || !h) return;
    const total = Number.isInteger(h.total) && h.total >= 0 && h.total <= 7 ? h.total : null;
    const hech = Number.isInteger(h.hechos) && h.hechos >= 0 && total !== null && h.hechos <= total ? h.hechos : null;
    if (total !== null && hech !== null) historial[lunes] = { hechos: hech, total };
  });

  return {
    datos,
    hechos,
    semana: esLunes(e.semana) ? e.semana : lunesDe(new Date()),
    marcas,
    pesos,
    historial,
    ultimaCopia: typeof e.ultimaCopia === 'string' ? e.ultimaCopia.slice(0, 30) : undefined,
  };
}

// ---------- Descargar ----------

function hoyTexto() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function descargarCopia() {
  estado.ultimaCopia = new Date().toISOString();
  guardar(estado);
  const copia = { formato: FORMATO_COPIA, version: 1, fecha: estado.ultimaCopia, estado };
  const blob = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `planning-entrenamiento-${hoyTexto()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  pintarCopia('✅ Copia descargada. Guárdala en un sitio seguro (por ejemplo, en la nube o mándatela por correo).');
}

// ---------- Cargar ----------

function cargarCopia(archivo, avisoId) {
  const aviso = $(avisoId);
  aviso.className = 'aviso';
  if (archivo.size > 5 * 1024 * 1024) {
    aviso.className = 'aviso error';
    aviso.textContent = 'El archivo es demasiado grande. No parece una copia de esta app.';
    return;
  }
  const lector = new FileReader();
  lector.onload = () => {
    let limpio;
    try {
      limpio = limpiarCopia(JSON.parse(lector.result));
    } catch (err) {
      aviso.className = 'aviso error';
      aviso.textContent = err instanceof SyntaxError ? 'No se puede leer el archivo. Elige el archivo .json que descargaste.' : err.message;
      return;
    }
    if (estado && estado.datos && !confirm('Esta copia va a reemplazar los datos que tienes ahora en este navegador. ¿Seguir?')) return;
    guardar(limpio);
    // Volvemos a abrir la app: así se revisa la semana y todo se pinta con los datos nuevos.
    location.reload();
  };
  lector.onerror = () => { aviso.className = 'aviso error'; aviso.textContent = 'No se pudo leer el archivo.'; };
  lector.readAsText(archivo);
}

// ---------- Pantalla ----------

function pintarCopia(mensaje) {
  const aviso = $('aviso-copia');
  if (mensaje) { aviso.className = 'aviso ok'; aviso.textContent = mensaje; return; }
  aviso.className = 'aviso';
  if (!estado || !estado.ultimaCopia) {
    aviso.textContent = 'Todavía no has hecho ninguna copia.';
    return;
  }
  const dias = Math.floor((Date.now() - new Date(estado.ultimaCopia)) / DIA_MS);
  aviso.textContent = dias <= 0 ? 'Última copia: hoy.' : dias === 1 ? 'Última copia: ayer.' : `Última copia: hace ${dias} días.`;
  if (dias >= 30) aviso.textContent += ' Te recomendamos hacer una nueva.';
}

$('btn-descargar').addEventListener('click', descargarCopia);
$('btn-cargar').addEventListener('click', () => $('archivo-copia').click());
$('btn-cargar-inicio').addEventListener('click', () => $('archivo-copia-inicio').click());
$('archivo-copia').addEventListener('change', (ev) => { if (ev.target.files[0]) cargarCopia(ev.target.files[0], 'aviso-copia'); ev.target.value = ''; });
$('archivo-copia-inicio').addEventListener('change', (ev) => { if (ev.target.files[0]) cargarCopia(ev.target.files[0], 'aviso-inicio'); ev.target.value = ''; });
$('btn-progreso').addEventListener('click', () => pintarCopia());
