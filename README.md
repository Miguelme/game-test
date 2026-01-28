# Juegos de Memoria (Web Móvil)

Sitio estático con 3 juegos suaves pensados para personas mayores:

- Parejas (match)
- El objeto que falta (recuerdo)
- Jardín de Simón (secuencias)

Sin cuentas. Guarda ajustes y mejores resultados en `localStorage`.

## Ejecutar en local

Desde `dev/alzheimer-games`:

```bash
python3 -m http.server 5173
```

Luego abre:

- Escritorio: `http://localhost:5173`
- Móvil en la misma Wi‑Fi: encuentra la IP de tu ordenador (p. ej. `192.168.1.20`) y abre `http://192.168.1.20:5173`

## Compartir al móvil con ngrok

Útil si tu móvil no está en la misma Wi‑Fi, o quieres una URL pública temporal.

1) Instalar ngrok (macOS):

```bash
brew install ngrok/ngrok/ngrok
```

2) Añadir el token (de https://dashboard.ngrok.com/get-started/your-authtoken):

```bash
ngrok config add-authtoken YOUR_TOKEN
```

3) Arranca el servidor local:

```bash
python3 -m http.server 5173
```

4) En otra terminal, expón el puerto:

```bash
ngrok http 5173
```

5) Copia el `Forwarding` HTTPS que imprime ngrok (ejemplo `https://xxxx.ngrok-free.app`) y ábrelo en el móvil.

Nota de seguridad: cualquiera con la URL puede acceder mientras ngrok esté ejecutándose. No la compartas.

## Desplegar (static)

Esto es HTML/CSS/JS sin build. Puedes subir el contenido a cualquier hosting estático:

- Netlify / Cloudflare Pages / Vercel static
- Nginx/Apache en un servidor

## Desplegar en Oracle Cloud (Always Free)

Guía completa (cuenta + VM + Nginx + puertos + subida):

- `dev/alzheimer-games/DEPLOY_ORACLE_FREE_ES.md`
