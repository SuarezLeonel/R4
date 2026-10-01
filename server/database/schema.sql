-- -------------------- Tabla: usuarios --------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- -------------------- Tabla: persona --------------------
CREATE TABLE IF NOT EXISTS persona (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  titulo_profesional TEXT NOT NULL,
  sobre_mi TEXT,
  email_contacto TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  cv_url TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- -------------------- Tabla: categorias_habilidades --------------------
CREATE TABLE IF NOT EXISTS categorias_habilidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_categoria TEXT NOT NULL UNIQUE
);

-- -------------------- Tabla: habilidades --------------------
CREATE TABLE IF NOT EXISTS habilidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  nivel_porcentaje INTEGER NOT NULL CHECK (nivel_porcentaje BETWEEN 0 AND 100),
  icono_url TEXT,
  FOREIGN KEY (categoria_id) REFERENCES categorias_habilidades(id) ON DELETE CASCADE
);

-- -------------------- Tabla: experiencias --------------------
CREATE TABLE IF NOT EXISTS experiencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  puesto TEXT NOT NULL,
  empresa TEXT NOT NULL,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT,
  es_actual INTEGER NOT NULL DEFAULT 0,
  descripcion TEXT
);

-- -------------------- Tabla: logros --------------------
CREATE TABLE IF NOT EXISTS logros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  institucion_o_entidad TEXT NOT NULL,
  fecha_obtencion TEXT NOT NULL,
  descripcion_logro TEXT,
  insignia_url TEXT
);

-- -------------------- Tabla: proyectos --------------------
CREATE TABLE IF NOT EXISTS proyectos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  demo_url TEXT,
  repo_url TEXT,
  destacado INTEGER NOT NULL DEFAULT 0,
  fecha_creacion TEXT DEFAULT (datetime('now'))
);

-- -------------------- Tabla: proyecto_habilidades (M:N) --------------------
CREATE TABLE IF NOT EXISTS proyecto_habilidades (
  proyecto_id INTEGER NOT NULL,
  habilidad_id INTEGER NOT NULL,
  PRIMARY KEY (proyecto_id, habilidad_id),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
  FOREIGN KEY (habilidad_id) REFERENCES habilidades(id) ON DELETE CASCADE
);

-- -------------------- Tabla: contactos --------------------
CREATE TABLE IF NOT EXISTS contactos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ==================== SEEDS ====================

-- 1 Usuario admin (password_hash se reemplaza en init.js por bcrypt hash)
INSERT OR IGNORE INTO usuarios (id, username, email, password_hash) VALUES
  (1, 'admin', 'admin@portfolio.dev', '__PASSWORD_HASH_PLACEHOLDER__');

-- 1 Persona relacionada con usuario admin
INSERT OR IGNORE INTO persona (usuario_id, nombre, apellido, titulo_profesional, sobre_mi, email_contacto, github_url, linkedin_url, avatar_url, cv_url) VALUES
  (1, 'Alex', 'Rodríguez', 'Full Stack Developer',
   'Desarrollador Full Stack con más de 5 años de experiencia construyendo aplicaciones web escalables y modernas. Apasionado por React, Node.js y las buenas prácticas de desarrollo. Me encanta resolver problemas complejos y aprender nuevas tecnologías.',
   'alex.rodriguez@portfolio.dev',
   'https://github.com/alexrodriguez',
   'https://linkedin.com/in/alexrodriguez',
   'https://i.pravatar.cc/300?img=13',
   'https://example.com/cv-alex-rodriguez.pdf');

-- 3 Categorías
INSERT OR IGNORE INTO categorias_habilidades (id, nombre_categoria) VALUES
  (1, 'Frontend'),
  (2, 'Backend'),
  (3, 'Herramientas & DevOps');

