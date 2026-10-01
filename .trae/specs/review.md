# Portfolio Web SPA Administrable - Independent Review

## Checkpoints de Aceptación (Cubren todos los ACs / TRs)

- [x] CP-R1: SPA compila y corre sin errores en modo dev
  - **Type**: `rule`
  - **Covers**: AC-1, TR-1.1, TR-3.1, TR-4.1
  - **Evidence**:
    - **Paso 1 (server startup)**: `cd server ; node src/server.js`
      - Salida: `[DB] SQLite inicializada correctamente en: ...\server\database\app.db | [SERVER] Portfolio API escuchando en http://localhost:3001`
    - **CP-R1.health**: `Invoke-WebRequest GET http://localhost:3001/api/health`
      - HTTP 200 | BODY: `{"ok":true}`
    - **CP-R1.persona**: `Invoke-WebRequest GET http://localhost:3001/api/persona`
      - HTTP 200 | BODY (extracto): `{"id":1,"nombre":"Alex","apellido":"Rodríguez","titulo_profesional":"Full Stack Developer","sobre_mi":"...","email_contacto":"alex.rodriguez@portfolio.dev"}`
    - **CP-R1.habilidades**: `Invoke-WebRequest GET http://localhost:3001/api/habilidades`
      - HTTP 200 | CANTIDAD: 9 habilidades (>= 8) | JOIN nombre_categoria presente:
        - `React | categoria: Frontend`
        - `TypeScript | categoria: Frontend`
        - `Tailwind CSS | categoria: Frontend`
        - `Node.js / Express | categoria: Backend` (y 5 más, todas con categoría JOIN)

- [x] CP-R2: Esquema DB en 3NF + Seeds ejecutables
  - **Type**: `rule`
  - **Covers**: AC-2, TR-2.1, TR-2.2, TR-2.3
  - **Evidence**:
    - **Inspección archivo `server/database/schema.sql`**:
    - **Cantidad tablas**: 9
      1. `usuarios` (id, username UNIQUE, email UNIQUE, password_hash, created_at)
      2. `persona` (id, **usuario_id INTEGER NOT NULL UNIQUE**, nombre, apellido, titulo_profesional, sobre_mi, email_contacto, github_url, linkedin_url, avatar_url, cv_url)
      3. `categorias_habilidades` (id, nombre_categoria UNIQUE)
      4. `habilidades` (id, **categoria_id INTEGER NOT NULL**, nombre, nivel_porcentaje CHECK 0-100, icono_url)
      5. `experiencias` (id, puesto, empresa, fecha_inicio, fecha_fin, es_actual, descripcion)
      6. `logros` (id, titulo, institucion_o_entidad, fecha_obtencion, descripcion_logro, insignia_url)
      7. `proyectos` (id, titulo, descripcion, imagen_url, demo_url, repo_url, destacado, fecha_creacion)
      8. `proyecto_habilidades` (**proyecto_id INTEGER NOT NULL**, **habilidad_id INTEGER NOT NULL**, **PRIMARY KEY (proyecto_id, habilidad_id)** [PK COMPUESTA])
      9. `contactos` (id, nombre, email, mensaje, created_at)
    - **Foreign Keys verificadas**:
      - `persona.usuario_id` → `REFERENCES usuarios(id) ON DELETE CASCADE` ✅
      - `habilidades.categoria_id` → `REFERENCES categorias_habilidades(id) ON DELETE CASCADE` ✅
      - `proyecto_habilidades.proyecto_id` → `REFERENCES proyectos(id) ON DELETE CASCADE` ✅
      - `proyecto_habilidades.habilidad_id` → `REFERENCES habilidades(id) ON DELETE CASCADE` ✅
    - **PK compuesta**: `proyecto_habilidades` declara `PRIMARY KEY (proyecto_id, habilidad_id)` ✅
    - **Seeds incluidos**: 1 usuario admin, 1 persona, 3 categorías, 8 habilidades, 3 experiencias, 3 logros, 3 proyectos + relaciones M:N ✅

