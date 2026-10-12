/**
 * ==========================================================
 * CONEXIÓN Y CLIENTE OFICIAL DE SUPABASE (POSTGRESQL & STORAGE)
 * ==========================================================
 */

const SUPABASE_CONFIG = {
    url: 'https://vlsuddzwdtalszimswec.supabase.co',
    anonKey: 'sb_publishable_tb6n8IdSTkk3hPNNFQcNaA_TC8HAdYu',
    bucket: 'posts-media'
};

class SupabaseService {
    constructor() {
        this.url = SUPABASE_CONFIG.url;
        this.key = SUPABASE_CONFIG.anonKey;
        this.bucket = SUPABASE_CONFIG.bucket;
        this.client = null;
        this.isConnected = false;
        this.hasCloudTables = false;
        this.statusListeners = [];
        this.init();
    }

    init() {
        if (window.supabase && window.supabase.createClient) {
            try {
                this.client = window.supabase.createClient(this.url, this.key, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    }
                });
                console.log('✅ Supabase Client inicializado correctamente con URL:', this.url);
                this.testConnection();
            } catch (err) {
                console.error('❌ Error al inicializar Supabase Client:', err);
            }
        } else {
            console.warn('⚠️ SDK de Supabase no encontrado en window.supabase. Verifique el script CDN.');
        }
    }

    // Registrar listeners para cambios de estado de conexión
    onStatusChange(fn) {
        if (typeof fn === 'function') {
            this.statusListeners.push(fn);
            fn(this.getConnectionInfo());
        }
    }

    notifyListeners() {
        const info = this.getConnectionInfo();
        this.statusListeners.forEach(fn => {
            try { fn(info); } catch (e) {}
        });
    }

    getConnectionInfo() {
        return {
            url: this.url,
            isConnected: this.isConnected,
            hasCloudTables: this.hasCloudTables,
            statusLabel: this.hasCloudTables 
                ? '🟢 Nube Supabase Activa' 
                : (this.isConnected ? '🟡 Conectado (Tablas Pendientes)' : '⚪ Modo Local')
        };
    }

    // Probar conexión y verificar si las tablas ya existen en Supabase
    async testConnection() {
        if (!this.client) return false;
        try {
            const { data, error } = await this.client
                .from('clients')
                .select('id, name')
                .limit(1);

            if (!error) {
                this.isConnected = true;
                this.hasCloudTables = true;
                console.log('☁️ Conexión completa con Supabase: Tablas encontradas y sincronizadas.');
            } else if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
                // El proyecto Supabase responde pero falta correr el script SQL de migración
                this.isConnected = true;
                this.hasCloudTables = false;
                console.info('ℹ️ Supabase conectado, pero las tablas aún no están creadas. Corre database/supabase_migration.sql en tu SQL Editor.');
            } else {
                this.isConnected = true;
                this.hasCloudTables = false;
                console.warn('⚠️ Respuesta de Supabase:', error.message);
            }
        } catch (err) {
            console.warn('⚠️ No se pudo verificar tablas de Supabase:', err);
            this.isConnected = false;
            this.hasCloudTables = false;
        }

        this.notifyListeners();
        return this.isConnected;
    }

    // ==========================================================
    // SUBIDA DE ARCHIVOS MULTIMEDIA (VIDEOS REELS E IMÁGENES)
    // ==========================================================
    async uploadMedia(file, customPath = '') {
        if (!this.client) {
            throw new Error('Cliente Supabase no disponible');
        }

        try {
            const fileExt = file.name ? file.name.split('.').pop() : (file.type.includes('video') ? 'mp4' : 'jpg');
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = customPath ? `${customPath}/${fileName}` : fileName;

            const { data, error } = await this.client.storage
                .from(this.bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.warn('Subida a Supabase Storage falló, usando fallback local:', error.message);
                return null;
            }

            // Obtener URL pública directa
            const { data: publicData } = this.client.storage
                .from(this.bucket)
                .getPublicUrl(filePath);

            return publicData ? publicData.publicUrl : null;
        } catch (err) {
            console.warn('Error en uploadMedia de Supabase:', err);
            return null;
        }
    }
}

window.supabaseService = new SupabaseService();
