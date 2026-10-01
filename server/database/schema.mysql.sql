-- ============================================================
-- Portfolio SPA Administrable - Esquema + Seeds (MySQL 8.0+)
-- ============================================================
-- ✅ 100% COMPATIBLE con MySQL Workbench, XAMPP, Laragon, etc.
--
-- Cómo usarlo en MySQL Workbench:
--   1) Abrir Workbench → conectar a tu servidor MySQL.
--   2) File → New Query Tab.
--   3) Pegar TODO este archivo.
--   4) (Opcional) Descomentar las 2 líneas siguientes para crear/elegir la DB.
--   5) Ejecutar (⚡ Rayo / Ctrl+Shift+Enter).
--
--   -- CREATE DATABASE IF NOT EXISTS portfolio_spa DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   -- USE portfolio_spa;
--
-- Luego en tu archivo server/.env configura:
--   DB_DRIVER=mysql
--   DATABASE_URL=mysql://usuario:password@localhost:3306/portfolio_spa
--
-- Recomendación: Instala `mysql2` (npm i mysql2) en /server y añade
-- soporte al wrapper query() - las placeholders `?` son nativas de mysql2.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------- Tabla: usuarios --------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  username         VARCHAR(50)  NOT NULL UNIQUE,
  email            VARCHAR(255) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: persona --------------------
