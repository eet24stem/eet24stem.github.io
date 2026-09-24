
// Al recargar la pagina, siempre arrancar arriba de todo (sin esto el navegador
// restaura la posicion de scroll donde estabas antes de recargar)
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Filtro de la seccion Speakers (buscador + area + dia)
(function(){
  var buscador = document.getElementById('buscador-speaker');
  var filtroRol = document.getElementById('filtro-rol');
  var filtroDia = document.getElementById('filtro-dia');
  var sinResultados = document.getElementById('sin-resultados');
  if (!buscador || !filtroRol || !filtroDia || !sinResultados) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('#grid-speakers .card-invitado'));

  function aplicarFiltros(){
    var q = buscador.value.trim().toLowerCase();
    var rol = filtroRol.value;
    var dia = filtroDia.value;
    var visibles = 0;

    cards.forEach(function(card){
      var nombre = card.getAttribute('data-nombre') || '';
      var rolCard = card.getAttribute('data-rol') || '';
      var dias = (card.getAttribute('data-dia') || '').split(',');

      var matchQ = !q || nombre.indexOf(q) !== -1;
      var matchRol = !rol || rolCard === rol;
      var matchDia = !dia || dias.indexOf(dia) !== -1;

      var visible = matchQ && matchRol && matchDia;
      card.style.display = visible ? '' : 'none';
      if (visible) visibles++;
    });

    sinResultados.style.display = visibles === 0 ? 'block' : 'none';
  }

  buscador.addEventListener('input', aplicarFiltros);
  filtroRol.addEventListener('change', aplicarFiltros);
  filtroDia.addEventListener('change', aplicarFiltros);
})();

// Resaltar en el menu la seccion que se esta viendo (scroll-spy)
(function(){
  var enlaces = Array.prototype.slice.call(document.querySelectorAll('#navLinks a[data-nav]'));
  if (!enlaces.length) return;

  var secciones = [
    { nav: 'inicio', el: document.getElementById('heroCarousel') },
    { nav: 'cronograma', el: document.getElementById('cronograma') },
    { nav: 'invitados', el: document.getElementById('invitados') }
  ].filter(function(s){ return s.el; });

  if (!secciones.length || typeof IntersectionObserver === 'undefined') return;

  function marcarActivo(nav){
    enlaces.forEach(function(a){
      a.classList.toggle('activo', a.getAttribute('data-nav') === nav);
    });
  }

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var seccion = secciones.filter(function(s){ return s.el === entry.target; })[0];
      if (seccion) marcarActivo(seccion.nav);
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  secciones.forEach(function(s){ observer.observe(s.el); });
})();

