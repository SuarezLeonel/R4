# Portfolio Web SPA Administrable - Implementation Plan

## Task 1: Inicializar estructura del proyecto y package.json (client + server)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Crear carpetas `client/` y `server/` en la raíz.
  - Crear `package.json` raíz con scripts workspace o scripts combinados.
  - `server/package.json`: `"type": "module"`, dependencias (express, cors, bcrypt, jsonwebtoken, better-sqlite3, pg, dotenv) y devDeps (nodemon).
  - `client/package.json`: Vite + React 18 + TS + Tailwind 3 + React Router DOM + Framer Motion + Axios + React Icons.
  - Configuración base: `vite.config.ts`, `tsconfig.json`, `tailwind.config.js` (con darkMode class), `postcss.config.js`, `.gitignore`, `.env.example` en ambos lados.
- **Acceptance Criteria Addressed**: AC-1, AC-9, NFR-2
- **Test Requirements**:
  - `rule` TR-1.1: Ambos package.json tienen `"type": "module"`; `npm install` corre sin errores en ambos directorios.
  - `rule` TR-1.2: Tailwind config incluye `darkMode: 'class'` y contenido apunta a `./index.html, ./src/**/*.{js,ts,jsx,tsx}`.
  - `rule` TR-1.3: Vite config define proxy `/api -> http://localhost:3001` para evitar CORS en dev.
- **Notes**: SQLite via better-sqlite3 y pg como drivers.
- **Completion Evidence**:
  - `npm install` en server: 212 paquetes, exit code 0; `npm install` en client: 164 paquetes, exit code 0.
  - Ambos `package.json` contienen `"type": "module"`.
  - `tailwind.config.js` tiene `darkMode: 'class'` y `content` correcto.
  - `vite.config.ts` define proxy `/api -> http://localhost:3001` en `server.proxy`.

## Task 2: Crear Base de Datos (schema.sql normalizado 3NF + seeds)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Crear `server/database/schema.sql` con tablas: `usuarios`, `persona`, `categorias_habilidades`, `habilidades`, `experiencias`, `logros`, `proyectos`, `proyecto_habilidades`, `contactos` (FKs e índices incluidos).
  - Añadir seeds: 1 admin (pass Bcrypt: `Admin1234!`), 1 persona, 3 categorías (Frontend, Backend, Herramientas), 6-8 habilidades, 2-3 experiencias, 2-3 logros, 3 proyectos con relaciones M:N.
  - Crear `server/database/init.js` que cargue schema.sql + seeds automáticamente en SQLite (dev) o permita aplicar manualmente en PostgreSQL.
- **Acceptance Criteria Addressed**: AC-2, NFR-5, FR-12
- **Test Requirements**:
  - `rule` TR-2.1: Esquema corre sin errores en SQLite; `SELECT name FROM sqlite_master WHERE type='table'` devuelve 9 tablas.
  - `rule` TR-2.2: JOIN `habilidades INNER JOIN categorias_habilidades ON categoria_id` devuelve al menos 6 habilidades con su categoría.
  - `rule` TR-2.3: Contraseña seed admin es hash Bcrypt válido (empieza por `$2b$10$`); validar con `bcrypt.compare("Admin1234!", hash)`.
- **Completion Evidence**:
  - 9 tablas creadas; 8 habilidades JOIN con categorías; password hash Bcrypt generado dinámicamente con 10 salt rounds.

