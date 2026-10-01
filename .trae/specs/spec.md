# Portfolio Web SPA Administrable - Product Requirements Document

## Overview
- **Summary**: Construcción de un Portfolio Web tipo Single-Page Application (SPA) con React en el frontend y un Backend API RESTful en Node.js/Express + Base de Datos SQL (PostgreSQL/SQLite), incluyendo un Panel de Administración con Autenticación JWT para gestionar dinámicamente todo el contenido del portfolio.
- **Purpose**: Proporcionar a un profesional una página web de portfolio moderna, responsiva, con modo claro/oscuro y un panel administrativo que le permita actualizar su contenido (habilidades, proyectos, experiencia, logros, datos personales) sin intervención de código ni reinicio de servidor.
- **Target Users**:
  - Usuario final (visita pública): Visitantes, recruiters, clientes.
  - Usuario administrador: Dueño/a del portfolio que gestiona el contenido.

## Goals
- SPA completamente funcional con navegación por secciones y smooth scroll.
- Modo Claro/Oscuro persistente en localStorage.
- Backend API RESTful con endpoints CRUD para todas las entidades.
- Autenticación JWT con contraseñas encriptadas (Bcrypt).
- Base de datos SQL normalizada en 3NF con datos semilla.
- Panel Admin con Login y CRUD completo que refleje cambios en tiempo real en la vista pública.
- Diseño profesional, responsive, con animaciones fluidas.
- Componente de notificaciones Toast personalizado (sin alert() ni confirm()).
- Formulario de contacto validado (solo POST).
- Código modular ES Modules, TypeScript en frontend, código limpio y documentado.

## Non-Goals
- No incluye múltiples roles de usuario (solo un admin).
- No incluye integración con proveedor de pago, newsletter ni blog.
- No incluye tests e2e automatizados (solo self-verification manual).
- No incluye subida de archivos/imágenes al servidor (URLs externas solamente).
- No incluye panel de analíticas ni seguimiento.

## Background & Context
- Proyecto construido desde cero en un workspace vacío (R4).
- Stack seleccionado:
  - Frontend: React 18 + Vite + TypeScript + Tailwind CSS 3 + React Router DOM + Framer Motion + Axios + React Icons.
  - Backend: Node.js + Express + CORS + Bcrypt + JWT + PostgreSQL (con SQLite fallback local vía better-sqlite3 para dev fácil).
  - Base de Datos: Esquema relacional 3NF con 9 tablas.
- Prefs de usuario recordadas: estilo modular ES Modules, atomizado, rutas SPA, componentes de notificación personalizados, fuertemente tipado (TS), modo claro/oscuro nativo.