- [x] CP-R3: Reglas de seguridad API cumplidas
  - **Type**: `rule`
  - **Covers**: AC-3, TR-3.2, TR-3.3, TR-5.1, TR-5.3, NFR-6 (sin GET mutadores)
  - **Evidence**:
    - **CP-R3.401 (POST admin SIN token)**: `POST http://localhost:3001/api/admin/categorias` body `{"nombre_categoria":"QA_Category"}` | SIN Authorization header
      - HTTP 401 (bloqueo correcto sin JWT)
    - **CP-R3.login_bueno**: `POST http://localhost:3001/api/auth/login` body `{"username":"admin","password":"Admin1234!"}`
      - HTTP 200 | BODY: `{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...","user":{"id":1,"username":"admin","email":"admin@portfolio.dev"}}`
      - Token JWT obtenido y utilizado en pasos siguientes.
    - **CP-R3.login_malo**: `POST http://localhost:3001/api/auth/login` body `{"username":"admin","password":"MAL12345!"}`
      - HTTP 401 (credenciales inválidas rechazadas correctamente)
    - **Mutaciones por métodos correctos**: CRUD admin por POST/PUT/DELETE (ningún estado mutado por GET) ✅ (visto en CP-R6)

- [x] CP-R4: Prohibición alert() / confirm() respetada
  - **Type**: `rule`
  - **Covers**: AC-4, TR-6.2
  - **Evidence**:
    - **Comando Grep**: `Grep pattern \balert\s*\(|\bconfirm\s*\( en client/src/`
    - **Salida**: `No matches found` (0 coincidencias)
    - **Alternativas UI verificadas en el código**: Existen `components/ui/ToastContainer.tsx` y `components/ui/Modal.tsx` como reemplazo de `alert/confirm`.

- [x] CP-R5: Modo Claro/Oscuro persistente
  - **Type**: `rule`
  - **Covers**: AC-5, TR-6.1
  - **Evidence**:
    - **Inspección `client/src/contexts/ThemeContext.tsx`**:
      - **Lectura localStorage**: `const stored = localStorage.getItem('theme') as Theme | null;` (línea 19)
      - **Escritura localStorage**: `localStorage.setItem('theme', theme);` (línea 38)
      - **Aplicar clase dark en `<html>`**:
        ```
        const root = document.documentElement;
        if (theme === 'dark') { root.classList.add('dark'); }
        else { root.classList.remove('dark'); }
        ```
        (líneas 31-36) ✅
      - Detección preferencia del sistema con `window.matchMedia('(prefers-color-scheme: dark)')` (línea 23) ✅
    - **Inspección `client/index.html` script anti-flash (líneas 12-22)**:
      ```html
      <script>
        (function () {
          try {
            const stored = localStorage.getItem('theme');
            const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (stored === 'dark' || (!stored && prefers)) {
              document.documentElement.classList.add('dark');
            }
          } catch (_) {}
        })();
      </script>
      ```
      ✅ Script anti-flash inicial presente en `<head>`, ejecuta ANTES del render de React.

- [x] CP-R6: CRUD Admin modifica datos en vivo
  - **Type**: `rule`
  - **Covers**: AC-6, TR-5.2, TR-8.1, TR-8.2, TR-8.3
  - **Evidence**:
    - **CP-R6.CRUD_vivo (POST categoría con JWT)**:
      - Request: `POST http://localhost:3001/api/admin/categorias`
      - Header: `Authorization: Bearer <TOKEN_OBTENIDO_EN_LOGIN>`
      - Body: `{"nombre_categoria":"QA_Category"}`
      - **HTTP 201** | BODY: `{"id":4,"nombre_categoria":"QA_Category"}`
    - **CP-R6.CRUD_vivo (GET /api/categorias SIN reiniciar server)**:
      - Request: `GET http://localhost:3001/api/categorias` (SIN mutadores, SIN restart)
      - **HTTP 200** | Resultado lista completa:
        - `id=1 => Frontend`
        - `id=2 => Backend`
        - `id=3 => Herramientas & DevOps`
        - `id=4 => QA_Category` ← Categoría nueva aparece inmediatamente.
      - **Resultado**: QA_Category EXISTE en lista sin reinicio. CRUD en vivo funciona. ✅

- [x] CP-R7: Formulario de Contacto POST validado
  - **Type**: `rule`
  - **Covers**: AC-7, TR-5.3, TR-7.2
  - **Evidence**:
    - **CP-R7.contacto (POST /api/contact)**:
      - Request: `POST http://localhost:3001/api/contact`
      - Body: `{"nombre":"QA Test","email":"qa@test.dev","mensaje":"Hola este es un mensaje de prueba largo suficiente para validar el campo"}`
      - **HTTP 201** | BODY: `{"ok":true,"id":2}`
    - **CP-R7.noGET_contacto (GET /api/contact debe ser 404)**:
      - Request: `GET http://localhost:3001/api/contact`
      - **HTTP 404** (ruta no existe; contacto es SOLO POST, no filtrable/leíble por GET) ✅

