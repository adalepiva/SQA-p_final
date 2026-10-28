// Migration utility: run only on the original 1.2.0 source.
const fs = require('node:fs');
const file = 'desa_Agenda_Proyecto2/agenda-contactos/assets/agenda.js';
let source = fs.readFileSync(file, 'utf8');
const start = source.indexOf('        async function editContact(');
const end = source.indexOf('        function createContactCard(', start);
if (source.includes('async function requestContact')) throw new Error('Already migrated');
const helpers = `        async function requestContact(method, contactId = null, contact = null, searchText = '') {
            const url = new URL(root.dataset.url);
            if (contactId !== null) {
                if (url.searchParams.has('rest_route')) {
                    const route = url.searchParams.get('rest_route').replace(/\\/$/, '');
                    url.searchParams.set('rest_route', route + '/' + contactId);
                } else {
                    url.pathname = url.pathname.replace(/\\/$/, '') + '/' + contactId;
                }
            }
            if (searchText) url.searchParams.set('buscar', searchText);
            const response = await fetch(url, {
                method, credentials: 'same-origin', cache: 'no-store',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-WP-Nonce': root.dataset.nonce },
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

`;
source = source.slice(0,start) + helpers + source.slice(end);
const listStart = source.indexOf('            const url = new URL(root.dataset.url);', source.indexOf('        async function loadContacts'));
const listEnd = source.indexOf('            contactList.replaceChildren();', listStart);
source = source.slice(0,listStart) + "            const contacts = await requestContact('GET', null, null, searchText);\n" + source.slice(listEnd);
const createStart = source.indexOf('        async function createContact(');
const saveStart = source.indexOf('        async function saveContact(', createStart);
source = source.slice(0,createStart) + source.slice(saveStart);
source = source.replace('await updateContact(editingContactId, contact);', "await requestContact('PUT', editingContactId, contact);").replace('await createContact(contact);', "await requestContact('POST', null, contact);");
fs.writeFileSync(file, source);
