import winston from 'winston';

// ログレベル: error, warn, info, http, verbose, debug, silly
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// ログのカラーリング
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// ログフォーマット
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// JSON形式のログフォーマット（本番環境用）
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// トランスポート設定
const transports = [
  // コンソール出力
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? jsonFormat : format,
  }),
  // エラーログファイル
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: jsonFormat,
  }),
  // 全ログファイル
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: jsonFormat,
  }),
];

// ロガーインスタンス
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // 本番環境では未処理の例外をキャッチしない（Next.jsに任せる）
  exitOnError: false,
});

export default logger;

// ヘルパー関数
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logError = (message: string, error?: Error | unknown, meta?: object) => {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, { error, ...meta });
  }
};

export const logHttp = (message: string, meta?: object) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

