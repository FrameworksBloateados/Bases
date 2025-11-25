const isProduction = process.env.NODE_ENV === 'production';

function info(...args: unknown[]) {
  if (!isProduction) {
    console.log('[INFO]', ...args);
  }
}

function error(...args: unknown[]) {
  console.error('[ERROR]', ...args);
}

export const logger = {info, error};