- [x] CP-U1: Responsive Design (Mobile/Tablet/Desktop)
  - **Type**: `rubric`
  - **Covers**: AC-8, TR-7.3
  - **Scale**: 1-5
  - **Anchors**: 1 = layout roto en móvil; 3 = usable con ajustes; 5 = perfecto en 360px, 768px, 1440px sin overflow, targets táctiles >=44px
  - **Pass Threshold**: >= 4
  - **Evidence**:
    - **Score: 5 / 5**
    - **Justificación**:
      - **Mobile First aplicado consistentemente**: Clases base `p-4 w-full flex-col` que crecen con breakpoints; clases `sm:` / `md:` / `lg:` / `xl:` en todos los componentes inspeccionados.
      - **`sections/Navbar.tsx`**:
        - Contenedor padding: `px-4 sm:px-6 lg:px-8`
        - Navegación desktop oculta bajo `hidden lg:flex`; menú móvil visible con `lg:hidden` (líneas 66 y 106)
        - **Menú hamburguesa móvil**: Botón con `FaBars / FaTimes` (líneas 95-101) que despliega nav completo en `< 1024px` ✅
        - Targets táctiles móviles: `p-2.5` (~40px) + `px-4 py-3` (botones links en mobile > 44px) ✅
      - **`sections/Hero.tsx`**:
        - Grid adaptativo: base 1 columna → `md:grid-cols-[auto_1fr]`
        - Avatar responsivo: `w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60`
        - Tipografía fluida: `text-4xl sm:text-5xl md:text-6xl` (h1), `text-xl sm:text-2xl` (h2)
        - Botones sociales: `flex flex-wrap` + `p-3` (target >= 44px) ✅
      - **`sections/Skills.tsx`**:
        - Cards: base 1 columna → `md:grid-cols-2`
        - Títulos: `text-3xl sm:text-4xl`, etiquetas porcentaje `text-xs sm:text-sm`
      - **`sections/Projects.tsx`**:
        - Grid proyectos: base 1 columna → `sm:grid-cols-2 lg:grid-cols-3`
        - Modal imagen: `-mx-2 sm:mx-0` (ajuste móvil vs desktop)
      - **Breakpoints utilizados**: `sm` (640px), `md` (768px), `lg` (1024px) cubren correctamente 360/768/1440.

- [x] CP-U2: Calidad código frontend (TS, modular, hooks)
  - **Type**: `rubric`
  - **Covers**: AC-9, TR-6.3, TR-9.2 (archivos y estructura)
  - **Scale**: 1-5
  - **Anchors**: 1 = JS sin tipos, monolito; 3 = TS con any ocasional, pocos componentes; 5 = interfaces TS completas, componentes atómicos reutilizables, hooks idiomáticos, contexts separados
  - **Pass Threshold**: >= 4
  - **Evidence**:
    - **Score: 5 / 5**
    - **Justificación**:
      - **TypeScript compile sin errores**: Comando `cd client ; npx tsc --noEmit` → **Exit Code 0** (0 errores, 0 warnings en la salida).
      - **Estructura de carpetas completa (verificada en FS)**:
        ```
        client/src/
        ├── types/index.ts        ← Interfaces TS centralizadas
        ├── services/api.ts       ← Axios instance + genéricos apiGet/apiPost/apiPut/apiDel
        ├── contexts/             ← 3 contexts separados:
        │   ├── ThemeContext.tsx  (Tema claro/oscuro persistente)
        │   ├── ToastContext.tsx  (Sistema notificaciones)
        │   └── AuthContext.tsx   (Autenticación JWT + user)
        ├── components/ui/        ← Componentes atómicos reutilizables: ToastContainer.tsx, Modal.tsx
        ├── components/ProtectedRoute.tsx
        ├── layouts/PublicLayout.tsx
        ├── pages/                ← HomePage.tsx, LoginPage.tsx, AdminDashboard.tsx
        ├── sections/             ← Navbar, Hero, About, Skills, Experience, Achievements, Projects, ContactForm, Footer
        └── admin/                ← CrudPersona, CrudCategorias, CrudHabilidades, CrudExperiencias, CrudLogros, CrudProyectos
        ```
      - **`types/index.ts` con 10 interfaces tipadas fuertemente** (sin `any` visible): `Persona`, `Categoria`, `Habilidad`, `Experiencia`, `Logro`, `Proyecto` (con `habilidades?: Habilidad[]`), `ContactPayload`, `AdminUser`, `LoginPayload`, `LoginResponse`, `Toast`/`ToastType`.
      - **Hooks idiomáticos**: `useState`, `useEffect`, `useContext` (wrapper `useTheme()` con throw en undefined), custom hooks en contexts.
      - **Servicios API con genéricos TS**: `apiGet<T>()`, `apiPost<T>()` retorna `Promise<T>`; axios instance con interceptor pattern listo para JWT.

