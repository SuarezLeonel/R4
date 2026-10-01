/**
 * Representa los datos principales de la persona dueña del portfolio.
 * Se usa en Hero, About, Navbar, Footer y en el CRUD de administración.
 */
export interface Persona {
  id: number;
  nombre: string;
  apellido: string;
  titulo_profesional: string;
  sobre_mi: string;
  email_contacto: string;
  github_url?: string;
  linkedin_url?: string;
  avatar_url?: string;
}

/**
 * Categoría que agrupa habilidades (ej: Frontend, Backend, DevOps).
 */
export interface Categoria {
  id: number;
  nombre_categoria: string;
}

/**
 * Habilidad / tecnología que forma parte de una categoría.
 * Puede estar asociada a 0..N proyectos.
 */
export interface Habilidad {
  id: number;
  categoria_id: number;
  nombre: string;
  nivel_porcentaje: number;
  icono_url?: string;
  nombre_categoria?: string;
}

/**
 * Experiencia laboral mostrada en la sección homónima.
 */
export interface Experiencia {
  id: number;
  puesto: string;
  empresa: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  es_actual: boolean;
  descripcion: string;
}

/**
 * Certificación, premio o logro profesional.
 */
export interface Logro {
  id: number;
  titulo: string;
  institucion_o_entidad: string;
  fecha_obtencion: string;
  descripcion_logro: string;
  insignia_url?: string;
}

/**
 * Proyecto del portafolio (deshabilitado actualmente en la UI pública
 * pero la interfaz se conserva para uso futuro o en el panel admin).
 */
export interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  demo_url?: string;
  repo_url?: string;
  destacado: boolean;
  fecha_creacion?: string;
  habilidades?: Habilidad[];
}

/**
 * Datos enviados por el formulario de contacto (público).
 */
export interface ContactPayload {
  nombre: string;
  email: string;
  mensaje: string;
}

/**
 * Usuario del panel de administración (tras login exitoso).
 */
export interface AdminUser {
  id: number;
  username: string;
  email: string;
}

/**
 * Cuerpo de la petición de login del administrador.
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * Respuesta del servidor tras autenticación exitosa.
 */
export interface LoginResponse {
  token: string;
  user: AdminUser;
}

/**
 * Tipos visuales soportados para los mensajes toast.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Mensaje toast que se muestra brevemente en pantalla (ver ToastContext).
 */
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}
