/**
 * ==========================================================
 * CAPA DE DATOS Y SIMULACIÓN DE CONSULTAS SQL
 * Modela directamente las tablas relacionales:
 * clients, users, posts, post_media, approval_feedback
 * ==========================================================
 */

const STORAGE_KEY_DB = 'social_calendar_sql_db';

// Datos iniciales de prueba (Seed Data)
const INITIAL_DB_STATE = {
    // 1. Tabla 'clients' (Aislamiento de Clientes y Sectorización: Clientes Reales vs Prospectos)
    clients: [
        {
            id: 1,
            name: "Lumina Dental Studio",
            client_type: "active_client", // 'active_client' (Cliente Real) o 'prospect' (Prospecto / Lead)
            brand_color: "#2563eb",
            logo_text: "LD",
            access_token: "tok_lumina_9921",
            contact_email: "contacto@luminadental.com",
            contact_phone: "+52 55 9988 7766",
            secondary_phone: "+52 55 4433 2211",
            website_url: "https://luminadental.com",
            description: "Clínica de estética dental y diseño de sonrisa",
            notes: "Plan mensual de 12 posts + 4 reels. Aprobador directo: Dra. Marcela.",
            target_posts_count: 12,
            target_reels_count: 4
        },
        {
            id: 2,
            name: "Aura Gourmet Bistro",
            client_type: "active_client",
            brand_color: "#ea580c",
            logo_text: "AG",
            access_token: "tok_aura_4481",
            contact_email: "gerencia@aurabistro.com",
            contact_phone: "+52 55 6677 8899",
            secondary_phone: "+52 55 7788 9900",
            website_url: "https://aurabistro.com",
            description: "Restaurante de autor y coctelería premium",
            notes: "Enfoque en fotografía gastronómica y reels de cocina.",
            target_posts_count: 10,
            target_reels_count: 6
        },
        {
            id: 3,
            name: "UrbanFit Athletics",
            client_type: "active_client",
            brand_color: "#10b981",
            logo_text: "UF",
            access_token: "tok_urbanfit_7732",
            contact_email: "marketing@urbanfit.io",
            contact_phone: "+52 55 1122 3344",
            secondary_phone: "+52 55 5566 7788",
            website_url: "https://urbanfit.io",
            description: "Cadena de gimnasios y ropa deportiva",
            notes: "Contrato trimestral con campaña de captación de socios.",
            target_posts_count: 16,
            target_reels_count: 8
        },
        {
            id: 4,
            name: "Apex Real Estate Boutique",
            client_type: "prospect",
            brand_color: "#8b5cf6",
            logo_text: "AR",
            access_token: "tok_apex_3319",
            contact_email: "ventas@apexrealestate.mx",
            contact_phone: "+52 55 8899 0011",
            secondary_phone: "+52 55 9900 1122",
            website_url: "https://apexrealestate.mx",
            description: "Desarrollo inmobiliario de lujo y preventas",
            notes: "Propuesta de reels de propiedades enviada; reunión de cierre el jueves.",
            target_posts_count: 8,
            target_reels_count: 4
        },
        {
            id: 5,
            name: "Komorebi Matcha Bar",
            client_type: "prospect",
            brand_color: "#059669",
            logo_text: "KM",
            access_token: "tok_komorebi_6642",
            contact_email: "hola@komorebimatcha.com",
            contact_phone: "+52 55 2233 4455",
            secondary_phone: "+52 55 3344 5566",
            website_url: "https://komorebimatcha.com",
            description: "Cafetería de té matcha ceremonial y repostería",
            notes: "Interesados en paquete básico de reels y TikToks.",
            target_posts_count: 6,
            target_reels_count: 4
        }
    ],

    // 2. Tabla 'roles'
    roles: [
        { id: 1, name: "admin", label: "Administrador de Agencia", description: "Acceso total a clientes y configuración" },
        { id: 2, name: "editor", label: "Diseñador / Content Creator", description: "Creación y programación de posts y reels" },
        { id: 3, name: "client_approver", label: "Aprobador de Marca (Cliente)", description: "Revisión y aprobación de publicaciones de su marca" }
    ],

    // 3. Tabla 'users' (Usuarios Modo Agencia y Vista Cliente)
    users: [
        // CATEGORÍA 1: MODO AGENCIA (Equipo Interno)
        {
            id: 1,
            role_id: 1,
            client_id: null,
            full_name: "Carlos Reyes",
            email: "carlos@socialflow.agency",
            position: "Director General & Admin",
            category: "agency", // 'agency' o 'client'
            avatar_color: "#2563eb",
            phone: "+52 55 1234 5678",
            is_active: true,
            created_at: "2026-09-15"
        },
        {
            id: 2,
            role_id: 2,
            client_id: 1, // Asignada a Lumina Dental Studio
            full_name: "Sofía Morales",
            email: "sofia@socialflow.agency",
            position: "Content Creator & Reels Designer",
            category: "agency",
            avatar_color: "#7c3aed",
            phone: "+52 55 8765 4321",
            is_active: true,
            created_at: "2026-09-20"
        },
        {
            id: 3,
            role_id: 2,
            client_id: 2, // Asignado a Aura Gourmet Bistro
            full_name: "Alejandro Silva",
            email: "alejandro@socialflow.agency",
            position: "Community Manager & Copywriter",
            category: "agency",
            avatar_color: "#0891b2",
            phone: "+52 55 3344 5566",
            is_active: true,
            created_at: "2026-09-22"
        },

        // CATEGORÍA 2: VISTA CLIENTE (Aprobadores por Marca)
        {
            id: 4,
            role_id: 3,
            client_id: 1, // Lumina Dental
            full_name: "Dra. Marcela Gómez",
            email: "marcela@luminadental.com",
            position: "Directora Médica & Fundadora",
            category: "client",
            avatar_color: "#2563eb",
            phone: "+52 55 9988 7766",
            is_active: true,
            created_at: "2026-10-01"
        },
        {
            id: 5,
            role_id: 3,
            client_id: 1, // Lumina Dental
            full_name: "Dr. Javier Soto",
            email: "javier@luminadental.com",
            position: "Coordinador de Estética Dental",
            category: "client",
            avatar_color: "#3b82f6",
            phone: "+52 55 4433 2211",
            is_active: true,
            created_at: "2026-10-02"
        },
        {
            id: 6,
            role_id: 3,
            client_id: 2, // Aura Gourmet Bistro
            full_name: "Chef Rodrigo Valenzuela",
            email: "rodrigo@aurabistro.com",
            position: "Chef Ejecutivo & Propietario",
            category: "client",
            avatar_color: "#ea580c",
            phone: "+52 55 6677 8899",
            is_active: true,
            created_at: "2026-10-01"
        },
        {
            id: 7,
            role_id: 3,
            client_id: 3, // UrbanFit Athletics
            full_name: "Valeria Martínez",
            email: "valeria@urbanfit.io",
            position: "Gerente de Marketing & Alianzas",
            category: "client",
            avatar_color: "#10b981",
            phone: "+52 55 1122 3344",
            is_active: true,
            created_at: "2026-10-03"
        }
    ],

    // 4. Tabla 'posts'
    posts: [
        {
            id: 101,
            client_id: 1,
            created_by_user_id: 1,
            title: "Reel: Transformación de Sonrisa en 3 Pasos",
            caption: "✨ ¿Sabías que una sonrisa armónica puede cambiar completamente la confianza en ti mismo? \n\nEn este video te mostramos el antes y después del diseño de sonrisa con carillas de porcelana ultradelgadas.\n\n📍 Agenda tu valoración en el link de la bio.",
            hashtags: "#DisenoDeSonrisa #EsteticaDental #LuminaDental #TransformacionDental",
            platform: "instagram",
            post_type: "reel",
            status: "pending_approval",
            observation_internal: "Por favor revisar el audio y confirmar si la doctora prefiere que el llamado a la acción sea por WhatsApp directo.",
            scheduled_date: "2026-10-06",
            scheduled_time: "18:30:00",
            created_at: "2026-10-01 10:00:00"
        },
        {
            id: 102,
            client_id: 1,
            created_by_user_id: 1,
            title: "Post Carrusel: 5 Mitos del Blanqueamiento",
            caption: "🦷 ¿El blanqueamiento desgasta el esmalte? ¡Desmentimos los mitos más comunes!\n\nDesliza para conocer la verdad y cuidar tu salud oral de forma segura.",
            hashtags: "#SaludDental #MitosDentales #BlanqueamientoSeguro",
            platform: "instagram",
            post_type: "carousel",
            status: "approved",
            observation_internal: "Diseño ajustado según la paleta azul y blanca corporativa.",
            scheduled_date: "2026-10-08",
            scheduled_time: "12:00:00",
            created_at: "2026-10-01 11:30:00"
        },
        {
            id: 103,
            client_id: 1,
            created_by_user_id: 1,
            title: "TikTok Reel: Tip Rápido con Hilo Dental",
            caption: "El error #1 que cometes al usar hilo dental y cómo solucionarlo en 10 segundos. 🦷",
            hashtags: "#DentistaTikTok #TipsDentales #HigieneOral",
            platform: "tiktok",
            post_type: "reel",
            status: "changes_requested",
            observation_internal: "Video dinámico grabado en el consultorio principal.",
            scheduled_date: "2026-10-12",
            scheduled_time: "20:00:00",
            created_at: "2026-10-02 09:00:00"
        },
        {
            id: 201,
            client_id: 2,
            created_by_user_id: 1,
            title: "Reel: Preparación del Cóctel Insignia 'Smoky Bourbon'",
            caption: "🍸 El arte de la mixología en su máxima expresión. Déjate cautivar por las notas ahumadas de roble y naranja caramelizada.\n\nVen a vivir la experiencia Aura este fin de semana.",
            hashtags: "#Mixologia #AuraBistro #Cocktails #FineDining",
            platform: "instagram",
            post_type: "reel",
            status: "pending_approval",
            observation_internal: "Revisar si el precio de la promoción debe incluirse o dejarse solo en historias.",
            scheduled_date: "2026-10-07",
            scheduled_time: "19:00:00",
            created_at: "2026-10-02 15:00:00"
        },
        {
            id: 202,
            client_id: 2,
            created_by_user_id: 1,
            title: "Post Fotografía: Nuevo Menú Degustación de Otoño",
            caption: "🍂 Presentamos nuestro Risotto de Trufa Negra y Hongos Silvestres. Una explosión de sabores creada por el Chef Rodrigo.",
            hashtags: "#Gastronomia #ChefSpecial #BistroGourmet",
            platform: "facebook",
            post_type: "image_post",
            status: "approved",
            observation_internal: "Foto profesional con iluminación cálida de restaurante.",
            scheduled_date: "2026-10-10",
            scheduled_time: "13:30:00",
            created_at: "2026-10-02 16:20:00"
        }
    ],

    // 4. Tabla 'post_media' (Soporte Videos Reels, Imágenes y Carruseles)
    post_media: [
        {
            id: 1,
            post_id: 101,
            media_type: "video",
            file_url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "9:16",
            order_index: 1
        },
        // Diapositivas para Carrusel Post #102
        {
            id: 2,
            post_id: 102,
            media_type: "image",
            file_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
            thumbnail_url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "1:1",
            order_index: 1,
            slide_caption: "Diapositiva 1: Portada - 5 Mitos del Blanqueamiento"
        },
        {
            id: 21,
            post_id: 102,
            media_type: "image",
            file_url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
            thumbnail_url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "1:1",
            order_index: 2,
            slide_caption: "Diapositiva 2: Mito 1 - ¿Desgasta el esmalte dental?"
        },
        {
            id: 22,
            post_id: 102,
            media_type: "image",
            file_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
            thumbnail_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "1:1",
            order_index: 3,
            slide_caption: "Diapositiva 3: Mito 2 - Pastas caseras de carbón activado"
        },
        {
            id: 23,
            post_id: 102,
            media_type: "image",
            file_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
            thumbnail_url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "1:1",
            order_index: 4,
            slide_caption: "Diapositiva 4: Cuidado profesional y valoración previa"
        },
        {
            id: 3,
            post_id: 103,
            media_type: "video",
            file_url: "https://media.w3.org/2010/05/sintel/trailer.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "9:16",
            order_index: 1
        },
        {
            id: 4,
            post_id: 201,
            media_type: "video",
            file_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "9:16",
            order_index: 1
        },
        {
            id: 5,
            post_id: 202,
            media_type: "image",
            file_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
            thumbnail_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
            aspect_ratio: "4:5",
            order_index: 1
        }
    ],

    // 5. Tabla 'approval_feedback' (Historial de Aprobaciones y Rechazos)
    approval_feedback: [
        {
            id: 1,
            post_id: 103,
            user_id: 2,
            action_type: "rejected",
            rejection_reason: "Ajuste en texto y logo",
            client_notes: "Por favor cambiar la tipografía del subtítulo en el segundo 0:04 y aumentar el tamaño de nuestro logo.",
            created_at: "2026-10-02 18:45:00"
        }
    ]
};

