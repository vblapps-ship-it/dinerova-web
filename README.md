# Dinerova — landing page

Sitio estático de una sola página (HTML/CSS puro, sin frameworks ni build
step) para la landing de Dinerova, más la página de política de privacidad
que se usará en Google Play Console.

## Por qué un repositorio separado del proyecto Flutter

Este sitio vive en su propio directorio/repositorio (`dinerova-web`), no
dentro de `dinerova` (el repo de la app), por dos razones:

1. **GitHub Pages solo permite servir desde la raíz o desde `/docs` de una
   rama** cuando se usa el modo "Deploy from a branch" (el más simple, sin
   GitHub Actions). Un repo dedicado permite servir directamente desde la
   raíz de `main`, sin mover carpetas ni añadir un workflow de Actions.
2. Son cosas de naturaleza distinta: el repo de la app es código fuente de
   desarrollo (con historial de features, tests, builds); este es contenido
   público de marketing/legal que cualquiera debe poder ver sin contexto
   del proyecto Flutter. Mantenerlos separados evita mezclar ambos
   historiales y ambas audiencias.

## Archivos

- `index.html` — página principal (propuesta de valor, argumentos de
  venta, capturas de pantalla, precio, botón de descarga).
- `privacidad.html` — política de privacidad (misma URL a usar en Google
  Play Console), generada a partir de
  `dinerova/assets/legal/privacy_policy.md`.
- `styles.css` — estilos compartidos por ambas páginas. Los colores y
  radios están copiados manualmente de
  `dinerova/lib/core/theme/app_theme.dart` (paleta cálida, acento
  terracota `#D9793F` claro / `#E48E58` oscuro, tipografía Inter vía
  Google Fonts). El logo es una réplica en SVG del monograma de
  `dinerova/lib/core/branding/dinerova_monogram.dart`.
- `app.js` — JS vanilla (sin librerías) para la cabecera sticky con
  glassmorphism y las animaciones de aparición al hacer scroll
  (Intersection Observer). Solo se usa en `index.html`.
- `img/` — carpeta vacía donde van las capturas de pantalla reales (ver
  más abajo).

## Pendiente de completar (marcado con `TODO` en el HTML)

1. **Captura de pantalla del hero**: en `index.html`, dentro de
   `.phone-mockup > .phone-screen`, el `<div class="screenshot-placeholder">`
   debe sustituirse por la captura real de la pantalla de inicio, ej.:

   ```html
   <img src="img/screenshot-home.png" alt="Pantalla de inicio de Dinerova">
   ```

   Coloca el fichero dentro de `img/`. Recomendado: captura vertical de
   móvil recortada 1:1 con la pantalla real (el marco/muesca ya los pone
   el mockup CSS, no hace falta que la imagen los incluya).

2. **Enlace real de Google Play**: los botones de la cabecera, el hero y
   la tarjeta de precio solo hacen scroll hasta la sección final
   (`#descarga`) a propósito. El único enlace que debe apuntar a Google
   Play es el botón de esa sección final, que hoy tiene `href="#"`.
   Sustitúyelo por la URL real de la ficha en Play Store cuando la
   tengas, ej.:

   ```html
   <a href="https://play.google.com/store/apps/details?id=com.tuempresa.dinerova" class="btn btn-primary">Descargar en Google Play</a>
   ```

## Cómo publicarlo con GitHub Pages (gratis)

1. Crea un repositorio nuevo en GitHub (por ejemplo `dinerova-web`),
   público (GitHub Pages gratuito requiere que el repo sea público, salvo
   que tengas GitHub Pro/Team/Enterprise).
2. Desde esta carpeta (`C:\dev\dinerova-web`), en una terminal:

   ```bash
   git init
   git add .
   git commit -m "Landing page de Dinerova"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/dinerova-web.git
   git push -u origin main
   ```

3. En GitHub, entra al repo → **Settings** → **Pages** (menú lateral).
4. En "Build and deployment" → "Source", elige **Deploy from a branch**.
5. En "Branch", selecciona `main` y la carpeta `/ (root)` → **Save**.
6. Espera 1-2 minutos. GitHub mostrará la URL pública arriba, con el
   formato:

   ```
   https://TU-USUARIO.github.io/dinerova-web/
   ```

7. La política de privacidad quedará en:

   ```
   https://TU-USUARIO.github.io/dinerova-web/privacidad.html
   ```

   Esa es la URL que debes pegar en Google Play Console → Presencia en
   Play Store → Política de privacidad.

Cada vez que hagas `git push` a `main` con cambios (por ejemplo, tras
añadir las capturas de pantalla reales o el enlace de Play Store), GitHub
Pages actualiza el sitio automáticamente en 1-2 minutos.

### Alternativa: dominio propio

Si más adelante compras un dominio (ej. `dinerova.app`), puedes apuntarlo
a este mismo GitHub Pages añadiendo un archivo `CNAME` con el dominio y
configurando un registro DNS — pero no es necesario para empezar.
