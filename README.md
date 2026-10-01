# Portfolio Web SPA Administrable

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

Single-Page Application (SPA) de **Portfolio Profesional Administrable** construida con **React 18 + TypeScript + Vite** en el Frontend y **Node.js / Express + SQL (SQLite / PostgreSQL)** en el Backend. Incluye **Modo Claro/Oscuro persistente**, **Panel de Administración con JWT**, **CRUD completo en vivo** (Habilidades, Proyectos, Experiencias, Logros, Datos Personales), **Formulario de Contacto validado**, animaciones con **Framer Motion**, diseño 100% **Responsive Mobile First** y componentes **Toast/Modal personalizados** (sin `alert()` ni `confirm()` nativos).

---

## ✨ Características Clave

- 🎨 **Interfaz Moderna y Responsive**: Mobile, Tablet, Desktop (Tailwind CSS 3).
- 🌗 **Modo Claro / Oscuro**: Persistente en `localStorage`, detecta preferencia del sistema.
- 🧭 **Smooth Scroll**: Navegación sticky con desplazamiento suave entre secciones.
- 🎬 **Animaciones Fluidas**: Montaje de secciones, efectos hover, transiciones con Framer Motion.
- 🔐 **Panel Admin Seguro**: Autenticación JWT, contraseñas encriptadas con Bcrypt.
- ✏️ **CRUD en Vivo**: Cualquier cambio desde el panel se refleja al instante en la vista pública.
- 🔔 **Toasts y Modales Personalizados**: Feedback UI elegante, cero funciones nativas del navegador.
- 📨 **Formulario de Contacto Validado**: Valida cliente + servidor, guarda en Base de Datos (solo POST).
- 🗃️ **Esquema SQL Normalizado (3NF)**: 9 tablas con FKs, relaciones M:N e índices.
- 🔀 **Dual Driver**: SQLite (desarrollo local sin servicio) o PostgreSQL (producción Supabase/Railway/Neon).
- 🌱 **Seeds Iniciales**: Usuario admin demo + portfolio de ejemplo pre-cargado.
- 🛡️ **Sin GET mutadores**: Toda autenticación / modificación usa POST, PUT, DELETE. Consultas SQL parametrizadas.

---

## 🧰 Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, React Router DOM v6, Framer Motion, Axios, React Icons |
| **Backend** | Node.js 18+, Express 4, CORS, ES Modules (`import` / `export`) |
| **Seguridad** | Bcrypt 5 (hash), JSON Web Token 9 (JWT), SQL parametrizado |
| **Base de Datos** | SQLite (local) o PostgreSQL (producción) |
| **Herramientas** | Nodemon (dev), dotenv |

---

## 📁 Estructura del Proyecto

```
R4/
├── client/                     # ⚛️ Frontend SPA
│   ├── index.html
│   ├── package.json            # "type": "module"
│   ├── tsconfig.json
│   ├── tailwind.config.js      # darkMode: 'class'
│   ├── vite.config.ts          # proxy /api -> localhost:3001
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── types/              # Interfaces TS (Persona, Habilidad, Proyecto...)
│       ├── services/api.ts     # Axios instance + interceptor JWT
│       ├── contexts/           # ThemeContext, ToastContext, AuthContext
│       ├── components/
│       │   ├── ui/             # ToastContainer, Modal, ProtectedRoute
│       │   └── ProtectedRoute.tsx
│       ├── layouts/            # PublicLayout
│       ├── pages/              # HomePage, LoginPage, AdminDashboard
│       ├── sections/           # Navbar, Hero, About, Skills, Experience, Projects, ContactForm...
│       └── admin/              # CrudPersona, CrudHabilidades, CrudProyectos...
│
├── server/                     # 🟢 Backend API REST
│   ├── package.json            # "type": "module"
│   ├── .env / .env.example
│   ├── database/
│   │   ├── schema.sql          # 9 tablas 3NF + seeds
│   │   └── init.js             # Auto-inicialización + bcrypt hash admin
│   └── src/
│       ├── server.js           # Entrypoint + init DB + listen 3001
│       ├── app.js              # Express app + rutas
│       ├── config/db.js        # query() wrapper SQLite/PG parametrizado
│       ├── middleware/auth.js  # authenticateJWT (Bearer token)
│       ├── utils/security.js   # bcrypt + JWT
│       └── routes/
│           ├── public.js       # GET /api/* (persona, habilidades, proyectos...)
│           ├── auth.js         # POST /api/auth/login
│           ├── admin.js        # POST/PUT/DELETE /api/admin/* (JWT)
│           └── contact.js      # POST /api/contact (SOLO POST, no GET)
│
├── .gitignore
├── package.json                # Scripts combinados
└── README.md
```

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** >= 18.0
- **npm** (o pnpm/yarn)
- *(Opcional)* PostgreSQL (solo si eliges producción en local; por defecto usa SQLite sin dependencias)