/**
 * SERVICIO SQL SIMULADO (SQL Store Manager con Soporte IndexedDB Local)
 * Permite almacenar videos reels pesados e imágenes sin límite de cuota (QuotaExceededError)
 */
class SQLDataStore {
    constructor() {
        this.dbName = 'SocialFlowLocalDB';
        this.dbVersion = 1;
        this.db = null;
        this.cachedState = null;
        this.isCloudSynced = false;
        this.init();
    }

    init() {
        // Carga inmediata en memoria para que no haya parpadeo en la interfaz
        this.cachedState = this.loadInitialFallback();

        // Conectar a IndexedDB (Motor de base de datos local del navegador con gigabytes de capacidad)
        this.openIndexedDB().then(async (db) => {
            this.db = db;
            const stored = await this.readFromIndexedDB('database_state');
            if (stored && stored.posts && stored.posts.length > 0) {
                // Migración suave: asignar clientes a usuarios de prueba si aún tenían null
                if (stored.users) {
                    let updated = false;
                    stored.users.forEach(u => {
                        if (u.id === 2 && u.client_id === null) { u.client_id = 1; updated = true; }
                        if (u.id === 3 && u.client_id === null) { u.client_id = 2; updated = true; }
                    });
                    if (updated) {
                        await this.writeToIndexedDB('database_state', stored);
                    }
                }
                this.cachedState = stored;
                if (window.uiRenderer) {
                    window.uiRenderer.renderAll();
                }
            } else {
                await this.writeToIndexedDB('database_state', this.cachedState);
            }

            // Iniciar sincronización con Supabase Cloud
            this.initSupabaseSync();
        }).catch((err) => {
            console.warn('IndexedDB no disponible, operando en memoria local:', err);
            this.initSupabaseSync();
        });
    }

