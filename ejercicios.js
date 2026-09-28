// Biblioteca de ejercicios.
// Cada ejercicio tiene un nombre y una explicación corta de cómo hacerlo.
// El id no debe cambiar nunca: más adelante lo usamos para guardar tus marcas.

const EJERCICIOS = {
  // ---------- Piernas y glúteo ----------
  sentadilla: {
    nombre: 'Sentadilla con barra',
    como: 'Barra sobre la espalda alta y pies al ancho de hombros. Baja como si te sentaras hasta que los muslos queden paralelos al suelo, con la espalda recta.',
  },
  sentadilla_goblet: {
    nombre: 'Sentadilla goblet',
    como: 'Sujeta una mancuerna o pesa rusa pegada al pecho. Baja lento con el pecho alto y los codos por dentro de las rodillas.',
  },
  sentadilla_casa: {
    nombre: 'Sentadilla',
    como: 'Pies al ancho de hombros y brazos al frente. Baja con el peso en los talones y sube apretando los glúteos.',
  },
  sentadilla_pausa: {
    nombre: 'Sentadilla con pausa',
    como: 'Como una sentadilla normal, pero quédate 2 segundos quieto abajo antes de subir. Cuesta más de lo que parece.',
  },
  prensa: {
    nombre: 'Prensa de piernas',
    como: 'Espalda bien pegada al respaldo. Baja la plataforma hasta que las rodillas formen un ángulo recto y empuja con todo el pie.',
  },
  zancadas: {
    nombre: 'Zancadas',
    como: 'Da un paso largo al frente y baja hasta que la rodilla de atrás casi toque el suelo. Vuelve y cambia de pierna.',
  },
  zancada_bulgara: {
    nombre: 'Sentadilla búlgara',
    como: 'Pon el pie de atrás sobre un banco o silla. Baja recto con la pierna de delante. Haz todas las reps con una pierna y luego cambia.',
  },
  step_up: {
    nombre: 'Subida al banco',
    como: 'Sube a un banco o escalón firme empujando con la pierna de arriba, sin impulsarte con la de abajo. Baja con control.',
  },
  peso_muerto_rumano: {
    nombre: 'Peso muerto rumano',
    como: 'Con la barra o mancuernas delante, echa la cadera hacia atrás con las rodillas un poco dobladas. Baja hasta notar la parte de atrás del muslo y sube.',
  },
  hip_thrust: {
    nombre: 'Hip thrust',
    como: 'Espalda alta apoyada en un banco y peso sobre la cadera. Sube la cadera hasta quedar recto y aprieta los glúteos arriba.',
  },
  puente_gluteo: {
    nombre: 'Puente de glúteo',
    como: 'Tumbado boca arriba con las rodillas dobladas. Sube la cadera apretando los glúteos y baja despacio.',
  },
  puente_una_pierna: {
    nombre: 'Puente a una pierna',
    como: 'Como el puente de glúteo, pero con una pierna estirada en el aire. Haz todas las reps y cambia de lado.',
  },
  curl_femoral: {
    nombre: 'Curl femoral en máquina',
    como: 'Dobla las rodillas llevando los talones hacia el glúteo. Baja lento, sin dejar caer el peso.',
  },
  gemelos: {
    nombre: 'Elevación de gemelos',
    como: 'De pie, sube de puntillas lo más alto que puedas. Aguanta 1 segundo arriba y baja lento.',
  },

  // ---------- Empuje: pecho, hombro, tríceps ----------
  press_banca: {
    nombre: 'Press de banca',
    como: 'Tumbado en el banco, baja la barra hasta la mitad del pecho con los codos un poco cerrados. Empuja hacia arriba sin levantar la cadera.',
  },
  press_mancuernas: {
    nombre: 'Press con mancuernas',
    como: 'Tumbado en el banco con una mancuerna en cada mano. Baja hasta el pecho y sube juntando un poco las mancuernas arriba.',
  },
  press_inclinado: {
    nombre: 'Press inclinado con mancuernas',
    como: 'Como el press con mancuernas, pero con el respaldo del banco inclinado. Trabaja más la parte alta del pecho.',
  },
  press_militar: {
    nombre: 'Press militar',
    como: 'De pie, sube la barra desde los hombros hasta estirar los brazos por encima de la cabeza. Aprieta el abdomen para no arquear la espalda.',
  },
  press_hombro_mancuernas: {
    nombre: 'Press de hombros con mancuernas',
    como: 'Sentado con la espalda apoyada, sube las mancuernas desde la altura de las orejas hasta arriba. Baja con control.',
  },
  elevaciones_laterales: {
    nombre: 'Elevaciones laterales',
    como: 'Con una mancuerna ligera en cada mano, sube los brazos hacia los lados hasta la altura de los hombros. No balancees el cuerpo.',
  },
  flexiones: {
    nombre: 'Flexiones',
    como: 'Manos un poco más abiertas que los hombros y cuerpo recto. Baja el pecho casi al suelo y empuja. Si cuesta, apoya las rodillas.',
  },
  flexiones_pies_elevados: {
    nombre: 'Flexiones con pies elevados',
    como: 'Como una flexión, pero con los pies sobre una silla o sofá. Es más difícil y trabaja más el pecho alto y el hombro.',
  },
  pike_flexiones: {
    nombre: 'Flexiones pica',
    como: 'Forma una V invertida con la cadera alta. Dobla los codos para bajar la cabeza hacia el suelo y empuja. Trabaja los hombros.',
  },
  fondos_silla: {
    nombre: 'Fondos en silla',
    como: 'Manos en el borde de una silla firme detrás de ti. Baja doblando los codos hasta 90 grados y sube.',
  },
  fondos_paralelas: {
    nombre: 'Fondos en paralelas',
    como: 'Sujeta las barras con los brazos estirados. Baja doblando los codos y sube. Usa la máquina asistida si todavía no puedes.',
  },
  triceps_polea: {
    nombre: 'Extensión de tríceps en polea',
    como: 'Codos pegados al cuerpo. Empuja la cuerda o barra hacia abajo hasta estirar los brazos y vuelve despacio.',
  },

  // ---------- Tirón: espalda y bíceps ----------
  remo_mancuerna: {
    nombre: 'Remo con mancuerna',
    como: 'Una mano y una rodilla apoyadas en el banco. Tira de la mancuerna hacia la cadera con el codo pegado al cuerpo.',
  },
  remo_barra: {
    nombre: 'Remo con barra',
    como: 'Inclínate hacia delante con la espalda recta. Tira de la barra hacia el ombligo y junta las escápulas.',
  },
  remo_polea: {
    nombre: 'Remo sentado en polea',
    como: 'Sentado con la espalda recta, tira del agarre hacia el abdomen. Saca pecho al final y vuelve despacio.',
  },
  jalon: {
    nombre: 'Jalón al pecho',
    como: 'Agarra la barra un poco más abierta que los hombros. Tira hacia la parte alta del pecho llevando los codos hacia abajo.',
  },
  dominadas: {
    nombre: 'Dominadas',
    como: 'Cuélgate de la barra y sube hasta pasar la barbilla. Si no llegas, usa la máquina asistida o una goma elástica.',
  },
  face_pull: {
    nombre: 'Face pull',
    como: 'Con la cuerda de la polea a la altura de la cara, tira hacia tus ojos abriendo los codos. Muy bueno para la postura.',
  },
  remo_mesa: {
    nombre: 'Remo invertido bajo mesa',
    como: 'Túmbate bajo una mesa firme y agarra el borde. Con el cuerpo recto, sube el pecho hacia la mesa. Comprueba antes que la mesa no se mueve.',
  },
  remo_toalla: {
    nombre: 'Remo con toalla en puerta',
    como: 'Pasa una toalla por el pomo de una puerta cerrada y agarra los extremos. Échate hacia atrás y tira de ti hacia la puerta.',
  },
  superman: {
    nombre: 'Superman',
    como: 'Tumbado boca abajo, sube a la vez brazos y piernas unos centímetros. Aguanta 2 segundos y baja.',
  },
  curl_biceps: {
    nombre: 'Curl de bíceps',
    como: 'De pie con una mancuerna en cada mano. Dobla los codos sin moverlos del sitio y baja lento.',
  },
  curl_martillo: {
    nombre: 'Curl martillo',
    como: 'Como el curl de bíceps, pero con las palmas mirándose entre sí todo el rato.',
  },

  // ---------- Core ----------
  plancha: {
    nombre: 'Plancha',
    como: 'Apoya antebrazos y puntas de los pies. Cuerpo recto de la cabeza a los talones. Aprieta abdomen y glúteos.',
  },
  plancha_lateral: {
    nombre: 'Plancha lateral',
    como: 'De lado, apoyado en un antebrazo y el borde del pie. Sube la cadera hasta quedar en línea recta. Haz los dos lados.',
  },
  dead_bug: {
    nombre: 'Dead bug',
    como: 'Boca arriba con brazos y piernas en el aire. Estira un brazo y la pierna contraria sin despegar la zona lumbar del suelo. Alterna.',
  },
  bird_dog: {
    nombre: 'Bird dog',
    como: 'A cuatro patas, estira un brazo y la pierna contraria hasta quedar recto. Aguanta 2 segundos y cambia.',
  },
  crunch_bicicleta: {
    nombre: 'Crunch bicicleta',
    como: 'Boca arriba, lleva el codo hacia la rodilla contraria mientras estiras la otra pierna. Alterna sin tirar del cuello.',
  },
  elevacion_piernas: {
    nombre: 'Elevación de piernas',
    como: 'Boca arriba con las manos bajo la cadera. Sube las piernas estiradas hasta 90 grados y baja lento sin tocar el suelo.',
  },

  // ---------- Cardio con el cuerpo ----------
  jumping_jacks: {
    nombre: 'Jumping jacks',
    como: 'Salta abriendo piernas y subiendo los brazos por encima de la cabeza. Vuelve a cerrar y repite rápido.',
  },
  skipping: {
    nombre: 'Skipping',
    como: 'Corre en el sitio subiendo las rodillas hasta la cadera. Mueve los brazos como al correr.',
  },
  patinador: {
    nombre: 'Saltos de patinador',
    como: 'Salta de lado de un pie al otro, como un patinador. Cae suave con la rodilla un poco doblada.',
  },
  sentadilla_salto: {
    nombre: 'Sentadilla con salto',
    como: 'Haz una sentadilla y sube saltando. Cae suave y baja directo a la siguiente.',
  },
  zancada_salto: {
    nombre: 'Zancada con salto',
    como: 'Desde una zancada, salta y cambia las piernas en el aire. Si es mucho, hazlas sin salto.',
  },
  mountain_climbers: {
    nombre: 'Mountain climbers',
    como: 'En posición de flexión, lleva las rodillas al pecho una y otra vez, rápido, como si corrieras.',
  },
  burpees: {
    nombre: 'Burpees',
    como: 'Agáchate, apoya las manos, salta atrás a plancha, vuelve a agacharte y salta arriba. Quita el salto si cuesta.',
  },
  plancha_toques: {
    nombre: 'Plancha con toque de hombro',
    como: 'En posición de flexión, toca con una mano el hombro contrario. Alterna sin mover la cadera.',
  },
  swing: {
    nombre: 'Swing con pesa rusa',
    como: 'Echa la cadera atrás con la pesa entre las piernas y empuja fuerte con la cadera para subirla a la altura del pecho. Los brazos no tiran.',
  },

  // ---------- Movilidad ----------
  movilidad_cadera: {
    nombre: 'Círculos de cadera',
    como: 'De pie con las manos en la cintura, haz círculos grandes con la cadera. 10 a cada lado.',
  },
  circulos_hombros: {
    nombre: 'Círculos de hombros',
    como: 'Brazos estirados a los lados. Haz círculos pequeños que se hacen grandes. Luego hacia el otro lado.',
  },
  gato_vaca: {
    nombre: 'Gato-vaca',
    como: 'A cuatro patas, redondea la espalda mirando al ombligo y luego húndela mirando al frente. Despacio y respirando.',
  },
  postura_nino: {
    nombre: 'Postura del niño',
    como: 'De rodillas, siéntate sobre los talones y estira los brazos al frente con la frente en el suelo. Respira hondo.',
  },
  cobra: {
    nombre: 'Cobra',
    como: 'Boca abajo, apoya las manos bajo los hombros y sube el pecho estirando suave la espalda. La cadera se queda en el suelo.',
  },
  estiramiento_isquios: {
    nombre: 'Estiramiento de isquios',
    como: 'Sentado con una pierna estirada, inclínate hacia el pie con la espalda recta hasta notar tensión suave. Cambia de pierna.',
  },
  estiramiento_cuadriceps: {
    nombre: 'Estiramiento de cuádriceps',
    como: 'De pie, agarra un pie y llévalo hacia el glúteo. Rodillas juntas. Apóyate en una pared si hace falta.',
  },
  paloma: {
    nombre: 'Postura de la paloma',
    como: 'Desde cuatro patas, lleva una rodilla al frente y estira la otra pierna atrás. Baja la cadera. Estira el glúteo.',
  },
  respiracion: {
    nombre: 'Respiración lenta',
    como: 'Tumbado, coge aire en 4 segundos, aguanta 4 y suelta en 6. Nota cómo baja el pulso.',
  },
};
