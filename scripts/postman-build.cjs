const fs = require('node:fs');
const item = [];
const valid = { nombre:'Ana E2E', telefono:'12345678', telefono2:'87654321' };
function add(name, method, route, status, body, extra = [], headers = []) {
  item.push({ name, request: { method, header: [{key:'Content-Type',value:'application/json'}, ...headers],
    url:'{{baseUrl}}' + route, ...(body ? {body:{mode:'raw',raw:JSON.stringify(body)}}:{}) },
    event:[{listen:'test',script:{type:'text/javascript',exec:[`pm.test('HTTP ${status}', () => pm.response.to.have.status(${status}));`, ...extra]}}] });
}
const page = '/?pagename=mis-contactos';
const api = '/?rest_route=/agenda/v1/';
const nonce = [{key:'X-WP-Nonce',value:'{{nonce}}'}];
add('E01 Acceso anónimo rechazado','GET',api+'contactos',401);
add('E02 Obtener formulario','GET',page,200,null,[
  "const m = pm.response.text().match(/data-auth[^>]*data-nonce=\"([^\"]+)\"/);",
  "pm.test('Nonce visitante presente', () => pm.expect(m).not.to.equal(null));",
  "if(m) pm.collectionVariables.set('guestNonce', m[1]);",
  "pm.collectionVariables.set('user', 'e2e_' + Date.now());"
]);
add('E03 Registrar usuario','POST',api+'registro',201,{nombre:'Prueba E2E',usuario:'{{user}}',email:'{{user}}@example.test',password:'E2e-Sqa-2026!',confirm_password:'E2e-Sqa-2026!'},[],[{key:'X-Agenda-Nonce',value:'{{guestNonce}}'}]);
add('E04 Obtener nonce de sesión','GET',page,200,null,[
  "const m = pm.response.text().match(/data-agenda[^>]*data-nonce=\"([^\"]+)\"/);",
  "pm.test('Sesión activa', () => pm.expect(m).not.to.equal(null));",
  "if(m) pm.collectionVariables.set('nonce', m[1]);"
]);
add('E05 Validar campos','POST',api+'contactos',422,{nombre:'Ana'},[],nonce);
add('E06 Crear contacto','POST',api+'contactos',201,valid,["pm.test('ID entero', () => pm.expect(pm.response.json().data.id).to.be.a('number'));", "pm.collectionVariables.set('id', pm.response.json().data.id);"],nonce);
add('E07 Leer contacto','GET',api+'contactos/{{id}}',200,null,["pm.test('Nombre persistido', () => pm.expect(pm.response.json().data.nombre).to.eql('Ana E2E'));"],nonce);
add('E08 Buscar contacto','GET',api+'contactos&buscar=Ana',200,null,["pm.test('Búsqueda encuentra creado', () => pm.expect(pm.response.json().data.some(x => x.id === Number(pm.collectionVariables.get('id')))).to.eql(true));"],nonce);
add('E09 Actualizar contacto','PUT',api+'contactos/{{id}}',200,{...valid,nombre:'Ana Actualizada'},["pm.test('Cambio persistido', () => pm.expect(pm.response.json().data.nombre).to.eql('Ana Actualizada'));"],nonce);
add('E10 Borrar contacto','DELETE',api+'contactos/{{id}}',200,null,[],nonce);
add('E11 Regresión contacto eliminado','GET',api+'contactos/{{id}}',404,null,[],nonce);
add('E12 Cerrar sesión','POST',api+'logout',200,{},[],nonce);
add('E13 Acceso posterior rechazado','GET',api+'contactos',401);
fs.mkdirSync('tests/postman', {recursive:true});
fs.writeFileSync('tests/postman/agenda.postman_collection.json', JSON.stringify({info:{name:'Agenda SQA — E2E HTTP',schema:'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'},variable:[{key:'baseUrl',value:'http://127.0.0.1:8080'}],item},null,2));