    // Sincronización bidireccional con Supabase PostgreSQL
    async initSupabaseSync() {
        if (!window.supabaseService) return;

        window.supabaseService.onStatusChange(async (status) => {
            if (status.hasCloudTables) {
                await this.pullFromSupabase();
                this.subscribeToRealtime();
            }
        });
    }

    // Descargar datos frescos de Supabase
    async pullFromSupabase() {
        const client = window.supabaseService?.client;
        if (!client) return;

        try {
            console.log('🔄 Sincronizando datos desde Supabase...');
            const [
                { data: clients },
                { data: roles },
                { data: users },
                { data: posts },
                { data: post_media },
                { data: feedback }
            ] = await Promise.all([
                client.from('clients').select('*'),
                client.from('roles').select('*'),
                client.from('users').select('*'),
                client.from('posts').select('*'),
                client.from('post_media').select('*'),
                client.from('approval_feedback').select('*')
            ]);

            if (clients && clients.length > 0) {
                this.cachedState = {
                    clients: clients || this.cachedState.clients,
                    roles: roles || this.cachedState.roles,
                    users: users || this.cachedState.users,
                    posts: posts || this.cachedState.posts,
                    post_media: post_media || this.cachedState.post_media,
                    approval_feedback: feedback || this.cachedState.approval_feedback
                };

                this.isCloudSynced = true;
                await this.writeToIndexedDB('database_state', this.cachedState);
                if (window.uiRenderer) {
                    window.uiRenderer.renderAll();
                    window.uiRenderer.showToast('Datos sincronizados con la nube de Supabase', 'cloud');
                }
            }
        } catch (err) {
            console.warn('No se pudo completar pullFromSupabase:', err);
        }
    }

