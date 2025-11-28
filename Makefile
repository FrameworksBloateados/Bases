# Ayuda por defecto
.DEFAULT_GOAL := help

# Colores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m

.PHONY: help
help: ## Muestra esta ayuda
	@printf "$(GREEN)Comandos disponibles:$(NC)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# ========================================
# ENTORNO LOCAL (compose-local.yml)
# ========================================

.PHONY: local-up
local-up: ## Inicia el entorno local con Traefik
	docker compose -f compose-local.yml up -d

.PHONY: local-down
local-down: ## Detiene el entorno local
	docker compose -f compose-local.yml down

.PHONY: local-logs
local-logs: ## Muestra logs del entorno local
	docker compose -f compose-local.yml logs -f

.PHONY: local-restart
local-restart: ## Reinicia el entorno local
	docker compose -f compose-local.yml down
	sleep 2
	docker compose -f compose-local.yml up -d

.PHONY: local-clean
local-clean: ## Limpia el entorno local (borra volúmenes)
	docker compose -f compose-local.yml down -v --remove-orphans

.PHONY: local-build
local-build: ## Reconstruye las imágenes del entorno local
	docker compose -f compose-local.yml build --no-cache

# ========================================
# ENTORNO PRODUCCIÓN (compose-prod.yml)
# ========================================

.PHONY: prod-up
prod-up: ## Inicia el entorno de producción
	docker compose -f compose-prod.yml up -d

.PHONY: prod-down
prod-down: ## Detiene el entorno de producción
	docker compose -f compose-prod.yml down

.PHONY: prod-logs
prod-logs: ## Muestra logs del entorno de producción
	docker compose -f compose-prod.yml logs -f

.PHONY: prod-restart
prod-restart: ## Reinicia el entorno de producción
	docker compose -f compose-prod.yml down
	sleep 2
	docker compose -f compose-prod.yml up -d

.PHONY: prod-clean
prod-clean: ## Limpia el entorno de producción (borra volúmenes)
	docker compose -f compose-prod.yml down -v --remove-orphans

.PHONY: prod-build
prod-build: ## Reconstruye las imágenes del entorno de producción
	docker compose -f compose-prod.yml build --no-cache

# ========================================
# ENTORNO DESARROLLO (devenv.yml)
# ========================================

.PHONY: dev-up
dev-up: ## Inicia el contenedor de desarrollo
	docker compose -f devenv.yml up -d

.PHONY: dev-down
dev-down: ## Detiene el contenedor de desarrollo
	docker compose -f devenv.yml down

.PHONY: dev-logs
dev-logs: ## Muestra logs del contenedor de desarrollo
	docker compose -f devenv.yml logs -f

.PHONY: dev-restart
dev-restart: ## Reinicia el contenedor de desarrollo
	docker compose -f devenv.yml down
	sleep 2
	docker compose -f devenv.yml up -d

.PHONY: dev-clean
dev-clean: ## Limpia el contenedor de desarrollo (borra volúmenes)
	docker compose -f devenv.yml down -v --remove-orphans

.PHONY: dev-build
dev-build: ## Reconstruye la imagen del contenedor de desarrollo
	docker compose -f devenv.yml build --no-cache

.PHONY: dev-shell
dev-shell: ## Accede a la shell del contenedor de desarrollo
	docker exec -it ffb_devenv /bin/sh

# ========================================
# COMANDOS GENERALES
# ========================================

.PHONY: clean-all
clean-all: ## Limpia todos los entornos
	@printf "$(YELLOW)Limpiando todos los entornos...$(NC)\n"
	make local-clean
	make prod-clean
	make dev-clean

.PHONY: down-all
down-all: ## Detiene todos los entornos
	@printf "$(YELLOW)Deteniendo todos los entornos...$(NC)\n"
	make local-down
	make prod-down
	make dev-down

.PHONY: ps
ps: ## Muestra el estado de todos los contenedores
	@printf "$(GREEN)=== Contenedores activos ===$(NC)\n"
	@docker ps --filter "name=ffb_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
