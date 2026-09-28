// Planning de entrenamiento semanal.
// Todo funciona en el navegador. Los datos se guardan en localStorage.

const CLAVE = 'planEntreno.v1';
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const OBJETIVOS = {
  perder_peso: 'perder peso',
  ganar_musculo: 'ganar músculo',
  resistencia: 'mejorar tu resistencia',
  salud: 'estar en forma',
};

const NIVELES = {
  principiante: { series: 3, reps: '10-12', factor: 1 },
  intermedio:   { series: 4, reps: '8-12',  factor: 1.3 },
  avanzado:     { series: 4, reps: '6-10',  factor: 1.6 },
};

// ---------- Biblioteca de sesiones ----------
// Cada sesión devuelve { meta, ejercicios } según el nivel (p), un factor de duración (f),
// el nivel por nombre y la variante de la semana (v).
// Un ejercicio puede ser un texto (un paso) o un objeto { id, nombre, dosis, como }.

const min = (base, f) => Math.round((base * f) / 5) * 5;

// Coge una opción de la lista según la variante. Con una sola opción, el ejercicio es fijo.
const elegir = (opciones, v) => opciones[v % opciones.length];

function ej(id, dosis) {
  const e = EJERCICIOS[id];
  return { id, nombre: e.nombre, dosis, como: e.como };
}

// Una sesión de fuerza es una lista de huecos. Cada hueco tiene opciones (o) y una dosis opcional (d).
// Los ejercicios principales tienen una sola opción: así puedes ver si mejoras semana a semana.
function huecos(lista, p, v) {
  // Los huecos sin dosis propia son series con repeticiones: ahí puedes apuntar tus marcas.
  return lista.map((h) => ({ ...ej(elegir(h.o, v), h.d || `${p.series} × ${p.reps}`), marca: !h.d }));
}

