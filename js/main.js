/* ============================================================
   INSTITUTO MUNICIPAL DE CULTURA Y TURISMO DE TENJO
   Scripts principales — Rediseño 2026 · Premium Edition
   (Adaptado para Drupal 10/11 con Drupal.behaviors)
   ============================================================ */

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.imcttPremiumScripts = {
    attach: function (context, settings) {

      // ── 1. Menú hamburguesa ───────────────────────────────────
      once('navToggleInit', '.nav-toggle', context).forEach((toggle) => {
        const nav = document.querySelector('.nav-principal');
        if (nav) {
          toggle.addEventListener('click', () => {
            const abierto = nav.classList.toggle('abierto');
            toggle.classList.toggle('abierto', abierto);
            toggle.setAttribute('aria-expanded', String(abierto));
            document.body.style.overflow = abierto ? 'hidden' : '';
          });
        }
      });

      // Eventos globales de clic para cerrar menús (se vincula una sola vez al HTML)
      once('globalMenuClicks', 'html', context).forEach(() => {
        document.addEventListener('click', (e) => {
          const nav = document.querySelector('.nav-principal');
          const toggle = document.querySelector('.nav-toggle');

          // Cerrar menú al hacer clic fuera del header (Mobile)
          if (!e.target.closest('.site-header') && nav?.classList.contains('abierto')) {
            nav.classList.remove('abierto');
            toggle?.classList.remove('abierto');
            toggle?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }

          // En desktop, cerrar dropdowns al hacer clic fuera del nav
          if (window.innerWidth > 768 && !e.target.closest('.nav-principal')) {
            document.querySelectorAll('.nav-item.dd-abierto').forEach((i) => i.classList.remove('dd-abierto'));
          }
        });
      });


      // ── 2. Dropdowns en mobile (clic sobre el enlace padre) ──
      once('dropdownMobileInit', '.nav-item > a', context).forEach((enlace) => {
        const item     = enlace.closest('.nav-item');
        const dropdown = item.querySelector(':scope > .dropdown');
        if (!dropdown) return;

        enlace.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            // Cierra los otros dropdowns abiertos
            item.closest('nav').querySelectorAll('.nav-item.dd-abierto').forEach((otro) => {
              if (otro !== item) otro.classList.remove('dd-abierto');
            });
            item.classList.toggle('dd-abierto');
          }
        });
      });

      // En mobile, cerrar todo el menú al elegir una hoja de navegación
      once('dropdownLinkClose', '.nav-principal .dropdown a', context).forEach((enlace) => {
        enlace.addEventListener('click', () => {
          const nav = document.querySelector('.nav-principal');
          const toggle = document.querySelector('.nav-toggle');

          if (window.innerWidth <= 768 && nav) {
            nav.classList.remove('abierto');
            toggle?.classList.remove('abierto');
            toggle?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            nav.querySelectorAll('.nav-item').forEach((i) => i.classList.remove('dd-abierto'));
          }
        });
      });


      // ── 3. Marcar enlace activo según página actual ──────────
      once('activeLinkInit', '.nav-principal > a, .nav-principal .nav-item > a', context).forEach((enlace) => {
        const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
        const href = (enlace.getAttribute('href') || '').split('/').pop();
        if (href === paginaActual || (paginaActual === '' && href === 'index.html')) {
          enlace.classList.add('activo');
        }
      });


      // ── 4. Acordeón (Transparencia y Listas Documentales) ───────────────
      once('accordionInit', '.accordion-header', context).forEach((header) => {
        // Estado inicial de accesibilidad
        header.setAttribute('aria-expanded', 'false');

        header.addEventListener('click', () => {
          const content = header.nextElementSibling;
          if (!content || !content.classList.contains('accordion-content')) return;

          const estaAbierto = content.style.display === 'block';

          // Colapsar todos los demás acordeones
          document.querySelectorAll('.accordion-content').forEach((c) => {
            c.style.display = 'none';
          });
          document.querySelectorAll('.accordion-header').forEach((h) => {
            h.setAttribute('aria-expanded', 'false');
            h.classList.remove('activo'); // Por si quieres darle color al abierto
          });

          // Abrir el que se clicó (si estaba cerrado)
          if (!estaAbierto) {
            content.style.display = 'block';
            header.setAttribute('aria-expanded', 'true');
            header.classList.add('activo');

            // Leve retraso para que el DOM pinte el bloque antes del scroll
            setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
          }
        });
      });


      // ── 5. Header: añade sombra/fondo al hacer scroll ────────
      once('headerScrollInit', '.site-header', context).forEach((header) => {
        const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Estado inicial
      });


      // ── 6. Slider / Carrusel (Hero de inicio) ────────────────
      // Vinculamos la lógica solo si existe el contenedor general para no generar errores
      once('sliderInit', 'html', context).forEach(() => {
        const slides  = document.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        const dots    = document.querySelectorAll('.slider-dot');
        const btnPrev = document.querySelector('.slider-btn.prev');
        const btnNext = document.querySelector('.slider-btn.next');
        let current   = 0;
        let timer     = null;

        const mostrarSlide = (n) => {
          slides.forEach((s, i) => s.classList.toggle('activo', i === n));
          dots.forEach((d, i) => {
            d.classList.toggle('activo', i === n);
            d.setAttribute('aria-selected', String(i === n));
          });
          current = n;
        };

        const siguiente = () => mostrarSlide((current + 1) % slides.length);
        const anterior  = () => mostrarSlide((current - 1 + slides.length) % slides.length);

        const iniciarTimer = () => {
          clearInterval(timer);
          if (slides.length > 1) timer = setInterval(siguiente, 5500);
        };

        // Respetar preferencia del sistema de movimiento reducido (WCAG 2.2.2)
        const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let pausadoPorUsuario = prefiereMenosMovimiento;

        mostrarSlide(0);
        if (!prefiereMenosMovimiento) iniciarTimer();

        btnNext?.addEventListener('click', () => { siguiente(); if (!pausadoPorUsuario) iniciarTimer(); });
        btnPrev?.addEventListener('click', () => { anterior(); if (!pausadoPorUsuario) iniciarTimer(); });

        dots.forEach((dot, i) => {
          dot.addEventListener('click', () => { mostrarSlide(i); if (!pausadoPorUsuario) iniciarTimer(); });
        });

        // Botón de pausa accesible (inyectado sobre el slider)
        const sliderEl = document.querySelector('.hero-slider');
        if (sliderEl && slides.length > 1) {
          const btnPausa = document.createElement('button');
          btnPausa.className = 'slider-pausa-btn';
          btnPausa.setAttribute('aria-label', pausadoPorUsuario ? 'Reproducir presentación' : 'Pausar presentación');
          btnPausa.setAttribute('aria-pressed', String(pausadoPorUsuario));
          btnPausa.innerHTML = pausadoPorUsuario
            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`
            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

          btnPausa.addEventListener('click', () => {
            pausadoPorUsuario = !pausadoPorUsuario;
            if (pausadoPorUsuario) {
              clearInterval(timer);
              btnPausa.setAttribute('aria-label', 'Reproducir presentación');
              btnPausa.setAttribute('aria-pressed', 'true');
              btnPausa.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>`;
            } else {
              iniciarTimer();
              btnPausa.setAttribute('aria-label', 'Pausar presentación');
              btnPausa.setAttribute('aria-pressed', 'false');
              btnPausa.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
            }
          });

          sliderEl.appendChild(btnPausa);

          sliderEl.addEventListener('mouseenter', () => { if (!pausadoPorUsuario) clearInterval(timer); });
          sliderEl.addEventListener('mouseleave', () => { if (!pausadoPorUsuario) iniciarTimer(); });

          // Soporte swipe táctil
          let touchStartX = 0;
          sliderEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
          }, { passive: true });

          sliderEl.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
              diff > 0 ? siguiente() : anterior();
              if (!pausadoPorUsuario) iniciarTimer();
            }
          }, { passive: true });
        }
      });


      // ── 7. Scroll Reveal — IntersectionObserver ──────────────
      once('scrollRevealInit', '[data-reveal]', context).forEach((el) => {
        if ('IntersectionObserver' in window) {
          const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Animación sólo una vez
              }
            });
          }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px',
          });
          revealObserver.observe(el);
        } else {
          // Fallback: mostrar todo directamente en browsers sin soporte
          el.classList.add('revealed');
        }
      });


      // ── 8. Efecto Ripple en botones y tarjetas ────────────────
      once('rippleEffectInit', '.btn, .btn-sucop, .documento-item, .document-item-link, .btn-institucional-rojo', context).forEach((el) => {
        el.addEventListener('click', (e) => {
          const rect   = el.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.classList.add('ripple');
          ripple.style.left = `${e.clientX - rect.left}px`;
          ripple.style.top  = `${e.clientY - rect.top}px`;
          el.appendChild(ripple);
          setTimeout(() => ripple.remove(), 700);
        });
      });


      // ── 9. Feedback visual en tarjetas de iconos ─────────────
      once('visualFeedbackInit', '.icono-btn', context).forEach((btn) => {
        btn.addEventListener('click', () => {
          btn.style.transform = 'scale(0.96)';
          setTimeout(() => { btn.style.transform = ''; }, 150);
        });
      });


      // ── 10. Filtros de categoría (.filtro-btn) ────────────────
      once('filtrosCategoriaInit', '.filtros-bar .filtro-btn', context).forEach((btn) => {
        // Estado inicial ARIA
        btn.setAttribute('aria-pressed', btn.classList.contains('activo') ? 'true' : 'false');

        btn.addEventListener('click', () => {
          const barraActual = btn.closest('.filtros-bar');
          if (!barraActual) return;

          // Desactivar todos los botones de esta barra
          barraActual.querySelectorAll('.filtro-btn').forEach((b) => {
            b.classList.remove('activo');
            b.setAttribute('aria-pressed', 'false');
          });

          // Activar el pulsado
          btn.classList.add('activo');
          btn.setAttribute('aria-pressed', 'true');

          const filtro = btn.getAttribute('data-filtro');
          if (!filtro) return;

          const contenedor = document.querySelector('[data-filtros-target]');
          if (!contenedor) return;

          contenedor.querySelectorAll('[data-area]').forEach((sec) => {
            const mostrar     = filtro === 'todas' || sec.getAttribute('data-area') === filtro;
            sec.hidden        = !mostrar;
            sec.style.display = mostrar ? '' : 'none';
          });
        });
      });


      // ── 11. Scroll suave para anclas internas ─────────────────
      once('smoothScrollInit', 'a[href^="#"]', context).forEach((enlace) => {
        enlace.addEventListener('click', (e) => {
          const id = enlace.getAttribute('href').slice(1);
          if (!id) return;
          const destino = document.getElementById(id);
          if (!destino) return;
          e.preventDefault();
          const header = document.querySelector('.site-header');
          const offsetHeader = (header ? header.getBoundingClientRect().height : 0) + 12;
          const top = destino.getBoundingClientRect().top + window.scrollY - offsetHeader;
          window.scrollTo({ top, behavior: 'smooth' });
        });
      });


      // ── 12. Botón "Volver al inicio" (auto-inyectado) ────────
      once('scrollTopBtnInit', 'html', context).forEach(() => {
        if (!document.querySelector('.scroll-top-btn')) {
          // Estilos del botón: se inyectan junto a la lógica para mantener coherencia
          const styleEl = document.createElement('style');
          styleEl.textContent = `
            .scroll-top-btn {
              position: fixed;
              bottom: 28px;
              right: 28px;
              z-index: 900;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              border: none;
              background: var(--verde-oscuro, #1A3A2A);
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(0,0,0,0.22);
              opacity: 0;
              transform: translateY(12px);
              transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s;
              pointer-events: none;
            }
            .scroll-top-btn.visible {
              opacity: 1;
              transform: translateY(0);
              pointer-events: auto;
            }
            .scroll-top-btn:hover  { background: var(--verde-medio, #2D5A27); }
            .scroll-top-btn:focus-visible {
              outline: 2px solid var(--acento, #D4A843);
              outline-offset: 3px;
            }
          `;
          document.head.appendChild(styleEl);

          // Crear el botón
          const scrollBtn = document.createElement('button');
          scrollBtn.className = 'scroll-top-btn';
          scrollBtn.setAttribute('aria-label', 'Volver al inicio');
          scrollBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18,15 12,9 6,15"/>
            </svg>`;
          document.body.appendChild(scrollBtn);

          // Mostrar/ocultar según posición del scroll
          window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('visible', window.scrollY > 400);
          }, { passive: true });

          // Volver al inicio al pulsar
          scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
      });


      // ── 13. Lazy-load para imágenes con data-src ─────────────
      once('lazyLoadInit', 'img[data-src]', context).forEach((img) => {
        if ('IntersectionObserver' in window) {
          const lazyObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const targetImg = entry.target;
                targetImg.src = targetImg.getAttribute('data-src');
                targetImg.removeAttribute('data-src');
                observer.unobserve(targetImg);
              }
            });
          }, { rootMargin: '200px' });
          lazyObserver.observe(img);
        }
      });

    } // Cierre de attach
  }; // Cierre de Drupal.behaviors
})(Drupal, once);

(function (Drupal, once) {
  Drupal.behaviors.perfilModal = {
    attach: function (context) {

      // 1. Crear el modal si no existe
      if (!document.getElementById('p-modal')) {
        const markup = `
          <div id="p-modal" class="perfil-modal">
            <div class="modal-content" style="background:#fff; width:90%; max-width:850px; display:flex; border-radius:20px; overflow:hidden; position:relative;">
              <span class="close-m" style="position:absolute; top:15px; right:25px; font-size:35px; cursor:pointer; color:#999; z-index:10;">&times;</span>
              <div class="modal-img-container" style="width:40%; background:#f0f0f0;">
                <img id="m-img" src="" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div class="modal-text-container" style="width:60%; padding:45px; max-height:85vh; overflow-y:auto;">
                <h2 id="m-nombre" style="color:var(--verde-oscuro); margin-bottom:5px;"></h2>
                <h4 id="m-cargo" style="color:var(--acento); text-transform:uppercase; font-size:0.9rem; margin-bottom:20px;"></h4>
                <div id="m-bio" style="line-height:1.8; color:#444;"></div>
              </div>
            </div>
          </div>`;
        document.body.insertAdjacentHTML('beforeend', markup);

        const m = document.getElementById('p-modal');
        m.querySelector('.close-m').onclick = () => m.classList.remove('activo');
        m.onclick = (e) => { if(e.target === m) m.classList.remove('activo'); };
      }

      // 2. Evento de clic con lectura segura (A prueba de errores)
      once('perfilClick', '.js-perfil-trigger', context).forEach(card => {
        card.addEventListener('click', function() {
          const m = document.getElementById('p-modal');

          // BÚSQUEDA SEGURA: Busca la clase nueva, o la vieja.
          const bioElement = this.querySelector('.hidden-bio-content') || this.querySelector('.hidden-bio');

          // Si el elemento existe, saca el texto. Si no, pon un mensaje o déjalo vacío.
          const bioFull = bioElement ? bioElement.innerHTML : '<p>Biografía no disponible.</p>';

          // Inyectar datos (con fallback por si falta algún data-attribute)
          m.querySelector('#m-nombre').innerText = this.dataset.nombre || '';
          m.querySelector('#m-cargo').innerText = this.dataset.cargo || '';
          m.querySelector('#m-img').src = this.dataset.foto || '';
          m.querySelector('#m-bio').innerHTML = bioFull;

          m.classList.add('activo');
        });
      });

    }
  };
})(Drupal, once);

(function (Drupal, once) {
  Drupal.behaviors.mejorarFiltrosFecha = {
    attach: function (context) {
      // Aplicar solo una vez a los formularios expuestos de Vistas
      once('filtrosFechaInit', '.views-exposed-form', context).forEach(form => {

        // Encontrar los inputs de Mínimo y Máximo
        const minInputs = form.querySelectorAll('input[name*="[min]"], input[id*="-min"]');
        const maxInputs = form.querySelectorAll('input[name*="[max]"], input[id*="-max"]');

        // Modificar los "Desde"
        minInputs.forEach(input => {
          input.type = 'date'; // Esto activa el calendario (cuadrito de fecha)
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (label) label.innerText = 'Seleccionar fecha desde';
        });

        // Modificar los "Hasta"
        maxInputs.forEach(input => {
          input.type = 'date'; // Esto activa el calendario
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (label) label.innerText = 'Seleccionar fecha hasta';
        });

        // Permitir filtrar con solo una fecha: completar el campo vacío antes de enviar
        form.addEventListener('submit', function () {
          minInputs.forEach((minInput, i) => {
            const maxInput = maxInputs[i];
            if (!maxInput) return;

            const tieneMin = minInput.value.trim() !== '';
            const tieneMax = maxInput.value.trim() !== '';

            if (tieneMin && !tieneMax) {
              // Solo fecha inicial → mostrar desde esa fecha en adelante
              maxInput.value = '2099-12-31';
            } else if (!tieneMin && tieneMax) {
              // Solo fecha final → mostrar hasta esa fecha
              minInput.value = '2000-01-01';
            }
          });
        });

      });
    }
  };
})(Drupal, once);

(function (Drupal, once) {
  Drupal.behaviors.filtrosProgramas = {
    attach: function (context) {
      once('initFiltros', '.filtros-bar', context).forEach(function () {
        const botones = document.querySelectorAll('.filtro-btn');
        const tarjetas = document.querySelectorAll('.programa-card');
        const grilla = document.querySelector('.programas-grid');

        botones.forEach(boton => {
          boton.addEventListener('click', function() {
            // 1. Gestión de clases activas
            botones.forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');

            const filtro = this.getAttribute('data-filtro');

            // 2. Mostrar/Ocultar tarjetas
            tarjetas.forEach(tarjeta => {
              const categoria = tarjeta.getAttribute('data-categoria');
              const contenedorTarjeta = tarjeta.closest('.views-row') || tarjeta;

              if (filtro === 'todos' || filtro === categoria) {
                // '' limpia el style inline y deja que el CSS tome el control (display: flex)
                contenedorTarjeta.style.display = '';
              } else {
                contenedorTarjeta.style.display = 'none';
              }
            });

            // 3. Subir al principio de la grilla después de filtrar
            if (grilla) {
              const headerOffset = 100;
              const elementPosition = grilla.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          });
        });
      });
    }
  };
})(Drupal, once);

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.iconosEnlacesExternos = {
    attach: function (context) {
      once('agregarIconoExterno', '.site-header a[target="_blank"]', context).forEach(function (link) {

        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13px" height="13px" class="icono-externo" style="margin-left: 6px; vertical-align: baseline; position: relative; top: 1px;">
            <path fill="currentColor" d="M 19.980469 2.9902344 A 1.0001 1.0001 0 0 0 19.869141 3 L 15 3 A 1.0001 1.0001 0 1 0 15 5 L 17.585938 5 L 8.2929688 14.292969 A 1.0001 1.0001 0 1 0 9.7070312 15.707031 L 19 6.4140625 L 19 9 A 1.0001 1.0001 0 1 0 21 9 L 21 4.1269531 A 1.0001 1.0001 0 0 0 19.980469 2.9902344 z M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 13 A 1.0001 1.0001 0 1 0 19 13 L 19 19 L 5 19 L 5 5 L 11 5 A 1.0001 1.0001 0 1 0 11 3 L 5 3 z"/>
          </svg>
        `;

        const svgWrapper = document.createElement("span");
        svgWrapper.classList.add("indicador-enlace-externo");
        svgWrapper.innerHTML = svgContent;

        link.appendChild(svgWrapper);
      });
    }
  };
})(Drupal, once);

