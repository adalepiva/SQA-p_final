<?php defined('ABSPATH') || exit; ?>
<section class="agenda-contactos agenda-weather" data-weather aria-label="Consulta del clima">
    <header><h2>El clima de tus contactos</h2><p>Consulta el clima de una ciudad antes de planificar una visita.</p></header>
    <form data-weather-search class="agenda-toolbar">
        <label>Buscar ciudad <input name="ciudad" type="search" placeholder="Ej. Antigua Guatemala" minlength="2" maxlength="100" required></label>
        <button type="submit">Buscar ciudad</button>
    </form>
    <div data-weather-results class="agenda-weather-results" aria-label="Ciudades encontradas"></div>
    <div data-weather-status role="status" aria-live="polite"></div>
    <article class="agenda-card" data-weather-card aria-live="polite" hidden>
        <h3 data-weather-city></h3>
        <p data-weather-temperature class="agenda-weather-temperature"></p>
        <p data-weather-description></p>
        <p data-weather-details></p>
        <small data-weather-time></small>
    </article>
    <button type="button" data-weather-refresh>Actualizar clima</button>
    <p class="agenda-weather-source">Datos meteorológicos de <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>
    <noscript>Activa JavaScript para consultar el clima.</noscript>
</section>
