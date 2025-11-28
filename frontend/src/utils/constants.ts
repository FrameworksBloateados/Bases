// API Configuration
export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://127-0-0-1.sslip.io/api/v1'
    : 'https://ffb.valn.dev/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,

  // User
  WHO_AM_I: `${API_BASE_URL}/user/whoami`,
  CHANGE_PASSWORD: `${API_BASE_URL}/user/changePassword`,
  CHANGE_EMAIL: `${API_BASE_URL}/user/changeEmail`,

  // Bets
  BET: `${API_BASE_URL}/bet`,

  // Tables
  TABLES: `${API_BASE_URL}/tables`,

  // Data endpoints
  MATCHES: `${API_BASE_URL}/matches`,
  TEAMS: `${API_BASE_URL}/teams`,
  PLAYERS: `${API_BASE_URL}/players`,
  MATCHES_RESULTS: `${API_BASE_URL}/matches_results`,
  PLAYER_MATCH_STATS: `${API_BASE_URL}/player_match_stats`,
} as const;

// Helper functions for dynamic endpoints
export const getMatchResultsEndpoint = (matchId: number) =>
  `${API_BASE_URL}/match/${matchId}/results`;

// Helper function to build table endpoint
export const getTableEndpoint = (tableName: string) =>
  `${API_BASE_URL}/${tableName}`;

// Error Messages
export const ERROR_MESSAGES = {
  UNKNOWN: 'Error desconocido',
  LOAD_TABLES: 'Error al cargar las tablas',
  LOAD_TABLE_DATA: 'Error al cargar los datos de la tabla',
  SAVE_CHANGES: 'Error desconocido al guardar los cambios',
  DELETE_RECORDS: 'Error desconocido al eliminar los registros',
  CHANGE_PASSWORD: 'Error desconocido al cambiar la contraseña',
  CHANGE_EMAIL: 'Error desconocido al cambiar el email',
  ADD_ROWS: 'Error desconocido al agregar las filas',
  PROCESS_JSON: 'Error desconocido al procesar el JSON',
  PROCESS_CSV: 'Error desconocido al procesar el archivo CSV',
  PLACE_BET: 'Error al realizar la apuesta',
  ALL_FIELDS_REQUIRED: 'Todos los campos son requeridos',
  INVALID_EMAIL: 'El email no es válido',
  PASSWORD_MIN_LENGTH: 'La nueva contraseña debe tener al menos 8 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/,
} as const;