// ── Acordeón: variante rendición de cuentas (.rendicion-accordion-btn) ───────
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.rendicionAccordion = {
    attach: function (context) {
      once('rendicionAccordionInit', '.rendicion-accordion-btn', context).forEach(function (btn) {
        btn.addEventListener('click', function () {
          const estaActivo = btn.classList.contains('activo');

          // Colapsar todos los demás
          document.querySelectorAll('.rendicion-accordion-btn.activo').forEach(function (otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.classList.remove('activo');
              const otherContent = otherBtn.nextElementSibling;
              if (otherContent) otherContent.classList.remove('activo');
            }
          });

          // Alternar el actual
          btn.classList.toggle('activo', !estaActivo);
          const content = btn.nextElementSibling;
          if (content) content.classList.toggle('activo', !estaActivo);
        });
      });
    }
  };
})(Drupal, once);

// ── Acordeón: variante participa (.participa-accordion-btn) ──────────────────
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.participaAccordion = {
    attach: function (context) {
      once('participaAccordionInit', '.participa-accordion-btn', context).forEach(function (btn) {
        btn.addEventListener('click', function () {
          const estaActivo = btn.classList.contains('activo');

          // Colapsar todos los demás en la página
          document.querySelectorAll('.participa-accordion-btn.activo').forEach(function (otherBtn) {
            if (otherBtn !== btn) {
              otherBtn.classList.remove('activo');
              const otherContent = otherBtn.nextElementSibling;
              if (otherContent) otherContent.classList.remove('activo');
            }
          });

          btn.classList.toggle('activo', !estaActivo);
          const content = btn.nextElementSibling;
          if (content) content.classList.toggle('activo', !estaActivo);
        });
      });
    }
  };
})(Drupal, once);