    // Suscripción Realtime a cambios en Supabase
    subscribeToRealtime() {
        const client = window.supabaseService?.client;
        if (!client || this.realtimeSubscribed) return;

        try {
            this.realtimeSubscribed = true;
            client.channel('public:posts')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
                    this.pullFromSupabase();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'approval_feedback' }, () => {
                    this.pullFromSupabase();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                    this.pullFromSupabase();
                })
                .subscribe();
            console.log('⚡ Supabase Realtime Channel suscrito activamente.');
        } catch (e) {
            console.warn('Error al suscribir canal realtime:', e);
        }
    }

    // Inicializar IndexedDB en el navegador
    openIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                return reject(new Error('IndexedDB no soportado en este navegador'));
            }
            const request = window.indexedDB.open(this.dbName, this.dbVersion);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('store')) {
                    db.createObjectStore('store', { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Leer estado completo desde IndexedDB
    readFromIndexedDB(key) {
        return new Promise((resolve) => {
            if (!this.db) return resolve(null);
            try {
                const tx = this.db.transaction('store', 'readonly');
                const store = tx.objectStore('store');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result ? req.result.data : null);
                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    }

    // Guardar estado completo en IndexedDB (soporta cientos de Megabytes / Gigabytes)
    writeToIndexedDB(key, data) {
        return new Promise((resolve) => {
            if (!this.db) return resolve(false);
            try {
                const tx = this.db.transaction('store', 'readwrite');
                const store = tx.objectStore('store');
                store.put({ id: key, data: data, updatedAt: Date.now() });
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }

    loadInitialFallback() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_DB);
            if (raw) {
                const parsed = JSON.parse(raw);
                const hasBrokenUrls = raw.includes('commondatastorage') || raw.includes('assets.mixkit.co');
                if (parsed && parsed.posts && parsed.posts.length > 0 && !hasBrokenUrls) {
                    if (!parsed.users || parsed.users.length < 5) {
                        parsed.users = INITIAL_DB_STATE.users;
                        parsed.roles = INITIAL_DB_STATE.roles;
                    }
                    return parsed;
                }
            }
        } catch (e) {
            // Si el localStorage estaba corrupto por superar la cuota, lo limpiamos
            try { localStorage.removeItem(STORAGE_KEY_DB); } catch (err) {}
        }
        return JSON.parse(JSON.stringify(INITIAL_DB_STATE));
    }

    getState() {
        return this.cachedState || INITIAL_DB_STATE;
    }

    saveState(state) {
        this.cachedState = state;

        // 1. Guardar en IndexedDB (Persistencia principal ilimitada)
        this.writeToIndexedDB('database_state', state);

        // 2. Guardar versión ligera en localStorage con protección try/catch para no lanzar QuotaExceededError
        try {
            const lightState = {
                ...state,
                post_media: state.post_media.map(m => ({
                    ...m,
                    // Si el archivo es un base64 grande, no saturar el límite de 5MB de localStorage
                    file_url: (m.file_url && m.file_url.length > 5000) ? 'stored_in_indexeddb' : m.file_url,
                    thumbnail_url: (m.thumbnail_url && m.thumbnail_url.length > 5000) ? 'stored_in_indexeddb' : m.thumbnail_url
                }))
            };
            localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(lightState));
        } catch (e) {
            // Ignorar límite de localStorage; IndexedDB almacena el archivo completo localmente
        }
    }

    // ==========================================================
    // MÉTODOS EQUIVALENTES A CONSULTAS SQL
    // ==========================================================

    // Retorna TODOS los clientes sin filtrar (para selectores de administración y configuración)
    getAllClients() {
        const state = this.getState();
        return state.clients || [];
    }

    // SELECT * FROM clients WHERE (client_type = ?) AND (search...);
    // Aplica aislamiento de cliente si forceAll = false y el usuario actual tiene cliente asignado
    getClients(filterType = 'all', searchQuery = '', forceAll = false) {
        const state = this.getState();
        let clients = state.clients || [];

        // Aislamiento: si el usuario no es Super Admin y tiene marca asignada, restringir lista
        if (!forceAll && window.authManager) {
            const currentUser = window.authManager.getCurrentUser();
            if (currentUser && currentUser.client_id) {
                clients = clients.filter(c => c.id === parseInt(currentUser.client_id));
            }
        }

        // Filtrar por sector / categoría: 'all', 'active_client' (Cliente Real), 'prospect' (Prospecto)
        if (filterType && filterType !== 'all') {
            clients = clients.filter(c => (c.client_type || 'active_client') === filterType);
        }

        // Búsqueda por texto (nombre, giro, correo, teléfono, web o notas)
        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            clients = clients.filter(c => 
                (c.name && c.name.toLowerCase().includes(q)) ||
                (c.description && c.description.toLowerCase().includes(q)) ||
                (c.contact_email && c.contact_email.toLowerCase().includes(q)) ||
                (c.contact_phone && c.contact_phone.toLowerCase().includes(q)) ||
                (c.secondary_phone && c.secondary_phone.toLowerCase().includes(q)) ||
                (c.website_url && c.website_url.toLowerCase().includes(q)) ||
                (c.notes && c.notes.toLowerCase().includes(q))
            );
        }

        return clients;
    }

    // SELECT * FROM clients WHERE id = ?;
    getClientById(clientId) {
        const state = this.getState();
        return (state.clients || []).find(c => c.id === parseInt(clientId)) || null;
    }

    // SELECT * FROM clients WHERE access_token = ?;
    getClientByToken(token) {
        const state = this.getState();
        return (state.clients || []).find(c => c.access_token === token) || null;
    }

    // SELECT p.*, m.file_url, m.thumbnail_url, m.media_type, m.aspect_ratio 
    // FROM posts p 
    // LEFT JOIN post_media m ON p.id = m.post_id 
    // WHERE p.client_id = ? ORDER BY p.scheduled_date ASC;
    getPostsByClient(clientId, filterStatus = 'all', filterType = 'all', searchQuery = '') {
        const state = this.getState();
        let targetClientId = parseInt(clientId);

        // Control estricto de visibilidad aislada: si el usuario actual tiene asignado un cliente, forzar ese cliente
        if (window.authManager) {
            const currentUser = window.authManager.getCurrentUser();
            if (currentUser && currentUser.client_id) {
                targetClientId = parseInt(currentUser.client_id);
            }
        }

        let posts = state.posts.filter(p => p.client_id === targetClientId);

        if (filterStatus && filterStatus !== 'all') {
            posts = posts.filter(p => p.status === filterStatus);
        }

        if (filterType && filterType !== 'all') {
            posts = posts.filter(p => p.post_type === filterType);
        }

        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            posts = posts.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.caption.toLowerCase().includes(q) ||
                p.hashtags.toLowerCase().includes(q)
            );
        }

        // Simular JOIN con post_media (Retornar todos los media_items y el principal)
        return posts.map(post => {
            const mediaItems = state.post_media
                .filter(m => m.post_id === post.id)
                .sort((a, b) => (a.order_index || 1) - (b.order_index || 1));
            
            const primaryMedia = mediaItems[0] || null;
            const feedback = state.approval_feedback.filter(f => f.post_id === post.id);
            
            return {
                ...post,
                media: primaryMedia,
                media_items: mediaItems,
                feedback
            };
        }).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
    }

    // SELECT * FROM posts WHERE id = ?;
    getPostDetail(postId) {
        const state = this.getState();
        const post = state.posts.find(p => p.id === parseInt(postId));
        if (!post) return null;

        // Aislamiento: si el usuario actual tiene asignado un cliente exclusivo y el post pertenece a otro cliente, bloquear acceso
        if (window.authManager) {
            const currentUser = window.authManager.getCurrentUser();
            if (currentUser && currentUser.client_id && post.client_id !== parseInt(currentUser.client_id)) {
                console.warn(`[Seguridad Aislamiento] Intento de acceso denegado a publicación #${postId} de otro cliente`);
                return null;
            }
        }

        const mediaItems = state.post_media
            .filter(m => m.post_id === post.id)
            .sort((a, b) => (a.order_index || 1) - (b.order_index || 1));
        
        const primaryMedia = mediaItems[0] || null;
        const feedback = state.approval_feedback.filter(f => f.post_id === post.id);
        const client = state.clients.find(c => c.id === post.client_id) || null;

        return {
            ...post,
            media: primaryMedia,
            media_items: mediaItems,
            feedback,
            client
        };
    }

    // UPDATE posts SET status = 'approved' WHERE id = ?;
    // Helper para replicar escrituras en Supabase en segundo plano
    async syncCloudWrite(table, operation, payload, matchKey = 'id') {
        const client = window.supabaseService?.client;
        if (!client || !window.supabaseService?.hasCloudTables) return;
        try {
            if (operation === 'insert') {
                await client.from(table).insert(payload);
            } else if (operation === 'update') {
                const matchVal = payload[matchKey];
                const cleanPayload = { ...payload };
                delete cleanPayload[matchKey];
                await client.from(table).update(cleanPayload).eq(matchKey, matchVal);
            } else if (operation === 'delete') {
                await client.from(table).delete().eq(matchKey, payload);
            }
        } catch (e) {
            console.warn(`Error en syncCloudWrite (${table} -> ${operation}):`, e);
        }
    }

    // UPDATE posts SET status = 'approved' WHERE id = ?;
    // INSERT INTO approval_feedback (post_id, action_type, client_notes) VALUES (?, 'approved', ?);
    approvePost(postId, clientNotes = '') {
        const state = this.getState();
        const postIndex = state.posts.findIndex(p => p.id === parseInt(postId));
        if (postIndex === -1) return false;

        state.posts[postIndex].status = 'approved';

        const newFeedback = {
            id: Date.now(),
            post_id: parseInt(postId),
            user_id: null,
            action_type: 'approved',
            rejection_reason: null,
            client_notes: clientNotes || 'Aprobado por el cliente',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        state.approval_feedback.push(newFeedback);
        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('posts', 'update', { id: parseInt(postId), status: 'approved' });
        this.syncCloudWrite('approval_feedback', 'insert', {
            post_id: parseInt(postId),
            action_type: 'approved',
            client_notes: clientNotes || 'Aprobado por el cliente'
        });

        return true;
    }

    // UPDATE posts SET status = 'changes_requested' WHERE id = ?;
    // INSERT INTO approval_feedback (post_id, action_type, rejection_reason, client_notes) VALUES (?, 'rejected', ?, ?);
    rejectPost(postId, rejectionReason, clientNotes) {
        const state = this.getState();
        const postIndex = state.posts.findIndex(p => p.id === parseInt(postId));
        if (postIndex === -1) return false;

        state.posts[postIndex].status = 'changes_requested';

        const newFeedback = {
            id: Date.now(),
            post_id: parseInt(postId),
            user_id: null,
            action_type: 'rejected',
            rejection_reason: rejectionReason,
            client_notes: clientNotes,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        state.approval_feedback.push(newFeedback);
        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('posts', 'update', { id: parseInt(postId), status: 'changes_requested' });
        this.syncCloudWrite('approval_feedback', 'insert', {
            post_id: parseInt(postId),
            action_type: 'rejected',
            rejection_reason: rejectionReason,
            client_notes: clientNotes
        });

        return true;
    }

    // INSERT INTO clients (name, client_type, brand_color, logo_text, access_token, contact_email, contact_phone, secondary_phone, website_url, description, notes) VALUES (...);
    createClient(clientData) {
        const state = this.getState();
        const newClientId = Date.now();
        const cleanName = (clientData.name || '').trim();
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomHex = Math.floor(Math.random() * 8999 + 1000);
        const token = `tok_${slug || 'client'}_${randomHex}`;

        const initials = cleanName.split(' ')
            .filter(w => w.length > 0)
            .slice(0, 2)
            .map(w => w[0].toUpperCase())
            .join('') || 'CL';

        const newClient = {
            id: newClientId,
            name: cleanName,
            client_type: clientData.client_type || 'active_client', // 'active_client' o 'prospect'
            brand_color: clientData.brand_color || '#2563eb',
            logo_text: clientData.logo_text || initials,
            access_token: token,
            contact_email: (clientData.contact_email || '').trim(),
            contact_phone: (clientData.contact_phone || '').trim(),
            secondary_phone: (clientData.secondary_phone || '').trim(),
            website_url: (clientData.website_url || '').trim(),
            description: (clientData.description || '').trim(),
            notes: (clientData.notes || '').trim(),
            target_posts_count: parseInt(clientData.target_posts_count || 0),
            target_reels_count: parseInt(clientData.target_reels_count || 0),
            is_active: true,
            created_at: new Date().toISOString().split('T')[0]
        };

        if (!state.clients) state.clients = [];
        state.clients.push(newClient);
        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('clients', 'insert', {
            name: newClient.name,
            client_type: newClient.client_type,
            brand_color: newClient.brand_color,
            logo_text: newClient.logo_text,
            access_token: newClient.access_token,
            contact_email: newClient.contact_email,
            contact_phone: newClient.contact_phone,
            secondary_phone: newClient.secondary_phone,
            website_url: newClient.website_url,
            description: newClient.description,
            notes: newClient.notes,
            target_posts_count: newClient.target_posts_count,
            target_reels_count: newClient.target_reels_count
        });

        return newClient;
    }

    // UPDATE clients SET ... WHERE id = ?;
    updateClient(clientId, clientData) {
        const state = this.getState();
        if (!state.clients) return false;

        const idx = state.clients.findIndex(c => c.id === parseInt(clientId));
        if (idx === -1) return false;

        const cleanName = clientData.name ? clientData.name.trim() : state.clients[idx].name;
        const initials = cleanName.split(' ')
            .filter(w => w.length > 0)
            .slice(0, 2)
            .map(w => w[0].toUpperCase())
            .join('') || 'CL';

        const targetPosts = clientData.target_posts_count !== undefined 
            ? parseInt(clientData.target_posts_count || 0) 
            : (state.clients[idx].target_posts_count || 0);

        const targetReels = clientData.target_reels_count !== undefined 
            ? parseInt(clientData.target_reels_count || 0) 
            : (state.clients[idx].target_reels_count || 0);

        state.clients[idx] = {
            ...state.clients[idx],
            ...clientData,
            id: parseInt(clientId),
            name: cleanName,
            logo_text: clientData.logo_text || initials,
            target_posts_count: targetPosts,
            target_reels_count: targetReels,
            updated_at: new Date().toISOString().split('T')[0]
        };

        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('clients', 'update', {
            id: parseInt(clientId),
            name: state.clients[idx].name,
            client_type: state.clients[idx].client_type,
            brand_color: state.clients[idx].brand_color,
            logo_text: state.clients[idx].logo_text,
            contact_email: state.clients[idx].contact_email,
            contact_phone: state.clients[idx].contact_phone,
            secondary_phone: state.clients[idx].secondary_phone,
            website_url: state.clients[idx].website_url,
            description: state.clients[idx].description,
            notes: state.clients[idx].notes,
            target_posts_count: state.clients[idx].target_posts_count,
            target_reels_count: state.clients[idx].target_reels_count
        });

        return state.clients[idx];
    }

    // Convertir tipo de cliente: de prospecto a cliente activo (o viceversa)
    convertClientType(clientId, newType = 'active_client') {
        return this.updateClient(clientId, { client_type: newType });
    }

    // DELETE FROM clients WHERE id = ?; (y limpiar referencias)
    deleteClient(clientId) {
        const state = this.getState();
        if (!state.clients) return false;

        const targetId = parseInt(clientId);
        const initialLength = state.clients.length;
        state.clients = state.clients.filter(c => c.id !== targetId);

        if (state.clients.length !== initialLength) {
            // Limpiar posts y medios vinculados
            const remainingPosts = (state.posts || []).filter(p => p.client_id !== targetId);
            const deletedPostIds = (state.posts || []).filter(p => p.client_id === targetId).map(p => p.id);
            state.posts = remainingPosts;
            state.post_media = (state.post_media || []).filter(m => !deletedPostIds.includes(m.post_id));

            this.saveState(state);

            // Replicar en Supabase Cloud
            this.syncCloudWrite('clients', 'delete', targetId);
            return true;
        }
        return false;
    }

    // Resumen de métricas de Clientes (Reales vs Prospectos)
    getClientsOverviewStats() {
        const clients = this.getClients('all', '', false);
        const state = this.getState();
        const activeClientId = window.authManager ? window.authManager.getActiveClientId() : null;
        const posts = (window.authManager && window.authManager.hasRestrictedClient())
            ? (state.posts || []).filter(p => p.client_id === activeClientId)
            : (state.posts || []);

        return {
            total: clients.length,
            activeCount: clients.filter(c => (c.client_type || 'active_client') === 'active_client').length,
            prospectCount: clients.filter(c => c.client_type === 'prospect').length,
            postsCount: posts.length
        };
    }

    // INSERT INTO posts (...) VALUES (...);
    // INSERT INTO post_media (...) VALUES (...);
    createPost(postData, mediaInput) {
        const state = this.getState();
        const newPostId = Date.now();

        const newPost = {
            id: newPostId,
            client_id: parseInt(postData.client_id),
            created_by_user_id: 1,
            title: postData.title,
            caption: postData.caption,
            hashtags: postData.hashtags || '',
            platform: postData.platform || 'instagram',
            post_type: postData.post_type || 'image_post',
            status: 'pending_approval',
            observation_internal: postData.observation_internal || '',
            scheduled_date: postData.scheduled_date,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        state.posts.push(newPost);

        const mediaToInsert = [];
        if (Array.isArray(mediaInput)) {
            mediaInput.forEach((m, idx) => {
                const mediaObj = {
                    id: Date.now() + idx + 1,
                    post_id: newPostId,
                    media_type: m.media_type || (postData.post_type === 'reel' ? 'video' : 'image'),
                    file_url: m.file_url,
                    thumbnail_url: m.thumbnail_url || m.file_url,
                    aspect_ratio: m.aspect_ratio || (postData.post_type === 'reel' ? '9:16' : '1:1'),
                    order_index: idx + 1,
                    slide_caption: m.slide_caption || `Diapositiva ${idx + 1}`
                };
                state.post_media.push(mediaObj);
                mediaToInsert.push(mediaObj);
            });
        } else if (mediaInput) {
            const mediaObj = {
                id: Date.now() + 1,
                post_id: newPostId,
                media_type: mediaInput.media_type || (postData.post_type === 'reel' ? 'video' : 'image'),
                file_url: mediaInput.file_url,
                thumbnail_url: mediaInput.thumbnail_url || mediaInput.file_url,
                aspect_ratio: mediaInput.aspect_ratio || (postData.post_type === 'reel' ? '9:16' : '1:1'),
                order_index: 1
            };
            state.post_media.push(mediaObj);
            mediaToInsert.push(mediaObj);
        }

        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('posts', 'insert', {
            client_id: newPost.client_id,
            created_by_user_id: newPost.created_by_user_id,
            title: newPost.title,
            caption: newPost.caption,
            hashtags: newPost.hashtags,
            platform: newPost.platform,
            post_type: newPost.post_type,
            status: newPost.status,
            observation_internal: newPost.observation_internal,
            scheduled_date: newPost.scheduled_date
        });

        return newPostId;
    }

    // DELETE FROM posts WHERE id = ?;
    deletePost(postId) {
        const state = this.getState();
        const targetId = parseInt(postId);
        const postIndex = state.posts.findIndex(p => p.id === targetId);
        if (postIndex === -1) return false;

        const deletedPost = state.posts[postIndex];

        // 1. Eliminar post
        state.posts.splice(postIndex, 1);

        // 2. Eliminar medios multimedia asociados (CASCADE)
        state.post_media = (state.post_media || []).filter(m => m.post_id !== targetId);

        // 3. Eliminar feedback/observaciones asociadas (CASCADE)
        state.approval_feedback = (state.approval_feedback || []).filter(f => f.post_id !== targetId);

        // 4. Guardar estado local (IndexedDB + LocalStorage)
        this.saveState(state);

        // 5. Replicar eliminación en Supabase Cloud
        this.syncCloudWrite('posts', 'delete', targetId);
        this.syncCloudWrite('post_media', 'delete', targetId, 'post_id');
        this.syncCloudWrite('approval_feedback', 'delete', targetId, 'post_id');

        return deletedPost;
    }

    // Obtener estadísticas de posts y cumplimiento de metas/alertas para el cliente
    getClientStats(clientId) {
        const state = this.getState();
        const client = (state.clients || []).find(c => c.id === parseInt(clientId)) || {};
        const clientPosts = (state.posts || []).filter(p => p.client_id === parseInt(clientId));
        
        const totalPosts = clientPosts.length;
        const reelsCount = clientPosts.filter(p => p.post_type === 'reel').length;
        const standardPostsCount = clientPosts.filter(p => p.post_type !== 'reel').length; // posts de imagen / carrusel

        const targetPosts = parseInt(client.target_posts_count || 0);
        const targetReels = parseInt(client.target_reels_count || 0);

        const missingPosts = targetPosts > 0 ? Math.max(0, targetPosts - totalPosts) : 0;
        const missingReels = targetReels > 0 ? Math.max(0, targetReels - reelsCount) : 0;

        const hasPostAlert = targetPosts > 0 && totalPosts < targetPosts;
        const hasReelAlert = targetReels > 0 && reelsCount < targetReels;
        const hasAnyAlert = hasPostAlert || hasReelAlert;

        let alertMessages = [];
        if (hasPostAlert && hasReelAlert) {
            alertMessages.push(`Faltan ${missingPosts} posts y ${missingReels} reels`);
        } else if (hasPostAlert) {
            alertMessages.push(`Faltan ${missingPosts} posts`);
        } else if (hasReelAlert) {
            alertMessages.push(`Faltan ${missingReels} reels`);
        }

        const quotaMet = (targetPosts > 0 || targetReels > 0) && !hasAnyAlert;

        return {
            total: totalPosts,
            pending: clientPosts.filter(p => p.status === 'pending_approval').length,
            approved: clientPosts.filter(p => p.status === 'approved').length,
            changes_requested: clientPosts.filter(p => p.status === 'changes_requested').length,
            reels: reelsCount,
            standard_posts: standardPostsCount,
            target_posts: targetPosts,
            target_reels: targetReels,
            missing_posts: missingPosts,
            missing_reels: missingReels,
            has_post_alert: hasPostAlert,
            has_reel_alert: hasReelAlert,
            has_alert: hasAnyAlert,
            alert_message: alertMessages.join(' & '),
            quota_met: quotaMet,
            posts_percent: targetPosts > 0 ? Math.min(100, Math.round((totalPosts / targetPosts) * 100)) : 100,
            reels_percent: targetReels > 0 ? Math.min(100, Math.round((reelsCount / targetReels) * 100)) : 100
        };
    }

    // ==========================================================
    // MÉTODOS DE GESTIÓN DE USUARIOS (AGENCIA Y CLIENTES)
    // ==========================================================

    // SELECT u.*, r.name as role_name, r.label as role_label, c.name as client_name, c.brand_color 
    // FROM users u 
    // LEFT JOIN roles r ON u.role_id = r.id 
    // LEFT JOIN clients c ON u.client_id = c.id;
    getUsers(filterCategory = 'all', searchQuery = '') {
        const state = this.getState();
        let users = state.users || [];

        // Filtrar por categoría (agency vs client)
        if (filterCategory && filterCategory !== 'all') {
            users = users.filter(u => u.category === filterCategory);
        }

        // Búsqueda por texto (nombre, email, cargo o cliente)
        if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            users = users.filter(u => {
                const client = u.client_id ? state.clients.find(c => c.id === u.client_id) : null;
                const clientName = client ? client.name.toLowerCase() : '';
                return (
                    u.full_name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.position && u.position.toLowerCase().includes(q)) ||
                    clientName.includes(q)
                );
            });
        }

        // Join con roles y clientes
        return users.map(user => {
            const role = (state.roles || []).find(r => r.id === user.role_id) || { name: 'user', label: 'Usuario' };
            const client = user.client_id ? (state.clients || []).find(c => c.id === user.client_id) : null;

            return {
                ...user,
                role_name: role.name,
                role_label: role.label,
                client: client,
                client_name: client ? client.name : null
            };
        });
    }

    // SELECT * FROM users WHERE id = ?;
    getUserById(userId) {
        const state = this.getState();
        const user = (state.users || []).find(u => u.id === parseInt(userId));
        if (!user) return null;

        const role = (state.roles || []).find(r => r.id === user.role_id) || null;
        const client = user.client_id ? (state.clients || []).find(c => c.id === user.client_id) : null;

        return {
            ...user,
            role,
            client
        };
    }

    // INSERT INTO users (...) VALUES (...);
    createUser(userData) {
        const state = this.getState();
        if (!state.users) state.users = [];

        const newId = Date.now();
        const category = userData.category || (userData.client_id ? 'client' : 'agency');
        const roleId = userData.role_id || (category === 'agency' ? 2 : 3);
        const clientId = (userData.client_id !== undefined && userData.client_id !== null && userData.client_id !== '' && userData.client_id !== 'all') 
            ? parseInt(userData.client_id) 
            : null;

        const newUser = {
            id: newId,
            role_id: parseInt(roleId),
            client_id: clientId,
            full_name: userData.full_name.trim(),
            email: userData.email.trim().toLowerCase(),
            position: userData.position ? userData.position.trim() : (category === 'agency' ? 'Equipo de Agencia' : 'Aprobador de Marca'),
            category: category,
            avatar_color: userData.avatar_color || (category === 'agency' ? '#2563eb' : '#ea580c'),
            phone: userData.phone ? userData.phone.trim() : '',
            is_active: true,
            created_at: new Date().toISOString().split('T')[0]
        };

        state.users.push(newUser);
        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('users', 'insert', {
            role_id: newUser.role_id,
            client_id: newUser.client_id,
            category: newUser.category,
            full_name: newUser.full_name,
            email: newUser.email,
            position: newUser.position,
            phone: newUser.phone,
            avatar_color: newUser.avatar_color
        });

        return newUser;
    }

    // UPDATE users SET ... WHERE id = ?;
    updateUser(userId, userData) {
        const state = this.getState();
        if (!state.users) return false;

        const idx = state.users.findIndex(u => u.id === parseInt(userId));
        if (idx === -1) return false;

        const clientId = (userData.client_id !== undefined)
            ? ((userData.client_id !== null && userData.client_id !== '' && userData.client_id !== 'all') ? parseInt(userData.client_id) : null)
            : state.users[idx].client_id;

        state.users[idx] = {
            ...state.users[idx],
            ...userData,
            client_id: clientId,
            id: parseInt(userId) // preservar id
        };

        this.saveState(state);

        // Replicar en Supabase Cloud
        this.syncCloudWrite('users', 'update', {
            id: parseInt(userId),
            ...userData,
            client_id: clientId
        });

        return state.users[idx];
    }

    // DELETE FROM users WHERE id = ?;
    deleteUser(userId) {
        const state = this.getState();
        if (!state.users) return false;

        const initialLength = state.users.length;
        state.users = state.users.filter(u => u.id !== parseInt(userId));

        if (state.users.length !== initialLength) {
            this.saveState(state);
            this.syncCloudWrite('users', 'delete', parseInt(userId));
            return true;
        }
        return false;
    }

    // Métricas y estadísticas de usuarios
    getUserStats() {
        const state = this.getState();
        const users = state.users || [];
        return {
            total: users.length,
            agencyCount: users.filter(u => u.category === 'agency').length,
            clientCount: users.filter(u => u.category === 'client').length
        };
    }
}

// Instancia global
window.dbStore = new SQLDataStore();