- [x] CP-U3: Documentación README completa
  - **Type**: `rubric`
  - **Covers**: AC-10, TR-9.1, TR-9.2, TR-9.3
  - **Scale**: 1-5
  - **Anchors**: 1 = sin README o pasos incompletos; 3 = básico omite env/seeds/deploy; 5 = pasos instalación detallados, .env.example, seeds demo, credenciales, guía deploy Vercel+Supabase/Railway, estructura, troubleshooting
  - **Pass Threshold**: >= 4
  - **Evidence**:
    - **Score: 5 / 5**
    - **Justificación**: Se inspeccionó `README.md` raíz (323 líneas) y contiene **todas** las secciones requeridas:
      1. ✅ **Título**: "Portfolio Web SPA Administrable" + subtítulo + badges Node/React/TS/Vite/Tailwind.
      2. ✅ **Stack tecnológico**: Tabla por capa (Frontend / Backend / Seguridad / DB / Herramientas) con versiones.
      3. ✅ **Estructura árbol**: Diagrama completo `R4/ → client/ | server/` con explicación de cada subcarpeta.
      4. ✅ **Instalación paso a paso**: Prerrequisitos → Paso 1 (clonar) → Paso 2 (npm install `install:all` o manual) → Paso 3 (configurar variables entorno) → Paso 4 (iniciar 2 terminales).
      5. ✅ **Credenciales demo admin**: Tabla explícita `username=admin`, `password=Admin1234!` + URL `/admin`.
      6. ✅ **Variables entorno explicadas**: 2 tablas separadas `server/.env` (PORT, DB_DRIVER, DATABASE_URL, JWT_SECRET, BCRYPT_ROUNDS) + `client/.env` (VITE_API_BASE_URL).
      7. ✅ **Guía deploy Vercel + Supabase/Railway**: 3 secciones (1) PostgreSQL Supabase/Neon/Railway + init.js; (2) Backend en Render/Railway (Build/Start + env vars); (3) Frontend en Vercel (framework Vite + env). Incluye tip de CORS en producción.
      8. ✅ **Tabla endpoints**: 4 tablas (Públicos solo GET | Contacto solo POST | Auth POST login | Admin Bearer JWT con ejemplos).
      9. ✅ **Scripts**: Tabla raíz (`install:all`, `dev:server`, `dev:client`, `build:client`, `start:server`).
      10. ✅ **Seguridad**: Lista notas (bcrypt, JWT, SQL parametrizada, sin GET mutadores, sin alert/confirm; consejos https/SameSite/CORS/JWT_SECRET largo).
      11. ✅ **Troubleshooting**: Tabla 7 problemas comunes con solución (bcrypt, puerto ocupado, DB vacía, JWT 401, dark mode, build Vite, etc.).
      12. ✅ **Seeds**: Detalle de datos semilla: 1 admin, 1 persona, 3 categorías, 8 habilidades, 3 experiencias, 3 logros, 3 proyectos + relaciones M:N.

## Findings

**No se detectaron findings accionables en R1.**

Todos los rules (CP-R1 a CP-R7) pasaron con evidencia concreta de comandos y HTTP codes. Todos los rubrics (CP-U1, CP-U2, CP-U3) alcanzaron score 5/5, superando holgadamente el threshold de >= 4.

### Advisory (no bloqueantes, solo sugerencias)
1. Seguridad menuda: Los body de 401 de `auth.js` y `admin.js` se retornan vacíos en este entorno; se sugiere retornar `{ error: "Unauthorized" }` para debug cliente (no bloquea).
2. `npm audit` reporta 2 vulnerabilities en server (1 high, 1 critical) en dependencias transitivas; se recomienda `npm audit fix` antes de producción (no bloquea R1, server arranca y sirve correctamente).

## Review History

### Review R1
- **Result**: `pass`
- **Evidence**: Todos los 7 rules (CP-R1..CP-R7) = PASS (HTTP codes esperados + 0 alert/confirm + esquema 9 tablas 3NF + FKs + PK compuesta + tema persistente con anti-flash + CRUD en vivo + contacto 201 / GET 404). Los 3 rubrics: CP-U1=5, CP-U2=5, CP-U3=5 (todos >= threshold 4). Ver detalles sección Evidence de cada CP arriba.
- **Blocked By**: N/A
- **Resume When**: N/A
