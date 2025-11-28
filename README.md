# Fundamentalistas de Frameworks Bloateados

### Integrantes
- Mercedes Llanos Pontaut (LU: 674/23)
- Benjamín Scaffidi (LU: 832/22)
- Octavio Valentín Vives (LU: 822/22)

## Configuración del Entorno de Desarrollo

### Prerequisitos

- [Bun](https://bun.sh/) - Runtime de JavaScript rápido y moderno
- Docker y Docker Compose - Para ejecutar el entorno en contenedores
- Make - Para usar los comandos del Makefile

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd FrameworksBloateados
   ```

2. **Ver todos los comandos disponibles**
   ```bash
   make help
   ```

### Levantar el Entorno de Desarrollo

Para poder levantar :

```bash
# Iniciar el contenedor de desarrollo
make dev-up

# Ver los logs
make dev-logs

# Acceder a la shell del contenedor
make dev-shell

# Detener el contenedor
make dev-down
```

### Levantar el proyecto

```bash
# acceder a shell del contenedor
make dev-shell

#(opcional) levantar una terminal bash
bash

#descargar dependencias
cd /usr/src/app/frontend && bun install

cd /usr/src/app/backend && bun install

#Arrancar servidor y página (Apretar enter para seguir en la misma terminal)
cd /usr/src/app/frontend && bun dev&
cd /usr/src/app/backend && bun dev&
```

Una vez hecho esto, la aplicación debería ser accedible desde http://127-0-0-1.sslip.io


### Comandos Útiles

**Ver el estado de los contenedores:**
```bash
make ps
```

**Reconstruir las imágenes (después de cambios en Dockerfile):**
```bash
make dev-build    # Para desarrollo
```

**Limpiar volúmenes y datos:**
```bash
make dev-clean    # Limpia desarrollo
make clean-all    # Limpia todos los entornos
```

**Detener todos los entornos:**
```bash
make down-all
```

### Estructura del Proyecto

- `backend/` - Servidor API con Hono.js
- `frontend/` - Aplicación frontend con React
- `compose-local.yml` - Configuración Docker Compose para desarrollo local
- `compose-prod.yml` - Configuración Docker Compose para producción
- `devenv.yml` - Configuración Docker Compose para entorno de desarrollo
- `Makefile` - Comandos para gestionar los diferentes entornos