const SESIONES = {
  gym_full: {
    titulo: 'Cuerpo completo', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p, f, nivel, v) => ({
      meta: `Gimnasio · ${min(45, Math.min(f, 1.3))} min · ${p.series} series de ${p.reps} reps`,
      ejercicios: huecos([
        { o: ['sentadilla'] },
        { o: ['press_banca'] },
        { o: ['remo_mancuerna', 'jalon', 'remo_polea'] },
        { o: ['peso_muerto_rumano', 'hip_thrust'] },
        { o: ['press_hombro_mancuernas', 'press_militar', 'elevaciones_laterales'] },
        { o: ['plancha', 'dead_bug', 'plancha_lateral'], d: '3 × 30-45 s' },
      ], p, v),
    }),
  },
  gym_superior: {
    titulo: 'Tren superior', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p, f, nivel, v) => ({
      meta: `Gimnasio · 50 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: huecos([
        { o: ['press_banca'] },
        { o: ['jalon', 'dominadas'] },
        { o: ['press_militar', 'press_hombro_mancuernas'] },
        { o: ['remo_polea', 'remo_barra', 'remo_mancuerna'] },
        { o: ['curl_biceps', 'curl_martillo'] },
        { o: ['triceps_polea', 'fondos_paralelas'] },
      ], p, v),
    }),
  },
  gym_inferior: {
    titulo: 'Tren inferior', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p, f, nivel, v) => ({
      meta: `Gimnasio · 50 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: huecos([
        { o: ['sentadilla'] },
        { o: ['peso_muerto_rumano'] },
        { o: ['prensa', 'sentadilla_goblet'] },
        { o: ['zancadas', 'zancada_bulgara', 'step_up'] },
        { o: ['curl_femoral', 'hip_thrust'] },
        { o: ['gemelos'] },
      ], p, v),
    }),
  },
  gym_circuito: {
    titulo: 'Circuito de fuerza', categoria: 'fuerza', lugar: 'gym', icono: '🔁',
    crear: (p, f, nivel, v) => {
      const rondas = Math.max(3, Math.round(3 * f));
      return {
        meta: `Gimnasio · ${rondas * 8 + 10} min · ${rondas} rondas`,
        ejercicios: [
          'Calienta 5 min en cinta o bici',
          `${rondas} rondas seguidas. Descansa solo 1-2 min al final de cada ronda.`,
          ...huecos([
            { o: ['sentadilla_goblet', 'zancadas'], d: '12 reps' },
            { o: ['remo_mancuerna', 'remo_polea'], d: '12 reps' },
            { o: ['press_mancuernas', 'flexiones'], d: '12 reps' },
            { o: ['swing', 'step_up'], d: '15 reps' },
            { o: ['mountain_climbers', 'plancha_toques'], d: '30 s' },
          ], p, v),
        ],
      };
    },
  },
  gym_cardio: {
    titulo: 'Cardio en máquina', categoria: 'cardio', lugar: 'gym', icono: '🚴',
    crear: (p, f, nivel, v) => ({
      meta: `Gimnasio · ${min(30, f)} min`,
      ejercicios: [
        'Calienta 5 min suave',
        `${min(20, f)} min en ${elegir(['cinta', 'bici', 'elíptica', 'remo'], v)} a ritmo cómodo`,
        'Si te sientes bien: 5 × (1 min fuerte + 1 min suave)',
        'Termina con 5 min suave y estira',
      ],
    }),
  },
  casa_fuerza: {
    titulo: 'Fuerza sin material', categoria: 'fuerza', lugar: 'casa', icono: '🏠',
    crear: (p, f, nivel, v) => ({
      meta: `Casa · 35 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: huecos([
        { o: ['flexiones', 'flexiones_pies_elevados', 'pike_flexiones'] },
        { o: ['sentadilla_casa', 'sentadilla_pausa'] },
        { o: ['zancadas', 'zancada_bulgara', 'step_up'] },
        { o: ['remo_mesa', 'remo_toalla', 'superman'] },
        { o: ['puente_gluteo', 'puente_una_pierna'] },
        { o: ['fondos_silla'] },
        { o: ['plancha', 'bird_dog', 'dead_bug'], d: '3 × 30-45 s' },
      ], p, v),
    }),
  },
  casa_core: {
    titulo: 'Core y abdomen', categoria: 'core', lugar: 'libre', icono: '🎯',
    crear: (p, f, nivel, v) => ({
      meta: 'Donde quieras · 20 min · 3 rondas',
      ejercicios: [
        '3 rondas. Descansa 1 min entre rondas.',
        ...huecos([
          { o: ['plancha'], d: '30-60 s' },
          { o: ['dead_bug', 'bird_dog'], d: '10 por lado' },
          { o: ['plancha_lateral'], d: '20-40 s por lado' },
          { o: ['crunch_bicicleta', 'elevacion_piernas'], d: '12-15 reps' },
          { o: ['superman', 'puente_gluteo'], d: '12 reps' },
        ], p, v),
      ],
    }),
  },
  casa_hiit: {
    titulo: 'Circuito HIIT', categoria: 'cardio', lugar: 'casa', icono: '🔥',
    crear: (p, f, nivel, v) => {
      const rondas = Math.max(3, Math.round(3 * f));
      return {
        meta: `Casa · ${rondas * 5 + 10} min · ${rondas} rondas`,
        ejercicios: [
          'Calienta 5 min (movilidad y saltos suaves)',
          `${rondas} rondas. 1 min de descanso entre rondas.`,
          ...huecos([
            { o: ['jumping_jacks', 'patinador', 'skipping'], d: '40 s + 20 s descanso' },
            { o: ['sentadilla_salto', 'zancada_salto'], d: '40 s + 20 s descanso' },
            { o: ['mountain_climbers', 'plancha_toques'], d: '40 s + 20 s descanso' },
            { o: ['burpees', 'flexiones'], d: '40 s + 20 s descanso' },
            { o: ['skipping', 'jumping_jacks', 'patinador'], d: '40 s + 20 s descanso' },
          ], p, v),
        ],
      };
    },
  },
  casa_movilidad: {
    titulo: 'Movilidad y estiramientos', categoria: 'movilidad', lugar: 'libre', icono: '🧘',
    crear: (p, f, nivel, v) => ({
      meta: 'Donde quieras · 25 min · suave',
      ejercicios: huecos([
        { o: ['movilidad_cadera', 'circulos_hombros'], d: '2 min' },
        { o: ['gato_vaca'], d: '10 lentos' },
        { o: ['postura_nino', 'cobra'], d: '1 min' },
        { o: ['estiramiento_isquios', 'paloma'], d: '45 s por lado' },
        { o: ['estiramiento_cuadriceps'], d: '45 s por lado' },
        { o: ['respiracion'], d: '3 min' },
      ], p, v),
    }),
  },
  run_suave: {
    titulo: 'Carrera suave', categoria: 'cardio', lugar: 'correr', icono: '🏃',
    crear: (p, f, nivel) => ({
      meta: `Correr · ${min(30, f)} min · ritmo en el que puedes hablar`,
      ejercicios: nivel === 'principiante'
        ? ['Calienta 5 min andando', `${min(20, f)} min alternando: 2 min trote + 1 min andar`, 'Estira 5 min al final']
        : ['Calienta 5 min', `${min(25, f)} min de trote suave y constante`, 'Estira 5 min al final'],
    }),
  },
  run_intervalos: {
    titulo: 'Series de carrera', categoria: 'cardio', lugar: 'correr', icono: '⚡',
    crear: (p, f, nivel, v) => {
      const reps = Math.round(5 * f);
      const largas = Math.max(3, Math.round(reps * 0.7));
      const bloques = [
        { texto: `${reps} × (1 min rápido + 2 min suave)`, min: reps * 3 },
        { texto: `${largas} × (2 min rápido + 2 min suave)`, min: largas * 4 },
        { texto: 'Pirámide: 1-2-3-2-1 min rápido, con la mitad de ese tiempo suave entre cada uno', min: 13 },
      ];
      const b = elegir(bloques, v);
      return {
        meta: `Correr · ${b.min + 20} min · intensidad alta`,
        ejercicios: ['Calienta 10 min trotando', b.texto, 'Vuelta a la calma 10 min trote suave'],
      };
    },
  },
  run_tempo: {
    titulo: 'Carrera a ritmo', categoria: 'cardio', lugar: 'correr', icono: '⏱️',
    crear: (p, f, nivel) => ({
      meta: `Correr · ${min(15, f) + 20} min · ritmo exigente pero controlado`,
      ejercicios: nivel === 'principiante'
        ? ['Calienta 10 min trotando suave', `${min(15, f)} min: 3 min a ritmo alegre + 2 min suave`, 'Vuelta a la calma 10 min andando o trotando']
        : ['Calienta 10 min trotando suave', `${min(15, f)} min seguidos a un ritmo en el que solo puedes decir frases cortas`, 'Vuelta a la calma 10 min trote suave'],
    }),
  },
  run_larga: {
    titulo: 'Tirada larga', categoria: 'cardio', lugar: 'correr', icono: '🛣️',
    crear: (p, f, nivel) => ({
      meta: `Correr · ${min(45, f)} min · ritmo suave`,
      ejercicios: nivel === 'principiante'
        ? [`${min(40, f)} min alternando: 3 min trote + 1 min andar`, 'No importa la velocidad, importa el tiempo', 'Bebe agua al terminar']
        : [`${min(45, f)} min seguidos a ritmo suave`, 'Los últimos 5 min un poco más rápido', 'Bebe agua al terminar'],
    }),
  },
};

// Si no puedes entrenar en ese lugar, usamos una alternativa.
const ALTERNATIVAS = {
  gym_full: ['casa_fuerza'],
  gym_superior: ['casa_fuerza'],
  gym_inferior: ['casa_fuerza'],
  gym_circuito: ['casa_hiit', 'casa_fuerza'],
  gym_cardio: ['run_suave', 'casa_hiit'],
  casa_fuerza: ['gym_full'],
  casa_hiit: ['run_intervalos', 'gym_cardio', 'gym_circuito'],
  run_suave: ['gym_cardio', 'casa_hiit'],
  run_intervalos: ['casa_hiit', 'gym_cardio'],
  run_tempo: ['gym_cardio', 'casa_hiit'],
  run_larga: ['gym_cardio', 'casa_hiit'],
};

// Orden de prioridad por objetivo. Si entrenas N días, cogemos las N primeras.
const PRIORIDAD = {
  perder_peso:   ['gym_full', 'run_suave', 'casa_hiit', 'gym_circuito', 'run_intervalos', 'run_larga', 'casa_movilidad'],
  ganar_musculo: ['gym_superior', 'gym_inferior', 'run_suave', 'gym_superior', 'gym_inferior', 'casa_core', 'casa_movilidad'],
  resistencia:   ['run_suave', 'run_intervalos', 'run_larga', 'gym_full', 'run_tempo', 'casa_movilidad', 'casa_core'],
  salud:         ['gym_full', 'run_suave', 'casa_movilidad', 'casa_fuerza', 'run_suave', 'casa_core', 'casa_hiit'],
};

// ---------- Generar el plan ----------

function elegirSesion(id, lugares) {
  const s = SESIONES[id];
  if (s.lugar === 'libre' || lugares.includes(s.lugar)) return id;
  const alts = ALTERNATIVAS[id] || [];
  const ok = alts.find((a) => SESIONES[a].lugar === 'libre' || lugares.includes(SESIONES[a].lugar));
  // Si nada encaja, la fuerza sin material se puede hacer en cualquier sitio.
  if (ok) return ok;
  return SESIONES[id].categoria === 'fuerza' ? 'casa_fuerza' : 'casa_hiit';
}

function ordenar(ids) {
  // Alternamos fuerza y el resto para no repetir el mismo tipo dos días seguidos.
  const fuerza = ids.filter((id) => SESIONES[id].categoria === 'fuerza');
  const otros = ids.filter((id) => SESIONES[id].categoria !== 'fuerza');
  const res = [];
  let turnoFuerza = fuerza.length >= otros.length;
  while (fuerza.length || otros.length) {
    const cola = turnoFuerza ? fuerza : otros;
    if (cola.length) res.push(cola.shift());
    turnoFuerza = !turnoFuerza;
  }
  return res;
}

// Número de la semana (sube 1 cada lunes). Sirve para rotar ejercicios.
function numeroSemana(lunes) {
  const [y, m, d] = lunes.split('-').map(Number);
  const DIA_MS = 86400000;
  // El 1-1-1970 fue jueves: restamos 4 días para que cada semana empiece en lunes.
  return Math.floor((Date.UTC(y, m - 1, d) - 4 * DIA_MS) / (7 * DIA_MS));
}

function generarPlan(datos, semana) {
  const n = datos.dias.length;
  let ids = PRIORIDAD[datos.objetivo].slice(0, n);
  // Con pocos días, mejor cuerpo completo que dividir.
  if (n <= 3) ids = ids.map((id) => (id === 'gym_superior' || id === 'gym_inferior' ? 'gym_full' : id));
  ids = ids.map((id) => elegirSesion(id, datos.lugares));
  ids = ordenar(ids);

  const p = NIVELES[datos.nivel];
  const f = p.factor * (datos.edad >= 50 ? 0.85 : 1);
  const diasOrdenados = [...datos.dias].sort((a, b) => a - b);

  return DIAS.map((nombre, i) => {
    const pos = diasOrdenados.indexOf(i);
    if (pos === -1) return { dia: i, descanso: true };
    const id = ids[pos];
    const s = SESIONES[id];
    // Si la misma sesión sale dos veces en la semana, la segunda usa otros ejercicios.
    const vez = ids.slice(0, pos).filter((x) => x === id).length;
    return { dia: i, id, titulo: s.titulo, categoria: s.categoria, lugar: s.lugar, icono: s.icono, ...s.crear(p, f, datos.nivel, semana + vez) };
  });
}

function crearConsejos(datos) {
  const c = [];
  const agua = (datos.peso * 0.035).toFixed(1).replace('.', ',');
  c.push(`Bebe unos ${agua} litros de agua al día (35 ml por cada kg de peso).`);
  if (datos.nivel === 'principiante') c.push('Empieza suave. Aprende bien la técnica antes de subir el peso.');
  if (datos.nivel === 'avanzado') c.push('Sube el peso o el ritmo poco a poco cada semana.');
  if (datos.edad >= 50) c.push('Calienta 10 min extra. Hemos bajado un poco la duración de las sesiones.');
  if (datos.edad < 16) c.push('Eres menor. Entrena con un adulto y evita pesos muy altos.');
  if (datos.dias.length >= 6) c.push('Entrenas casi todos los días. Duerme bien y escucha a tu cuerpo.');
  if (datos.dias.length <= 2) c.push('Con pocos días, lo importante es no fallar. ¡La constancia gana!');
  const extra = {
    perder_peso: 'Para perder peso, la comida importa mucho. Come más verdura y proteína.',
    ganar_musculo: `Para ganar músculo, come unos ${Math.round(datos.peso * 1.6)} g de proteína al día (1,6 g por kg).`,
    resistencia: 'En la carrera suave debes poder hablar. Si no puedes, ve más despacio.',
    salud: 'Lo mejor es moverte cada día, aunque sea un paseo de 20 min.',
  };
  c.push(extra[datos.objetivo]);
  return c;
}

// ---------- Guardar y cargar ----------

function lunesDe(fecha) {
  const d = new Date(fecha);
  const dia = (d.getDay() + 6) % 7; // lunes = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dia);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function cargar() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || null;
  } catch (e) {
    return null;
  }
}

function guardar(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    /* Si no se puede guardar, la página sigue funcionando. */
  }
}

// Datos que se guardan a lo largo del tiempo (las versiones viejas no los tienen).
// marcas:    { [lunes]: { [día]: { [idEjercicio]: { kg, reps }, _carrera: { km, min } } } }
// pesos:     { [lunes]: kg }
// historial: { [lunes]: { hechos, total } }  → semanas ya terminadas
function completarEstado(e) {
  if (!e) return e;
  e.marcas = e.marcas || {};
  e.pesos = e.pesos || {};
  e.historial = e.historial || {};
  return e;
}

// ---------- Marcas ----------

const CARRERA = '_carrera';
const num = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

// Tipo de registro de un día: carrera (km y tiempo) o nada.
const esCarrera = (d) => d.lugar === 'correr' || d.id === 'gym_cardio';

function ritmo(m) {
  if (!m || !m.km || !m.min) return '';
  const s = Math.round((m.min / m.km) * 60);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min/km`;
}

function textoMarca(m, clave) {
  if (!m) return '';
  if (clave === CARRERA) {
    const partes = [m.km && `${num(m.km)} km`, m.min && `${num(m.min)} min`, ritmo(m)].filter(Boolean);
    return partes.join(' · ');
  }
  if (m.kg && m.reps) return `${num(m.kg)} kg × ${m.reps}`;
  if (m.kg) return `${num(m.kg)} kg`;
  if (m.reps) return `${m.reps} reps`;
  return '';
}

function marcaDe(dia, clave) {
  const sem = estado.marcas[estado.semana];
  return sem && sem[dia] && sem[dia][clave];
}

function ponerMarca(dia, clave, m) {
  const sem = (estado.marcas[estado.semana] = estado.marcas[estado.semana] || {});
  const d = (sem[dia] = sem[dia] || {});
  if (Object.keys(m).length) d[clave] = m;
  else delete d[clave];
  if (!Object.keys(d).length) delete sem[dia];
  if (!Object.keys(sem).length) delete estado.marcas[estado.semana];
}

// La marca más reciente de ese ejercicio antes de este día.
function ultimaMarca(clave, dia) {
  const ahora = numeroSemana(estado.semana) * 7 + dia;
  let mejor = null;
  let orden = -Infinity;
  Object.entries(estado.marcas).forEach(([lunes, dias]) => {
    Object.entries(dias).forEach(([d, marcas]) => {
      const o = numeroSemana(lunes) * 7 + Number(d);
      if (marcas[clave] && o < ahora && o > orden) { orden = o; mejor = marcas[clave]; }
    });
  });
  return mejor;
}

// El peso más reciente antes de esta semana.
function pesoAnterior() {
  const ahora = numeroSemana(estado.semana);
  let mejor = null;
  let orden = -Infinity;
  Object.entries(estado.pesos).forEach(([lunes, kg]) => {
    const o = numeroSemana(lunes);
    if (o < ahora && o > orden) { orden = o; mejor = kg; }
  });
  return mejor;
}

// ---------- Interfaz ----------

const $ = (id) => document.getElementById(id);
let estado = completarEstado(cargar());

function pintarChipsDias(seleccion) {
  const cont = $('dias');
  cont.innerHTML = '';
  DIAS_CORTOS.forEach((d, i) => {
    const label = document.createElement('label');
    label.className = 'chip';
    label.innerHTML = `<input type="checkbox" name="dia" value="${i}"><span>${d}</span>`;
    label.querySelector('input').checked = seleccion.includes(i);
    cont.appendChild(label);
  });
  actualizarContador();
}

function actualizarContador() {
  const n = document.querySelectorAll('input[name=dia]:checked').length;
  $('dias-count').textContent = n === 1 ? '1 día elegido' : `${n} días elegidos`;
}

function rellenarFormulario(d) {
  $('nombre').value = d.nombre || '';
  $('edad').value = d.edad;
  $('peso').value = d.peso;
  $('nivel').value = d.nivel;
  $('objetivo').value = d.objetivo;
  document.querySelectorAll('input[name=lugar]').forEach((el) => { el.checked = d.lugares.includes(el.value); });
  pintarChipsDias(d.dias);
}

function mostrar(vista) {
  $('vista-form').classList.toggle('hidden', vista !== 'form');
  $('vista-plan').classList.toggle('hidden', vista !== 'plan');
  $('vista-progreso').classList.toggle('hidden', vista !== 'progreso');
  window.scrollTo(0, 0);
}

// Campos para apuntar una marca. Cada campo sabe su día, su ejercicio y qué guarda.
const CAMPOS = {
  kg:   { etiqueta: 'kg', paso: '0.5', max: 500 },
  reps: { etiqueta: 'reps', paso: '1', max: 200 },
  km:   { etiqueta: 'km', paso: '0.01', max: 200 },
  min:  { etiqueta: 'minutos', paso: '1', max: 1000 },
};

function pintarRegistro(dia, clave, campos, extra = '') {
  const m = marcaDe(dia, clave) || {};
  const ult = ultimaMarca(clave, dia);
  const inputs = campos.map((c) => {
    const k = CAMPOS[c];
    return `<label class="campo">${k.etiqueta}<input type="number" inputmode="decimal" min="0" max="${k.max}" step="${k.paso}"` +
      ` data-dia="${dia}" data-clave="${clave}" data-campo="${c}" value="${m[c] ?? ''}"></label>`;
  }).join('');
  return `<div class="registro" data-dia="${dia}" data-clave="${clave}">${inputs}${extra}</div>` +
    (ult ? `<p class="ultima">Última vez: ${textoMarca(ult, clave)}</p>` : '');
}

// Un paso es texto. Un ejercicio se abre al tocarlo para ver cómo se hace (y apuntar tu marca).
function pintarEjercicio(e, d) {
  if (typeof e === 'string') return `<li class="paso">${e}</li>`;
  const hecho = e.marca && textoMarca(marcaDe(d.dia, e.id), e.id);
  const registro = e.marca ? pintarRegistro(d.dia, e.id, d.lugar === 'gym' ? ['kg', 'reps'] : ['reps']) : '';
  return `<li class="ej" data-clave="${e.id}"><details><summary><span class="ej-nombre">${e.nombre}</span>` +
    `<span class="dosis${hecho ? ' marcado' : ''}" data-dosis="${e.dosis}">${hecho || e.dosis}</span></summary>` +
    `<p class="como">${e.como}</p>${registro}</details></li>`;
}

// Guarda lo que escribes en una casilla, sin volver a pintar todo (así no se cierra nada).
function alCambiarMarca(ev) {
  const input = ev.target;
  if (!input.dataset.campo) return;
  const caja = input.closest('.registro');
  const dia = Number(caja.dataset.dia);
  const clave = caja.dataset.clave;
  const m = {};
  caja.querySelectorAll('input').forEach((el) => {
    const v = Number(el.value);
    const ok = el.value !== '' && el.checkValidity() && v > 0;
    el.setAttribute('aria-invalid', el.value !== '' && !ok ? 'true' : 'false');
    if (ok) m[el.dataset.campo] = v;
  });
  ponerMarca(dia, clave, m);
  guardar(estado);

  const texto = textoMarca(marcaDe(dia, clave), clave);
  if (clave === CARRERA) {
    caja.querySelector('.ritmo').textContent = ritmo(m);
  } else {
    const dosis = caja.closest('li').querySelector('.dosis');
    dosis.textContent = texto || dosis.dataset.dosis;
    dosis.classList.toggle('marcado', !!texto);
  }
}

function pintarPeso() {
  const kg = estado.pesos[estado.semana];
  const antes = pesoAnterior();
  $('peso-semana').value = kg ?? '';
  let txt = '';
  if (kg && antes) {
    const dif = Math.round((kg - antes) * 10) / 10;
    txt = dif === 0 ? 'Igual que la última vez' : `${dif > 0 ? '▲' : '▼'} ${num(Math.abs(dif))} kg desde la última vez`;
  }
  $('peso-cambio').textContent = txt;
}

function pintarPlan() {
  const { datos, hechos } = estado;
  const plan = generarPlan(datos, numeroSemana(estado.semana));
  const hoy = (new Date().getDay() + 6) % 7;

  $('saludo').textContent = datos.nombre ? `Tu semana, ${datos.nombre}` : 'Tu semana';
  $('resumen-texto').textContent =
    `${datos.dias.length} días de entrenamiento · objetivo: ${OBJETIVOS[datos.objetivo]} · nivel ${datos.nivel}`;

  const consejos = $('consejos');
  consejos.innerHTML = '<h3>💡 Consejos para ti</h3><ul></ul>';
  crearConsejos(datos).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    consejos.querySelector('ul').appendChild(li);
  });

  pintarPeso();

  // Recordamos qué ejercicios estaban abiertos para dejarlos igual.
  const semana = $('semana');
  const abiertos = [...semana.querySelectorAll('details[open]')].map((el) => el.closest('.dia').dataset.dia + '|' + el.closest('li').dataset.clave);
  semana.innerHTML = '';
  plan.forEach((d) => {
    const div = document.createElement('div');
    const esHoy = d.dia === hoy;
    div.className = 'dia' + (d.descanso ? ' descanso' : '') + (hechos[d.dia] ? ' hecho' : '') + (esHoy ? ' hoy' : '');
    div.dataset.dia = d.dia;

    const top = document.createElement('div');
    top.className = 'dia-top';
    top.innerHTML = `<span class="dia-nombre">${DIAS[d.dia]}</span>`;
    const tag = document.createElement('span');
    if (esHoy) { tag.className = 'tag hoy-tag'; tag.textContent = 'Hoy'; }
    else if (!d.descanso) { tag.className = `tag ${d.categoria}`; tag.textContent = d.categoria; }
    top.appendChild(tag);
    div.appendChild(top);

    if (d.descanso) {
      div.insertAdjacentHTML('beforeend', '<h3>😴 Descanso</h3><p class="meta">Descansa, camina o estira un poco.</p>');
    } else {
      div.insertAdjacentHTML('beforeend',
        `<h3>${d.icono} ${d.titulo}</h3><p class="meta">${d.meta}</p><ul>${d.ejercicios.map((e) => pintarEjercicio(e, d)).join('')}</ul>`);
      if (esCarrera(d)) {
        div.insertAdjacentHTML('beforeend', '<p class="apunta">📝 Apunta tu carrera</p>' +
          pintarRegistro(d.dia, CARRERA, ['km', 'min'], `<span class="ritmo">${ritmo(marcaDe(d.dia, CARRERA))}</span>`));
      }
      const chk = document.createElement('label');
      chk.className = 'hecho-check';
      chk.innerHTML = '<input type="checkbox"> <span>Hecho</span>';
      const input = chk.querySelector('input');
      input.checked = !!hechos[d.dia];
      input.addEventListener('change', () => {
        estado.hechos[d.dia] = input.checked;
        guardar(estado);
        pintarPlan();
      });
      div.appendChild(chk);
    }
    semana.appendChild(div);
  });
  semana.querySelectorAll('details').forEach((el) => {
    if (abiertos.includes(el.closest('.dia').dataset.dia + '|' + el.closest('li').dataset.clave)) el.open = true;
  });

  const total = datos.dias.length;
  const hechosN = datos.dias.filter((i) => hechos[i]).length;
  $('barra-relleno').style.width = total ? `${(hechosN / total) * 100}%` : '0';
  $('progreso-texto').textContent = hechosN === total && total > 0
    ? `🎉 ¡Semana completa! ${hechosN} de ${total}`
    : `${hechosN} de ${total} entrenamientos hechos`;
}

