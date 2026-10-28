(() => {
    'use strict';
    const descriptions = {
        0: 'Despejado',
        1: 'Mayormente despejado',
        2: 'Parcialmente nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna ligera',
        53: 'Llovizna',
        55: 'Llovizna intensa',
        56: 'Llovizna helada',
        57: 'Llovizna helada intensa',
        61: 'Lluvia ligera',
        63: 'Lluvia moderada',
        65: 'Lluvia intensa',
        66: 'Lluvia helada',
        67: 'Lluvia helada intensa',
        71: 'Nieve ligera',
        73: 'Nieve moderada',
        75: 'Nieve intensa',
        77: 'Granos de nieve',
        80: 'Chubascos ligeros',
        81: 'Chubascos',
        82: 'Chubascos intensos',
        85: 'Chubascos de nieve',
        86: 'Chubascos de nieve intensos',
        95: 'Tormenta',
        96: 'Tormenta con granizo',
        99: 'Tormenta con granizo intenso',
    };

    async function getJSON(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
            // No se envían cookies ni datos de los contactos a Open-Meteo.
            const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
            if (!response.ok) throw new Error('Servicio no disponible');
            return await response.json();
        } finally {
            clearTimeout(timer);
        }
    }

    document.querySelectorAll('[data-weather]').forEach((root) => {
        const form = root.querySelector('[data-weather-search]');
        const results = root.querySelector('[data-weather-results]');
        const status = root.querySelector('[data-weather-status]');
        const card = root.querySelector('[data-weather-card]');
        const refresh = root.querySelector('[data-weather-refresh]');
        let city = { name: 'Ciudad de Guatemala', latitude: 14.6349, longitude: -90.5069 };
        let busy = false;

        function setBusy(value) {
            busy = value;
            root.querySelectorAll('button').forEach((button) => {
                button.disabled = value;
            });
        }

        async function loadWeather() {
            if (busy) return;
            setBusy(true);
            card.hidden = true;
            status.textContent = 'Consultando el clima…';
            try {
                const url = new URL('https://api.open-meteo.com/v1/forecast');
                url.search = new URLSearchParams({
                    latitude: city.latitude,
                    longitude: city.longitude,
                    current:
                        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
                    timezone: 'auto',
                    temperature_unit: 'celsius',
                    wind_speed_unit: 'kmh',
                }).toString();
                const data = await getJSON(url);
                const current = data.current;
                if (!current || !Number.isFinite(current.temperature_2m))
                    throw new Error('Respuesta incompleta');
                const number = (value) =>
                    Number.isFinite(value)
                        ? value.toLocaleString('es-GT', { maximumFractionDigits: 1 })
                        : '—';
                root.querySelector('[data-weather-city]').textContent = city.name;
                root.querySelector('[data-weather-temperature]').textContent =
                    number(current.temperature_2m) + ' °C';
                root.querySelector('[data-weather-description]').textContent =
                    descriptions[current.weather_code] || 'Condición no disponible';
                root.querySelector('[data-weather-details]').textContent =
                    `Sensación: ${number(current.apparent_temperature)} °C · Humedad: ${number(current.relative_humidity_2m)} % · Viento: ${number(current.wind_speed_10m)} km/h`;
                root.querySelector('[data-weather-time]').textContent =
                    `Hora local del dato: ${String(current.time || '').replace('T', ' ')} (${data.timezone || 'hora de la ciudad'})`;
                card.hidden = false;
                status.textContent = '';
            } catch {
                status.textContent =
                    'No se pudo consultar el clima. Revisa tu conexión y pulsa Actualizar clima para reintentar.';
            } finally {
                setBusy(false);
            }
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (busy) return;
            const query = form.elements.ciudad.value.trim();
            if (query.length < 2) {
                status.textContent = 'Escribe al menos dos caracteres para buscar una ciudad.';
                return;
            }
            setBusy(true);
            results.replaceChildren();
            status.textContent = 'Buscando ciudades…';
            try {
                const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
                url.search = new URLSearchParams({
                    name: query,
                    count: 5,
                    language: 'es',
                    format: 'json',
                }).toString();
                const data = await getJSON(url);
                const cities = (data.results || []).filter(
                    (item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
                );
                status.textContent = cities.length
                    ? 'Selecciona una ciudad para ver su clima.'
                    : 'No se encontraron ciudades. Prueba con otro nombre.';
                cities.forEach((item) => {
                    const name = [item.name, item.admin1, item.country].filter(Boolean).join(', ');
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.textContent = name;
                    button.addEventListener('click', () => {
                        if (busy) return;
                        city = { name, latitude: item.latitude, longitude: item.longitude };
                        results.replaceChildren();
                        loadWeather();
                    });
                    results.append(button);
                });
            } catch {
                status.textContent = 'No se pudieron buscar ciudades. Revisa tu conexión e intenta de nuevo.';
            } finally {
                setBusy(false);
            }
        });
        refresh.addEventListener('click', loadWeather);
        loadWeather();
    });
})();
