-- ==========================================================
-- SISTEMA DE CALENDARIO DE POSTEOS Y APROBACIÓN DE CONTENIDO
-- Esquema de Base de Datos Relacional (PostgreSQL / MySQL compatible)
-- ==========================================================

-- 1. TABLA DE ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,       -- 'admin', 'editor', 'client'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CLIENTES (Aislamiento de Cuentas y Sectorización: Clientes Reales vs Prospectos)
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    client_type VARCHAR(30) NOT NULL DEFAULT 'active_client', -- 'active_client' (Cliente Real) o 'prospect' (Prospecto / Lead)
    brand_color VARCHAR(20) DEFAULT '#2563eb',
    logo_text VARCHAR(10),
    access_token VARCHAR(64) NOT NULL UNIQUE, -- Token para enlace público/privado de aprobación
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),                -- Teléfono Principal
    secondary_phone VARCHAR(50),              -- Teléfono Secundario / WhatsApp Alternativo
    website_url TEXT,                         -- Sitio Web o Perfil Social
    description TEXT,                         -- Giro / Descripción del negocio
    notes TEXT,                               -- Notas u observaciones comerciales internas
    target_posts_count INT DEFAULT 0,         -- Meta acordada mensual de Posts / Carruseles
    target_reels_count INT DEFAULT 0,         -- Meta acordada mensual de Videos Reels
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABLA DE USUARIOS (Asignación de Clientes y Aislamiento de Cuentas)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    client_id INT NULL,                      -- NULL si es Super Admin (Acceso Total a todas las marcas); ID del cliente si tiene acceso exclusivo asignado (otros clientes no visibles)
    category VARCHAR(20) NOT NULL DEFAULT 'agency', -- 'agency' (Modo Agencia) o 'client' (Vista Cliente)
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    position VARCHAR(150),                   -- Cargo o función (ej: Directora Médica, Content Lead)
    phone VARCHAR(50),                       -- Teléfono / WhatsApp de contacto
    avatar_color VARCHAR(20) DEFAULT '#2563eb',
    password_hash VARCHAR(255) NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. TABLA DE PUBLICACIONES (Posts / Reels)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,                  -- Relación directa para garantizar aislamiento
    created_by_user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    caption TEXT,                            -- Copy / Pie de foto
    hashtags TEXT,
    platform VARCHAR(50) NOT NULL,           -- 'instagram', 'tiktok', 'facebook', 'linkedin', 'youtube'
    post_type VARCHAR(50) NOT NULL,          -- 'reel', 'image_post', 'carousel', 'story'
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval', -- 'draft', 'pending_approval', 'approved', 'changes_requested'
    observation_internal TEXT,               -- Observación/Nota de la agencia para el cliente
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NULL,                -- Opcional / No requerido
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 5. TABLA DE ARCHIVOS MULTIMEDIA (Soporte Videos Reels e Imágenes)
CREATE TABLE IF NOT EXISTS post_media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    media_type VARCHAR(50) NOT NULL,         -- 'video', 'image'
    file_url TEXT NOT NULL,                  -- URL en Supabase/S3/Cloudinary
    thumbnail_url TEXT,                      -- Portada / Miniatura del reel
    aspect_ratio VARCHAR(10) DEFAULT '9:16', -- '9:16' (Reels/Stories), '1:1' (Cuadrado), '4:5' (Retrato)
    order_index INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 6. TABLA DE FEEDBACK Y AUDITORÍA DE APROBACIÓN
CREATE TABLE IF NOT EXISTS approval_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NULL,                        -- Usuario que aprobó/rechazó (o NULL si fue por enlace token)
    action_type VARCHAR(30) NOT NULL,        -- 'approved', 'rejected', 'comment'
    rejection_reason TEXT,                   -- Motivo obligatorio si fue rechazado
    client_notes TEXT,                       -- Comentarios extra del cliente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================================
-- ÍNDICES PARA ALTA EFICIENCIA Y CONSULTAS AISLADAS
-- ==========================================================
CREATE INDEX idx_posts_client ON posts(client_id);
CREATE INDEX idx_posts_scheduled_date ON posts(scheduled_date);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_clients_access_token ON clients(access_token);
