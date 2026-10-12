/**
 * ==========================================================
 * GESTOR DE USUARIOS Y ASIGNACIÓN DE CLIENTES (USER MANAGER)
 * Permite asignar a cada usuario su cliente correspondiente
 * para aislar por completo la información entre clientes.
 * ==========================================================
 */

class UserManager {
    constructor() {
        this.currentCategoryFilter = 'all'; // 'all', 'agency', 'client'
        this.searchQuery = '';
        this.editingUserId = null;
        this.modalEl = null;
    }

    init() {
        this.modalEl = document.getElementById('create-user-modal');
        this.bindEvents();
    }

    bindEvents() {
        // Selector de Categoría dentro del Modal (Agencia vs Cliente)
        const categoryRadios = document.querySelectorAll('input[name="new-user-category"]');

        categoryRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const category = e.target.value;
                this.populateClientSelect(category);

                // Ajustar sugerencias de cargos según la categoría
                const positionInput = document.getElementById('new-user-position');
                if (positionInput && !this.editingUserId) {
                    positionInput.placeholder = category === 'client'
                        ? 'Ej. Director Médico, Gerente General, Marketing Lead' 
                        : 'Ej. Diseñador Senior, Community Manager, Director de Cuenta';
                }
            });
        });
    }

    // Poblar selector de clientes según la categoría seleccionada
    populateClientSelect(category, selectedClientId = null) {
        const clientSelect = document.getElementById('new-user-client-id');
        const clientHint = document.getElementById('user-client-hint');
        if (!clientSelect) return;

        const allClients = window.dbStore.getAllClients ? window.dbStore.getAllClients() : window.dbStore.getClients();

        if (category === 'agency') {
            clientSelect.innerHTML = `
                <option value="" ${!selectedClientId ? 'selected' : ''}>🌐 Todas las Marcas (Acceso Total / Super Admin)</option>
                ${allClients.map(c => `
                    <option value="${c.id}" ${selectedClientId && parseInt(selectedClientId) === c.id ? 'selected' : ''}>
                        🏢 ${c.name} (Acceso Exclusivo Asignado)
                    </option>
                `).join('')}
            `;
            if (clientHint) {
                clientHint.innerHTML = `
                    🛡️ <strong>Aislamiento de Cuentas:</strong> Si asignas un cliente específico, este miembro del equipo <strong>únicamente podrá ver el calendario, posts y reels de esa marca</strong>. No tendrá acceso a las demás marcas.
                `;
            }
        } else {
            // Vista Cliente
            clientSelect.innerHTML = `
                <option value="" disabled ${!selectedClientId ? 'selected' : ''}>-- Selecciona la Marca Asignada (*) --</option>
                ${allClients.map(c => `
                    <option value="${c.id}" ${selectedClientId && parseInt(selectedClientId) === c.id ? 'selected' : ''}>
                        👤 ${c.name}
                    </option>
                `).join('')}
            `;
            if (clientHint) {
                clientHint.innerHTML = `
                    🔒 <strong>Aprobador de Marca:</strong> Este usuario solo tendrá acceso al portal de aprobación de la marca asignada.
                `;
            }
        }
    }

    // Renderizar la Vista Principal de Gestión de Usuarios
    renderUsersView() {
        const usersContainer = document.getElementById('users-grid-container');
        if (!usersContainer) return;

        const users = window.dbStore.getUsers(this.currentCategoryFilter, this.searchQuery);
        const stats = window.dbStore.getUserStats();

        // Actualizar contadores de métricas de usuarios
        const statTotal = document.getElementById('stat-users-total');
        const statAgency = document.getElementById('stat-users-agency');
        const statClient = document.getElementById('stat-users-client');

        if (statTotal) statTotal.textContent = stats.total;
        if (statAgency) statAgency.textContent = stats.agencyCount;
        if (statClient) statClient.textContent = stats.clientCount;

        // Renderizar barra de filtros por categoría
        this.renderCategoryPills(stats);

        if (users.length === 0) {
            usersContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 20px; border: 1.5px dashed var(--border-subtle);">
                    <div style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--text-muted);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">No se encontraron usuarios</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">No hay miembros o aprobadores que coincidan con la búsqueda.</p>
                </div>
            `;
            return;
        }

        const activeUser = window.authManager.getCurrentUser();

        usersContainer.innerHTML = users.map(user => {
            const isAgency = user.category === 'agency';
            const isCurrentActive = activeUser && activeUser.id === user.id;
            const initials = user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            const brandColor = isAgency ? (user.avatar_color || '#2563eb') : (user.client?.brand_color || '#ea580c');
            const hasAssignedClient = !!user.client_id;
            const clientName = user.client ? user.client.name : (hasAssignedClient ? `Cliente #${user.client_id}` : null);

            return `
                <div class="user-card ${isCurrentActive ? 'current-active-user' : ''}">
                    <div class="user-card-header">
                        <!-- Badge de Categoría Principal -->
                        <span class="user-category-badge ${isAgency ? 'agency' : 'client'}">
                            ${isAgency ? `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                <span>Modo Agencia</span>
                            ` : `
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <span>Vista Cliente</span>
                            `}
                        </span>

                        <!-- Badge de Asignación de Cliente / Aislamiento -->
                        ${hasAssignedClient ? `
                            <span class="user-assigned-badge restricted" title="Este usuario solo puede ver los contenidos de ${clientName}">
                                🔒 ${clientName}
                            </span>
                        ` : `
                            <span class="user-assigned-badge global" title="Este usuario tiene acceso a todas las marcas (Super Admin)">
                                🌐 Acceso Total
                            </span>
                        `}

                        ${isCurrentActive ? `
                            <span class="user-active-indicator">● Sesión Activa</span>
                        ` : ''}
                    </div>

                    <div class="user-profile-section">
                        <div class="user-avatar-large" style="background: ${brandColor};">
                            ${initials}
                        </div>
                        <div class="user-info-text">
                            <h3 class="user-name-title">${user.full_name}</h3>
                            <span class="user-position-text">${user.position || user.role_label}</span>
                            <span class="user-email-text">${user.email}</span>
                        </div>
                    </div>

                    <!-- Detalles de Asignación y Permisos -->
                    <div class="user-meta-details-box">
                        <div class="user-meta-item">
                            <span class="meta-label">Cliente Asignado:</span>
                            <span class="meta-value highlight" style="color: ${hasAssignedClient ? (user.client?.brand_color || 'var(--accent)') : '#10b981'};">
                                ${hasAssignedClient ? `🔒 ${clientName} (Aislado)` : '🏢 Todas las Marcas (Super Admin)'}
                            </span>
                        </div>
                        <div class="user-meta-item">
                            <span class="meta-label">Rol del Sistema:</span>
                            <span class="meta-value">${user.role_label}</span>
                        </div>
                        ${user.phone ? `
                            <div class="user-meta-item">
                                <span class="meta-label">Teléfono:</span>
                                <span class="meta-value">${user.phone}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Acciones del Usuario -->
                    <div class="user-card-actions">
                        <button class="btn-switch-user" onclick="window.userManager.switchActiveUser(${user.id})" title="Simular la vista de este usuario">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            <span>${isCurrentActive ? 'Usuario en Uso' : 'Ingresar como este Usuario'}</span>
                        </button>

                        <!-- Botón de Edición -->
                        <button class="btn-user-edit" onclick="window.userManager.openEditUserModal(${user.id})" title="Editar usuario y asignación de cliente">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>

                        ${!isAgency && user.client ? `
                            <button class="btn-user-link" onclick="window.userManager.copyUserAccessLink(${user.id})" title="Copiar enlace de aprobación para este cliente">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </button>
                        ` : ''}

                        ${user.id > 1 ? `
                            <button class="btn-user-delete" onclick="window.userManager.deleteUser(${user.id})" title="Eliminar usuario">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar barra de filtros de categoría
    renderCategoryPills(stats) {
        const pillsContainer = document.getElementById('user-category-pills');
        if (!pillsContainer) return;

        const categories = [
            { id: 'all', label: 'Todos los Usuarios', count: stats.total, icon: '👥' },
            { id: 'agency', label: 'Modo Agencia (Equipo)', count: stats.agencyCount, icon: '🏢' },
            { id: 'client', label: 'Vista Cliente (Aprobadores)', count: stats.clientCount, icon: '👤' }
        ];

        pillsContainer.innerHTML = categories.map(c => `
            <button class="category-pill-btn ${this.currentCategoryFilter === c.id ? 'active' : ''}" 
                    onclick="window.userManager.setCategoryFilter('${c.id}')">
                <span>${c.icon}</span>
                <span>${c.label}</span>
                <span class="count-badge">${c.count}</span>
            </button>
        `).join('');
    }

    setCategoryFilter(category) {
        this.currentCategoryFilter = category;
        this.renderUsersView();
    }

    // Cambiar sesión activa a un usuario específico
    switchActiveUser(userId) {
        const user = window.dbStore.getUserById(userId);
        if (!user) return;

        window.authManager.setCurrentUser(user);
        
        const clientName = user.client ? user.client.name : (user.client_id ? `Cliente #${user.client_id}` : null);
        if (user.client_id) {
            window.uiRenderer.showToast(`Has cambiado a: ${user.full_name} (🔒 Asignado exclusivamente a: ${clientName})`, 'check');
        } else {
            window.uiRenderer.showToast(`Has cambiado a: ${user.full_name} (🌐 Super Admin - Acceso a todas las marcas)`, 'check');
        }
        
        // Si es cliente, cambiar a vista de feed automáticamente
        if (user.category === 'client') {
            window.uiRenderer.currentView = 'feed';
            document.querySelectorAll('.nav-item').forEach(n => {
                n.classList.toggle('active', n.dataset.view === 'feed');
            });
        }

        window.uiRenderer.renderAll();
    }

    // Copiar enlace de acceso directo para el cliente
    copyUserAccessLink(userId) {
        const user = window.dbStore.getUserById(userId);
        if (!user || !user.client) return;

        const link = window.authManager.getShareableClientLink(user.client.id);
        navigator.clipboard.writeText(link).then(() => {
            window.uiRenderer.showToast(`Enlace de acceso para ${user.full_name} copiado al portapapeles`, 'check');
        });
    }

    // Abrir Modal para Registrar Nuevo Usuario
    openCreateUserModal(defaultCategory = 'agency') {
        this.editingUserId = null;
        if (!this.modalEl) this.modalEl = document.getElementById('create-user-modal');
        if (!this.modalEl) return;

        const titleEl = document.getElementById('user-modal-title');
        const descEl = document.getElementById('user-modal-desc');
        const submitBtn = document.getElementById('btn-submit-user');

        if (titleEl) titleEl.textContent = 'Registrar Nuevo Usuario';
        if (descEl) descEl.textContent = 'Selecciona la categoría y asigna el cliente correspondiente para garantizar el aislamiento de contenidos.';
        if (submitBtn) submitBtn.textContent = 'Guardar Usuario';

        // Seleccionar categoría
        const radio = document.querySelector(`input[name="new-user-category"][value="${defaultCategory}"]`);
        if (radio) {
            radio.checked = true;
        }

        this.populateClientSelect(defaultCategory, null);

        // Limpiar campos
        const nameInput = document.getElementById('new-user-name');
        const emailInput = document.getElementById('new-user-email');
        const posInput = document.getElementById('new-user-position');
        const phoneInput = document.getElementById('new-user-phone');
        const colorInput = document.getElementById('new-user-color');

        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (posInput) posInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (colorInput) colorInput.value = defaultCategory === 'agency' ? '#2563eb' : '#ea580c';

        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Abrir Modal para Editar Usuario y Asignación de Cliente
    openEditUserModal(userId) {
        const user = window.dbStore.getUserById(userId);
        if (!user) return;

        this.editingUserId = parseInt(userId);
        if (!this.modalEl) this.modalEl = document.getElementById('create-user-modal');
        if (!this.modalEl) return;

        const titleEl = document.getElementById('user-modal-title');
        const descEl = document.getElementById('user-modal-desc');
        const submitBtn = document.getElementById('btn-submit-user');

        if (titleEl) titleEl.textContent = 'Editar Usuario y Asignación de Cliente';
        if (descEl) descEl.textContent = `Modifica los datos de ${user.full_name} y asigna o cambia su cliente para aislar su vista.`;
        if (submitBtn) submitBtn.textContent = 'Actualizar Usuario';

        // Seleccionar categoría
        const radio = document.querySelector(`input[name="new-user-category"][value="${user.category}"]`);
        if (radio) {
            radio.checked = true;
        }

        this.populateClientSelect(user.category, user.client_id);

        // Pre-llenar campos
        const nameInput = document.getElementById('new-user-name');
        const emailInput = document.getElementById('new-user-email');
        const posInput = document.getElementById('new-user-position');
        const phoneInput = document.getElementById('new-user-phone');
        const colorInput = document.getElementById('new-user-color');

        if (nameInput) nameInput.value = user.full_name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (posInput) posInput.value = user.position || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (colorInput) colorInput.value = user.avatar_color || '#2563eb';

        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCreateUserModal() {
        if (!this.modalEl) this.modalEl = document.getElementById('create-user-modal');
        if (!this.modalEl) return;
        this.editingUserId = null;
        this.modalEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Procesar Creación o Edición de Usuario
    submitNewUser() {
        const categoryInput = document.querySelector('input[name="new-user-category"]:checked');
        const category = categoryInput ? categoryInput.value : 'agency';
        const name = document.getElementById('new-user-name')?.value.trim();
        const email = document.getElementById('new-user-email')?.value.trim();
        const position = document.getElementById('new-user-position')?.value.trim();
        const phone = document.getElementById('new-user-phone')?.value.trim();
        const clientIdVal = document.getElementById('new-user-client-id')?.value;
        const color = document.getElementById('new-user-color')?.value || '#2563eb';

        if (!name || !email) {
            alert('Por favor completa el Nombre completo y Correo electrónico del usuario.');
            return;
        }

        if (category === 'client' && (!clientIdVal || clientIdVal === '')) {
            alert('Un usuario de Vista Cliente debe tener obligatoriamente una marca asignada.');
            return;
        }

        const clientId = (clientIdVal && clientIdVal !== '' && clientIdVal !== 'all') ? parseInt(clientIdVal) : null;

        if (this.editingUserId) {
            // Actualizar usuario existente
            const updated = window.dbStore.updateUser(this.editingUserId, {
                full_name: name,
                email: email,
                position: position,
                phone: phone,
                category: category,
                client_id: clientId,
                avatar_color: color,
                role_id: category === 'agency' ? 2 : 3
            });

            if (updated) {
                // Si el usuario editado es el que está en sesión activa, refrescar su sesión
                const currentUser = window.authManager.getCurrentUser();
                if (currentUser && currentUser.id === this.editingUserId) {
                    window.authManager.setCurrentUser(updated);
                }

                window.uiRenderer.showToast(`Usuario "${name}" actualizado con éxito. Asignación guardada.`, 'check');
                this.closeCreateUserModal();
                this.renderUsersView();
                window.uiRenderer.renderAll();
            }
        } else {
            // Registrar nuevo usuario
            const newUser = window.dbStore.createUser({
                full_name: name,
                email: email,
                position: position,
                phone: phone,
                category: category,
                client_id: clientId,
                avatar_color: color,
                role_id: category === 'agency' ? 2 : 3
            });

            if (newUser) {
                window.uiRenderer.showToast(`Usuario "${newUser.full_name}" registrado con éxito.`, 'check');
                this.closeCreateUserModal();
                this.renderUsersView();
                window.uiRenderer.renderAll();
            }
        }
    }

    // Eliminar usuario
    deleteUser(userId) {
        const user = window.dbStore.getUserById(userId);
        if (!user) return;

        if (confirm(`¿Estás seguro de eliminar el acceso de "${user.full_name}"?`)) {
            const success = window.dbStore.deleteUser(userId);
            if (success) {
                // Si el usuario eliminado era el activo, volver al admin #1
                if (window.authManager.currentUserId === parseInt(userId)) {
                    window.authManager.currentUserId = 1;
                }
                window.uiRenderer.showToast('Usuario eliminado correctamente', 'check');
                this.renderUsersView();
                window.uiRenderer.renderAll();
            }
        }
    }
}

window.userManager = new UserManager();