### Paso 1: Clonar / preparar carpeta
```bash
# Ya tienes los archivos listos en esta carpeta.
# Desde la raíz R4/:
```

### Paso 2: Instalar dependencias
Tienes dos opciones:

```bash
# Opción A - Script combinado (recomendado):
npm run install:all

# Opción B - Manual:
cd server && npm install && cd ../client && npm install && cd ..
```

### Paso 3: Configurar variables de entorno
El proyecto trae `.env.example` en ambos lados. Copiarlos/renombrarlos:

```bash
# Backend (servidor)
# server/.env ya viene pre-configurado para SQLite en desarrollo.
# Contenido típico:
#   PORT=3001
#   DB_DRIVER=sqlite
#   DATABASE_URL=file:./database/app.db
#   JWT_SECRET=dev_secret_change_me_in_production_please_123456789
#   BCRYPT_ROUNDS=10

# Frontend
cp client/.env.example client/.env     # Linux/Mac
# ó en PowerShell Windows: copy client\.env.example client\.env
```

### Paso 4: Iniciar los servicios en paralelo
Abre **dos terminales** (uno para server, otro para client), o usa el script por separado:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
#  -> http://localhost:3001/api/health  (debe responder {"ok":true})
```
*Los seeds + schema SQL se ejecutan automáticamente la primera vez en SQLite (crea `server/database/app.db`).*

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
#  -> http://localhost:5173  (abrir en navegador)
```

Vite automáticamente redirige `/api/*` a `http://localhost:3001` gracias al proxy, evitando problemas de CORS.

---

## 👤 Credenciales de Demo (Admin Panel)

URL Panel Admin: **http://localhost:5173/admin**

| Campo | Valor |
|---|---|
| **Usuario** | `admin` |
| **Contraseña** | `Admin1234!` |

> 🔒 Por seguridad **cambia inmediatamente estas credenciales** en producción. Puedes hacer un INSERT nuevo en la tabla `usuarios` con hash Bcrypt (ejecutando `bcrypt.hashSync('TuPass123!', 10)`).

---

## ⚙️ Variables de Entorno

### Server (archivo: `server/.env`)

| Variable | Ejemplo | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto donde escucha el backend |
| `DB_DRIVER` | `sqlite` ó `pg` | Driver SQL a utilizar |
| `DATABASE_URL` | `file:./database/app.db` ó `postgresql://user:pw@host:port/db?sslmode=require` | Cadena de conexión |
| `JWT_SECRET` | string largo aleatorio | **¡Cambia esto en producción!** Firma de tokens JWT |
| `BCRYPT_ROUNDS` | `10` | Salt rounds de bcrypt (>= 10 recomendado) |

### Client (archivo: `client/.env`)
| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | URL base del API (en dev proxy a localhost:3001; en producción pondrás `https://tu-backend.onrender.com/api`) |

---

## ☁️ Guía de Despliegue (Producción)

### 1) Base de Datos (PostgreSQL gestionado)
Elige uno (todos soportan el schema.sql):
- **Supabase** (supabase.com) → SQL Editor → pegar el contenido de `server/database/schema.sql` (reemplaza `__PASSWORD_HASH_PLACEHOLDER__` manualmente si no usas init.js).
- **Neon.tech** → conn string tipo `postgres://user:pass@.../neondb`.
- **Railway / Render PostgreSQL** → same.
- Añade extensiones si es necesario (no requiere ninguna especial).

### 2) Backend (Node.js) en Render / Railway
1. Sube este repositorio a GitHub/GitLab.
2. **Railway / Render** → New → Web Service → conecta repo → Root Directory `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Añade las **Environment Variables**:
   - `DB_DRIVER=pg`
   - `DATABASE_URL=postgresql://tu-cadena-a-supabase-o-neon`
   - `JWT_SECRET=<una-string-aleatoria-y-larga-usa-1password>`
   - `BCRYPT_ROUNDS=10`
   - `PORT=3001`
6. La primera vez, desde **Shell** del host o con `psql` ejecuta el schema + seeds:
   ```bash
   psql "$DATABASE_URL" -f server/database/schema.sql
   ```
   *(Nota: PostgreSQL no soporta `AUTOINCREMENT`; el archivo `init.js` ya lo transforma a `GENERATED AS IDENTITY`. Si lo haces manualmente, reemplaza `INTEGER PRIMARY KEY AUTOINCREMENT` por `SERIAL PRIMARY KEY` o usa `init.js`)*.

7. Anota la URL pública: ej. `https://mi-portfolio-api.onrender.com`

### 3) Frontend (SPA) en Vercel
1. Entra a vercel.com → New Project → importa repo → Root Directory `client`.
2. Framework preset = **Vite**.
3. **Environment Variables**:
   - `VITE_API_BASE_URL=https://mi-portfolio-api.onrender.com/api`
4. Deploy! Listo.
5. Configura un dominio personalizado en Vercel si lo deseas.

> 📌 Consejo de Seguridad: Activa **CORS** en producción (modifica `server/src/app.js` `cors({origin: 'https://tu-vercel-domain.vercel.app'})`).