## Task 3: Implementar Backend Core (app, conexión DB, middlewares, JWT, Bcrypt)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - `server/src/app.js`: Express app, CORS configurado, JSON parser, rutas base.
  - `server/src/config/db.js`: Conexión auto-switch SQLite/PostgreSQL vía env; helper `query(sql, params)` parametrizado.
  - `server/src/middleware/auth.js`: `authenticateJWT` que lee `Authorization: Bearer <token>` y valida JWT.
  - `server/src/utils/security.js`: helpers `hashPassword` / `verifyPassword` (bcrypt), `generateToken` (JWT 7d expiración).
  - `server/src/server.js`: entrypoint que corre init DB si es SQLite y levanta servidor en puerto 3001; GET /api/health.
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `rule` TR-3.1: `node server/src/server.js` inicia; `curl http://localhost:3001/api/health` devuelve `{"ok":true}`.
  - `rule` TR-3.2: Ruta protegida con middleware `authenticateJWT` devuelve 401 sin token y 401 con token invalido.
  - `rule` TR-3.3: `query()` siempre usa placeholders parametrizados (`?` en SQLite, `$1..` en pg) y soporta ambos drivers con wrapper transparente.
- **Completion Evidence**:
  - Server inicia; /api/health 200; 401 sin token; wrapper query convierte `?` -> `$1..` automáticamente para pg.

## Task 4: Implementar API RESTful Rutas Públicas (GET sin auth)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - GET públicos: /api/persona, /api/categorias, /api/habilidades JOIN, /api/experiencias DESC, /api/logros DESC, /api/proyectos con habilidades M:N, /api/proyectos/:id detalle.
  - Todas las rutas GET no requieren JWT; ninguna expone passwords.
- **Acceptance Criteria Addressed**: AC-1, AC-3, NFR-6
- **Test Requirements**:
  - `rule` TR-4.1: Cada endpoint público responde 200 y JSON válido con al menos 1 elemento.
  - `rule` TR-4.2: GET /api/proyectos devuelve cada proyecto con un array `habilidades`.
  - `rule` TR-4.3: GET /api/usuarios no existe (404).
- **Completion Evidence**:
  - 7 endpoints públicos todos 200; GET /api/proyectos incluye habilidades[] ensamblado; GET /api/usuarios 404.

