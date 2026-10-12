/**
 * ==========================================================
 * CONTROLADOR PRINCIPAL Y BINDING DE EVENTOS (APP.JS)
 * ==========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar managers
    window.postModal.init();
    window.postCreator.init();
    if (window.clientManager) {
        window.clientManager.init();
    }
    if (window.userManager) {
        window.userManager.init();
    }

    // 2. Render inicial
    window.uiRenderer.renderAll();

    // ==========================================================
    // 3. LISTENERS DE LA BARRA LATERAL (SIDEBAR NAVIGATION)
    // ==========================================================
    
    // Botón de Colapsar / Expandir Menú Lateral
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    if (btnToggleSidebar && sidebar) {
        // Cargar estado de colapso previo
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }

        btnToggleSidebar.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            const nowCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar_collapsed', nowCollapsed);
        });
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const viewType = item.dataset.view;
            const filterStatus = item.dataset.status;

            if (viewType === 'calendar') {
                window.uiRenderer.currentView = 'calendar';
                window.uiRenderer.currentStatusFilter = 'all';
            } else if (viewType === 'clients') {
                window.uiRenderer.currentView = 'clients';
            } else if (viewType === 'users') {
                window.uiRenderer.currentView = 'users';
            } else {
                window.uiRenderer.currentView = 'feed';
                window.uiRenderer.currentStatusFilter = filterStatus || 'all';
            }

            window.uiRenderer.renderAll();
        });
    });

    // Clic en Selector de Cliente (Abre / Cierra Dropdown)
    const clientSwitchWrapper = document.getElementById('client-switch-wrapper');
    if (clientSwitchWrapper) {
        clientSwitchWrapper.addEventListener('click', (e) => {
            // Evitar que el clic en el botón de agregar cliente cierre inmediatamente
            if (e.target.closest('.btn-add-new-client')) {
                return;
            }
            window.uiRenderer.toggleClientDropdown();
        });
    }

    // Cerrar dropdown si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#client-switch-wrapper') && !e.target.closest('#client-dropdown-menu')) {
            window.uiRenderer.closeClientDropdown();
        }
    });

    // Botón para Abrir Modal de Nuevo Cliente
    const btnAddNewClient = document.getElementById('btn-add-new-client');
    if (btnAddNewClient) {
        btnAddNewClient.addEventListener('click', (e) => {
            e.stopPropagation();
            window.clientCreator.open();
        });
    }

    // Botón de Enlace Seguro para el Cliente
    const btnShareLink = document.getElementById('btn-share-client-link');
    if (btnShareLink) {
        btnShareLink.addEventListener('click', () => {
            const link = window.authManager.getShareableClientLink();
            navigator.clipboard.writeText(link).then(() => {
                window.uiRenderer.showToast('Enlace copiado al portapapeles', 'check');
            });
        });
    }

    // Botón Nuevo Post (Abre Modal de Creación)
    const btnNewPost = document.getElementById('btn-open-new-post-modal');
    if (btnNewPost) {
        btnNewPost.addEventListener('click', () => {
            window.postCreator.open();
        });
    }

    // Toggle de clases activas en los checkboxes de plataformas
    document.querySelectorAll('.platform-pill-checkbox input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
            const parent = input.closest('.platform-pill-checkbox');
            if (parent) {
                if (input.checked) {
                    parent.classList.add('active');
                } else {
                    parent.classList.remove('active');
                }
            }
        });
    });

    // ==========================================================
    // 4. LISTENERS DEL HEADER (BÚSQUEDA Y MODO DE ROL)
    // ==========================================================
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (window.uiRenderer.currentView === 'users') {
                if (window.userManager) {
                    window.userManager.searchQuery = query;
                    window.userManager.renderUsersView();
                }
            } else if (window.uiRenderer.currentView === 'clients') {
                if (window.clientManager) {
                    window.clientManager.searchQuery = query;
                    window.clientManager.renderClientsView();
                }
            } else {
                window.uiRenderer.searchQuery = query;
                window.uiRenderer.renderAll();
            }
        });
    }

    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            window.authManager.setRole(role);
            window.uiRenderer.updateRoleUI();
            window.uiRenderer.showToast(`Modo cambiado a: ${role === 'admin' ? 'Agencia / Admin' : 'Cliente (Aprobador)'}`, '👤');
        });
    });

    // ==========================================================
    // 5. LISTENERS DE FILTROS DE CATEGORÍA
    // ==========================================================
    const categoryContainer = document.getElementById('category-filters-container');
    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            const pillBtn = e.target.closest('.category-pill-btn');
            if (!pillBtn) return;

            const status = pillBtn.dataset.status;
            const type = pillBtn.dataset.type;

            window.uiRenderer.currentStatusFilter = status;
            window.uiRenderer.currentTypeFilter = type;
            window.uiRenderer.renderAll();
        });
    }

    // ==========================================================
    // 6. LISTENERS DEL CALENDARIO
    // ==========================================================
    const btnPrevMonth = document.getElementById('btn-calendar-prev');
    const btnNextMonth = document.getElementById('btn-calendar-next');
    const btnToday = document.getElementById('btn-calendar-today');

    if (btnPrevMonth) {
        btnPrevMonth.addEventListener('click', () => {
            window.uiRenderer.calendarDate.setMonth(window.uiRenderer.calendarDate.getMonth() - 1);
            window.uiRenderer.renderCalendar();
        });
    }

    if (btnNextMonth) {
        btnNextMonth.addEventListener('click', () => {
            window.uiRenderer.calendarDate.setMonth(window.uiRenderer.calendarDate.getMonth() + 1);
            window.uiRenderer.renderCalendar();
        });
    }

    if (btnToday) {
        btnToday.addEventListener('click', () => {
            window.uiRenderer.calendarDate = new Date();
            window.uiRenderer.renderCalendar();
        });
    }

    // ==========================================================
    // 7. TECLA ESCAPE PARA CERRAR MODALES
    // ==========================================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (window.postModal) window.postModal.close();
            if (window.postCreator) window.postCreator.close();
            if (window.clientManager) window.clientManager.closeModal();
            if (window.userManager) window.userManager.closeCreateUserModal();
        }
    });
});
