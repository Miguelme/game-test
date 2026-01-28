# Desplegar en Oracle Cloud (Always Free) — Guía Paso a Paso (España)

Esta guía te permite publicar este juego como un sitio web estático en una **instancia gratuita (Always Free)** de Oracle Cloud Infrastructure (OCI), para abrirlo desde el móvil con el navegador.

La opción más simple y estable es:
- **Compute VM Always Free + Nginx** sirviendo archivos estáticos.

---

## 0) Requisitos

- Un ordenador con macOS/Linux/Windows.
- Acceso a tu terminal.
- Una clave SSH (la generamos en esta guía).
- Cuenta Oracle Cloud (Always Free). Normalmente requiere:
  - Teléfono móvil (verificación)
  - Tarjeta para verificación (no se cobra si te quedas en Always Free)

---

## 1) Crear cuenta en Oracle Cloud (Always Free)

1. Abre el registro:
   - `https://signup.cloud.oracle.com/`

2. Completa:
   - País/región
   - Email
   - Datos personales
   - Verificación por SMS
   - Método de verificación de pago (según país)

3. Cuando termines:
   - Entra en la consola OCI: `https://cloud.oracle.com/`

Consejo: elige una región donde te deje crear **Compute Always Free** (a veces una región se queda sin capacidad temporalmente).

---

## 2) Crear una clave SSH en tu ordenador

En tu ordenador (macOS/Linux):

```bash
ssh-keygen -t ed25519 -C "oci-memory-games" -f ~/.ssh/oci-memory-games
```

Esto crea:
- Clave privada: `~/.ssh/oci-memory-games`
- Clave pública: `~/.ssh/oci-memory-games.pub`

---

## 3) Crear una instancia Always Free (Compute)

En la consola de OCI:

1. Ve a:
   - `Compute` → `Instances` → `Create instance`

2. Nombre:
   - `memory-games`

3. Imagen (Image):
   - Recomendado: **Ubuntu 22.04** (o la Ubuntu LTS más reciente disponible)

4. Shape:
   - Marca/filtra por **Always Free Eligible**
   - Elige una shape Always Free (por ejemplo, una micro o ARM Ampere Always Free si está disponible en tu región).

5. Networking:
   - Crea una VCN nueva (por defecto suele estar bien).
   - Asegúrate de tener:
     - Subnet pública
     - Public IPv4 asignada

6. SSH:
   - Pega el contenido de tu clave pública:
     - `cat ~/.ssh/oci-memory-games.pub`

7. Crear instancia.

Cuando termine, copia:
- **Public IPv4 address** (IP pública)

---

## 4) Abrir puertos HTTP (80) en OCI (red)

Para ver la web desde fuera necesitas permitir **ingress** al puerto 80.

Opción A (Security List):
1. `Networking` → `Virtual Cloud Networks` → tu VCN
2. `Security Lists` → la security list de la subnet
3. `Add Ingress Rules`
   - Source type: `CIDR`
   - Source CIDR: `0.0.0.0/0`
   - IP protocol: `TCP`
   - Destination port range: `80`

Opcional (si luego quieres HTTPS): añade también puerto `443`.

---

## 5) Conectarte por SSH

En tu ordenador:

```bash
ssh -i ~/.ssh/oci-memory-games ubuntu@TU_IP_PUBLICA
```

Si tu imagen no usa el usuario `ubuntu`, OCI suele indicarlo en la pantalla de la instancia.

---

## 6) Instalar Nginx en la VM

Dentro de la VM:

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

Comprueba que Nginx responde localmente:

```bash
curl -I http://localhost
```

---

## 7) Abrir el firewall del sistema (Ubuntu)

En Ubuntu, normalmente basta con UFW:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

Si `ufw` no está activo o sigues sin acceso desde fuera, revisa reglas iptables:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

---

## 8) Subir el juego a la VM

En tu ordenador, empaqueta el contenido del juego:

```bash
cd dev/alzheimer-games
tar -czf memory-games.tgz .
```

Sube el archivo a la VM:

```bash
scp -i ~/.ssh/oci-memory-games memory-games.tgz ubuntu@TU_IP_PUBLICA:~/
```

En la VM, despliega en el directorio web:

```bash
sudo mkdir -p /var/www/memory-games
sudo tar -xzf ~/memory-games.tgz -C /var/www/memory-games
sudo chown -R www-data:www-data /var/www/memory-games
```

---

## 9) Configurar Nginx para servir el sitio

En la VM, crea un site:

```bash
sudo tee /etc/nginx/sites-available/memory-games >/dev/null <<'EOF'
server {
  listen 80;
  server_name _;

  root /var/www/memory-games;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }
}
EOF
```

Actívalo:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/memory-games /etc/nginx/sites-enabled/memory-games
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10) Abrirlo desde el móvil

En el móvil (con cualquier navegador):

- `http://TU_IP_PUBLICA/`

Consejo: añade a pantalla de inicio (Android/Chrome o iOS/Safari) para que parezca una app.

---

## Actualizar el sitio

Repite los pasos de empaquetar + `scp`, y en la VM vuelve a extraer:

```bash
sudo rm -rf /var/www/memory-games/*
sudo tar -xzf ~/memory-games.tgz -C /var/www/memory-games
sudo chown -R www-data:www-data /var/www/memory-games
sudo systemctl reload nginx
```

---

## Troubleshooting rápido

Si no carga desde el móvil:

1) ¿La VM tiene IP pública?
- OCI instance details → `Public IPv4 address`

2) ¿Puerto 80 abierto en OCI?
- Security List / NSG ingress para TCP 80

3) ¿Puerto 80 abierto en el SO?
- `sudo ufw status`
- `sudo iptables -S | grep 80`

4) ¿Nginx está escuchando?
- `sudo ss -lntp | grep ':80'`
- `sudo systemctl status nginx`