## Functional Requirements
- **FR-1 (Frontend SPA)**: Vista pública con Navbar sticky, Hero, Sobre Mí, Habilidades, Experiencia, Logros, Proyectos, Contacto y Footer.
- **FR-2 (Dark/Light Mode)**: Toggle tema claro/oscuro persistente en localStorage, aplicado en toda la SPA.
- **FR-3 (Smooth Scroll)**: Navegación smooth-scroll entre secciones de la vista pública.
- **FR-4 (Panel Admin)**: Ruta `/admin` con Login (JWT) y Dashboard con CRUD de Persona, Habilidades, Categorías, Experiencias, Logros, Proyectos.
- **FR-5 (Auth)**: Login admin mediante POST /api/auth/login que devuelve JWT; Logout limpia token; todas las rutas /api/admin/* protegidas.
- **FR-6 (API CRUD)**: Endpoints RESTful (GET público, POST/PUT/DELETE protegidos) para cada entidad: Persona, Categorías Habilidades, Habilidades, Experiencias, Logros, Proyectos, Proyecto_Habilidades.
- **FR-7 (Seguridad DB)**: Contraseñas admin encriptadas con Bcrypt; consultas parametrizadas; JWT con expiración.
- **FR-8 (Toast/Modales)**: Feedback UI mediante Toasts personalizados y Modal de detalle de proyecto. Sin alert() ni confirm() nativos.
- **FR-9 (Formulario Contacto)**: Formulario validado cliente-side + server-side que envía datos por POST a /api/contact (registra en tabla y devuelve confirmación Toast).
- **FR-10 (Modal Detalle Proyecto)**: Click en card de proyecto abre Modal con detalle, tags de tecnologías y links.
- **FR-11 (Timeline y Skills)**: Vista Experiencia como Timeline y Habilidades agrupadas por categoría con barras de porcentaje.
- **FR-12 (Seeds)**: Datos semilla iniciales para admin demo, persona, categorías, skills, experiencias, logros, proyectos.

## Non-Functional Requirements
- **NFR-1 (TypeScript)**: Frontend 100% TypeScript con interfaces tipadas para todas las entidades.
- **NFR-2 (ES Modules)**: package.json con `"type": "module"` tanto en client como server; sintaxis import/export exclusivamente.
- **NFR-3 (Responsive)**: Diseño Mobile First, breakpoints sm/md/lg/xl correctos en todas las secciones.
- **NFR-4 (Animaciones)**: Animaciones fluidas (Framer Motion) en montaje de secciones, hover cards, transiciones.
- **NFR-5 (3NF)**: Esquema SQL estrictamente en Tercera Forma Normal.
- **NFR-6 (Sin GET mutadores)**: Toda autenticación, creación, modificación, eliminación usa POST/PUT/PATCH/DELETE. GET solo lectura pública sin datos sensibles.
- **NFR-7 (Linting/Formato)**: Código indentado con 2 espacios; nombres camelCase/PascalCase; sin comentarios innecesarios pero interfaces/documentadas donde corresponda.
- **NFR-8 (Performance)**: Imágenes via URL, componentes atomizados, re-renders mínimos, lazy de íconos.
- **NFR-9 (README)**: Documentación completa de instalación, variables de entorno, seed, despliegue (Vercel + Supabase/Railway/Render).

## Constraints
- **Technical**:
  - Node.js >= 18.x.
  - Sintaxis ES Modules estricta (no require).
  - Prohibido alert() / confirm() nativos.
  - Prohibido usar GET para mutar o autenticar.
  - Contraseñas encriptadas con Bcrypt (10+ salt rounds).
  - SQL parametrizado obligatorio.
- **Business**:
  - Una sola cuenta administradora inicial (seed).
  - Endpoints públicos no exponen password_hash ni datos sensibles.
- **Dependencies**:
  - PostgreSQL para producción (Supabase, Railway, Neon, Render).
  - SQLite local para desarrollo rápido sin servicio externo.

## Assumptions
- Imágenes/avatares/icons se sirven por URL externa (no upload local).
- Formulario de Contacto guarda en tabla SQL (no envía email SMTP a menos que el usuario configure luego).
- Token JWT se almacena en localStorage del cliente.
- Usuario final tiene Node.js 18+ y npm/pnpm instalado.
- Para demo inicial, el admin credencial se crea via seeds: `admin` / `Admin1234!`.

## Acceptance Criteria

### AC-1: SPA se compila y corre sin errores en modo dev
- **Type**: `rule`
- **Given**: Repositorio clonado, dependencias instaladas (npm install en /client y /server), variables de entorno configuradas, seeds ejecutados.
- **When**: Ejecutar `npm run dev` en /client y `npm run dev` en /server en paralelo.
- **Then**: Frontend abre en http://localhost:5173 sin errores de consola; Backend escucha en http://localhost:3001 y responde 200 en GET /api/health.
- **Pass Condition**: Ambos procesos corren y los endpoints públicos (GET /api/persona, GET /api/habilidades, GET /api/proyectos) devuelven JSON con datos semilla.
- **Evidence**: Captura de consola con Vite + Express running, curl de /api/health y /api/persona.

### AC-2: Esquema DB en 3NF + Seeds ejecutables
- **Type**: `rule`
- **Given**: Archivo server/database/schema.sql creado.
- **When**: Ejecutar esquema + seeds en SQLite local (dev) o PostgreSQL (prod).
- **Then**: 9 tablas creadas (usuarios, persona, categorias_habilidades, habilidades, experiencias, logros, proyectos, proyecto_habilidades, contactos); al menos 1 admin, 1 persona, 3 categorías, 6 habilidades, 2 experiencias, 2 logros, 3 proyectos insertados; relaciones FK correctas; no hay transitivas ni redundancias.
- **Pass Condition**: Schema corre sin errores; SELECTs JOIN entre habilidades/categorías y proyectos/habilidades devuelven filas combinadas.
- **Evidence**: Schema.sql + queries de prueba que muestran JOINs y conteo de filas por tabla.

### AC-3: Reglas de seguridad API cumplidas
- **Type**: `rule`
- **Given**: Server corriendo.
- **When**: Intentar POST/PUT/DELETE sin token en rutas /api/admin/*; intentar GET /api/usuarios o /api/auth/password_hash.
- **Then**: Rutas protegidas devuelven 401; rutas públicas GET no devuelven campos sensibles; login requiere POST con body JSON (no GET); passwords en DB son hash Bcrypt.
- **Pass Condition**: 401 sin token, 200 con token; hash password empieza por `$2b$10$`; ningún endpoint público expone password_hash.
- **Evidence**: Captura curl de 401, 200 con JWT, hash en DB.

### AC-4: Prohibición alert()/confirm() respetada
- **Type**: `rule`
- **Given**: Todo el código frontend revisado.
- **When**: Grep por `alert(` y `confirm(` en /client/src.
- **Then**: Ninguna coincidencia nativa de window.alert o window.confirm; notificaciones exclusivamente vía componente Toast custom y modales React.
- **Pass Condition**: Grep devuelve 0 coincidencias de `alert(` o `confirm(` (solo en comentarios si acaso).
- **Evidence**: Salida grep vacía; componente Toast existente y utilizado.

### AC-5: Modo Claro/Oscuro persistente
- **Type**: `rule`
- **Given**: SPA cargada en navegador.
- **When**: Clickear toggle tema, actualizar página (F5), cerrar y reabrir pestaña.
- **Then**: Tema seleccionado persiste; localStorage["theme"] contiene "light" o "dark"; CSS vars de Tailwind aplican correctamente en modo actual.
- **Pass Condition**: Tras refresh, el tema se mantiene; no hay flash de tema incorrecto.
- **Evidence**: DevTools Application > LocalStorage muestra theme correcto; screenshot de ambos modos.

### AC-6: CRUD Admin modifica datos en vivo
- **Type**: `rule`
- **Given**: Admin logueado en /admin/dashboard.
- **When**: Crear, editar o eliminar una habilidad/proyecto/experiencia desde el panel y luego navegar a la vista pública (mismo navegador, sin recarga de server).
- **Then**: El cambio se ve inmediatamente en la vista pública al volver (sin reiniciar backend); Toast confirma operación.
- **Pass Condition**: Operaciones Create/Update/Delete persisten en DB y GET público refleja cambios al instante.
- **Evidence**: Video o pasos mostrando edición en panel + refresh público sin tocar server.

### AC-7: Formulario de Contacto (POST validado)
- **Type**: `rule`
- **Given**: Vista pública en la sección Contacto.
- **When**: Enviar formulario con datos inválidos (email malo) y luego con datos válidos.
- **Then**: Validación cliente-side muestra errores inline; submit válido hace POST a /api/contact; se guarda en tabla contactos; devuelve 201 y Toast de éxito en UI; request por método GET a /api/contact desde navegador no envía nada.
- **Pass Condition**: Registro en tabla, Toast éxito, no envío por GET.
- **Evidence**: Captura network panel (POST 201), fila en contactos, Toast visible.

### AC-8: Responsive Design (Mobile/Tablet/Desktop)
- **Type**: `rubric`
- **Dimension**: Adaptabilidad visual y funcionalidad en 3 breakpoints.
- **Scale**: 1-5
- **Anchors**: 1 = layout roto en móvil, horizontalscroll; 3 = usable pero pequeños ajustes; 5 = perfecto en 360px, 768px y 1440px, sin overflow, touch targets >= 44px.
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots de navegador DevTools Device Mode en 3 tamaños.

### AC-9: Calidad de código frontend (TS, modular, hooks)
- **Type**: `rubric`
- **Dimension**: Cumplimiento de estándares TypeScript, atomización componentes y uso idiomático de hooks.
- **Scale**: 1-5
- **Anchors**: 1 = código JS puro sin tipos, todo en un archivo; 3 = TS con any ocasional, pocos componentes; 5 = interfaces para todas las entidades, componentes atómicos reutilizables, useState/useEffect/useContext correctos, sin eslint-ignore masivos.
- **Pass Threshold**: >= 4
- **Evidence**: Estructura de carpetas, revisión de interfaces en types/, revisión de App.tsx.

### AC-10: Documentación README completa
- **Type**: `rubric`
- **Dimension**: Completitud y claridad de la guía de instalación y despliegue.
- **Scale**: 1-5
- **Anchors**: 1 = sin README o pasos incompletos; 3 = explica install pero omite variables/env/seeds/deploy; 5 = pasos detallados install local (client y server), .env.example, seeds, crédenciales demo, guía de despliegue en Vercel + Supabase/Railway, estructura del proyecto.
- **Pass Threshold**: >= 4
- **Evidence**: Archivo README.md revisado sección por sección.

## Open Questions
- [ ] (Resuelto con Supabase) ¿Se prefiere PostgreSQL on-premise o servicio gestionado? → Se documentan ambos, default Supabase.
- [ ] (Resuelto SQLite) ¿Dev local requiere SQLite fallback o PostgreSQL obligatorio? → SQLite fallback incluido para dev sin servicio externo.