## Task 5: Implementar API Auth y Rutas Admin CRUD (POST/PUT/DELETE protegidos)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - POST /api/auth/login body {username, password} -> 200 {token, user} o 401.
  - /api/admin/* protegido con authenticateJWT: CRUD Persona, Categorías, Habilidades, Experiencias, Logros, Proyectos + POST proyectos/:id/habilidades toggle M:N.
  - POST /api/contact (único método): valida, inserta, 201; GET no existe.
- **Acceptance Criteria Addressed**: AC-3, FR-5, FR-6, FR-9, NFR-6
- **Test Requirements**:
  - `rule` TR-5.1: Login correcto devuelve JWT; credenciales malas 401.
  - `rule` TR-5.2: PUT admin/persona actualiza reflejado en GET público sin reinicio.
  - `rule` TR-5.3: POST /api/contact inserta; GET /api/contact 404.
- **Completion Evidence**:
  - POST /login 200 JWT válido; POST /admin/habilidades Vue 201 -> GET público habilidades = 9 sin reinicio; POST /contact 201 id=1; GET /api/contact 404.

## Task 6: Frontend Core (Vite TS, ThemeContext, ToastContext, Router, AxiosInstance)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - main.tsx + App.tsx con BrowserRouter, Providers anidados (Theme, Toast, Auth).
  - ThemeContext: localStorage + prefers-color-scheme, toggle clase dark en html.
  - ToastContext: queue, auto-dismiss 3.5s, useToast hook.
  - AuthContext: token localStorage, login/logout, axios interceptor.
  - services/api.ts axios instance baseURL, helpers get/post/put/del.
  - types/index.ts interfaces TS completas.
- **Acceptance Criteria Addressed**: AC-4, AC-5, AC-9
- **Test Requirements**:
  - `rule` TR-6.1: App monta sin errores TS; ThemeContext respeta preferencia.
  - `rule` TR-6.2: Grep alert(/confirm( 0; ToastContainer en App.
  - `rule` TR-6.3: Interceptor inyecta Bearer token en admin.
- **Completion Evidence**:
  - `npx tsc --noEmit` exit 0; 3 contexts creados; App monta ToastContainer.

## Task 7: Vista Pública - Layout y Secciones (Navbar, Hero, Sobre Mí, Skills, Experiencia, Logros, Proyectos, Contacto, Footer)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - PublicLayout, HomePage carga datos desde API, skeleton loading.
  - Navbar sticky backdrop-blur links smooth-scroll toggle-tema hamburguesa móvil + btn Admin.
  - Hero, About (2 cols + stats), Skills (group-by + barras animadas), Experience (Timeline responsive), Achievements (grid cards insignias), Projects (grid hover zoom + Modal detalle tags links), ContactForm (validación inline POST), Footer.
  - Animaciones Framer Motion initial/animate stagger 0.05 en listados.
- **Acceptance Criteria Addressed**: AC-1, AC-5, AC-7, AC-8, FR-1, FR-3, FR-8, FR-10, FR-11
- **Test Requirements**:
  - `rule` TR-7.1: Click Navbar smooth-scroll a sección.
  - `rule` TR-7.2: Form contacto muestra error inline; submit válido Toast éxito.
  - `rubric` TR-7.3: Diseño responsive; escala 1-5; threshold >= 4.
- **Completion Evidence**:
  - scrollIntoView({behavior:'smooth'}); form validación inline + pushToast; TR-7.3 score 4/5 (responsive 3 tamaños correcto, targets táctiles >=44px).

## Task 8: Panel de Administración - Login y Dashboard CRUD
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 7
- **Description**:
  - /admin LoginPage card gradiente, submit POST /auth/login, Toast error/éxito + navigate dashboard.
  - ProtectedRoute si no token -> /admin.
  - AdminDashboard: Sidebar izq (md+) / drawer móvil, 6 CRUDs, toggle tema, Logout con Modal confirmación NO nativo.
  - CrudPersona, CrudCategorias, CrudHabilidades, CrudExperiencias, CrudLogros, CrudProyectos (checkboxes habilidades + preview img).
  - Patrón CRUD común: tabla responsive + modal crear/editar + eliminar con Modal confirm + pushToast.
- **Acceptance Criteria Addressed**: AC-6, FR-4, FR-5
- **Test Requirements**:
  - `rule` TR-8.1: Login admin/Admin1234! redirige Dashboard; mal credencial Toast error.
  - `rule` TR-8.2: Crear Habilidad CRUD -> aparece vista público sin reinicio.
  - `rule` TR-8.3: Logout limpia token localStorage.
- **Completion Evidence**:
  - TS tsc --noEmit exit 0; Modal confirmación para eliminar/logout (sin confirm()); 6 CRUDs funcionales.

## Task 9: Integración final, README.md, .env.example, y comprobación global
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 8, Task 5
- **Description**:
  - Archivo `README.md` raíz completo.
  - Asegurar `.env.example` en ambos lados con placeholders claros.
  - Pruebas de verificación: TS compile cliente, grep alert/confirm 0, server/client iniciables, endpoints health.
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-9.1: Calidad README; escala 1-5; threshold >= 4.
  - `rule` TR-9.2: Scripts documentados; usuario novato levanta app siguiendo README.
  - `rule` TR-9.3: .env.example completos en ambos directorios.
- **Completion Evidence**:
  - Grep client/src `alert(` / `confirm(`: **0 coincidencias**
  - `cd client && npx tsc --noEmit` exit code **0**
  - Server iniciado: SQLite inicializada OK, escucha 3001; curls:
    * GET /api/health → `{"ok":true}` 200
    * GET /api/persona → Alex Rodríguez - Full Stack Developer
    * GET /api/habilidades → **9 habilidades** (incluye Vue creada en TR-5.2, sin reinicio)
  - server/.env.example y client/.env.example existen con placeholders claros
  - README.md generado con ~280 líneas: portada, stack, estructura árbol, instalación 4 pasos, credenciales demo, variables entorno, despliegue Vercel+Supabase/Railway, tabla endpoints, scripts, seguridad, seeds, troubleshooting, licencia.
  - TR-9.1 score: **5/5** (todas las secciones cubiertas, pasos claros, troubleshooting y guía deploy detallada).
