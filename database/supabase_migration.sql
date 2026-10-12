-- ==========================================================
-- SOCIALFLOW - SCRIPT DE MIGRACIÓN PARA SUPABASE (POSTGRESQL)
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase:
-- Dashboard -> SQL Editor -> New Query -> Pegar y dar clic en "Run"
-- ==========================================================

-- 1. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS public.roles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE CLIENTES (Aislamiento de Cuentas y Sectorización: Clientes Reales vs Prospectos)
CREATE TABLE IF NOT EXISTS public.clients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    client_type TEXT NOT NULL DEFAULT 'active_client', -- 'active_client' (Cliente Real) o 'prospect' (Prospecto / Lead)
    brand_color TEXT DEFAULT '#2563eb',
    logo_text TEXT,
    access_token TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,                -- Teléfono Principal
    secondary_phone TEXT,              -- Teléfono Secundario / WhatsApp Alternativo
    website_url TEXT,                  -- Sitio Web o Redes
    description TEXT,                  -- Giro / Descripción
    notes TEXT,                        -- Notas internas
    target_posts_count INT DEFAULT 0,  -- Meta acordada mensual de Posts
    target_reels_count INT DEFAULT 0,  -- Meta acordada mensual de Reels
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE USUARIOS (Modo Agencia vs Vista Cliente)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    role_id BIGINT REFERENCES public.roles(id) ON DELETE RESTRICT,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'agency', -- 'agency' o 'client'
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    position TEXT,
    phone TEXT,
    avatar_color TEXT DEFAULT '#2563eb',
    password_hash TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE PUBLICACIONES (Posts / Reels)
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    created_by_user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT,
    platform TEXT NOT NULL DEFAULT 'instagram', -- 'instagram', 'tiktok', 'facebook', 'linkedin'
    post_type TEXT NOT NULL DEFAULT 'reel',     -- 'reel', 'image_post', 'carousel', 'story'
    status TEXT NOT NULL DEFAULT 'pending_approval', -- 'draft', 'pending_approval', 'approved', 'changes_requested'
    observation_internal TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE ARCHIVOS MULTIMEDIA (Reels, Fotos, Carruseles)