$('form-datos').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const dias = [...document.querySelectorAll('input[name=dia]:checked')].map((el) => Number(el.value));
  const lugares = [...document.querySelectorAll('input[name=lugar]:checked')].map((el) => el.value);
  const edad = Number($('edad').value);
  const peso = Number($('peso').value);

  if (!edad || !peso) return ($('error').textContent = 'Pon tu edad y tu peso.');
  if (dias.length === 0) return ($('error').textContent = 'Elige al menos 1 día.');
  if (lugares.length === 0) return ($('error').textContent = 'Elige al menos 1 lugar.');
  $('error').textContent = '';

  const datos = { nombre: $('nombre').value.trim(), edad, peso, nivel: $('nivel').value, objetivo: $('objetivo').value, dias, lugares };
  // Si cambian los días, reiniciamos lo marcado como hecho. Las marcas y pesos se quedan.
  const mismosDias = estado && JSON.stringify(estado.datos.dias.slice().sort()) === JSON.stringify(dias.slice().sort());
  const semana = lunesDe(new Date());
  estado = completarEstado({ ...estado, datos, hechos: mismosDias ? estado.hechos : {}, semana });
  estado.pesos[semana] = peso;
  guardar(estado);
  pintarPlan();
  mostrar('plan');
});

$('dias').addEventListener('change', actualizarContador);
$('semana').addEventListener('change', alCambiarMarca);
$('peso-semana').addEventListener('change', () => {
  const el = $('peso-semana');
  const v = Number(el.value);
  const ok = el.value !== '' && el.checkValidity() && v > 0;
  el.setAttribute('aria-invalid', el.value !== '' && !ok ? 'true' : 'false');
  if (!ok) return;
  estado.pesos[estado.semana] = v;
  estado.datos.peso = v; // Los consejos (agua, proteína) usan tu peso más nuevo.
  guardar(estado);
  pintarPlan();
});
$('btn-editar').addEventListener('click', () => { rellenarFormulario(estado.datos); mostrar('form'); });
$('btn-nueva').addEventListener('click', () => {
  if (!confirm('¿Empezar una semana nueva? Se borran los "Hecho" de esta semana.')) return;
  estado.hechos = {};
  estado.semana = lunesDe(new Date());
  guardar(estado);
  pintarPlan();
});

// ---------- Inicio ----------

if (estado && estado.datos) {
  // Si empezó una semana nueva, guardamos la anterior en el historial y reiniciamos lo marcado.
  const lunes = lunesDe(new Date());
  if (estado.semana !== lunes) {
    const total = estado.datos.dias.length;
    estado.historial[estado.semana] = { hechos: estado.datos.dias.filter((i) => estado.hechos[i]).length, total };
    estado.hechos = {};
    estado.semana = lunes;
    guardar(estado);
  }
  pintarChipsDias(estado.datos.dias);
  pintarPlan();
  mostrar('plan');
} else {
  pintarChipsDias([0, 2, 4]);
  mostrar('form');
}
