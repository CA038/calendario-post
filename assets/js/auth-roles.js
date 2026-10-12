/**
 * ==========================================================
 * GESTIÓN DE ROLES, SESIÓN Y AISLAMIENTO ESTRICTO DE CLIENTES
 * Asigna a cada usuario su cliente correspondiente para que
 * los datos de otros clientes queden completamente aislados.
 * ==========================================================
 */

class AuthRoleManager {
    constructor() {
        this.currentUserId = 1;      // ID del usuario activo (Carlos Reyes por defecto)
        this.currentRole = 'admin';  // 'admin' o 'client'
        this.selectedClientId = 1;   // ID del cliente actualmente seleccionado
        this.initFromUrl();
    }

    // Detectar si el usuario entró mediante un enlace directo de cliente (?token=... o ?client_id=...)
    initFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const clientIdParam = urlParams.get('client_id');
        const userIdParam = urlParams.get('user_id');

        if (token) {
            const client = window.dbStore.getClientByToken(token);
            if (client) {
                this.currentRole = 'client';
                this.selectedClientId = client.id;
                // Buscar usuario representante de ese cliente
                const clientUsers = (window.dbStore.getState().users || []).filter(u => u.client_id === client.id);
                if (clientUsers.length > 0) {
                    this.currentUserId = clientUsers[0].id;
                }
            }
        } else if (userIdParam) {
            const user = window.dbStore.getUserById(userIdParam);
            if (user) {
                this.setCurrentUser(user);
            }
        } else if (clientIdParam) {
            const client = window.dbStore.getClientById(clientIdParam);
            if (client) {
                this.selectedClientId = parseInt(clientIdParam);
            }
        }
    }

    getCurrentUser() {
        const user = window.dbStore.getUserById(this.currentUserId);
        if (user) return user;
        // Fallback al primer usuario
        const allUsers = window.dbStore.getState().users || [];
        return allUsers[0] || null;
    }

    setCurrentUser(user) {
        if (!user) return;
        this.currentUserId = user.id;
        this.currentRole = user.category === 'agency' ? 'admin' : 'client';
        
        // Si el usuario tiene cliente asignado (sea de agencia o cliente), fijar estrictamente ese cliente
        if (user.client_id) {
            this.selectedClientId = parseInt(user.client_id);
        }
    }

    getRole() {
        return this.currentRole;
    }

    setRole(role) {
        this.currentRole = role;
        const allUsers = window.dbStore.getState().users || [];
        if (role === 'client') {
            const activeId = this.getActiveClientId();
            const clientUsers = allUsers.filter(u => u.category === 'client' && u.client_id === activeId);
            if (clientUsers.length > 0) {
                this.currentUserId = clientUsers[0].id;
            } else {
                const anyClient = allUsers.find(u => u.category === 'client');
                if (anyClient) this.setCurrentUser(anyClient);
            }
        } else {
            // Modo agencia: intentar encontrar superadmin o primer usuario de agencia
            const agencyAdmin = allUsers.find(u => u.category === 'agency' && !u.client_id) ||
                               allUsers.find(u => u.category === 'agency') || 
                               allUsers[0];
            if (agencyAdmin) {
                this.setCurrentUser(agencyAdmin);
            }
        }
    }

    // Retorna true si el usuario actual tiene asignado un cliente exclusivo (acceso restringido)
    hasRestrictedClient() {
        const user = this.getCurrentUser();
        return !!(user && user.client_id);
    }

    // Retorna true si el usuario puede alternar entre distintas marcas (Super Administrador sin cliente_id)
    canSwitchClient() {
        const user = this.getCurrentUser();
        return !!(user && user.category === 'agency' && !user.client_id);
    }

    // Obtener ID del cliente activo, garantizando aislamiento si el usuario está restringido
    getActiveClientId() {
        const user = this.getCurrentUser();
        if (user && user.client_id) {
            return parseInt(user.client_id);
        }
        return this.selectedClientId;
    }

    // Cambiar cliente activo (bloqueado para usuarios asignados a un cliente específico)
    setActiveClientId(clientId) {
        const user = this.getCurrentUser();
        if (user && user.client_id) {
            // Usuario con asignación estricta de cliente: no se le permite ver datos de otro cliente
            this.selectedClientId = parseInt(user.client_id);
            return false;
        }

        this.selectedClientId = parseInt(clientId);
        // Si el modo actual es cliente, actualizar usuario activo del nuevo cliente si aplica
        if (this.currentRole === 'client') {
            const clientUsers = (window.dbStore.getState().users || []).filter(u => u.client_id === this.selectedClientId);
            if (clientUsers.length > 0) {
                this.currentUserId = clientUsers[0].id;
            }
        }
        return true;
    }

    // Obtener objeto del cliente activo
    getActiveClient() {
        const activeId = this.getActiveClientId();
        return window.dbStore.getClientById(activeId);
    }

    // Obtener marcas accesibles para el usuario en sesión
    getAccessibleClients() {
        const user = this.getCurrentUser();
        const allClients = window.dbStore.getAllClients ? window.dbStore.getAllClients() : window.dbStore.getClients();
        if (user && user.client_id) {
            return allClients.filter(c => c.id === parseInt(user.client_id));
        }
        return allClients;
    }

    // Verificar si el usuario actual tiene permiso de ver un cliente determinado
    canAccessClient(clientId) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (!user.client_id) return true; // Super Admin accede a todos
        return parseInt(user.client_id) === parseInt(clientId);
    }

    // Generar enlace seguro para compartir al cliente
    getShareableClientLink(clientId = this.getActiveClientId()) {
        const client = window.dbStore.getClientById(clientId);
        if (!client) return '';
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?token=${client.access_token}`;
    }
}

window.authManager = new AuthRoleManager();
