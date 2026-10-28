import { beforeEach, afterEach, test, expect, vi } from 'vitest';
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
const reply = (data, ok = true) => ({ ok, json: async () => data });
const contact = { id: 5, nombre: '<img src=x onerror=alert(1)>', telefono: '12345678', telefono2: '87654321', email: 'a@b.test', direccion: 'Zona 1' };
beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = `<section data-agenda data-url="http://localhost/?rest_route=/agenda/v1/contactos" data-nonce="nonce">
    <form data-search><input name="buscar"></form><form data-editor hidden>
    ${['nombre','telefono','telefono2','email','direccion'].map(name => `<input name="${name}">`).join('')}
    <button>Guardar</button></form><div data-list></div><div data-message></div><h2 data-heading></h2>
    <button data-new>Nuevo</button><button data-cancel>Cancelar</button></section>`;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ data: [contact] })));
  vi.stubGlobal('confirm', vi.fn(() => true));
});
afterEach(() => vi.unstubAllGlobals());
async function start() { await import('../../desa_Agenda_Proyecto2/agenda-contactos/assets/agenda.js'); await tick(); }
function submit(selector) { document.querySelector(selector).dispatchEvent(new Event('submit', { cancelable: true })); }
test('F01 renderiza datos como texto y envía nonce sin cache', async () => {
  await start(); expect(document.querySelector('[data-list] img')).toBeNull();
  expect(document.querySelector('h3').textContent).toBe(contact.nombre);
  expect(fetch.mock.calls[0][1]).toMatchObject({ cache: 'no-store', headers: { 'X-WP-Nonce': 'nonce' } });
});
test('F02 búsqueda y listado vacío', async () => {
  await start(); fetch.mockResolvedValue(reply({ data: [] }));
  document.querySelector('[name=buscar]').value = ' Ana '; submit('[data-search]'); await tick();
  expect(fetch.mock.calls.at(-1)[0].searchParams.get('buscar')).toBe('Ana');
  expect(document.querySelector('[data-list]').textContent).toContain('No se encontraron');
});
test('F03 crear contacto, limpiar formulario y recargar listado', async () => {
  await start(); document.querySelector('[data-new]').click();
  document.querySelector('[name=nombre]').value = 'Ana'; submit('[data-editor]'); await tick();
  const call = fetch.mock.calls.find(([, options]) => options.method === 'POST');
  expect(JSON.parse(call[1].body).nombre).toBe('Ana');
  expect(document.querySelector('[data-editor]').hidden).toBe(true);
  expect(document.querySelector('[data-message]').textContent).toBe('Contacto agregado.');
});
test.each([true, false])('F04 editar y borrar con enlaces simples=%s', async simple => {
  if (!simple) document.querySelector('[data-agenda]').dataset.url = 'http://localhost/wp-json/agenda/v1/contactos';
  await start(); fetch.mockResolvedValueOnce(reply({ data: contact }));
  [...document.querySelectorAll('button')].find(b => b.textContent === 'Editar').click(); await tick();
  expect(document.querySelector('[name=nombre]').value).toBe(contact.nombre);
  submit('[data-editor]'); await tick();
  expect(fetch.mock.calls.some(([url, opt]) => opt.method === 'PUT' && url.toString().includes('5'))).toBe(true);
  [...document.querySelectorAll('button')].find(b => b.textContent === 'Eliminar').click(); await tick();
  expect(fetch.mock.calls.some(([, opt]) => opt.method === 'DELETE')).toBe(true);
  expect(document.querySelector('[data-message]').textContent).toBe('Contacto eliminado.');
});
test('F05 error inicial, recuperación y cancelación de borrado', async () => {
  fetch.mockRejectedValueOnce(new Error('Sin red')); await start();
  expect(document.querySelector('[data-list]').textContent).toContain('reintentar');
  expect(document.querySelector('[data-new]').disabled).toBe(false);
  submit('[data-search]'); await tick(); confirm.mockReturnValue(false);
  [...document.querySelectorAll('button')].find(b => b.textContent === 'Eliminar').click();
  expect(fetch.mock.calls.some(([, opt]) => opt.method === 'DELETE')).toBe(false);
  document.querySelector('[data-new]').click(); document.querySelector('[data-cancel]').click();
  expect(document.querySelector('[data-editor]').hidden).toBe(true);
});
test('F06 fallo HTTP al guardar conserva formulario y muestra mensaje', async () => {
  await start(); document.querySelector('[data-new]').click();
  fetch.mockResolvedValueOnce(reply({ message: 'Teléfono inválido' }, false));
  submit('[data-editor]'); await tick();
  expect(document.querySelector('[data-message]').textContent).toBe('Teléfono inválido');
  expect(document.querySelector('[data-editor]').hidden).toBe(false);
});
