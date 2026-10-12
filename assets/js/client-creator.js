/**
 * ==========================================================
 * GESTOR DE CREACIÓN DE NUEVOS CLIENTES (MODO AGENCIA)
 * Inserta nuevos clientes en la tabla 'clients' del DataStore
 * ==========================================================
 */

class ClientCreatorManager {
    constructor() {
        this.modalEl = null;
    }

    init() {
        this.modalEl = document.getElementById('create-client-modal');
    }

    open() {
        if (!this.modalEl) return;
        window.uiRenderer.closeClientDropdown();
        this.modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';

        const nameInput = document.getElementById('new-client-name');
        if (nameInput) {
            nameInput.focus();
        }
    }

    close() {
        if (!this.modalEl) return;
        this.modalEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Guardar nuevo cliente en la base de datos simulada
    submitNewClient() {
        const nameInput = document.getElementById('new-client-name');
        const descInput = document.getElementById('new-client-description');
        const emailInput = document.getElementById('new-client-email');
        const colorInput = document.getElementById('new-client-color');

        const name = nameInput ? nameInput.value.trim() : '';
        const description = descInput ? descInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const color = colorInput ? colorInput.value : '#2563eb';

        if (!name) {
            alert('Por favor ingresa el nombre de la marca o cliente.');
            if (nameInput) nameInput.focus();
            return;
        }

        const clientData = {
            name: name,
            description: description || 'Cliente de la Agencia',
            contact_email: email,
            brand_color: color
        };

        const newClient = window.dbStore.createClient(clientData);
        if (newClient) {
            // Seleccionar inmediatamente el nuevo cliente
            window.authManager.setActiveClientId(newClient.id);
            
            window.uiRenderer.showToast(`¡Cliente "${newClient.name}" creado con éxito!`, 'check');
            this.close();

            // Limpiar formulario
            if (nameInput) nameInput.value = '';
            if (descInput) descInput.value = '';
            if (emailInput) emailInput.value = '';

            // Actualizar toda la interfaz
            window.uiRenderer.renderAll();
        }
    }
}

window.clientCreator = new ClientCreatorManager();
