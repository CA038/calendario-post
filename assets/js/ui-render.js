/**
 * ==========================================================
 * RENDERIZADO VISUAL DE LA INTERFAZ
 * Iconos Vectoriales Uniformes, Dropdown y Control de Roles
 * ==========================================================
 */

// Helper con Iconos SVG de Línea Uniformes
const ICONS = {
    sparkle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2 7.6 2.4-7.6 2.4L12 21.2l-2.4-7.2-7.6-2.4 7.6-2.4L12 2z"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
    bulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    cross: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`
};

class UIRenderer {
    constructor() {
        this.currentView = 'feed'; // 'feed' o 'calendar'
        this.currentStatusFilter = 'all';
        this.currentTypeFilter = 'all';
        this.searchQuery = '';
        this.calendarDate = new Date();

        if (window.supabaseService) {
            window.supabaseService.onStatusChange((status) => {
                this.updateCloudBadge(status);
            });
        }
    }

    // Inicializar renderizado completo
    // Formateador de fechas a formato legible (ej: 6 de Octubre, 2026)
    formatDateOnly(dateStr) {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `${day} de ${months[month]}, ${year}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    }

    renderAll() {
        this.renderSidebarClient();
        this.renderHeroSection();

        const categoryFilters = document.getElementById('category-filters-container');
        const postsGrid = document.getElementById('posts-grid-container');
        const calendarView = document.getElementById('calendar-view-container');
        const usersView = document.getElementById('users-view-container');
        const clientsView = document.getElementById('clients-view-container');

        if (this.currentView === 'clients') {
            if (categoryFilters) categoryFilters.style.display = 'none';
            if (postsGrid) postsGrid.style.display = 'none';
            if (calendarView) calendarView.style.display = 'none';
            if (usersView) usersView.style.display = 'none';
            if (clientsView) clientsView.style.display = 'block';
            if (window.clientManager) {
                window.clientManager.renderClientsView();
            }
        } else if (this.currentView === 'users') {
            if (clientsView) clientsView.style.display = 'none';
            if (categoryFilters) categoryFilters.style.display = 'none';
            if (postsGrid) postsGrid.style.display = 'none';
            if (calendarView) calendarView.style.display = 'none';
            if (usersView) usersView.style.display = 'block';
            if (window.userManager) {
                window.userManager.renderUsersView();
            }
        } else if (this.currentView === 'calendar') {
            if (clientsView) clientsView.style.display = 'none';
            if (usersView) usersView.style.display = 'none';
            if (categoryFilters) categoryFilters.style.display = 'none';
            if (postsGrid) postsGrid.style.display = 'none';
            if (calendarView) calendarView.style.display = 'block';
            this.renderCalendar();
        } else {
            // 'feed'
            if (clientsView) clientsView.style.display = 'none';
            if (usersView) usersView.style.display = 'none';
            if (calendarView) calendarView.style.display = 'none';
            if (categoryFilters) categoryFilters.style.display = 'flex';
            if (postsGrid) postsGrid.style.display = 'grid';
            this.renderCategoryFilters();
            this.renderPostsGrid();
        }

        this.updateRoleUI();
    }

    // Actualizar datos del cliente activo y renderizar menú desplegable
    renderSidebarClient() {
        const client = window.authManager.getActiveClient();
        if (!client) return;

        const avatarBadge = document.getElementById('sidebar-client-avatar');
        const clientName = document.getElementById('sidebar-client-name');
        const clientDesc = document.getElementById('sidebar-client-desc');
        const dropdownList = document.getElementById('client-dropdown-list');
        const switchWrapper = document.getElementById('client-switch-wrapper');
        const badgeTag = switchWrapper ? switchWrapper.querySelector('.client-switch-badge-tag') : null;
        const chevronIcon = switchWrapper ? switchWrapper.querySelector('.select-chevron-icon') : null;
        const btnAddClient = document.getElementById('btn-add-new-client');

        if (avatarBadge) avatarBadge.textContent = client.logo_text || client.name.substring(0, 2).toUpperCase();
        if (clientName) clientName.textContent = client.name;
        if (clientDesc) clientDesc.textContent = client.description || 'Cliente Activo';

        const canSwitch = window.authManager.canSwitchClient();
        const hasRestricted = window.authManager.hasRestrictedClient();

        if (switchWrapper) {
            if (hasRestricted) {
                switchWrapper.classList.add('client-locked');
                switchWrapper.setAttribute('title', `Acceso exclusivo asignado a ${client.name}. Tu usuario no puede ver datos de otros clientes.`);
                if (badgeTag) {
                    badgeTag.textContent = '🔒 Asignado';
                    badgeTag.className = 'client-switch-badge-tag locked';
                }
                if (chevronIcon) {
                    chevronIcon.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    `;
                    chevronIcon.title = 'Acceso bloqueado exclusivamente a esta marca';
                }
            } else {
                switchWrapper.classList.remove('client-locked');
                switchWrapper.setAttribute('title', 'Haz clic para cambiar de cliente o crear uno nuevo');
                if (badgeTag) {
                    badgeTag.textContent = 'Marca';
                    badgeTag.className = 'client-switch-badge-tag';
                }
                if (chevronIcon) {
                    chevronIcon.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    `;
                }
            }
        }

        if (btnAddClient) {
            btnAddClient.style.display = canSwitch ? 'flex' : 'none';
        }

        // Llenar lista desplegable de clientes interactiva
        if (dropdownList) {
            if (hasRestricted) {
                dropdownList.innerHTML = `
                    <div style="padding: 14px; text-align: center; color: var(--text-secondary); font-size: 12.5px; line-height: 1.4;">
                        <span style="font-weight: 800; color: var(--text-primary); display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px;">
                            <span>🔒</span> Acceso Restringido
                        </span>
                        Estás asignado exclusivamente a <strong>${client.name}</strong>.<br>
                        Por políticas de privacidad, las demás marcas están ocultas.
                    </div>
                `;
            } else {
                const accessibleClients = window.authManager.getAccessibleClients();
                dropdownList.innerHTML = accessibleClients.map(c => {
                    const stats = window.dbStore.getClientStats(c.id);
                    const isSelected = c.id === client.id;
                    return `
                        <div class="client-dropdown-item ${isSelected ? 'selected' : ''}" onclick="window.uiRenderer.selectClient(${c.id})">
                            <div class="client-item-left">
                                <div class="client-mini-avatar" style="background: ${c.brand_color || 'var(--primary)'}">
                                    ${c.logo_text || c.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div class="client-item-texts">
                                    <span class="client-item-name">${c.name}</span>
                                    <span class="client-item-posts-count">${stats.total} publicaciones (${stats.pending} por aprobar)</span>
                                </div>
                            </div>
                            ${isSelected ? `<span class="client-check-icon">✓</span>` : ''}
                        </div>
                    `;
                }).join('');
            }
        }

        // Actualizar contadores del menú lateral
        const stats = window.dbStore.getClientStats(client.id);
        const userStats = window.dbStore.getUserStats ? window.dbStore.getUserStats() : { total: 0 };
        const clientsOverview = window.dbStore.getClientsOverviewStats ? window.dbStore.getClientsOverviewStats() : { total: 0 };

        const badgePending = document.getElementById('badge-count-pending');
        const badgeApproved = document.getElementById('badge-count-approved');
        const badgeChanges = document.getElementById('badge-count-changes');
        const badgeAll = document.getElementById('badge-count-all');
        const badgeUsers = document.getElementById('badge-count-users');
        const badgeClients = document.getElementById('badge-count-clients');

        if (badgePending) badgePending.textContent = stats.pending;
        if (badgeApproved) badgeApproved.textContent = stats.approved;
        if (badgeChanges) badgeChanges.textContent = stats.changes_requested;
        if (badgeAll) badgeAll.textContent = stats.total;
        if (badgeUsers) badgeUsers.textContent = userStats.total;
        if (badgeClients) badgeClients.textContent = hasRestricted ? 1 : clientsOverview.total;
    }

    // Seleccionar cliente desde el dropdown
    selectClient(clientId) {
        if (!window.authManager.canAccessClient(clientId)) {
            this.showToast('No tienes permiso para ver este cliente.', 'alert');
            return;
        }
        const success = window.authManager.setActiveClientId(clientId);
        if (success) {
            this.closeClientDropdown();
            this.renderAll();
            const client = window.authManager.getActiveClient();
            this.showToast(`Cliente cambiado a: ${client.name}`, 'check');
        }
    }

    toggleClientDropdown() {
        if (!window.authManager.canSwitchClient()) {
            const client = window.authManager.getActiveClient();
            this.showToast(`🔒 Acceso exclusivo: Tu usuario está asignado únicamente a ${client ? client.name : 'tu marca'}.`, 'alert');
            return;
        }

        const wrapper = document.getElementById('client-switch-wrapper');
        const menu = document.getElementById('client-dropdown-menu');
        if (!wrapper || !menu) return;

        const isOpen = menu.classList.contains('active');
        if (isOpen) {
            this.closeClientDropdown();
        } else {
            wrapper.classList.add('dropdown-open');
            menu.classList.add('active');
        }
    }

    closeClientDropdown() {
        const wrapper = document.getElementById('client-switch-wrapper');
        const menu = document.getElementById('client-dropdown-menu');
        if (wrapper) wrapper.classList.remove('dropdown-open');
        if (menu) menu.classList.remove('active');
    }

    // Actualizar sección Hero y Métricas
    renderHeroSection() {
        const client = window.authManager.getActiveClient();
        const currentUser = window.authManager.getCurrentUser();
        const role = window.authManager.getRole();
        const isUsersView = this.currentView === 'users';
        const isClientsView = this.currentView === 'clients';

        const heroTag = document.getElementById('hero-client-tag-text');
        const heroTitle = document.getElementById('hero-client-title');
        const heroDesc = document.getElementById('hero-client-desc');
        const heroStatsRow = document.getElementById('hero-stats-row');

        if (isClientsView) {
            if (heroTag) heroTag.textContent = 'Directorio & Pipeline Comercial';
            if (heroTitle) heroTitle.textContent = 'Gestión de Empresas & Prospectos';
            if (heroDesc) heroDesc.textContent = 'Administra tu cartera de marcas: clientes reales con calendario activo y prospectos en etapa de propuesta o negociación.';
            if (heroStatsRow) heroStatsRow.style.display = 'none';
            return;
        }

        if (isUsersView) {
            if (heroTag) heroTag.textContent = 'Control de Accesos & Roles';
            if (heroTitle) heroTitle.textContent = 'Gestión de Usuarios del Sistema';
            if (heroDesc) heroDesc.textContent = 'Administra a los miembros de tu equipo de agencia y a los representantes/aprobadores autorizados de cada marca.';
            if (heroStatsRow) heroStatsRow.style.display = 'none';
            return;
        }

        if (heroStatsRow) heroStatsRow.style.display = 'flex';

        if (role === 'client') {
            const userName = currentUser ? currentUser.full_name : 'Cliente';
            if (heroTag) heroTag.textContent = 'Portal de Aprobación de Marca';
            if (heroTitle) heroTitle.textContent = `¡Hola, ${userName}! 👋`;
            if (heroDesc) heroDesc.textContent = `Revisa los diseños y videos reels programados para ${client ? client.name : 'tu marca'}. Aprueba directamente o añade observaciones para el equipo de diseño.`;
        } else {
            const stats = client ? window.dbStore.getClientStats(client.id) : null;
            if (heroTag) {
                if (stats && stats.has_alert) {
                    heroTag.innerHTML = `<span style="color: #b45309;">⚠️ Alerta de Plan: ${stats.alert_message}</span>`;
                } else if (stats && stats.quota_met) {
                    heroTag.innerHTML = `<span style="color: #047857;">✅ Meta Mensual Cumplida</span>`;
                } else {
                    heroTag.textContent = 'Aprobación de Contenidos';
                }
            }
            if (heroTitle) heroTitle.textContent = `Calendario de Contenidos: ${client ? client.name : 'Marca'}`;
            if (heroDesc) heroDesc.textContent = `Revisa, previsualiza reels en video, consulta observaciones y aprueba las publicaciones programadas.`;
        }

        if (client) {
            const stats = window.dbStore.getClientStats(client.id);
            const statTotal = document.getElementById('stat-total-posts');
            const statPending = document.getElementById('stat-pending-posts');
            const statApproved = document.getElementById('stat-approved-posts');
            const statReels = document.getElementById('stat-reels-count');

            if (statTotal) statTotal.textContent = stats.total;
            if (statPending) statPending.textContent = stats.pending;
            if (statApproved) statApproved.textContent = stats.approved;
            if (statReels) statReels.textContent = stats.reels;
        }
    }

    // Renderizar barra de filtros horizontales con Iconos SVG de Línea
    renderCategoryFilters() {
        const clientId = window.authManager.getActiveClientId();
        const stats = window.dbStore.getClientStats(clientId);
        const container = document.getElementById('category-filters-container');
        if (!container) return;

        const filters = [
            { id: 'all', label: 'Todos los Posts', count: stats.total, icon: ICONS.list },
            { id: 'type-reel', label: 'Videos Reels', count: stats.reels, icon: ICONS.video, filterType: 'reel' },
            { id: 'status-pending', label: 'Pendientes', count: stats.pending, icon: ICONS.clock, filterStatus: 'pending_approval' },
            { id: 'status-approved', label: 'Aprobados', count: stats.approved, icon: ICONS.check, filterStatus: 'approved' },
            { id: 'status-changes', label: 'Con Observaciones', count: stats.changes_requested, icon: ICONS.alert, filterStatus: 'changes_requested' }
        ];

        container.innerHTML = filters.map(f => {
            const isActive = (f.filterStatus && this.currentStatusFilter === f.filterStatus) ||
                             (f.filterType && this.currentTypeFilter === f.filterType) ||
                             (!f.filterStatus && !f.filterType && this.currentStatusFilter === 'all' && this.currentTypeFilter === 'all');

            return `
                <button class="category-pill-btn ${isActive ? 'active' : ''}" 
                        data-status="${f.filterStatus || 'all'}" 
                        data-type="${f.filterType || 'all'}">
                    ${f.icon}
                    <span>${f.label}</span>
                    <span class="count-badge">${f.count}</span>
                </button>
            `;
        }).join('');
    }

    // Renderizar la cuadrícula de posts con Iconos de Línea
    renderPostsGrid() {
        const clientId = window.authManager.getActiveClientId();
        const posts = window.dbStore.getPostsByClient(
            clientId, 
            this.currentStatusFilter, 
            this.currentTypeFilter, 
            this.searchQuery
        );

        const gridContainer = document.getElementById('posts-grid-container');
        const calendarContainer = document.getElementById('calendar-view-container');
        
        if (gridContainer) gridContainer.style.display = 'grid';
        if (calendarContainer) calendarContainer.style.display = 'none';

        if (!gridContainer) return;

        if (posts.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 20px; border: 1px dashed var(--border-subtle);">
                    <div style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--text-muted);">${ICONS.grid}</div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">No se encontraron publicaciones</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">No hay publicaciones que coincidan con los filtros seleccionados.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = posts.map(post => {
            const isReel = post.post_type === 'reel';
            const statusLabel = {
                'pending_approval': 'Pendiente',
                'approved': 'Aprobado',
                'changes_requested': 'Con Observaciones',
                'draft': 'Borrador'
            }[post.status] || post.status;

            const statusClass = {
                'pending_approval': 'pending',
                'approved': 'approved',
                'changes_requested': 'rejected',
                'draft': 'draft'
            }[post.status] || 'pending';

            const platformList = (post.platform || 'instagram').split(',').map(p => p.trim().toLowerCase());
            const platformBadgesHtml = platformList.map(p => {
                const icon = ICONS[p] || ICONS.instagram;
                return `<span style="width: 14px; height: 14px; display: inline-flex; align-items: center;" title="${p}">${icon}</span>`;
            }).join('');

            const mediaUrl = post.media?.thumbnail_url || post.media?.file_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800';

            return `
                <div class="post-card" data-post-id="${post.id}">
                    <!-- Portada de la Tarjeta -->
                    <div class="post-media-preview ${isReel ? 'reel-aspect' : ''}" onclick="window.postModal.open(${post.id})">
                        <img src="${mediaUrl}" alt="${post.title}" class="media-thumbnail-img" loading="lazy" />
                        
                        <span class="status-badge-floating ${statusClass}">
                            ${statusLabel}
                        </span>

                        <span class="platform-badge-floating" style="display: flex; align-items: center; gap: 5px;">
                            ${platformBadgesHtml}
                            <span style="text-transform: capitalize;">${platformList.length > 1 ? `${platformList.length} Redes` : platformList[0]}</span>
                        </span>

                        ${isReel ? `
                            <div class="reel-play-overlay">
                                <div class="reel-play-button" style="width: 44px; height: 44px; padding-left: 3px;">
                                    ${ICONS.play}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Contenido y Metadatos -->
                    <div class="post-card-body">
                        <div class="post-meta-schedule">
                            <span>${ICONS.calendar} ${this.formatDateOnly(post.scheduled_date)}</span>
                        </div>

                        <h3 class="post-title-text" onclick="window.postModal.open(${post.id})" style="cursor: pointer;">
                            ${post.title}
                        </h3>

                        <p class="post-copy-preview">
                            ${post.caption}
                        </p>

                        ${post.observation_internal ? `
                            <div class="agency-observation-box">
                                <strong>💡 Observación de la Agencia:</strong>
                                ${post.observation_internal}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Footer con Acciones -->
                    <div class="post-card-footer">
                        <button class="btn-action-view" onclick="window.postModal.open(${post.id})">
                            ${ICONS.eye} Ver Detalle
                        </button>

                        <div class="card-quick-actions">
                            ${post.status !== 'approved' ? `
                                <button class="btn-quick-approve" onclick="window.postModal.quickApprove(${post.id})">
                                    ${ICONS.check} Aprobar
                                </button>
                            ` : `
                                <span style="font-size: 12px; font-weight: 700; color: var(--status-approved-badge); display: inline-flex; align-items: center; gap: 4px;">
                                    ${ICONS.check} Aprobado
                                </span>
                            `}
                            ${post.status !== 'changes_requested' && post.status !== 'approved' ? `
                                <button class="btn-quick-reject" onclick="window.postModal.open(${post.id}, true)">
                                    ${ICONS.cross} Declinar
                                </button>
                            ` : ''}

                            <!-- Botón de Eliminar Post (Solo Agencia) -->
                            <button class="btn-quick-delete admin-only-feature" onclick="event.stopPropagation(); window.postModal.deletePostPrompt(${post.id})" title="Eliminar este post o reel">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar Vista de Calendario Mensual
    renderCalendar() {
        const gridContainer = document.getElementById('posts-grid-container');
        const calendarContainer = document.getElementById('calendar-view-container');
        
        if (gridContainer) gridContainer.style.display = 'none';
        if (calendarContainer) calendarContainer.style.display = 'block';

        const clientId = window.authManager.getActiveClientId();
        const posts = window.dbStore.getPostsByClient(clientId, 'all', 'all', this.searchQuery);

        const monthLabel = document.getElementById('calendar-month-label');
        const daysGrid = document.getElementById('calendar-days-grid');
        if (!daysGrid) return;

        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();

        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        if (monthLabel) {
            monthLabel.textContent = `${monthNames[month]} ${year}`;
        }

        const firstDayIndex = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevMonthTotalDays = new Date(year, month, 0).getDate();

        let gridHtml = '';

        for (let i = adjustedFirstDay; i > 0; i--) {
            gridHtml += `
                <div class="calendar-day-cell other-month">
                    <span class="day-cell-number">${prevMonthTotalDays - i + 1}</span>
                </div>
            `;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (let day = 1; day <= totalDays; day++) {
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = formattedDate === todayStr;
            const daysPosts = posts.filter(p => p.scheduled_date === formattedDate);

            gridHtml += `
                <div class="calendar-day-cell ${isToday ? 'today' : ''}">
                    <span class="day-cell-number">${day}</span>
                    <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 85px;">
                        ${daysPosts.map(p => `
                            <div class="calendar-post-chip status-${p.status === 'changes_requested' ? 'rejected' : p.status === 'approved' ? 'approved' : 'pending'}" 
                                 onclick="window.postModal.open(${p.id})">
                                <span class="chip-platform-icon" style="width: 12px; height: 12px; display: inline-flex;">
                                    ${p.post_type === 'reel' ? ICONS.video : ICONS.image}
                                </span>
                                <span class="chip-title">${p.title}</span>
                                <button type="button" class="btn-calendar-chip-delete admin-only-feature" onclick="event.stopPropagation(); window.postModal.deletePostPrompt(${p.id})" title="Eliminar post del calendario">✕</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        daysGrid.innerHTML = gridHtml;
    }

    // Control de visibilidad estricta por rol (Agencia vs Cliente)
    updateRoleUI() {
        const role = window.authManager.getRole();
        const currentUser = window.authManager.getCurrentUser();
        const roleBtns = document.querySelectorAll('.role-btn');
        const adminElements = document.querySelectorAll('.admin-only-feature');

        roleBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.role === role);
        });

        // Ocultar sección de Estados de Aprobación, gestión de usuarios y opciones de administración en Vista Cliente
        adminElements.forEach(el => {
            el.style.display = role === 'admin' ? '' : 'none';
        });

        // Renderizar Widget de Usuario Activo en Cabecera Superior
        const userBadgeContainer = document.getElementById('header-active-user-badge');
        if (userBadgeContainer && currentUser) {
            const isAgency = currentUser.category === 'agency';
            const initials = currentUser.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            const avatarColor = currentUser.avatar_color || (isAgency ? '#2563eb' : '#ea580c');
            const hasRestricted = !!currentUser.client_id;
            const clientName = currentUser.client ? currentUser.client.name : (hasRestricted ? `Cliente #${currentUser.client_id}` : null);

            userBadgeContainer.innerHTML = `
                <div class="header-user-card" onclick="window.uiRenderer.openUserQuickSwitch()">
                    <div class="header-user-avatar" style="background: ${avatarColor};">
                        ${initials}
                    </div>
                    <div class="header-user-texts">
                        <span class="header-user-name">${currentUser.full_name}</span>
                        <span class="header-user-category-tag ${hasRestricted ? 'client' : 'agency'}">
                            ${hasRestricted ? `🔒 ${clientName}` : '🏢 Acceso Total'}
                        </span>
                    </div>
                </div>
            `;
        }
    }

    openUserQuickSwitch() {
        // Redirigir a vista de usuarios si es admin
        if (window.authManager.getRole() === 'admin') {
            this.currentView = 'users';
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.toggle('active', n.dataset.view === 'users');
            });
            this.renderAll();
        }
    }

    // Actualizar badge visual de estado de conexión a Supabase
    updateCloudBadge(status) {
        const badge = document.getElementById('supabase-cloud-badge');
        const text = document.getElementById('supabase-status-text');
        if (!badge || !text) return;

        if (!status) {
            status = window.supabaseService ? window.supabaseService.getConnectionInfo() : { isConnected: false, hasCloudTables: false };
        }

        if (status.hasCloudTables) {
            badge.className = 'cloud-status-badge';
            badge.title = '🟢 Supabase PostgreSQL & Storage sincronizados';
            text.textContent = 'Supabase Cloud';
        } else if (status.isConnected) {
            badge.className = 'cloud-status-badge pending';
            badge.title = '🟡 Conectado a Supabase (Pendiente correr SQL migration en dashboard)';
            text.textContent = 'Supabase Conectado';
        } else {
            badge.className = 'cloud-status-badge offline';
            badge.title = 'Modo Local (IndexedDB)';
            text.textContent = 'Modo Local';
        }
    }

    // Copiar enlace de aprobación del cliente activo actualmente
    copyActiveClientLink() {
        const client = window.authManager.getActiveClient();
        if (!client) {
            this.showToast('Selecciona un cliente primero', 'alert');
            return;
        }
        const link = window.authManager.getShareableClientLink(client.id);
        navigator.clipboard.writeText(link).then(() => {
            this.showToast(`Enlace de aprobación de "${client.name}" copiado al portapapeles`, 'sparkle');
        });
    }

    // Mostrar Toast flotante con icono SVG
    showToast(message, iconKey = 'check') {
        const toast = document.getElementById('global-toast');
        if (!toast) return;

        const iconSvg = ICONS[iconKey] || ICONS.check;
        toast.innerHTML = `<span style="width: 18px; height: 18px; display: inline-flex; align-items: center;">${iconSvg}</span> <span>${message}</span>`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
}

window.uiRenderer = new UIRenderer();

