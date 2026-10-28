# Guion de video — duración objetivo 4:45

Grabar a 1280×720 o superior en MP4. Narración del estudiante; mostrar únicamente datos ficticios. Preparar previamente las ejecuciones para no consumir el tiempo esperando. No presentar una ejecución antigua como si correspondiera a otro commit.

| Tiempo | Pantalla | Narración sugerida |
|---|---|---|
| 0:00–0:35 | Portada y app | Soy Emilio Adalberto Pivaral Delgado. Reutilicé mi agenda de contactos en WordPress para integrar aseguramiento de calidad. El objetivo es verificar cada cambio antes de aceptarlo en main. Conservé PHP, MySQL y JavaScript porque la aplicación existente ya resuelve el CRUD. |
| 0:35–1:05 | GitHub Desktop, rama y cambio | Trabajo en una rama. Este cambio de demostración introduce un error que las verificaciones deben detectar. El pull request concentra los cambios y su revisión. |
| 1:05–1:40 | Actions rechazado y PR | El pipeline valida el build, ejecuta pruebas y cobertura, analiza el código y genera el reporte. Este fallo impide aprobar el gate. Muestro la regla que obliga a pasar el check antes de fusionar. |
| 1:40–2:20 | Corrección y ejecución aprobada | Corrijo el error en la misma rama. La nueva ejecución pasa. Las pruebas incluyen dobles PHP, interfaz, integración real con MySQL y la colección Postman. La revisión humana complementa los checks antes del merge. |
| 2:20–3:10 | Dashboard y Postman reales | El dashboard muestra cobertura JavaScript de 98,48% en líneas y 84,61% en ramas; PHP alcanza 78,09%. El mínimo es 60%. Postman ejecuta 13 solicitudes y 19 aserciones. El análisis usa ESLint y jscpd; no atribuyo a estas herramientas métricas de bugs de Sonar que no calculan. |
| 3:10–3:50 | Tabla antes/después | La base tenía 77 comprobaciones PHP, pero no pipeline ni pruebas frontend. Agregué 10 casos de interfaz, 12 verificaciones de integración y el recorrido HTTP. Eliminé cuatro bloques duplicados. La cobertura PHP no aumentó: lo nuevo es medirla y exigirla automáticamente. |
| 3:50–4:45 | Conclusiones | Aprendí a separar pruebas con dobles de integración real, a conservar una línea base y a evitar que un reporte oculte fallos. La autenticación exigió manejar cookies y nonce. Quedan como mejoras el análisis semántico PHP, automatización de navegador y despliegue cloud. La evidencia y la revisión permiten decidir con datos si un cambio puede aceptarse. |

El bloque de pipeline dura 105 segundos, dashboard 50, comparación 40 e introducción 35. Ajustar la conclusión a 35–45 segundos y utilizar el margen restante para transiciones; el video final debe quedar entre 4:25 y 4:45. No superar cinco minutos. Revisar audio y legibilidad antes de entregar.