// Carrusel del hero
(function(){
  var carrusel = document.getElementById('heroCarousel');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var puntos = Array.prototype.slice.call(document.querySelectorAll('.hero-puntos .punto'));
  var contenido = document.getElementById('heroContenido');
  var btnPrev = document.getElementById('heroPrev');
  var btnNext = document.getElementById('heroNext');
  if (!slides.length || !contenido) return;

  // El texto de cada slide vive solo en JS: asi el cambio de texto es un
  // corte rapido (fade-out breve, se pisa el contenido, fade-in) en vez de
  // quedar superpuesto con el texto de la slide anterior durante el crossfade
  // de las fotos de fondo (que sigue siendo mas lento y se ve bien mezclado).
  var contenidoSlides = [
    { titulo: 'SPACE WEEK', fecha: '4 — 9 OCTUBRE 2026', bajada: 'Charlas y mini entrevistas para despertar curiosidad sobre gente que hace ciencia y tecnología de punta en el país, en el área espacial.' },
    { titulo: 'E.E.T. N°24 "SIMÓN DE IRIONDO"', fecha: null, bajada: 'La escuela técnica de Resistencia, Chaco que organiza la Space Week 2026.' }
  ];

  function renderContenido(i){
    var d = contenidoSlides[i];
    if (!d) return;
    contenido.innerHTML = '';
    var h1 = document.createElement('h1');
    h1.className = 'titulo-evento';
    h1.textContent = d.titulo;
    contenido.appendChild(h1);
    if (d.fecha) {
      var badge = document.createElement('div');
      badge.className = 'fecha-badge';
      badge.textContent = d.fecha;
      contenido.appendChild(badge);
    }
    var p = document.createElement('p');
    p.className = 'bajada';
    p.textContent = d.bajada;
    contenido.appendChild(p);
  }

  var actual = 0;
  var timer;
  var cambioTexto;

  function mostrar(i){
    var nuevo = (i + slides.length) % slides.length;
    if (nuevo === actual) return;
    actual = nuevo;
    slides.forEach(function(s, idx){ s.classList.toggle('activo', idx === actual); });
    puntos.forEach(function(p, idx){ p.classList.toggle('activo', idx === actual); });

    contenido.classList.add('cambiando');
    clearTimeout(cambioTexto);
    cambioTexto = setTimeout(function(){
      renderContenido(actual);
      contenido.classList.remove('cambiando');
    }, 250);
  }
  function siguiente(){ mostrar(actual + 1); }
  function anterior(){ mostrar(actual - 1); }
  function reiniciarAutoplay(){
    clearInterval(timer);
    timer = setInterval(siguiente, 6000);
  }

  if (btnNext) btnNext.addEventListener('click', function(){ siguiente(); reiniciarAutoplay(); });
  if (btnPrev) btnPrev.addEventListener('click', function(){ anterior(); reiniciarAutoplay(); });
  puntos.forEach(function(p, idx){
    p.addEventListener('click', function(){ mostrar(idx); reiniciarAutoplay(); });
  });

  // Swipe tactil (celular): deslizar como en Instagram/TikTok cambia de slide
  if (carrusel) {
    var inicioX = 0, inicioY = 0;
    carrusel.addEventListener('touchstart', function(e){
      var t = e.changedTouches[0];
      inicioX = t.clientX;
      inicioY = t.clientY;
    }, { passive: true });
    carrusel.addEventListener('touchend', function(e){
      var t = e.changedTouches[0];
      var deltaX = t.clientX - inicioX;
      var deltaY = t.clientY - inicioY;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) siguiente(); else anterior();
        reiniciarAutoplay();
      }
    }, { passive: true });
  }

  reiniciarAutoplay();
})();

// Cronograma: tabs por dia
// Nota: los paneles NO tienen la clase "oculto" en el HTML (si el usuario no
// tiene JS, ve todos los dias completos en vez de que el contenido desaparezca).
// Por eso, al iniciar, ocultamos por JS los paneles que no correspondan al tab activo.
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-dia'));
  var paneles = Array.prototype.slice.call(document.querySelectorAll('.cronograma-panel'));
  if (!tabs.length || !paneles.length) return;

  function mostrarDia(dia){
    tabs.forEach(function(t){ t.classList.toggle('activo', t.getAttribute('data-dia-tab') === dia); });
    paneles.forEach(function(p){
      p.classList.toggle('oculto', p.getAttribute('data-dia-panel') !== dia);
    });
  }

  var tabActivo = tabs.filter(function(t){ return t.classList.contains('activo'); })[0] || tabs[0];
  mostrarDia(tabActivo.getAttribute('data-dia-tab'));

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      mostrarDia(tab.getAttribute('data-dia-tab'));
    });
  });
})();

// Menu hamburguesa (mobile)
(function(){
  var toggle = document.getElementById('navToggle');
  var closeBtn = document.getElementById('navClose');
  var links = document.getElementById('navLinks');
  if (!toggle || !closeBtn || !links) return;

  var scrollGuardado = 0;

  function abrirMenu(){
    scrollGuardado = window.scrollY;
    links.classList.add('abierto');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.position = 'fixed';
    document.body.style.top = (-scrollGuardado) + 'px';
    document.body.style.width = '100%';
  }
  function cerrarMenu(){
    links.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollGuardado);
  }

  toggle.addEventListener('click', abrirMenu);
  closeBtn.addEventListener('click', cerrarMenu);
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', cerrarMenu);
  });
})();

