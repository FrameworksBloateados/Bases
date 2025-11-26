import {cookieNamePrefix} from '../utils/jwt';

export const openAPIOptions = {
  openapi: '3.1.1',
  documentation: {
    info: {
      title: 'Fundamentalistas de Frameworks Bloateados',
      version: '0.0.0',
      description: 'Documentación con Swagger',
    },
    tags: [
      {name: 'Auth', description: 'Endpoints de autenticación'},
      {name: 'User', description: 'Endpoints del usuario'},
      {
        name: 'AntiPareto',
        description:
          'Endpoints CRUD generados automáticamente para todas las tablas',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http' as const,
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token',
        },
        cookieAuth: {
          type: 'apiKey' as const,
          in: 'cookie',
          name: `${cookieNamePrefix}JWT`,
          description: 'Refresh token',
        },
        cookieFingerprint: {
          type: 'apiKey' as const,
          in: 'cookie',
          name: `${cookieNamePrefix}Fgp`,
          description: 'Fingerprint para el refresh token y el access token',
        },
      },
    },
  },
};

export const swaggerCSS = `
:root {
	--bg-color: #020617;
	--primary-color: #e2e8f0;
	--secondary-color: #94a3b8;
	--highlight-bg-color: transparent;
	--highlight-border-color: #1e293b;
	--button-bg-color: #0f172a;
	--button-text-color: #e2e8f0;
	--method-bg-color: transparent;
	--cancel-border-color: #b91c1c;
	--success-color: #4ade80;
	--select-bg-color: transparent --copy-button-bg-color: transparent --servers-bg-color: transparent --execute-button-bg-color: transparent
}

body {
	background-color: var(--bg-color);
	color-scheme: dark;
}

* {
	color: var(--primary-color);
}

.scheme-container {
	background-color: var(--bg-color) !important;
}

.modal-ux {
	background-color: var(--bg-color) !important;
}

input {
	background-color: var(--bg-color) !important;
}

.execute {
	color: var(--bg-color) !important;
	background-color: var(--primary-color) !important;
	border: transparent 1px solid !important;
}

.btn-clear,
.btn-clear:hover {
	color: var(--primary-color) !important;
	border: transparent 1px solid !important;
}

.btn-clear:hover {
	border: transparent 1px solid !important;
}

.opblock-summary-method {
	background-color: var(--method-bg-color) !important;
	font-weight: 800 !important
}

.opblock-section-header {
	background-color: var(--highlight-bg-color) !important;
}

p,
td,
.tabitem {
	color: var(--secondary-color) !important;
}

h1,
h2,
h3,
h4,
h5,
h6,
h7 .active {
	color: var(--primary-color) !important;
}

pre .highlight-code,
.microlight {
	background-color: var(--highlight-bg-color) !important;
	border: var(--highlight-border-color) solid 1px;
}

.try-out__btn {
	color: var(--button-bg-color) !important;
	background-color: var(--primary-color) !important;
	border: transparent 1px solid !important;
}

.cancel {
	color: var(--primary-color) !important;
	background-color: var(--highlight-bg-color) !important;
	border-color: var(--secondary-color) !important;
}

.download-contents {
	background-color: var(--button-bg-color) !important;
	color: var(--primary-color);
}

.copy-to-clipboard {
	background-color: var(--copy-button-bg-color) !important;
	color: var(--button-text-color);
}

.highlight-code .copy-to-clipboard {
	background-color: var(--button-bg-color) !important;
	color: var(--button-text-color);
}

.servers {
	background-color: var(--servers-bg-color) !important;
}

.response-control-media-type__accept-message {
	color: var(--success-color) !important;
}

.title small {
	background-color: var(--bg-color) !important;
}

.arrow {
	fill: var(--primary-color) !important;
}

select {
	background-color: var(--select-bg-color) !important;
	color: var(--primary-color) !important;
	border-color: var(--highlight-border-color) !important;
}

.opblock-summary-control {
	outline: none !important;
}

.model-box .json-schema-2020-12__title,
.json-schema-2020-12-expand-deep-button {
	color: var(--secondary-color) !important;
}

.json-schema-2020-12__attribute--primary {
	color: var(--primary-color) !important;
}
`;
