<div align="center">

# Fundamentalistas de Frameworks Bloateados

### Una aplicación web construida con las mejores prácticas de seguridad

[![Docker](https://img.shields.io/badge/Docker-29.x-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Bun](https://img.shields.io/badge/Bun-1.x-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[🌐 Demo en vivo](https://ffb.hra.agency/) • [📚 Documentación API](https://ffb.hra.agency/api/v1/docs)

</div>

---

## Equipo

| Nombre | LU |
|--------|-----|
| Mercedes Llanos Pontaut | 674/23 |
| Benjamín Scaffidi | 832/22 |
| Octavio Valentín Vives | 822/22 |

---

## Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Seguridad](#seguridad)
- [Instalación](#instalación)
- [Despliegue](#despliegue)
- [Comandos](#comandos)
- [Troubleshooting](#troubleshooting)
- [Filosofía](#filosofía)

---

## Características

- Autenticación con JWT (access + refresh tokens) [jwt.io](https://www.jwt.io/)
- Seguridad siguiendo recomendaciones de la [OWASP](https://owasp.org/about/)
- Interfaz con React y TailwindCSS
- Runtime con Bun para performance
- Todo containerizado con Docker
- Reverse proxy con Traefik
- Documentación automática con Swagger/OpenAPI
- Hot reload en desarrollo

---

## Arquitectura

```mermaid
graph LR
    A[Cliente/Browser] --> B[Traefik Reverse Proxy]
    B --> C[Frontend: React + Bun]
    B --> D[Backend: Hono + Bun]
    D --> E[(PostgreSQL)]
    
    style A fill:#2E8025,stroke:#333,stroke-width:2px
    style B fill:#176D91,stroke:#333,stroke-width:2px
    style C fill:#24A1C1,stroke:#333,stroke-width:2px
    style D fill:#E36002,stroke:#333,stroke-width:2px
    style E fill:#4169E1,stroke:#333,stroke-width:2px
```

**Componentes:**
- **Frontend**: React + Bun
- **Backend**: API REST con Hono
- **Base de Datos**: PostgreSQL
- **Reverse Proxy**: Traefik (SSL/TLS)
- **Orquestación**: Docker Compose

---

## Stack Tecnológico

### Frontend
- [Bun](https://bun.sh/) - Runtime JavaScript
- [React](https://react.dev/) - UI library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework

### Backend
- [Bun](https://bun.sh/) - Runtime y package manager
- [Hono](https://hono.dev/) - Framework web (recomendado por Cloudflare como alternativa a Express)
- [PostgreSQL](https://www.postgresql.org/) - Base de datos

### DevOps
- [Docker](https://www.docker.com/) - Containerización
- [Docker Compose](https://docs.docker.com/compose/) - Orquestación
- [Traefik](https://traefik.io/) - Reverse proxy
- [Make](https://www.gnu.org/software/make/) - Automatización

---

## Seguridad

### Autenticación
- **JWT** con access y refresh tokens
- **Ed25519** para firma de tokens (actualmente el algoritmo más seguro para este propósito)
- Implementación siguiendo las [recomendaciones de la OWASP](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

### Contraseñas
- **Argon2** para hashing (ganador del Password Hashing Competition)
- Resistente a ataques GPU y side-channel

### Cookies
- Prefijo `__Secure-` 
- `HttpOnly` para prevenir XSS
- `SameSite` para protección contra CSRF
- Frontend y backend tienen que estar en el mismo dominio

### Red
- HTTPS forced en producción
- Security headers configurados
- CORS apropiadamente configurado

---

## Instalación

### Requisitos

- Docker
- Docker Compose
- Make
- OpenSSL

**Importante para entorno local**: Necesitás un DNS que soporte sslip.io. Recomendamos usar Cloudflare DNS (1.1.1.1) o Google DNS (8.8.8.8).

### Setup

**1. Clonar el repo**

```bash
git clone <repository-url>
cd FrameworksBloateados
```

**2. Generar claves para JWT**

Necesitás dos pares de claves Ed25519:

```bash
# Access token keys
openssl genpkey -algorithm Ed25519 -out ACCESS_TOKEN_PRIVATE_KEY.pem
openssl pkey -in ACCESS_TOKEN_PRIVATE_KEY.pem -pubout -out ACCESS_TOKEN_PUBLIC_KEY.pem

# Refresh token keys
openssl genpkey -algorithm Ed25519 -out REFRESH_TOKEN_PRIVATE_KEY.pem
openssl pkey -in REFRESH_TOKEN_PRIVATE_KEY.pem -pubout -out REFRESH_TOKEN_PUBLIC_KEY.pem
```

**3. Configurar variables de entorno**

```bash
cp .env.example .env
nvim .env  # o tu editor favorito
```

Contenido del `.env`:

```bash
# JWT Keys (las que generaste arriba)
ACCESS_TOKEN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ACCESS_TOKEN_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
REFRESH_TOKEN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
REFRESH_TOKEN_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"

# URLs
FRONTEND_URL=http://127-0-0-1.sslip.io  # local
# FRONTEND_URL=https://tu-dominio.com  # producción

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres  # cambiar en producción
POSTGRES_DB=postgres
```

**Nota para producción**: Si deployás a producción, además de cambiar `FRONTEND_URL` en el `.env`, tenés que actualizar `PRODUCTION_URL` en `./frontend/src/utils/constants.ts` con el mismo dominio.

---

## Despliegue

### Local

```bash
make local-up
```

Acceso:
- App: http://127-0-0-1.sslip.io
- API docs: http://127-0-0-1.sslip.io/api/v1/docs

### Producción

```bash
make prod-up
```

Acceso:
- App: https://tu-dominio.com
- API docs: https://tu-dominio.com/api/v1/docs

---

## Comandos

Usá `make help` para ver todos los comandos.

### Local

```bash
make local-up        # Iniciar
make local-down      # Detener
make local-restart   # Reiniciar
make local-logs      # Ver logs
make local-build     # Rebuild sin caché
make local-clean     # Limpiar todo
```

### Producción

```bash
make prod-up         # Iniciar
make prod-down       # Detener
make prod-restart    # Reiniciar
make prod-logs       # Ver logs
make prod-build      # Rebuild sin caché
make prod-clean      # Limpiar todo
```

### Desarrollo

```bash
make dev-up          # Iniciar dev container
make dev-down        # Detener
make dev-shell       # Shell en el container
make dev-restart     # Reiniciar
make dev-clean       # Limpiar
```

### General

```bash
make help            # Ver ayuda
make ps              # Ver containers activos
make down-all        # Detener todos
make clean-all       # Limpiar todos
```

---

## Troubleshooting

### No resuelve 127-0-0-1.sslip.io

Probá el siguiente comando:

```bash
nslookup 127-0-0-1.sslip.io
```

Si no funciona, intentá forzar un servidor DNS específico:

```bash
nslookup 127-0-0-1.sslip.io 1.1.1.1
```

Si el segundo comando resuelve, el problema está en la configuración de tu DNS local.

---

## Filosofía

> Trabajamos todo el TP centrados en el antipareto, invertir el 80% del tiempo en el 20% más utilizado.