// Modal de especialistas confirmados (Socolovsky, Janches, Cieza)
(function(){
  var SPEAKERS_INFO = {
    socolovsky: {
      nombre: 'Hernán Socolovsky',
      rol: 'CNEA — Energía Solar',
      foto: 'img/socolovsky.jpg',
      titulo: 'Paneles solares y energía espacial',
      bio: 'Ingeniero del Departamento de Energía Solar de la CNEA; desarrolla paneles solares para uso espacial, entre ellos ATENEA, que voló en Artemis II.',
      preguntas: [
        '¿Qué es lo más difícil de que un panel solar funcione en el espacio?',
        '¿Cómo es trabajar en un proyecto que termina siendo parte de una misión real como Artemis II?'
      ]
    },
    janches: {
      nombre: 'Diego Janches',
      rol: 'NASA Goddard',
      foto: 'img/janches.jpg',
      titulo: 'Meteoros, radares y basura espacial',
      bio: 'Astrofísico, investiga en NASA Goddard; colabora con la UNLP en el radar de meteoros de Río Grande. Tiene un asteroide con su nombre.',
      preguntas: [
        '¿Cómo es investigar en la NASA colaborando con un radar en Tierra del Fuego?',
        '¿Qué diferencia hay entre meteoro, meteorito y "basura espacial"?'
      ]
    },
    cieza: {
      nombre: 'Lucas Cieza',
      rol: 'Universidad Diego Portales',
      foto: 'img/cieza.jpg',
      titulo: 'Detección y estudio de exoplanetas',
      bio: 'Astrónomo, lidera el proyecto Odisea, que descubrió el exoplaneta más joven observado hasta la fecha (Elías 2-24 b).',
      preguntas: [
        '¿Cómo se "ve" un planeta tan lejos que ni se puede fotografiar directamente?',
        '¿Por qué importa encontrar un planeta recién formado?'
      ]
    }
  };

  var modal = document.getElementById('modalSpeaker');
  var backdrop = document.getElementById('modalSpeakerBackdrop');
  var btnClose = document.getElementById('modalSpeakerClose');
  var fotoEl = document.getElementById('modalSpeakerFoto');
  var rolEl = document.getElementById('modalSpeakerRol');
  var nombreEl = document.getElementById('modalSpeakerNombre');
  var charlaEl = document.getElementById('modalSpeakerCharla');
  var bioEl = document.getElementById('modalSpeakerBio');
  var preguntasEl = document.getElementById('modalSpeakerPreguntas');

  if (!modal || !btnClose || !fotoEl || !nombreEl || !charlaEl || !bioEl || !preguntasEl) return;

  // Mismo truco de scroll-lock que ya usa el menu hamburguesa (ver mas abajo):
  // "overflow:hidden" solo no alcanza en Safari de iPhone, hay que fijar el
  // body con position:fixed y restaurar el scroll manualmente al cerrar.
  var scrollGuardadoModal = 0;

  function abrirModal(id){
    var sp = SPEAKERS_INFO[id];
    if (!sp) return;

    fotoEl.src = sp.foto;
    fotoEl.alt = sp.nombre;
    if (rolEl) rolEl.textContent = sp.rol;
    nombreEl.textContent = sp.nombre;
    charlaEl.textContent = sp.titulo;
    bioEl.textContent = sp.bio;

    preguntasEl.innerHTML = '';
    sp.preguntas.forEach(function(pregunta){
      var li = document.createElement('li');
      li.textContent = pregunta;
      preguntasEl.appendChild(li);
    });

    scrollGuardadoModal = window.scrollY;
    modal.classList.add('activo');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-abierto');
    document.body.style.position = 'fixed';
    document.body.style.top = (-scrollGuardadoModal) + 'px';
    document.body.style.width = '100%';
    btnClose.focus();
  }

  function cerrarModal(){
    modal.classList.remove('activo');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-abierto');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollGuardadoModal);
  }

  // Triggers en tarjetas del grid y tags del cronograma
  var triggers = document.querySelectorAll('[data-speaker]');
  triggers.forEach(function(trigger){
    var speakerId = trigger.getAttribute('data-speaker');
    if (!speakerId) return;

    trigger.addEventListener('click', function(e){
      e.preventDefault();
      abrirModal(speakerId);
    });

    // Accesibilidad por teclado (Enter o Espacio)
    trigger.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirModal(speakerId);
      }
    });
  });

  btnClose.addEventListener('click', cerrarModal);
  if (backdrop) backdrop.addEventListener('click', cerrarModal);

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal.classList.contains('activo')) {
      cerrarModal();
    }
  });
})();