CREATE TABLE IF NOT EXISTS public.post_media (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL DEFAULT 'video', -- 'video', 'image'
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    aspect_ratio TEXT DEFAULT '9:16',        -- '9:16', '1:1', '4:5'
    order_index INT DEFAULT 1,
    slide_caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE HISTORIAL Y FEEDBACK DE APROBACIÓN
CREATE TABLE IF NOT EXISTS public.approval_feedback (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'approved', 'rejected', 'comment'
    rejection_reason TEXT,
    client_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON public.posts(client_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON public.posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON public.users(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_token ON public.clients(access_token);

-- ==========================================================
-- POLÍTICAS DE ACCESO ROW LEVEL SECURITY (RLS)
-- Permitir lectura y escritura con la clave anónima/pública (anon/publishable key)
-- ==========================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública/anon
CREATE POLICY "Permitir lectura publica roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica post_media" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica feedback" ON public.approval_feedback FOR SELECT USING (true);

-- Políticas de escritura (INSERT, UPDATE, DELETE) para anon
CREATE POLICY "Permitir insercion clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion clients" ON public.clients FOR UPDATE USING (true);

CREATE POLICY "Permitir insercion users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminacion users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Permitir insercion posts" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion posts" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminacion posts" ON public.posts FOR DELETE USING (true);

CREATE POLICY "Permitir insercion post_media" ON public.post_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion post_media" ON public.post_media FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminacion post_media" ON public.post_media FOR DELETE USING (true);

CREATE POLICY "Permitir insercion feedback" ON public.approval_feedback FOR INSERT WITH CHECK (true);

-- ==========================================================
-- STORAGE BUCKET PARA VIDEOS REELS E IMÁGENES
-- ==========================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts-media', 'posts-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Permitir subir archivos multimedia" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'posts-media');

CREATE POLICY "Permitir ver archivos multimedia publicos" ON storage.objects 
FOR SELECT USING (bucket_id = 'posts-media');

CREATE POLICY "Permitir actualizar archivos multimedia" ON storage.objects 
FOR UPDATE USING (bucket_id = 'posts-media');

-- ==========================================================
-- DATOS SEMILLA INICIALES (SEED DATA)
-- ==========================================================

-- 1. Roles
INSERT INTO public.roles (id, name, label, description) OVERRIDING SYSTEM VALUE VALUES
(1, 'admin', 'Administrador de Agencia', 'Acceso total a clientes y configuración'),
(2, 'editor', 'Diseñador / Content Creator', 'Creación y programación de posts y reels'),
(3, 'client_approver', 'Aprobador de Marca (Cliente)', 'Revisión y aprobación de publicaciones de su marca')
ON CONFLICT (id) DO NOTHING;

-- 2. Clientes (Clientes Reales y Prospectos con Metas de Posts y Reels)
INSERT INTO public.clients (id, name, client_type, brand_color, logo_text, access_token, contact_email, contact_phone, secondary_phone, website_url, description, notes, target_posts_count, target_reels_count) OVERRIDING SYSTEM VALUE VALUES
(1, 'Lumina Dental Studio', 'active_client', '#2563eb', 'LD', 'tok_lumina_9921', 'contacto@luminadental.com', '+52 55 9988 7766', '+52 55 4433 2211', 'https://luminadental.com', 'Clínica de estética dental y diseño de sonrisa', 'Plan mensual de 12 posts + 4 reels. Aprobador directo: Dra. Marcela.', 12, 4),
(2, 'Aura Gourmet Bistro', 'active_client', '#ea580c', 'AG', 'tok_aura_4481', 'gerencia@aurabistro.com', '+52 55 6677 8899', '+52 55 7788 9900', 'https://aurabistro.com', 'Restaurante de autor y coctelería premium', 'Enfoque en fotografía gastronómica y reels de cocina.', 10, 6),
(3, 'UrbanFit Athletics', 'active_client', '#10b981', 'UF', 'tok_urbanfit_7732', 'marketing@urbanfit.io', '+52 55 1122 3344', '+52 55 5566 7788', 'https://urbanfit.io', 'Cadena de gimnasios y ropa deportiva', 'Contrato trimestral con campaña de captación de socios.', 16, 8),
(4, 'Apex Real Estate Boutique', 'prospect', '#8b5cf6', 'AR', 'tok_apex_3319', 'ventas@apexrealestate.mx', '+52 55 8899 0011', '+52 55 9900 1122', 'https://apexrealestate.mx', 'Desarrollo inmobiliario de lujo y preventas', 'Propuesta de reels de propiedades enviada; reunión de cierre el jueves.', 8, 4),
(5, 'Komorebi Matcha Bar', 'prospect', '#059669', 'KM', 'tok_komorebi_6642', 'hola@komorebimatcha.com', '+52 55 2233 4455', '+52 55 3344 5566', 'https://komorebimatcha.com', 'Cafetería de té matcha ceremonial y repostería', 'Interesados en paquete básico de reels y TikToks.', 6, 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Usuarios (Agencia y Clientes con Asignación de Cliente para Aislamiento)
-- NOTA: Si client_id es NULL, el usuario tiene Acceso Total (Super Admin)
-- Si client_id tiene un ID asignado, el usuario SOLO puede ver los contenidos de esa marca
INSERT INTO public.users (id, role_id, client_id, category, full_name, email, position, phone, avatar_color) OVERRIDING SYSTEM VALUE VALUES
(1, 1, NULL, 'agency', 'Carlos Reyes', 'carlos@socialflow.agency', 'Director General & Super Admin', '+52 55 1234 5678', '#2563eb'),
(2, 2, 1, 'agency', 'Sofía Morales', 'sofia@socialflow.agency', 'Content Creator & Reels Designer', '+52 55 8765 4321', '#7c3aed'),
(3, 2, 2, 'agency', 'Alejandro Silva', 'alejandro@socialflow.agency', 'Community Manager & Copywriter', '+52 55 3344 5566', '#0891b2'),
(4, 3, 1, 'client', 'Dra. Marcela Gómez', 'marcela@luminadental.com', 'Directora Médica & Fundadora', '+52 55 9988 7766', '#2563eb'),
(5, 3, 1, 'client', 'Dr. Javier Soto', 'javier@luminadental.com', 'Coordinador de Estética Dental', '+52 55 4433 2211', '#3b82f6'),
(6, 3, 2, 'client', 'Chef Rodrigo Valenzuela', 'rodrigo@aurabistro.com', 'Chef Ejecutivo & Propietario', '+52 55 6677 8899', '#ea580c'),
(7, 3, 3, 'client', 'Valeria Martínez', 'valeria@urbanfit.io', 'Gerente de Marketing & Alianzas', '+52 55 1122 3344', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- 4. Posts de Ejemplo
INSERT INTO public.posts (id, client_id, created_by_user_id, title, caption, hashtags, platform, post_type, status, observation_internal, scheduled_date, scheduled_time) OVERRIDING SYSTEM VALUE VALUES
(101, 1, 1, 'Reel: Transformación de Sonrisa en 3 Pasos', '✨ ¿Sabías que una sonrisa armónica puede cambiar completamente la confianza en ti mismo? \n\nEn este video te mostramos el antes y después del diseño de sonrisa con carillas de porcelana ultradelgadas.\n\n📍 Agenda tu valoración en el link de la bio.', '#DisenoDeSonrisa #EsteticaDental #LuminaDental #TransformacionDental', 'instagram', 'reel', 'pending_approval', 'Por favor revisar el audio y confirmar si la doctora prefiere que el llamado a la acción sea por WhatsApp directo.', '2026-10-06', '18:30:00'),
(102, 1, 1, 'Post Carrusel: 5 Mitos del Blanqueamiento', '🦷 ¿El blanqueamiento desgasta el esmalte? ¡Desmentimos los mitos más comunes!\n\nDesliza para conocer la verdad y cuidar tu salud oral de forma segura.', '#SaludDental #MitosDentales #BlanqueamientoSeguro', 'instagram', 'carousel', 'approved', 'Diseño ajustado según la paleta azul y blanca corporativa.', '2026-10-08', '12:00:00'),
(103, 1, 1, 'Reel: Detrás de Cámaras en Laboratorio 3D', '🔬 Así creamos la precisión de cada carilla dental con nuestra tecnología de escaneo e impresión 3D.', '#TecnologiaDental #Innovacion #SonrisasPerfectas', 'tiktok', 'reel', 'changes_requested', 'El cliente solicitó cambiar el fondo musical y añadir el logo al inicio.', '2026-10-12', '17:00:00'),
(201, 2, 1, 'Reel: Preparación del Cóctel Insignia Smoky Bourbon', '🍸 El arte de la mixología en su máxima expresión. Déjate cautivar por las notas ahumadas de roble y naranja caramelizada.\n\nVen a vivir la experiencia Aura este fin de semana.', '#Mixologia #AuraBistro #Cocktails #FineDining', 'instagram', 'reel', 'pending_approval', 'Revisar si el precio de la promoción debe incluirse o dejarse solo en historias.', '2026-10-07', '19:00:00'),
(202, 2, 1, 'Post Fotografía: Nuevo Menú Degustación de Otoño', '🍂 Presentamos nuestro Risotto de Trufa Negra y Hongos Silvestres. Una explosión de sabores creada por el Chef Rodrigo.', '#Gastronomia #ChefSpecial #BistroGourmet', 'facebook', 'image_post', 'approved', 'Foto profesional con iluminación cálida de restaurante.', '2026-10-10', '13:30:00')
ON CONFLICT (id) DO NOTHING;

-- 5. Multimedia de los Posts
INSERT INTO public.post_media (id, post_id, media_type, file_url, thumbnail_url, aspect_ratio, order_index, slide_caption) OVERRIDING SYSTEM VALUE VALUES
(1, 101, 'video', 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80', '9:16', 1, NULL),
(2, 102, 'image', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80', '1:1', 1, 'Diapositiva 1: Portada - 5 Mitos del Blanqueamiento'),
(21, 102, 'image', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80', '1:1', 2, 'Diapositiva 2: Mito 1 - ¿Desgasta el esmalte dental?'),
(22, 102, 'image', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80', '1:1', 3, 'Diapositiva 3: Mito 2 - Pastas caseras de carbón activado'),
(23, 102, 'image', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80', '1:1', 4, 'Diapositiva 4: Cuidado profesional y valoración previa'),
(3, 103, 'video', 'https://media.w3.org/2010/05/sintel/trailer.mp4', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80', '9:16', 1, NULL),
(4, 201, 'video', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80', '9:16', 1, NULL),
(5, 202, 'image', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', '4:5', 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. Feedback de Ejemplo
INSERT INTO public.approval_feedback (id, post_id, user_id, action_type, rejection_reason, client_notes) OVERRIDING SYSTEM VALUE VALUES
(1, 103, 2, 'rejected', 'Ajuste en texto y logo', 'Por favor cambiar la tipografía del subtítulo en el segundo 0:04 y aumentar el tamaño de nuestro logo.')
ON CONFLICT (id) DO NOTHING;
