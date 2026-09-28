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
// Cada sesión devuelve { meta, ejercicios } según el nivel (p) y un factor de duración (f).

const min = (base, f) => Math.round((base * f) / 5) * 5;

const SESIONES = {
  gym_full: {
    titulo: 'Cuerpo completo', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p, f) => ({
      meta: `Gimnasio · ${min(45, Math.min(f, 1.3))} min · ${p.series} series de ${p.reps} reps`,
      ejercicios: ['Sentadilla', 'Press de banca', 'Remo con mancuerna', 'Peso muerto rumano', 'Press de hombros', 'Plancha: 3 × 30-45 s'],
    }),
  },
  gym_superior: {
    titulo: 'Tren superior', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p) => ({
      meta: `Gimnasio · 50 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: ['Press de banca', 'Jalón al pecho', 'Press militar', 'Remo sentado en polea', 'Curl de bíceps', 'Extensión de tríceps en polea'],
    }),
  },
  gym_inferior: {
    titulo: 'Tren inferior', categoria: 'fuerza', lugar: 'gym', icono: '🏋️',
    crear: (p) => ({
      meta: `Gimnasio · 50 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: ['Sentadilla', 'Peso muerto rumano', 'Prensa de piernas', 'Zancadas', 'Elevación de gemelos', 'Plancha lateral: 3 × 30 s'],
    }),
  },
  gym_cardio: {
    titulo: 'Cardio en máquina', categoria: 'cardio', lugar: 'gym', icono: '🚴',
    crear: (p, f) => ({
      meta: `Gimnasio · ${min(30, f)} min`,
      ejercicios: [
        'Calienta 5 min suave',
        `${min(20, f)} min en cinta, bici o elíptica a ritmo cómodo`,
        'Si te sientes bien: 5 × (1 min fuerte + 1 min suave)',
        'Termina con 5 min suave y estira',
      ],
    }),
  },
  casa_fuerza: {
    titulo: 'Fuerza sin material', categoria: 'fuerza', lugar: 'casa', icono: '🏠',
    crear: (p) => ({
      meta: `Casa · 35 min · ${p.series} series de ${p.reps} reps`,
      ejercicios: ['Flexiones (de rodillas si cuesta)', 'Sentadillas', 'Zancadas', 'Fondos en silla', 'Puente de glúteo', 'Plancha: 3 × 30-45 s'],
    }),
  },
  casa_hiit: {
    titulo: 'Circuito HIIT', categoria: 'cardio', lugar: 'casa', icono: '🔥',
    crear: (p, f) => {
      const rondas = Math.max(3, Math.round(3 * f));
      return {
        meta: `Casa · ${rondas * 5 + 10} min · ${rondas} rondas`,
        ejercicios: [
          'Calienta 5 min (movilidad y saltos suaves)',
          `${rondas} rondas de: 40 s trabajo + 20 s descanso en cada ejercicio`,
          'Jumping jacks · Sentadilla con salto · Mountain climbers · Burpees · Skipping',
          '1 min de descanso entre rondas',
        ],
      };
    },
  },
  casa_movilidad: {
    titulo: 'Movilidad y estiramientos', categoria: 'movilidad', lugar: 'libre', icono: '🧘',
    crear: () => ({
      meta: 'Donde quieras · 25 min · suave',
      ejercicios: ['Movilidad de cuello, hombros y cadera', 'Gato-vaca y postura del niño', 'Estiramiento de isquios y cuádriceps', 'Respiración lenta 3 min'],
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
    crear: (p, f) => {
      const reps = Math.round(5 * f);
      return {
        meta: `Correr · ${reps * 3 + 20} min · intensidad alta`,
        ejercicios: ['Calienta 10 min trotando', `${reps} × (1 min rápido + 2 min suave)`, 'Vuelta a la calma 10 min trote suave'],
      };
    },
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
  gym_cardio: ['run_suave', 'casa_hiit'],
  casa_fuerza: ['gym_full'],
  casa_hiit: ['run_intervalos', 'gym_cardio'],
  run_suave: ['gym_cardio', 'casa_hiit'],
  run_intervalos: ['casa_hiit', 'gym_cardio'],
  run_larga: ['gym_cardio', 'casa_hiit'],
};

// Orden de prioridad por objetivo. Si entrenas N días, cogemos las N primeras.
const PRIORIDAD = {
  perder_peso:   ['gym_full', 'run_suave', 'casa_hiit', 'gym_full', 'run_intervalos', 'run_larga', 'casa_movilidad'],
  ganar_musculo: ['gym_superior', 'gym_inferior', 'run_suave', 'gym_superior', 'gym_inferior', 'casa_hiit', 'casa_movilidad'],
  resistencia:   ['run_suave', 'run_intervalos', 'run_larga', 'gym_full', 'run_suave', 'casa_movilidad', 'casa_hiit'],
  salud:         ['gym_full', 'run_suave', 'casa_movilidad', 'casa_fuerza', 'run_suave', 'casa_hiit', 'casa_movilidad'],
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

function generarPlan(datos) {
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
    return { dia: i, id, titulo: s.titulo, categoria: s.categoria, icono: s.icono, ...s.crear(p, f, datos.nivel) };
  });
}

function crearConsejos(datos) {
  const c = [];
  const agua = (datos.peso * 0.035).toFixed(1);
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

// ---------- Interfaz ----------

const $ = (id) => document.getElementById(id);
let estado = cargar();

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
  window.scrollTo(0, 0);
}

function pintarPlan() {
  const { datos, hechos } = estado;
  const plan = generarPlan(datos);
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

  const semana = $('semana');
  semana.innerHTML = '';
  plan.forEach((d) => {
    const div = document.createElement('div');
    const esHoy = d.dia === hoy;
    div.className = 'dia' + (d.descanso ? ' descanso' : '') + (hechos[d.dia] ? ' hecho' : '') + (esHoy ? ' hoy' : '');

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
        `<h3>${d.icono} ${d.titulo}</h3><p class="meta">${d.meta}</p><ul>${d.ejercicios.map((e) => `<li>${e}</li>`).join('')}</ul>`);
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
  // Si cambian los días, reiniciamos lo marcado como hecho.
  const mismosDias = estado && JSON.stringify(estado.datos.dias.slice().sort()) === JSON.stringify(dias.slice().sort());
  estado = { datos, hechos: mismosDias ? estado.hechos : {}, semana: lunesDe(new Date()) };
  guardar(estado);
  pintarPlan();
  mostrar('plan');
});

$('dias').addEventListener('change', actualizarContador);
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
  // Si empezó una semana nueva, reiniciamos lo marcado.
  const lunes = lunesDe(new Date());
  if (estado.semana !== lunes) {
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
