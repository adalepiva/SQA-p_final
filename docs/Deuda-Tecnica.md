# Registro de deuda técnica

| ID | Hallazgo | Prioridad | Responsable | Criterio de cierre / estado |
|---|---|---|---|---|
| DT-01 | Peticiones CRUD duplicadas | Media | Estudiante | Cerrado: función común, 4→0 bloques, regresión verde |
| DT-02 | Ausencia de pruebas frontend | Alta | Estudiante | Cerrado: 10 casos y cobertura con gate |
| DT-03 | Ausencia de integración y E2E | Alta | Estudiante | Cerrado local: 12 verificaciones y 19 aserciones HTTP |
| DT-04 | Revisión y main sin evidencia de protección | Alta | Estudiante/colaborador | Pendiente: guardar regla activa y PR bloqueado/aprobado |
| DT-05 | Análisis semántico PHP y seguridad especializado | Media | Estudiante | Pendiente: conectar Sonar o PHPStan y clasificar hallazgos; antes de uso productivo |
| DT-06 | Plantillas PHP sin cobertura instrumentada | Media | Estudiante | Pendiente: incorporar cobertura del render y casos adicionales de HTML |
| DT-07 | Login exitoso frontend recarga navegador | Baja | Estudiante | Backend/E2E validan sesión; añadir prueba en navegador real automatizada |
| DT-08 | Dependencias transitivas de herramientas con deprecaciones | Media | Estudiante | Revisar npm audit y actualizar con regresión antes de entrega definitiva |
| DT-09 | CD cloud | Opcional | Estudiante | No implementado: entrega de ZIP tras gates, instalación manual |

No se borra deuda pendiente para presentar un resultado artificialmente limpio. Cada cierre debe señalar prueba y evidencia.