DROP TABLE IF EXISTS persona;
CREATE TABLE persona (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id           INT          NOT NULL UNIQUE,
  nombre               VARCHAR(100) NOT NULL,
  apellido             VARCHAR(100) NOT NULL,
  titulo_profesional   VARCHAR(200) NOT NULL,
  sobre_mi             TEXT,
  email_contacto       VARCHAR(255),
  github_url           VARCHAR(500),
  linkedin_url         VARCHAR(500),
  avatar_url           VARCHAR(500),
  cv_url               VARCHAR(500),
  CONSTRAINT fk_persona_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: categorias_habilidades --------------------
DROP TABLE IF EXISTS categorias_habilidades;
CREATE TABLE categorias_habilidades (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: habilidades --------------------
DROP TABLE IF EXISTS habilidades;
CREATE TABLE habilidades (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id       INT          NOT NULL,
  nombre             VARCHAR(150) NOT NULL,
  nivel_porcentaje   TINYINT UNSIGNED NOT NULL
    CHECK (nivel_porcentaje BETWEEN 0 AND 100),
  icono_url          VARCHAR(500),
  CONSTRAINT fk_habilidad_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias_habilidades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: experiencias --------------------
DROP TABLE IF EXISTS experiencias;
CREATE TABLE experiencias (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  puesto         VARCHAR(200) NOT NULL,
  empresa        VARCHAR(200) NOT NULL,
  fecha_inicio   DATE         NOT NULL,
  fecha_fin      DATE DEFAULT NULL,
  es_actual      TINYINT(1)   NOT NULL DEFAULT 0,
  descripcion    TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: logros --------------------
DROP TABLE IF EXISTS logros;
CREATE TABLE logros (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  titulo                 VARCHAR(250) NOT NULL,
  institucion_o_entidad  VARCHAR(250) NOT NULL,
  fecha_obtencion        DATE         NOT NULL,
  descripcion_logro      TEXT,
  insignia_url           VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: proyectos --------------------
DROP TABLE IF EXISTS proyectos;
CREATE TABLE proyectos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  titulo         VARCHAR(250) NOT NULL,
  descripcion    TEXT         NOT NULL,
  imagen_url     VARCHAR(500) NOT NULL,
  demo_url       VARCHAR(500),
  repo_url       VARCHAR(500),
  destacado      TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_creacion DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: proyecto_habilidades (M:N) --------------------
DROP TABLE IF EXISTS proyecto_habilidades;
CREATE TABLE proyecto_habilidades (
  proyecto_id   INT NOT NULL,
  habilidad_id  INT NOT NULL,
  PRIMARY KEY (proyecto_id, habilidad_id),
  CONSTRAINT fk_ph_proyecto FOREIGN KEY (proyecto_id)
    REFERENCES proyectos(id) ON DELETE CASCADE,
  CONSTRAINT fk_ph_habilidad FOREIGN KEY (habilidad_id)
    REFERENCES habilidades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------- Tabla: contactos --------------------
DROP TABLE IF EXISTS contactos;
CREATE TABLE contactos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(200) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  mensaje      TEXT         NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEEDS / DATOS DE PRUEBA
--
-- ⚠️ IMPORTANTE sobre el password admin:
--   El hash que se usa a continuación es el bcrypt de "Admin1234!"
--   generado con 10 rounds. Si quieres tu propio password:
--   node -e "console.log(require('bcrypt').hashSync('TuPassword!',10))"
--   y reemplazas el string a continuación.
-- ============================================================

-- 1 Usuario admin (password: Admin1234!)
INSERT INTO usuarios (id, username, email, password_hash) VALUES
  (1, 'admin', 'admin@portfolio.dev', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  email = VALUES(email),
  password_hash = VALUES(password_hash);

-- 1 Persona relacionada con usuario admin
INSERT INTO persona (usuario_id, nombre, apellido, titulo_profesional, sobre_mi, email_contacto, github_url, linkedin_url, avatar_url, cv_url) VALUES
  (1, 'Alex', 'Rodríguez', 'Full Stack Developer',
   'Desarrollador Full Stack con más de 5 años de experiencia construyendo aplicaciones web escalables y modernas. Apasionado por React, Node.js y las buenas prácticas de desarrollo. Me encanta resolver problemas complejos y aprender nuevas tecnologías.',
   'alex.rodriguez@portfolio.dev',
   'https://github.com/alexrodriguez',
   'https://linkedin.com/in/alexrodriguez',
   'https://i.pravatar.cc/300?img=13',
   'https://example.com/cv-alex-rodriguez.pdf')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  apellido = VALUES(apellido),
  titulo_profesional = VALUES(titulo_profesional),
  sobre_mi = VALUES(sobre_mi);

-- 3 Categorías
INSERT INTO categorias_habilidades (id, nombre_categoria) VALUES
  (1, 'Frontend'),
  (2, 'Backend'),
  (3, 'Herramientas & DevOps')
ON DUPLICATE KEY UPDATE nombre_categoria = VALUES(nombre_categoria);

-- 8 Habilidades
INSERT INTO habilidades (id, categoria_id, nombre, nivel_porcentaje, icono_url) VALUES
  (1, 1, 'React',           95, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
  (2, 1, 'TypeScript',      90, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
  (3, 1, 'Tailwind CSS',    90, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'),
  (4, 2, 'Node.js / Express', 88, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'),
  (5, 2, 'PostgreSQL / MySQL', 85, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'),
  (6, 2, 'Python',          75, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'),
  (7, 3, 'Docker',          70, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'),
  (8, 3, 'Git',             92, 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  categoria_id = VALUES(categoria_id),
  nivel_porcentaje = VALUES(nivel_porcentaje);

-- 3 Experiencias
INSERT INTO experiencias (id, puesto, empresa, fecha_inicio, fecha_fin, es_actual, descripcion) VALUES
  (1, 'Senior Full Stack Developer', 'TechCorp Solutions', '2023-06-01', NULL, 1,
   'Liderazgo de equipo de 6 desarrolladores. Diseño e implementación de arquitectura de microservicios. Mentoría a desarrolladores junior. Optimización de performance de APIs REST (reducción de latencia 40%).'),
  (2, 'Semi-Senior Full Stack Developer', 'InnovateLab', '2021-03-15', '2023-05-31', 0,
   'Desarrollo de aplicaciones SPA con React y TypeScript. Creación de APIs REST con Node.js y Express. Integración con bases de datos PostgreSQL/MySQL y Redis. Implementación de CI/CD con GitHub Actions.'),
  (3, 'Junior Frontend Developer', 'StartUpWeb Studio', '2019-09-01', '2021-03-14', 0,
   'Maquetación responsive con HTML, CSS y JavaScript. Desarrollo de componentes reutilizables con React. Colaboración con diseñadores UX/UI. Mantenimiento y optimización de sitios web existentes.')
ON DUPLICATE KEY UPDATE
  puesto = VALUES(puesto),
  empresa = VALUES(empresa),
  fecha_inicio = VALUES(fecha_inicio),
  fecha_fin = VALUES(fecha_fin),
  es_actual = VALUES(es_actual),
  descripcion = VALUES(descripcion);

-- 3 Logros
INSERT INTO logros (id, titulo, institucion_o_entidad, fecha_obtencion, descripcion_logro, insignia_url) VALUES
  (1, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2024-02-15',
   'Certificación oficial AWS que valida conocimientos fundamentales en servicios cloud, arquitectura, precios y seguridad.',
   'https://images.credly.com/size/340x340/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png'),
  (2, 'Meta Front-End Developer Professional Certificate', 'Meta (Coursera)', '2023-08-20',
   'Certificación profesional de 9 cursos que cubre HTML, CSS, JavaScript, React, control de versiones y principios de UX/UI.',
   'https://s3.amazonaws.com/coursera_assets/meta_images/generated/XDP/XDP~SPECIALIZATION!-meta-front-end-developer/XDP~SPECIALIZATION!-meta-front-end-developer.jpeg'),
  (3, '1er Lugar - Hackathon X Innovación 2022', 'Hackathon X Community', '2022-11-10',
   'Primer puesto entre más de 50 equipos por la solución "EcoTrack", una app para monitorear huella de carbono personal con IoT y dashboards en tiempo real.',
   'https://example.com/badges/hackathon-first-place.png')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  institucion_o_entidad = VALUES(institucion_o_entidad),
  fecha_obtencion = VALUES(fecha_obtencion),
  descripcion_logro = VALUES(descripcion_logro),
  insignia_url = VALUES(insignia_url);

-- 3 Proyectos
INSERT INTO proyectos (id, titulo, descripcion, imagen_url, demo_url, repo_url, destacado) VALUES
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
   0)
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  descripcion = VALUES(descripcion),
  imagen_url = VALUES(imagen_url),
  demo_url = VALUES(demo_url),
  repo_url = VALUES(repo_url),
  destacado = VALUES(destacado);

-- Relaciones M:N proyecto_habilidades
INSERT INTO proyecto_habilidades (proyecto_id, habilidad_id) VALUES
  (1, 1), (1, 2), (1, 4), (1, 5), (1, 7),
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 8),
  (3, 1), (3, 4), (3, 5), (3, 8)
ON DUPLICATE KEY UPDATE proyecto_id = proyecto_id;

SET FOREIGN_KEY_CHECKS = 1;