---

## 📡 Resumen Rápidamente de Endpoints API

### 🔓 Públicos (sin auth, solo GET)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Heartbeat del servidor |
| GET | `/api/persona` | Datos personales (1 fila) |
| GET | `/api/categorias` | Categorías de habilidades |
| GET | `/api/habilidades` | Habilidades + JOIN categoría |
| GET | `/api/experiencias` | Experiencia laboral DESC |
| GET | `/api/logros` | Logros / certificaciones DESC |
| GET | `/api/proyectos` | Proyectos + habilidades asociadas M:N |
| GET | `/api/proyectos/:id` | Detalle de proyecto |

### ✉️ Solo Contacto (público, solo POST)
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| POST | `/api/contact` | `{ nombre, email, mensaje }` | Guardar mensaje (GET 404) |

### 🔑 Auth
| Método | Endpoint | Payload | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` | Retorna `{ token, user }` JWT |

### 🛡️ Admin (TODOS requieren Header `Authorization: Bearer <JWT>`)
Prefijo base: `/api/admin`
| Método | Endpoints (ejemplos) | Descripción |
|---|---|---|
| GET/PUT | `/persona`, `/persona/:id` | Ver/editar datos personales |
| CRUD | `/categorias`, `/categorias/:id` | POST / GET / PUT / DELETE categorías |
| CRUD | `/habilidades`, `/habilidades/:id` | Gestionar habilidades |
| CRUD | `/experiencias`, `/experiencias/:id` | Gestionar experiencia |
| CRUD | `/logros`, `/logros/:id` | Gestionar logros |
| CRUD | `/proyectos`, `/proyectos/:id` | Gestionar proyectos |
| POST | `/proyectos/:id/habilidades` | `{ habilidadId, agregar }` asignar/desasignar M:N |

---

## 🛠️ Scripts Útiles (raíz `R4/`)

| Script | Descripción |
|---|---|
| `npm run install:all` | Instala dependencias de root + server + client |
| `npm run dev:server` | `cd server && npm run dev` |
| `npm run dev:client` | `cd client && npm run dev` |
| `npm run build:client` | Build producción del frontend en `client/dist/` |
| `npm run start:server` | Arranca backend en modo producción |

---

## 🛡️ Notas de Seguridad

- ✅ Contraseñas siempre con Bcrypt (>= 10 rounds). Nunca texto plano.
- ✅ Todas las rutas admin requieren JWT válido.
- ✅ SQL 100% parametrizada (no concatenación strings).
- ✅ Mutaciones exclusivamente por POST / PUT / DELETE (ninguna operación sensible por GET).
- ✅ Componente de confirmación vía Modal + Toast (nunca `confirm()` / `alert()`).
- 🔧 En producción: usa `https`, SameSite cookies (si cambias estrategia), CORS cerrado, JWT_SECRET largo y rotación de tokens.

---

## 📦 Datos de Semilla Incluidos (seed)

- **1 Usuario Admin** → username `admin`
- **1 Perfil Persona** → Alex Rodríguez, Full Stack Developer
- **3 Categorías de habilidades**: Frontend, Backend, Herramientas & DevOps
- **8 Habilidades iniciales**: React, TypeScript, Tailwind, Node/Express, PostgreSQL, Python, Docker, Git
- **3 Experiencias** (Senior actual, Semi-Senior, Junior)
- **3 Logros** (AWS Cloud Practitioner 2024, Meta Front-End 2023, Hackathon 2022)
- **3 Proyectos de ejemplo** con relaciones a ~3-5 habilidades M:N

---

## 🆘 Solución de Problemas Comunes

| Problema | Solución |
|---|---|
| Error en install bcrypt o better-sqlite3 | Asegúrate de Node >= 18 y herramientas build (`windows-build-tools` en Win si falla prebuild) |
| Port 3001 ya ocupado | Cambia `PORT` en `server/.env` y actualiza proxy en `client/vite.config.ts` |
| No veo datos en /api/persona | Verifica `server/database/app.db` exista; elimínala y re-arranca server para regenerar seeds |
| JWT inválido / 401 en rutas admin | Asegúrate de no haber cambiado JWT_SECRET; vuelve a hacer login |
| Tailwind dark mode no cambia | Revisa que `darkMode: 'class'` esté en tailwind config y el `<html>` reciba `class="dark"` |
| Build frontend Vite falla | `cd client && npx tsc --noEmit` para ver errores TS |

---

## 📝 Licencia & Créditos

- **Licencia**: MIT (usa libremente para tu propio portfolio).
- Imágenes placeholder: [Pravatar](https://i.pravatar.cc), [Picsum](https://picsum.photos).
- Íconos: React Icons pack.
- Autor: *Generado bajo pipeline full-stack arquitectura modular ES Modules + SQL 3NF.*

---
¡Listo! Tienes un portfolio profesional **totalmente administrable** sin tocar código fuente. 🎉
