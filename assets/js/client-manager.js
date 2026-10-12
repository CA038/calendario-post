/**
 * ==========================================================
 * GESTOR INTEGRAL DE CLIENTES Y PROSPECTOS (CLIENT MANAGER)
 * - Modo Fichas (Grid) y Modo Lista (Table)
 * - Sectorización: Clientes Reales vs Prospectos / Leads
 * - Metas Acordadas de Contenido (Posts y Reels) con Alertas
 * - Enlaces Exclusivos de Aprobación por Cliente
 * ==========================================================
 */

class ClientManager {
    constructor() {
        this.currentFilter = 'all'; // 'all', 'active_client', 'prospect'
        this.searchQuery = '';
        this.editingClientId = null;
        this.modalEl = null;
        this.viewMode = localStorage.getItem('socialflow_clients_view_mode') || 'grid'; // 'grid' o 'list'
    }

    init() {
        this.modalEl = document.getElementById('client-modal');
        this.bindEvents();
        this.updateViewModeButtons();
    }

    bindEvents() {
        // Selector de tipo de cliente en el modal (Cliente Real vs Prospecto)
        const typeRadios = document.querySelectorAll('input[name="client-modal-type"]');
        typeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isProspect = e.target.value === 'prospect';
                const notesLabel = document.getElementById('client-notes-label');
                if (notesLabel) {
                    notesLabel.textContent = isProspect 
                        ? 'Notas Comerciales / Estado del Lead:' 
                        : 'Notas Internas / Acuerdos del Cliente:';
                }
            });
        });
    }

    // Cambiar entre Modo Fichas y Modo Lista
    setViewMode(mode) {
        this.viewMode = mode === 'list' ? 'list' : 'grid';
        localStorage.setItem('socialflow_clients_view_mode', this.viewMode);
        this.updateViewModeButtons();
        this.renderClientsView();
    }

    updateViewModeButtons() {
        const btnGrid = document.getElementById('btn-client-view-grid');
        const btnList = document.getElementById('btn-client-view-list');
        if (btnGrid && btnList) {
            btnGrid.classList.toggle('active', this.viewMode === 'grid');
            btnList.classList.toggle('active', this.viewMode === 'list');
        }
    }

    // Renderizar la Vista Principal de Gestión de Clientes
    renderClientsView() {
        const gridContainer = document.getElementById('clients-grid-container');
        if (!gridContainer) return;

        const clients = window.dbStore.getClients(this.currentFilter, this.searchQuery);
        const stats = window.dbStore.getClientsOverviewStats();

        // Actualizar contadores de métricas
        const statTotal = document.getElementById('stat-clients-total');
        const statActive = document.getElementById('stat-clients-active');
        const statProspects = document.getElementById('stat-clients-prospects');

        if (statTotal) statTotal.textContent = stats.total;
        if (statActive) statActive.textContent = stats.activeCount;
        if (statProspects) statProspects.textContent = stats.prospectCount;

        // Renderizar barra de filtros por sector
        this.renderCategoryPills(stats);
        this.updateViewModeButtons();

        if (clients.length === 0) {
            gridContainer.className = 'clients-grid-container single-column';
            gridContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 20px; border: 1.5px dashed var(--border-subtle);">
                    <div style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--text-muted);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">No se encontraron empresas</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">No hay clientes o prospectos que coincidan con la búsqueda o filtro actual.</p>
                </div>
            `;
            return;
        }

        if (this.viewMode === 'list') {
            gridContainer.className = 'clients-list-mode-active';
            gridContainer.innerHTML = this.renderListView(clients);
        } else {
            gridContainer.className = 'clients-grid-container';
            gridContainer.innerHTML = this.renderGridView(clients);
        }
    }

    // Renderizar Modo Fichas / Tarjetas (Grid)
    renderGridView(clients) {
        const activeClient = window.authManager.getActiveClient();
        const canSwitch = window.authManager.canSwitchClient();

        return clients.map(client => {
            const isProspect = (client.client_type || 'active_client') === 'prospect';
            const isActiveCurrent = activeClient && activeClient.id === client.id;
            const clientStats = window.dbStore.getClientStats(client.id);
            const brandColor = client.brand_color || '#2563eb';
            const initials = client.logo_text || client.name.substring(0, 2).toUpperCase();

            // Limpiar teléfono para enlaces directos
            const cleanPhone = (client.contact_phone || '').replace(/[^0-9+]/g, '');
            const cleanSecondaryPhone = (client.secondary_phone || '').replace(/[^0-9+]/g, '');

            // Meta y alertas de contenido
            const hasTarget = clientStats.target_posts > 0 || clientStats.target_reels > 0;

            return `
                <div class="client-card ${isActiveCurrent ? 'current-active-brand' : ''} ${isProspect ? 'prospect-card' : ''}">
                    <!-- Cabecera de la Tarjeta -->
                    <div class="client-card-top-header">
                        <span class="client-sector-badge ${isProspect ? 'prospect' : 'active-client'}">
                            ${isProspect ? `
                                <span>🎯 Prospecto / Lead</span>
                            ` : `
                                <span>💎 Cliente Real</span>
                            `}
                        </span>

                        <div class="client-card-top-actions">
                            ${isProspect ? `
                                <button class="btn-convert-client" onclick="window.clientManager.convertType(${client.id}, 'active_client')" title="Convertir en Cliente Real">
                                    <span>✨ Convertir a Cliente</span>
                                </button>
                            ` : `
                                <button class="btn-convert-client subtle" onclick="window.clientManager.convertType(${client.id}, 'prospect')" title="Mover a Prospectos">
                                    <span>Pasar a Prospecto</span>
                                </button>
                            `}

                            <button class="btn-icon-action" onclick="window.clientManager.openEditClientModal(${client.id})" title="Editar datos del cliente">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            
                            ${canSwitch ? `
                                <button class="btn-icon-action delete" onclick="window.clientManager.deleteClient(${client.id})" title="Eliminar cliente">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Perfil e Identidad de la Marca -->
                    <div class="client-brand-profile">
                        <div class="client-avatar-sq" style="background: ${brandColor};">
                            ${initials}
                        </div>
                        <div class="client-brand-info">
                            <h3 class="client-brand-title" title="${client.name}">${client.name}</h3>
                            <p class="client-brand-description">${client.description || 'Sin descripción de giro comercial'}</p>
                        </div>
                    </div>

                    <!-- Alerta y Cumplimiento de Metas Acordadas -->
                    ${hasTarget ? `
                        <div class="client-quota-status-card ${clientStats.has_alert ? 'warning' : 'success'}">
                            <div class="quota-status-header">
                                <span class="quota-badge ${clientStats.has_alert ? 'warning' : 'success'}">
                                    ${clientStats.has_alert ? `⚠️ ${clientStats.alert_message}` : '✅ Meta mensual cumplida'}
                                </span>
                            </div>

                            <div class="quota-progress-bars-row">
                                ${clientStats.target_posts > 0 ? `
                                    <div class="quota-mini-progress">
                                        <div class="quota-progress-label">
                                            <span>Posts / Diseños:</span>
                                            <strong>${clientStats.total} / ${clientStats.target_posts}</strong>
                                        </div>
                                        <div class="quota-bar-track">
                                            <div class="quota-bar-fill ${clientStats.has_post_alert ? 'warning' : 'success'}" style="width: ${clientStats.posts_percent}%;"></div>
                                        </div>
                                    </div>
                                ` : ''}

                                ${clientStats.target_reels > 0 ? `
                                    <div class="quota-mini-progress">
                                        <div class="quota-progress-label">
                                            <span>Videos Reels:</span>
                                            <strong>${clientStats.reels} / ${clientStats.target_reels}</strong>
                                        </div>
                                        <div class="quota-bar-track">
                                            <div class="quota-bar-fill ${clientStats.has_reel_alert ? 'warning' : 'success'}" style="width: ${clientStats.reels_percent}%;"></div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : `
                        <div class="client-quota-status-card unset">
                            <span style="font-size: 11px; color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px;">
                                <span>🎯 Sin metas configuradas</span>
                                <a href="javascript:void(0)" onclick="window.clientManager.openEditClientModal(${client.id})" style="color: var(--accent); font-weight: 700; text-decoration: none;">+ Establecer meta</a>
                            </span>
                        </div>
                    `}

                    <!-- Información de Contacto Completa -->
                    <div class="client-contact-details-box">
                        ${client.contact_phone ? `
                            <div class="contact-info-row">
                                <span class="contact-icon">📞</span>
                                <span class="contact-label">Tel. Principal:</span>
                                <a href="tel:${cleanPhone}" class="contact-value-link">${client.contact_phone}</a>
                                <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="btn-wa-direct" title="Abrir WhatsApp con el cliente">💬</a>
                            </div>
                        ` : ''}

                        ${client.secondary_phone ? `
                            <div class="contact-info-row">
                                <span class="contact-icon">📱</span>
                                <span class="contact-label">Tel. Secundario:</span>
                                <a href="tel:${cleanSecondaryPhone}" class="contact-value-link">${client.secondary_phone}</a>
                                <a href="https://wa.me/${cleanSecondaryPhone.replace('+', '')}" target="_blank" class="btn-wa-direct" title="Abrir WhatsApp secundario">💬</a>
                            </div>
                        ` : ''}

                        ${client.contact_email ? `
                            <div class="contact-info-row">
                                <span class="contact-icon">✉️</span>
                                <span class="contact-label">Correo:</span>
                                <a href="mailto:${client.contact_email}" class="contact-value-link" title="${client.contact_email}">${client.contact_email}</a>
                            </div>
                        ` : ''}

                        ${client.website_url ? `
                            <div class="contact-info-row">
                                <span class="contact-icon">🌐</span>
                                <span class="contact-label">Sitio Web:</span>
                                <a href="${client.website_url.startsWith('http') ? client.website_url : 'https://' + client.website_url}" target="_blank" class="contact-value-link website" title="${client.website_url}">
                                    <span>${client.website_url.replace(/^https?:\/\//, '')}</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 11px; height: 11px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                            </div>
                        ` : ''}

                        ${client.notes ? `
                            <div class="client-notes-snippet">
                                <strong>📝 Notas:</strong> <span>${client.notes}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Métricas de Contenidos (Posts & Aprobaciones) -->
                    <div class="client-posts-stats-row">
                        <div class="mini-stat">
                            <span class="num">${clientStats.total}</span>
                            <span class="lbl">Posts</span>
                        </div>
                        <div class="mini-stat pending">
                            <span class="num">${clientStats.pending}</span>
                            <span class="lbl">Por Aprobar</span>
                        </div>
                        <div class="mini-stat approved">
                            <span class="num">${clientStats.approved}</span>
                            <span class="lbl">Aprobados</span>
                        </div>
                        <div class="mini-stat">
                            <span class="num">${clientStats.reels}</span>
                            <span class="lbl">Reels</span>
                        </div>
                    </div>

                    <!-- Footer de Acciones de la Tarjeta con Enlace Exclusivo -->
                    <div class="client-card-footer">
                        <button class="btn-select-brand" onclick="window.clientManager.selectAndOpenFeed(${client.id})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            <span>${isActiveCurrent ? '● Marca Activa' : 'Ver Calendario'}</span>
                        </button>

                        <button class="btn-card-share-link" onclick="window.clientManager.copyClientLink(${client.id})" title="Copiar enlace exclusivo de aprobación para ${client.name}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" style="width: 14px; height: 14px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            <span>🔗 Link de Aprobación</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar Modo Lista / Tabla (List View)
    renderListView(clients) {
        const activeClient = window.authManager.getActiveClient();
        const canSwitch = window.authManager.canSwitchClient();

        let tableRowsHtml = clients.map(client => {
            const isProspect = (client.client_type || 'active_client') === 'prospect';
            const isActiveCurrent = activeClient && activeClient.id === client.id;
            const clientStats = window.dbStore.getClientStats(client.id);
            const brandColor = client.brand_color || '#2563eb';
            const initials = client.logo_text || client.name.substring(0, 2).toUpperCase();

            const cleanPhone = (client.contact_phone || '').replace(/[^0-9+]/g, '');
            const cleanSecondaryPhone = (client.secondary_phone || '').replace(/[^0-9+]/g, '');
            const hasTarget = clientStats.target_posts > 0 || clientStats.target_reels > 0;

            return `
                <tr class="client-table-row ${isActiveCurrent ? 'row-active-brand' : ''}">
                    <!-- Empresa e Identidad -->
                    <td class="col-client-brand">
                        <div class="client-table-brand-cell">
                            <div class="client-avatar-sq-sm" style="background: ${brandColor};">
                                ${initials}
                            </div>
                            <div class="brand-cell-texts">
                                <strong class="brand-cell-name" onclick="window.clientManager.selectAndOpenFeed(${client.id})">${client.name}</strong>
                                <span class="brand-cell-desc">${client.description || 'Sin giro especificado'}</span>
                            </div>
                        </div>
                    </td>

                    <!-- Sector / Estado -->
                    <td class="col-client-sector">
                        <span class="client-sector-badge ${isProspect ? 'prospect' : 'active-client'}">
                            ${isProspect ? '🎯 Prospecto' : '💎 Cliente'}
                        </span>
                    </td>

                    <!-- Metas y Alertas de Contenido -->
                    <td class="col-client-quotas">
                        ${hasTarget ? `
                            <div class="table-quota-cell">
                                <span class="quota-badge ${clientStats.has_alert ? 'warning' : 'success'}">
                                    ${clientStats.has_alert ? `⚠️ ${clientStats.alert_message}` : '✅ Meta Cumplida'}
                                </span>
                                <div class="table-quota-counts">
                                    <span>Posts: <strong>${clientStats.total}/${clientStats.target_posts}</strong></span>
                                    <span>Reels: <strong>${clientStats.reels}/${clientStats.target_reels}</strong></span>
                                </div>
                            </div>
                        ` : `
                            <span class="table-no-quota" onclick="window.clientManager.openEditClientModal(${client.id})">+ Fijar metas</span>
                        `}
                    </td>

                    <!-- Contacto Rápido -->
                    <td class="col-client-contact">
                        <div class="table-contact-box">
                            ${client.contact_phone ? `
                                <div class="table-contact-item">
                                    <span>📞</span>
                                    <a href="tel:${cleanPhone}">${client.contact_phone}</a>
                                    <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="table-btn-wa" title="WhatsApp">💬</a>
                                </div>
                            ` : ''}

                            ${client.secondary_phone ? `
                                <div class="table-contact-item">
                                    <span>📱</span>
                                    <a href="tel:${cleanSecondaryPhone}">${client.secondary_phone}</a>
                                    <a href="https://wa.me/${cleanSecondaryPhone.replace('+', '')}" target="_blank" class="table-btn-wa" title="WhatsApp 2">💬</a>
                                </div>
                            ` : ''}

                            ${client.contact_email ? `
                                <div class="table-contact-item">
                                    <span>✉️</span>
                                    <a href="mailto:${client.contact_email}" title="${client.contact_email}">${client.contact_email}</a>
                                </div>
                            ` : ''}

                            ${client.website_url ? `
                                <div class="table-contact-item">
                                    <span>🌐</span>
                                    <a href="${client.website_url.startsWith('http') ? client.website_url : 'https://' + client.website_url}" target="_blank">${client.website_url.replace(/^https?:\/\//, '')}</a>
                                </div>
                            ` : ''}
                        </div>
                    </td>

                    <!-- Publicaciones -->
                    <td class="col-client-posts">
                        <div class="table-posts-summary">
                            <span class="table-stat-badge" title="Total Posts">${clientStats.total} total</span>
                            <span class="table-stat-badge pending" title="Por Aprobar">${clientStats.pending} pend.</span>
                            <span class="table-stat-badge approved" title="Aprobados">${clientStats.approved} aprob.</span>
                        </div>
                    </td>

                    <!-- Acciones Directas y Enlace por Cliente -->
                    <td class="col-client-actions">
                        <div class="table-action-buttons">
                            <button class="btn-table-action brand-link" onclick="window.clientManager.copyClientLink(${client.id})" title="Copiar enlace de aprobación exclusivo para ${client.name}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" style="width: 14px; height: 14px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                <span>🔗 Copiar Link</span>
                            </button>

                            <button class="btn-table-action feed" onclick="window.clientManager.selectAndOpenFeed(${client.id})" title="Ver Calendario de Contenidos">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                <span>Calendario</span>
                            </button>

                            <button class="btn-icon-action" onclick="window.clientManager.openEditClientModal(${client.id})" title="Editar datos">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>

                            ${canSwitch ? `
                                <button class="btn-icon-action delete" onclick="window.clientManager.deleteClient(${client.id})" title="Eliminar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 13px; height: 13px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="clients-table-wrapper">
                <table class="clients-table">
                    <thead>
                        <tr>
                            <th>Empresa / Marca</th>
                            <th>Sector</th>
                            <th>Metas & Alertas</th>
                            <th>Contacto Directo</th>
                            <th>Publicaciones</th>
                            <th style="text-align: right;">Acciones & Enlace</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Renderizar barra de filtros de categoría / sector
    renderCategoryPills(stats) {
        const pillsContainer = document.getElementById('client-category-pills');
        if (!pillsContainer) return;

        const categories = [
            { id: 'all', label: 'Todas las Empresas', count: stats.total, icon: '🏢' },
            { id: 'active_client', label: 'Clientes Reales (Activos)', count: stats.activeCount, icon: '💎' },
            { id: 'prospect', label: 'Prospectos / Leads', count: stats.prospectCount, icon: '🎯' }
        ];

        pillsContainer.innerHTML = categories.map(c => `
            <button class="category-pill-btn ${this.currentFilter === c.id ? 'active' : ''}" 
                    onclick="window.clientManager.setFilter('${c.id}')">
                <span>${c.icon}</span>
                <span>${c.label}</span>
                <span class="count-badge">${c.count}</span>
            </button>
        `).join('');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderClientsView();
    }

    // Seleccionar cliente y saltar directo al Feed
    selectAndOpenFeed(clientId) {
        window.authManager.setActiveClientId(clientId);
        window.uiRenderer.currentView = 'feed';
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.toggle('active', n.dataset.view === 'feed');
        });
        window.uiRenderer.renderAll();
        const client = window.dbStore.getClientById(clientId);
        window.uiRenderer.showToast(`Has seleccionado: ${client ? client.name : 'Cliente'}`, 'check');
    }

    // Copiar enlace de aprobación exclusivo del cliente solicitado
    copyClientLink(clientId) {
        const client = window.dbStore.getClientById(clientId);
        const link = window.authManager.getShareableClientLink(clientId);
        navigator.clipboard.writeText(link).then(() => {
            const clientName = client ? client.name : 'Cliente';
            window.uiRenderer.showToast(`Enlace de aprobación de "${clientName}" copiado al portapapeles`, 'sparkle');
        });
    }

    // Convertir tipo de cliente
    convertType(clientId, newType) {
        const updated = window.dbStore.convertClientType(clientId, newType);
        if (updated) {
            const isNowActive = newType === 'active_client';
            window.uiRenderer.showToast(`"${updated.name}" ahora está en: ${isNowActive ? '💎 Clientes Reales' : '🎯 Prospectos'}`, 'check');
            this.renderClientsView();
            window.uiRenderer.renderSidebarClient();
        }
    }

    // Abrir Modal en modo CREACIÓN
    openCreateModal(defaultType = 'active_client') {
        this.editingClientId = null;
        if (!this.modalEl) this.modalEl = document.getElementById('client-modal');
        if (!this.modalEl) return;

        document.getElementById('client-modal-title').textContent = 'Registrar Nueva Empresa / Marca';
        document.getElementById('client-modal-desc').textContent = 'Captura los datos de contacto, metas de contenido y clasifícalo como Cliente Real o Prospecto.';
        document.getElementById('btn-client-submit-label').textContent = 'Guardar y Registrar Empresa';

        // Seleccionar tipo
        const typeRadio = document.querySelector(`input[name="client-modal-type"][value="${defaultType}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
            typeRadio.dispatchEvent(new Event('change'));
        }

        // Limpiar campos
        document.getElementById('client-input-name').value = '';
        document.getElementById('client-input-desc').value = '';
        document.getElementById('client-input-email').value = '';
        document.getElementById('client-input-phone').value = '';
        document.getElementById('client-input-secondary-phone').value = '';
        document.getElementById('client-input-website').value = '';
        document.getElementById('client-input-notes').value = '';
        document.getElementById('client-input-color').value = '#2563eb';
        
        // Metas acordadas por defecto
        const inputTargetPosts = document.getElementById('client-input-target-posts');
        const inputTargetReels = document.getElementById('client-input-target-reels');
        if (inputTargetPosts) inputTargetPosts.value = '12';
        if (inputTargetReels) inputTargetReels.value = '4';

        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Abrir Modal en modo EDICIÓN
    openEditClientModal(clientId) {
        const client = window.dbStore.getClientById(clientId);
        if (!client) return;

        this.editingClientId = clientId;
        if (!this.modalEl) this.modalEl = document.getElementById('client-modal');
        if (!this.modalEl) return;

        document.getElementById('client-modal-title').textContent = `Editar Datos: ${client.name}`;
        document.getElementById('client-modal-desc').textContent = 'Actualiza la información comercial, metas de contenidos acordadas y teléfonos de contacto.';
        document.getElementById('btn-client-submit-label').textContent = 'Actualizar Datos de la Empresa';

        // Prellenar tipo
        const clientType = client.client_type || 'active_client';
        const typeRadio = document.querySelector(`input[name="client-modal-type"][value="${clientType}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
            typeRadio.dispatchEvent(new Event('change'));
        }

        // Prellenar campos
        document.getElementById('client-input-name').value = client.name || '';
        document.getElementById('client-input-desc').value = client.description || '';
        document.getElementById('client-input-email').value = client.contact_email || '';
        document.getElementById('client-input-phone').value = client.contact_phone || '';
        document.getElementById('client-input-secondary-phone').value = client.secondary_phone || '';
        document.getElementById('client-input-website').value = client.website_url || '';
        document.getElementById('client-input-notes').value = client.notes || '';
        document.getElementById('client-input-color').value = client.brand_color || '#2563eb';

        // Prellenar metas
        const inputTargetPosts = document.getElementById('client-input-target-posts');
        const inputTargetReels = document.getElementById('client-input-target-reels');
        if (inputTargetPosts) inputTargetPosts.value = client.target_posts_count !== undefined ? client.target_posts_count : 0;
        if (inputTargetReels) inputTargetReels.value = client.target_reels_count !== undefined ? client.target_reels_count : 0;

        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modalEl) this.modalEl = document.getElementById('client-modal');
        if (!this.modalEl) return;
        this.modalEl.classList.remove('active');
        document.body.style.overflow = '';
        this.editingClientId = null;
    }

    // Guardar (Crear o Actualizar)
    submitClientForm() {
        const name = document.getElementById('client-input-name')?.value.trim();
        const typeInput = document.querySelector('input[name="client-modal-type"]:checked');
        const clientType = typeInput ? typeInput.value : 'active_client';
        const description = document.getElementById('client-input-desc')?.value.trim();
        const contactEmail = document.getElementById('client-input-email')?.value.trim();
        const contactPhone = document.getElementById('client-input-phone')?.value.trim();
        const secondaryPhone = document.getElementById('client-input-secondary-phone')?.value.trim();
        const websiteUrl = document.getElementById('client-input-website')?.value.trim();
        const notes = document.getElementById('client-input-notes')?.value.trim();
        const brandColor = document.getElementById('client-input-color')?.value || '#2563eb';
        const targetPosts = parseInt(document.getElementById('client-input-target-posts')?.value || 0);
        const targetReels = parseInt(document.getElementById('client-input-target-reels')?.value || 0);

        if (!name) {
            alert('Por favor ingresa el nombre de la empresa o marca.');
            return;
        }

        const clientData = {
            name,
            client_type: clientType,
            description,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            secondary_phone: secondaryPhone,
            website_url: websiteUrl,
            notes,
            brand_color: brandColor,
            target_posts_count: targetPosts,
            target_reels_count: targetReels
        };

        if (this.editingClientId) {
            const updated = window.dbStore.updateClient(this.editingClientId, clientData);
            if (updated) {
                window.uiRenderer.showToast(`Datos de "${updated.name}" actualizados correctamente`, 'check');
            }
        } else {
            const created = window.dbStore.createClient(clientData);
            if (created) {
                window.uiRenderer.showToast(`Empresa "${created.name}" registrada con éxito`, 'check');
                window.authManager.setActiveClientId(created.id);
            }
        }

        this.closeModal();
        this.renderClientsView();
        window.uiRenderer.renderAll();
    }

    // Eliminar Cliente
    deleteClient(clientId) {
        if (!window.authManager.canSwitchClient()) {
            alert('No tienes permisos de Super Administrador para eliminar empresas.');
            return;
        }

        const client = window.dbStore.getClientById(clientId);
        if (!client) return;

        const allClients = window.dbStore.getClients();
        if (allClients.length <= 1) {
            alert('No puedes eliminar la única empresa registrada en el sistema.');
            return;
        }

        if (confirm(`¿Estás seguro de eliminar "${client.name}"?\nEsta acción eliminará sus publicaciones y accesos asociados.`)) {
            const success = window.dbStore.deleteClient(clientId);
            if (success) {
                window.uiRenderer.showToast('Empresa eliminada correctamente', 'check');
                
                // Si el cliente eliminado era el activo, cambiar al primero disponible
                const remaining = window.dbStore.getClients();
                if (window.authManager.getActiveClientId() === parseInt(clientId) && remaining.length > 0) {
                    window.authManager.setActiveClientId(remaining[0].id);
                }

                this.renderClientsView();
                window.uiRenderer.renderAll();
            }
        }
    }
}

window.clientManager = new ClientManager();
// Compatibilidad
window.clientCreator = {
    open: () => window.clientManager.openCreateModal(),
    close: () => window.clientManager.closeModal(),
    submitNewClient: () => window.clientManager.submitClientForm()
};
