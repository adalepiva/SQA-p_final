const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const plugin = process.argv[2] || path.join(__dirname, '..', 'agenda-contactos');

// DOM mínimo: las solicitudes HTTP y los eventos se controlan desde cada prueba.
class Element {
    constructor(tag = 'div') {
        this.tag = tag;
        this.children = [];
        this.dataset = {};
        this.events = {};
        this.selectors = {};
        this.elements = {};
        this.hidden = false;
        this.disabled = false;
        this.textContent = '';
    }
    append(...children) { this.children.push(...children); }
    replaceChildren() { this.children = []; }
    querySelector(selector) { return this.selectors[selector]; }
    querySelectorAll(tag) {
        return this.children.flatMap(child => [
            ...(child.tag === tag ? [child] : []), ...child.querySelectorAll(tag),
        ]);
    }
    addEventListener(name, handler) { this.events[name] = handler; }
    trigger(name) { return this.events[name]({ preventDefault() {} }); }
    reset() { Object.values(this.elements).forEach(field => { field.value = ''; }); }
    focus() { this.focused = true; }
}
function field(value = '') { return Object.assign(new Element('input'), { value }); }
function setup(script, selector, root, replies = []) {
    const calls = [];
    const state = { confirm: true, reloads: 0, alerts: [] };
    const context = {
        URL,
        URLSearchParams, AbortController, setTimeout, clearTimeout,
        document: {
            querySelectorAll: name => name === selector ? [root] : [],
            createElement: tag => new Element(tag),
        },
        FormData: class {
            constructor(form) { this.entries = Object.entries(form.elements).map(([key, input]) => [key, input.value]); }
            [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
        },
        fetch: async (url, options) => {
            calls.push({ url: String(url), ...options });
            const reply = replies.shift();
            if (reply instanceof Error) { throw reply; }
            assert.ok(reply, 'Falta una respuesta HTTP preparada');
            return reply;
        },
        confirm: () => state.confirm,
        alert: text => state.alerts.push(text),
        location: { reload: () => state.reloads++ },
    };
    vm.runInNewContext(fs.readFileSync(path.join(plugin, 'assets', script), 'utf8'), context);
    return { calls, state, replies };
}
function response(data, ok = true) { return { ok, json: async () => ok ? { data } : { message: data } }; }
const settle = () => new Promise(resolve => setImmediate(resolve));
test('Clima: carga, ciudad seleccionada, errores y recuperación independiente', async () => {
    const root = new Element();
    for (const key of ['search', 'results', 'status', 'card', 'city', 'temperature', 'description', 'details', 'time', 'refresh']) {
        root.selectors[`[data-weather-${key}]`] = new Element(key === 'refresh' ? 'button' : 'div');
    }
    root.append(...Object.values(root.selectors));
    const get = key => root.selectors[`[data-weather-${key}]`];
    get('search').elements.ciudad = field('Antigua');
    const weather = { current: { temperature_2m: 21, relative_humidity_2m: 70, apparent_temperature: 20, weather_code: 3, wind_speed_10m: 12, time: '2026-10-26T12:00' }, timezone: 'America/Guatemala' };
    const reply = data => ({ ok: true, json: async () => data });
    const { calls, replies } = setup('weather.js', '[data-weather]', root, [reply(weather)]);
    await settle();
    assert.equal(get('temperature').textContent, '21 °C');
    assert.equal(get('card').hidden, false);
    assert.equal(calls[0].credentials, 'omit');
    assert.equal(new URL(calls[0].url).searchParams.get('latitude'), '14.6349');
    replies.push(reply({ results: [{ name: '<Antigua>', country: 'Guatemala', latitude: 14.56, longitude: -90.73 }] }));
    await get('search').trigger('submit');
    assert.equal(get('results').children[0].textContent, '<Antigua>, Guatemala');
    replies.push(reply(weather));
    get('results').children[0].trigger('click');
    await settle();
    assert.equal(new URL(calls.at(-1).url).searchParams.get('longitude'), '-90.73');
    assert.equal(get('city').textContent, '<Antigua>, Guatemala');
    replies.push(new Error('Offline'));
    await get('refresh').trigger('click');
    assert.equal(get('card').hidden, true);
    assert.match(get('status').textContent, /No se pudo consultar/);
    assert.equal(get('refresh').disabled, false);
    replies.push(reply(weather));
    await get('refresh').trigger('click');
    assert.equal(get('card').hidden, false);
    replies.push(reply({}));
    await get('search').trigger('submit');
    assert.match(get('status').textContent, /No se encontraron/);
});
const contact = { id: 8, nombre: '<Ana>', telefono: '12345678', telefono2: '87654321', email: '', direccion: 'Ciudad' };
function agendaRoot(url) {
    const root = new Element();
    root.dataset = { url, nonce: 'rest-nonce' };
    for (const name of ['search', 'editor', 'list', 'message', 'heading', 'new', 'cancel']) {
        root.selectors[`[data-${name}]`] = new Element(['new', 'cancel'].includes(name) ? 'button' : 'div');
    }
    root.append(...Object.values(root.selectors));
    const search = root.selectors['[data-search]'];
    search.elements.buscar = field();
    const editor = root.selectors['[data-editor]'];
    for (const name of ['nombre', 'telefono', 'telefono2', 'email', 'direccion']) { editor.elements[name] = field(); }
    editor.hidden = true;
    return { root, search, editor, list: root.selectors['[data-list]'], message: root.selectors['[data-message]'] };
}
for (const url of [
    'https://example.test/sub/wp-json/agenda/v1/contactos',
    'https://example.test/sub/?rest_route=/agenda/v1/contactos',
    'https://example.test/sub/wp-json/agenda/v1/contactos/?lang=es',
    'https://example.test/sub/?rest_route=/agenda/v1/contactos/&lang=es',
]) {
    test(`CRUD, búsqueda y confirmación: ${url}`, async () => {
        const { root, search, editor, list, message } = agendaRoot(url);
        const { calls, state, replies } = setup('agenda.js', '[data-agenda]', root, [response([contact])]);
        await settle();
        assert.equal(list.children[0].children[0].textContent, '<Ana>');
        assert.equal(calls[0].url, new URL(url).href);
        assert.equal(calls[0].headers['X-WP-Nonce'], 'rest-nonce');
        assert.equal(calls[0].credentials, 'same-origin');
        assert.equal(calls[0].cache, 'no-store');
        search.elements.buscar.value = ' Ana & teléfono ';
        replies.push(response([contact]));
        search.trigger('submit');
        await settle();
        assert.equal(new URL(calls.at(-1).url).searchParams.get('buscar'), 'Ana & teléfono');
        replies.push(response(contact));
        list.children[0].children.at(-1).children[0].trigger('click');
        await settle();
        assert.equal(editor.elements.nombre.value, '<Ana>');
        assert.equal(editor.hidden, false);
        assert.equal(editor.elements.nombre.focused, true);
        const editUrl = new URL(calls.at(-1).url);
        assert.ok((editUrl.searchParams.get('rest_route') || editUrl.pathname).endsWith('/contactos/8'));
        replies.push(response(contact), response([contact]));
        editor.trigger('submit');
        await settle();
        assert.equal(calls.at(-2).method, 'PUT');
        assert.equal(calls.at(-2).url, editUrl.href);
        assert.equal(JSON.parse(calls.at(-2).body).telefono2, '87654321');
        assert.equal(editor.hidden, true);
        assert.equal(message.textContent, 'Contacto actualizado.');
        root.selectors['[data-new]'].trigger('click');
        editor.elements.nombre.value = 'Nueva';
        replies.push(response(contact), response([contact]));
        editor.trigger('submit');
        await settle();
        assert.equal(calls.at(-2).method, 'POST');
        assert.equal(calls.at(-2).url, new URL(url).href);
        assert.equal(message.textContent, 'Contacto agregado.');
        state.confirm = false;
        const before = calls.length;
        list.children[0].children.at(-1).children[1].trigger('click');
        assert.equal(calls.length, before);
        state.confirm = true;
        replies.push(response({}), response([]));
        list.children[0].children.at(-1).children[1].trigger('click');
        await settle();
        assert.equal(calls.at(-2).method, 'DELETE');
        assert.equal(calls.at(-2).url, editUrl.href);
        for (const call of calls) {
            assert.equal(call.headers['X-WP-Nonce'], 'rest-nonce');
            assert.equal(call.headers['Content-Type'], 'application/json');
            assert.equal(call.credentials, 'same-origin');
            assert.equal(call.cache, 'no-store');
            assert.equal(new URL(call.url).searchParams.get('lang'), new URL(url).searchParams.get('lang'));
        }
        assert.equal(list.children[0].textContent, 'No se encontraron contactos.');
        assert.equal(message.textContent, 'Contacto eliminado.');
        assert.ok(root.querySelectorAll('button').every(button => !button.disabled));
    });
}
test('Error inicial, reintento, error REST y bloqueo de solicitudes simultáneas', async () => {
    const { root, search, message, list } = agendaRoot('https://example.test/wp-json/agenda/v1/contactos');
    const { replies, calls } = setup('agenda.js', '[data-agenda]', root, [new Error('Sin conexión')]);
    await settle();
    assert.equal(message.textContent, 'Sin conexión');
    assert.equal(message.dataset.error, 'true');
    assert.equal(list.textContent, 'No se pudo cargar la agenda. Pulsa Buscar para reintentar.');
    replies.push(response([]));
    search.trigger('submit');
    search.trigger('submit');
    await settle();
    assert.equal(calls.length, 2);
    assert.equal(list.children[0].textContent, 'No se encontraron contactos.');
    replies.push(response('Sesión vencida', false));
    search.trigger('submit');
    await settle();
    assert.equal(message.textContent, 'Sesión vencida');
    assert.ok(root.querySelectorAll('button').every(button => !button.disabled));
});
test('Login, registro, cambio de formulario y errores', async () => {
    const root = new Element();
    root.dataset = { login: '/login', registro: '/registro', nonce: 'guest-nonce' };
    for (const key of ['login-form', 'register-form', 'show-register', 'show-login', 'message']) {
        root.selectors[`[data-${key}]`] = new Element();
    }
    const login = root.selectors['[data-login-form]'];
    const register = root.selectors['[data-register-form]'];
    for (const form of [login, register]) {
        form.selectors['[type="submit"]'] = new Element('button');
        form.elements.usuario = field('ana');
        form.elements.password = field('secreto');
    }
    const { calls, state, replies } = setup('auth.js', '[data-auth]', root);
    root.selectors['[data-show-register]'].onclick();
    assert.equal(login.hidden, true);
    assert.equal(register.hidden, false);
    root.selectors['[data-show-login]'].onclick();
    assert.equal(login.hidden, false);
    replies.push(response('Credenciales incorrectas', false));
    const pending = login.trigger('submit');
    login.trigger('submit');
    await pending;
    assert.equal(calls.length, 1);
    assert.equal(root.selectors['[data-message]'].textContent, 'Credenciales incorrectas');
    assert.equal(calls[0].headers['X-Agenda-Nonce'], 'guest-nonce');
    assert.equal(calls[0].cache, 'no-store');
    replies.push(response({}));
    await register.trigger('submit');
    assert.equal(calls.at(-1).url, '/registro');
    assert.equal(state.reloads, 1);
    replies.push(new Error('Sin conexión'));
    await login.trigger('submit');
    assert.equal(root.selectors['[data-message]'].textContent, 'Sin conexión');
    assert.equal(login.selectors['[type="submit"]'].disabled, false);
});
test('Logout: nonce, recarga y recuperación ante errores', async () => {
    const button = new Element('button');
    button.dataset = { url: '/logout', nonce: 'rest-nonce' };
    const { calls, state, replies } = setup('auth.js', '[data-agenda-logout]', button, [response('Error al salir', false)]);
    await button.trigger('click');
    assert.deepEqual(state.alerts, ['Error al salir']);
    assert.equal(button.disabled, false);
    replies.push(response({}));
    await button.trigger('click');
    assert.equal(state.reloads, 1);
    assert.equal(calls[0].headers['X-WP-Nonce'], 'rest-nonce');
    assert.equal(calls[0].method, 'POST');
});
