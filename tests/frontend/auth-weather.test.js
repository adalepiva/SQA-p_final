import { beforeEach, afterEach, test, expect, vi } from 'vitest';
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
const response = (data, ok = true) => ({ ok, json: async () => data });
beforeEach(() => { vi.resetModules(); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => vi.unstubAllGlobals());
test('F07 alterna acceso y registro; gestiona errores de autenticación y logout', async () => {
  document.body.innerHTML = `<section data-auth data-login="/login" data-registro="/registro" data-nonce="n">
    <form data-login-form><input name="usuario" value="ana"><button type="submit">Entrar</button></form>
    <form data-register-form hidden><button type="submit">Registrar</button></form><p data-message></p>
    <button data-show-register>Registro</button><button data-show-login>Acceso</button></section>
    <button data-agenda-logout data-url="/logout" data-nonce="n">Salir</button>`;
  vi.stubGlobal('alert', vi.fn()); fetch.mockResolvedValue(response({message:'Acceso denegado'}, false));
  await import('../../desa_Agenda_Proyecto2/agenda-contactos/assets/auth.js');
  document.querySelector('[data-show-register]').click(); expect(document.querySelector('[data-login-form]').hidden).toBe(true);
  document.querySelector('[data-show-login]').click();
  for (const selector of ['[data-login-form]', '[data-register-form]']) {
    document.querySelector(selector).dispatchEvent(new Event('submit', {cancelable:true})); await tick();
    expect(document.querySelector('[data-message]').textContent).toBe('Acceso denegado');
    expect(document.querySelector(`${selector} button`).disabled).toBe(false);
  }
  document.querySelector('[data-agenda-logout]').click(); await tick(); expect(alert).toHaveBeenCalledWith('Acceso denegado');
});
async function weather() {
  document.body.innerHTML = `<section data-weather><form data-weather-search><input name="ciudad"><button>Buscar</button></form>
    <div data-weather-results></div><p data-weather-status></p><div data-weather-card>
    ${['city','temperature','description','details','time'].map(n=>`<p data-weather-${n}></p>`).join('')}</div><button data-weather-refresh>Actualizar</button></section>`;
  await import('../../desa_Agenda_Proyecto2/agenda-contactos/assets/weather.js'); await tick();
}
const forecast = { current: { temperature_2m: 22, weather_code: 0, time: '2026-10-27T12:00' } };
function search(value) { document.querySelector('[name=ciudad]').value = value; document.querySelector('form').dispatchEvent(new Event('submit', {cancelable:true})); }
test('F08 clima, validación, búsqueda, elección y actualización', async () => {
  fetch.mockResolvedValue(response(forecast)); await weather();
  expect(document.querySelector('[data-weather-temperature]').textContent).toContain('22');
  expect(fetch.mock.calls[0][1].credentials).toBe('omit');
  search('a'); expect(document.querySelector('[data-weather-status]').textContent).toContain('dos caracteres');
  fetch.mockResolvedValueOnce(response({results:[{name:'Antigua', latitude:14.5, longitude:-90.7}, {name:'inválida'}]}));
  search('Antigua'); await tick(); expect(document.querySelectorAll('[data-weather-results] button')).toHaveLength(1);
  document.querySelector('[data-weather-results] button').click(); await tick();
  expect(document.querySelector('[data-weather-city]').textContent).toBe('Antigua');
  document.querySelector('[data-weather-refresh]').click(); await tick();
  fetch.mockResolvedValueOnce(response({})); search('Nada'); await tick();
  expect(document.querySelector('[data-weather-status]').textContent).toContain('No se encontraron');
});
test('F09 falla servicio y recupera botones; respuesta incompleta', async () => {
  fetch.mockResolvedValue(response({}, false)); await weather();
  expect(document.querySelector('[data-weather-status]').textContent).toContain('No se pudo');
  search('Ciudad'); await tick(); expect(document.querySelector('[data-weather-status]').textContent).toContain('No se pudieron');
  fetch.mockResolvedValue(response({})); document.querySelector('[data-weather-refresh]').click(); await tick();
  expect(document.querySelector('[data-weather-card]').hidden).toBe(true);
  expect(document.querySelector('[data-weather-refresh]').disabled).toBe(false);
});
