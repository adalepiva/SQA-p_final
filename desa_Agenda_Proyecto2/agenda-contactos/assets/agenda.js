(() => {
    'use strict';

    document.querySelectorAll('[data-agenda]').forEach((root) => {
        const searchForm = root.querySelector('[data-search]');
        const editorForm = root.querySelector('[data-editor]');
        const contactList = root.querySelector('[data-list]');
        const message = root.querySelector('[data-message]');
        let editingContactId = null;
        let isBusy = false;

        function showMessage(text, isError = false) {
            message.textContent = text;
            message.dataset.error = String(isError);
            message.hidden = !text;
        }

        function createElement(tag, text, className = '') {
            const element = document.createElement(tag);
            // Los datos del contacto se muestran como texto, nunca como HTML.
            element.textContent = text;
            element.className = className;
            return element;
        }

        function setButtonsDisabled(disabled) {
            root.querySelectorAll('button').forEach((button) => {
                button.disabled = disabled;
            });
        }

        async function runAction(work) {
            // Evita que dos operaciones cambien la lista o el formulario al mismo tiempo.
            if (isBusy) {
                return;
            }
            isBusy = true;
            setButtonsDisabled(true);
            showMessage('');
            try {
                await work();
            } catch (error) {
                showMessage(error.message || 'Error de conexión. Intenta nuevamente.', true);
            } finally {
                isBusy = false;
                setButtonsDisabled(false);
            }
        }

        function closeEditor() {
            editingContactId = null;
            editorForm.reset();
            editorForm.hidden = true;
        }

        function showEditor(title) {
            root.querySelector('[data-heading]').textContent = title;
            editorForm.hidden = false;
            editorForm.elements.nombre.focus();
        }

        async function requestContact(method, contactId = null, contact = null, searchText = '') {
            const url = new URL(root.dataset.url);
            if (contactId !== null) {
                if (url.searchParams.has('rest_route')) {
                    const route = url.searchParams.get('rest_route').replace(/\/$/, '');
                    url.searchParams.set('rest_route', route + '/' + contactId);
                } else {
                    url.pathname = url.pathname.replace(/\/$/, '') + '/' + contactId;
                }
            }
            if (searchText) url.searchParams.set('buscar', searchText);
            const response = await fetch(url, {
                method,
                credentials: 'same-origin',
                cache: 'no-store',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': root.dataset.nonce,
                },
                ...(contact === null ? {} : { body: JSON.stringify(contact) }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'No se pudo completar la operación.');
            return result.data;
        }

        async function editContact(contactId) {
            const contact = await requestContact('GET', contactId);
            editingContactId = contact.id;
            for (const field of ['nombre', 'telefono', 'telefono2', 'email', 'direccion']) {
                editorForm.elements[field].value = contact[field] || '';
            }
            showEditor('Editar contacto');
        }

        async function deleteContact(contactId) {
            await requestContact('DELETE', contactId);
            if (editingContactId === contactId) closeEditor();
            await loadContacts();
            showMessage('Contacto eliminado.');
        }

        function createContactCard(contact) {
            const card = createElement('article', '', 'agenda-card');
            card.append(createElement('h3', contact.nombre));
            const details = [
                ['Teléfono', contact.telefono],
                ['Teléfono 2', contact.telefono2],
                ['Correo', contact.email],
                ['Dirección', contact.direccion],
            ];
            for (const [label, value] of details) {
                if (value) {
                    card.append(createElement('p', `${label}: ${value}`));
                }
            }

            const actions = createElement('div', '', 'agenda-actions');
            const editButton = createElement('button', 'Editar');
            editButton.type = 'button';
            editButton.addEventListener('click', () => runAction(() => editContact(contact.id)));

            const deleteButton = createElement('button', 'Eliminar', 'agenda-delete');
            deleteButton.type = 'button';
            deleteButton.addEventListener('click', () => {
                if (!confirm(`¿Eliminar a ${contact.nombre}?`)) {
                    return;
                }
                runAction(() => deleteContact(contact.id));
            });
            actions.append(editButton, deleteButton);
            card.append(actions);
            return card;
        }

        async function loadContacts() {
            const searchText = searchForm.elements.buscar.value.trim();
            const contacts = await requestContact('GET', null, null, searchText);
            contactList.replaceChildren();
            if (!contacts.length) {
                contactList.append(createElement('p', 'No se encontraron contactos.'));
            }
            contacts.forEach((contact) => {
                contactList.append(createContactCard(contact));
            });
        }

        async function saveContact() {
            const isUpdate = editingContactId !== null;
            const contact = Object.fromEntries(new FormData(editorForm));
            if (isUpdate) {
                await requestContact('PUT', editingContactId, contact);
            } else {
                await requestContact('POST', null, contact);
            }
            closeEditor();
            await loadContacts();
            showMessage(isUpdate ? 'Contacto actualizado.' : 'Contacto agregado.');
        }

        root.querySelector('[data-new]').addEventListener('click', () => {
            closeEditor();
            showMessage('');
            showEditor('Nuevo contacto');
        });
        root.querySelector('[data-cancel]').addEventListener('click', closeEditor);
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            runAction(loadContacts);
        });
        editorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            runAction(saveContact);
        });

        runAction(async () => {
            try {
                await loadContacts();
            } catch (error) {
                contactList.textContent = 'No se pudo cargar la agenda. Pulsa Buscar para reintentar.';
                throw error;
            }
        });
    });
})();
