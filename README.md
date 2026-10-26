# Presupuestos al Día

Asistente comercial con IA para negocios de reformas e instalaciones. La página permite analizar una consulta anonimizada, detectar datos presentes y faltantes, y preparar un borrador editable. El borrador **no se envía** desde la web.

## Qué incluye

- `web/index.html`: página responsive y formulario de prueba.
- `worker/handler.js`: API de análisis para Cloudflare Workers. Usa la API de OpenAI desde el servidor.
- `integraciones/gmail/AutoRespuestas.gs`: piloto opcional para una hoja de Google del negocio. El envío automático comienza apagado y solo procesa conversaciones etiquetadas.
- `tests/`: verificaciones del flujo de la web y de la opción de envíos del piloto.

El código está listo para un repositorio público. No contiene claves, códigos de prueba, datos de clientes ni el historial del sitio anterior. `hola.presupuestosaldia@gmail.com` es el correo comercial público que aparece en la página.

## Verificar en local

Necesitás Node.js 20 o posterior.

```bash
npm test
```

Esto genera `dist/worker.js` y prueba los estados con y sin configuración, la validación de datos y el análisis simulado. No realiza llamadas pagadas a OpenAI.

## Publicar como Cloudflare Worker

GitHub guarda el código, pero **GitHub Pages no ejecuta la API** de análisis. Para que funcione la prueba con IA, desplegá este proyecto como Worker:

1. Instalá Wrangler en este proyecto: `npm install -D wrangler@latest`.
2. Ejecutá `npm test` y después `npx wrangler deploy`.
3. En Cloudflare configurá los secretos `OPENAI_API_KEY` y `TRIAL_ACCESS_CODE` para el Worker. No los pongas en el repositorio ni en `wrangler.toml`. También podés cargarlos con `npx wrangler secret put NOMBRE_DEL_SECRETO`, que solicita el valor de forma interactiva.
4. Entregá el código de prueba únicamente a quienes quieras habilitar. Probá la ruta `/health` y una consulta anonimizada antes de compartir la URL.

Sin los dos secretos, la página sigue mostrando la oferta y un enlace al correo comercial, pero oculta el formulario de IA. Para desarrollo local, copiá `.dev.vars.example` a `.dev.vars` y completá ese archivo ignorado por Git.

La API limita a tres análisis por hora y conexión dentro de cada instancia del Worker. Es una barrera básica para un piloto; para abrir la prueba sin código conviene agregar un límite persistente y protección contra abuso. El uso de OpenAI API puede generar cargos según el volumen de consultas.

## Integración opcional de Gmail

El archivo `integraciones/gmail/AutoRespuestas.gs` se instala en una hoja de Google **del negocio que lo usará**. La clave de OpenAI se configura en las propiedades del proyecto de Apps Script, nunca en el código. El negocio completa nombre, servicios, zona y reglas; etiqueta las consultas elegidas con `PAD/Por responder`; y activa la revisión periódica desde el menú. La casilla `ENVIAR_AUTOMATICAMENTE` comienza apagada. Cuando está apagada, se crean borradores. Los casos que la IA marca para revisión también quedan como borradores.

Los tests de esta integración simulan Gmail y Sheets; antes de usarla con clientes reales, hacé una prueba controlada en la cuenta del negocio y revisá los permisos y textos de respuesta.

## Privacidad y seguridad

- No ingreses nombres, direcciones exactas, correos ni teléfonos de clientes en la prueba web. El servidor rechaza correos y teléfonos detectables.
- Las consultas no se almacenan en este proyecto y la solicitud a OpenAI usa `store: false`.
- `.dev.vars`, `.env`, `dist/` y `node_modules/` están excluidos de Git.
- El código de acceso de la prueba se comprueba en el servidor. Nunca se envía la clave de OpenAI al navegador.