// ── Acordeón: variante accordion-trigger / accordion-item.abierto ────────────
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.accordionTrigger = {
    attach: function (context) {
      once('accordionTriggerInit', '.accordion-container', context).forEach(function (container) {
        container.addEventListener('click', function (e) {
          const trigger = e.target.closest('.accordion-trigger');
          if (!trigger) return;

          const item = trigger.closest('.accordion-item');
          if (!item) return;

          // Cerrar los demás ítems del mismo contenedor
          container.querySelectorAll('.accordion-item.abierto').forEach(function (openItem) {
            if (openItem !== item) openItem.classList.remove('abierto');
          });

          item.classList.toggle('abierto');
        });
      });
    }
  };
})(Drupal, once);

// ── Lightbox para galería de eventos (.evento-galeria) ───────────────────────
(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.eventoLightbox = {
    attach: function (context) {
      // Vincular controles al overlay estático (viene del Twig de evento)
      once('lightboxControls', '#evento-lightbox', context).forEach(function (overlay) {
        const btnCerrar = overlay.querySelector('.lightbox-cerrar');

        if (btnCerrar) {
          btnCerrar.addEventListener('click', function () {
            overlay.classList.remove('activo');
          });
        }
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) overlay.classList.remove('activo');
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && overlay.classList.contains('activo')) {
            overlay.classList.remove('activo');
          }
        });
      });

      // Vincular clics en imágenes de galería (compatible con AJAX)
      once('lightboxImgInit', '.evento-galeria img', context).forEach(function (img) {
        img.addEventListener('click', function () {
          const overlay = document.getElementById('evento-lightbox');
          const modalImg = overlay && overlay.querySelector('#lightbox-img-src');
          if (!overlay || !modalImg) return;
          modalImg.src = img.src;
          overlay.classList.add('activo');
        });
      });
    }
  };
})(Drupal, once);

(function (Drupal, once) {
  'use strict';

  Drupal.behaviors.headerSearch = {
    attach: function (context) {
      once('headerSearchInit', '.header-search-toggle', context).forEach(function (toggleBtn) {
        var form = document.getElementById('header-search-form');
        var closeBtn = form && form.querySelector('.header-search-close');
        var input = form && form.querySelector('#header-search-input');

        if (!form) return;

        function openSearch() {
          form.hidden = false;
          toggleBtn.setAttribute('aria-expanded', 'true');
          if (input) input.focus();
        }

        function closeSearch() {
          form.hidden = true;
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.focus();
        }

        toggleBtn.addEventListener('click', function () {
          if (form.hidden) {
            openSearch();
          } else {
            closeSearch();
          }
        });

        if (closeBtn) {
          closeBtn.addEventListener('click', closeSearch);
        }

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && !form.hidden) {
            closeSearch();
          }
        });

        document.addEventListener('click', function (e) {
          if (!form.hidden && !form.contains(e.target) && e.target !== toggleBtn) {
            closeSearch();
          }
        });
      });
    }
  };
})(Drupal, once);
