# rediseno_tenjo

Tema personalizado de **Drupal 11** desarrollado para el portal institucional **tenjoculturayturismo.gov.co** del Instituto Municipal de Cultura y Turismo de Tenjo (IMCTT).

> Repositorio privado. Este documento resume la línea base técnica y operativa del tema, a partir de la documentación técnica oficial (versión 1.0, 20 de julio de 2026).

## Descripción general

El tema `redisenotenjo` provee la presentación visual y los componentes de interacción del portal institucional, incluyendo el encabezado, navegación principal, portada (hero, programas destacados, últimas noticias), listados dinámicos de noticias/eventos, buscador y pie institucional.

## Información técnica

| Campo | Valor |
|---|---|
| CMS | Drupal 11.3.x |
| Nombre visible del tema | Rediseño Tenjo |
| Machine name | `redisenotenjo` |
| Ruta | `themes/custom/redisenotenjo` |
| Tema base declarado | `stable9` (origen y compatibilidad pendientes de validar) |
| Librería global | `redisenotenjo/global-styling` |
| Módulo custom asociado | `tenjosearch` (restringe resultados de búsqueda) |

## Estructura del tema

```
redisenotenjo/
├── redisenotenjo.info.yml
├── redisenotenjo.libraries.yml
├── redisenotenjo.theme
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── docs/
└── templates/        # 146 plantillas Twig reportadas
```

El CSS y JavaScript globales se concentran en un solo archivo cada uno (sin proceso de compilación/minificación por componentes), lo cual simplifica la carga inicial pero incrementa el riesgo de acoplamiento a medida que crece el sitio.

## Regiones del tema

| Machine name | Etiqueta | Uso |
|---|---|---|
| header | Encabezado | Cabecera institucional |
| primary_menu | Menú Principal | Navegación principal |
| hero_slider | Hero Slider Home | Portada (`page--front.html.twig`) |
| programas_destacados | Programas Destacados Home | Bloque de programas en portada |
| content | Contenido Principal | Salida principal |
| footer | Pie de página | Información y enlaces institucionales |

La sección "Últimas Noticias" de la portada no usa una región: se alimenta mediante la variable `ultimas_noticias` inyectada vía preprocess.

## Plantillas Twig

Se siguen las convenciones estándar de Drupal para sobrescritura de plantillas (`node--[nid]`, `node--[bundle]`, `node--[bundle]--[viewmode]`, `views-view--[machine_name]`, etc.). El nombre de una plantilla de Views debe coincidir con el machine name configurado en Drupal, no con el alias de URL.

Varias páginas normativas/institucionales (p. ej. Transparencia y Acceso a la Información) se implementaron como plantillas completas asociadas a IDs de nodo específicos, lo que limita la edición editorial directa desde Drupal.

## Lógica PHP y JavaScript

- `redisenotenjo.theme` implementa un `hook_preprocess_page` que carga la vista de noticias (display `block_ultimas_noticias`) y expone el resultado como `ultimas_noticias`.
- Los *behaviors* de JavaScript (menú móvil, acordeones, header con scroll, sliders, modales, lightbox, filtros, buscador colapsable, etc.) usan `core/once` para evitar reinicializaciones con AJAX/BigPipe.
- El portal cuenta con **dos buscadores diferenciados**: la barra de búsqueda de la topbar y el control colapsable dentro del header (`header-search-toggle`).

## Búsqueda (módulo `tenjosearch`)

El módulo custom `tenjosearch` implementa `hook_query_search_node_alter` para restringir la búsqueda a los tipos `documento_institucional`, `article` y `evento`. Los resultados de tipo documento enlazan directamente al archivo adjunto en una pestaña nueva.

## Buenas prácticas para el desarrollo del tema

- Mantener la lógica de negocio fuera de Twig (usar configuración, preprocess o módulos).
- Conservar el escape automático; usar `|raw` solo con justificación y revisión de seguridad.
- No incorporar contenido institucional administrable directamente en plantillas nuevas.
- Documentar propósito, hook, entidad, vista, display, variables y dependencias de cada override.
- Garantizar jerarquía de encabezados, textos alternativos, labels, foco visible y navegación por teclado.

## Gestión de dependencias

Se recomienda administrar core, módulos, temas y librerías mediante Composer (`composer.json` / `composer.lock`), evitando instalaciones manuales (ZIP) sin trazabilidad. Antes de actualizar el core debe confirmarse el paquete, versión y procedencia del tema base `stable9`.

## Flujo de despliegue (resumen)

1. Registrar el cambio (motivación, impacto, riesgo, criterio de aceptación).
2. Desarrollar en rama/local o entorno de desarrollo, sin datos sensibles de producción.
3. Exportar configuración (`drush cex`) cuando cambien Views, campos, permisos o menús.
4. Revisión de código y pruebas funcionales, responsive, accesibilidad y seguridad.
5. Backup completo antes del cambio.
6. Despliegue mediante `composer install` desde el lock (no `composer update` en producción).
7. Ejecutar en orden controlado: `drush updb`, `drush cim`, `drush cr`.
8. Smoke test, revisión de logs y monitoreo.

## Riesgos y pendientes conocidos

- Formalizar repositorio Git con rama productiva protegida.
- Migrar módulos contribuidos fuera de Composer (incluye un ZIP manual detectado).
- Confirmar parche exacto de Drupal instalado y ejecutar `composer audit`.
- Validar origen y compatibilidad del tema base `stable9` con Drupal 11.
- Completar inventario de infraestructura, backups y prueba de restauración.
- Reconciliar el conteo de plantillas estáticas por nodo (17 registradas vs. 23 IDs nominales).
- Reducir gradualmente el contenido institucional embebido en Twig, migrándolo a campos/bloques administrables.

## Licencia y uso

Repositorio de uso interno del IMCTT. Distribución y acceso restringidos (repositorio privado).