-- 8 Habilidades
INSERT OR IGNORE INTO habilidades (id, categoria_id, nombre, nivel_porcentaje, icono_url) VALUES
  (1, 1, 'React', 95, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
  (2, 1, 'TypeScript', 90, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
  (3, 1, 'Tailwind CSS', 90, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'),
  (4, 2, 'Node.js / Express', 88, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'),
  (5, 2, 'PostgreSQL', 85, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'),
  (6, 2, 'Python', 75, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'),
  (7, 3, 'Docker', 70, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'),
  (8, 3, 'Git', 92, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg');

-- 3 Experiencias
INSERT OR IGNORE INTO experiencias (id, puesto, empresa, fecha_inicio, fecha_fin, es_actual, descripcion) VALUES
  (1, 'Senior Full Stack Developer', 'TechCorp Solutions', '2023-06-01', NULL, 1,
   'Liderazgo de equipo de 6 desarrolladores. Diseño e implementación de arquitectura de microservicios. Mentoría a desarrolladores junior. Optimización de performance de APIs REST (reducción de latencia 40%).'),
  (2, 'Semi-Senior Full Stack Developer', 'InnovateLab', '2021-03-15', '2023-05-31', 0,
   'Desarrollo de aplicaciones SPA con React y TypeScript. Creación de APIs REST con Node.js y Express. Integración con bases de datos PostgreSQL y Redis. Implementación de CI/CD con GitHub Actions.'),
  (3, 'Junior Frontend Developer', 'StartUpWeb Studio', '2019-09-01', '2021-03-14', 0,
   'Maquetación responsive con HTML, CSS y JavaScript. Desarrollo de componentes reutilizables con React. Colaboración con diseñadores UX/UI. Mantenimiento y optimización de sitios web existentes.');

-- 3 Logros
INSERT OR IGNORE INTO logros (id, titulo, institucion_o_entidad, fecha_obtencion, descripcion_logro, insignia_url) VALUES
  (1, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2024-02-15',
   'Certificación oficial AWS que valida conocimientos fundamentales en servicios cloud, arquitectura, precios y seguridad.',
   'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png'),
  (2, 'Meta Front-End Developer Professional Certificate', 'Meta (Coursera)', '2023-08-20',
   'Certificación profesional de 9 cursos que cubre HTML, CSS, JavaScript, React, control de versiones y principios de UX/UI.',
   'https://s3.amazonaws.com/coursera_assets/meta_images/generated/XDP/XDP~SPECIALIZATION!-meta-front-end-developer/XDP~SPECIALIZATION!-meta-front-end-developer.jpeg'),
  (3, '1er Lugar - Hackathon X Innovación 2022', 'Hackathon X Community', '2022-11-10',
   'Primer puesto entre más de 50 equipos por la solución "EcoTrack", una app para monitorear huella de carbono personal con IoT y dashboards en tiempo real.',
   'https://example.com/badges/hackathon-first-place.png');

-- 3 Proyectos destacados
INSERT OR IGNORE INTO proyectos (id, titulo, descripcion, imagen_url, demo_url, repo_url, destacado) VALUES
  (1, 'EcoTrack - Dashboard Huella de Carbono',
   'Aplicación web full-stack para monitorear y visualizar la huella de carbono personal. Integración con dispositivos IoT, dashboard en tiempo real con gráficos interactivos, reportes PDF y recomendaciones personalizadas.',
   'https://picsum.photos/seed/ecotrack/800/500',
   'https://ecotrack-demo.example.com',
   'https://github.com/alexrodriguez/ecotrack',
   1),
  (2, 'DevPortfolio Builder',
   'Plataforma SaaS para que desarrolladores creen portfolios profesionales sin escribir código. Editor drag-and-drop, temas personalizables, hosting automático, analytics integrados y CMS propio.',
   'https://picsum.photos/seed/devportfolio/800/500',
   'https://devportfolio-builder.example.com',
   'https://github.com/alexrodriguez/devportfolio-builder',
   1),
  (3, 'TaskFlow - Gestión Ágil de Proyectos',
   'Herramienta de gestión de proyectos inspirada en Trello/Notion. Kanban boards, colaboración en tiempo real con WebSockets, integraciones con GitHub/Slack, automatizaciones y reportes avanzados.',
   'https://picsum.photos/seed/taskflow/800/500',
   'https://taskflow-demo.example.com',
   'https://github.com/alexrodriguez/taskflow',
   0);

-- Relaciones M:N proyecto_habilidades
-- Proyecto 1 (EcoTrack): React, TS, Node, PostgreSQL, Docker
INSERT OR IGNORE INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES
  (1, 1), (1, 2), (1, 4), (1, 5), (1, 7);

-- Proyecto 2 (DevPortfolio Builder): React, TS, Tailwind, Node, Git
INSERT OR IGNORE INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 8);

-- Proyecto 3 (TaskFlow): React, Node, PostgreSQL, Git
INSERT OR IGNORE INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES
  (3, 1), (3, 4), (3, 5), (3, 8);
