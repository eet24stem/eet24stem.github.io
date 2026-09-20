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

// Carrusel del hero
(function(){
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var puntos = Array.prototype.slice.call(document.querySelectorAll('.hero-puntos .punto'));
  var btnPrev = document.getElementById('heroPrev');
  var btnNext = document.getElementById('heroNext');
  if (!slides.length) return;

  var actual = 0;
  var timer;

  function mostrar(i){
    actual = (i + slides.length) % slides.length;
    slides.forEach(function(s, idx){ s.classList.toggle('activo', idx === actual); });
    puntos.forEach(function(p, idx){ p.classList.toggle('activo', idx === actual); });
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

  reiniciarAutoplay();
})();

// Cronograma: tabs por dia
(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab-dia'));
  var paneles = Array.prototype.slice.call(document.querySelectorAll('.cronograma-panel'));
  if (!tabs.length || !paneles.length) return;

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var dia = tab.getAttribute('data-dia-tab');
      tabs.forEach(function(t){ t.classList.toggle('activo', t === tab); });
      paneles.forEach(function(p){
        p.classList.toggle('oculto', p.getAttribute('data-dia-panel') !== dia);
      });
    });
  });
})();

// Menu hamburguesa (mobile)
(function(){
  var toggle = document.getElementById('navToggle');
  var closeBtn = document.getElementById('navClose');
  var links = document.getElementById('navLinks');
  if (!toggle || !closeBtn || !links) return;

  function abrirMenu(){
    links.classList.add('abierto');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function cerrarMenu(){
    links.classList.remove('abierto');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', abrirMenu);
  closeBtn.addEventListener('click', cerrarMenu);
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', cerrarMenu);
  });
})();
