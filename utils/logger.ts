type LogLevel = "info" | "warn" | "error";

interface LogMeta {
  screen?: string;
  event?: string;
  device?: string;
  [key: string]: unknown;
}

const format = (level: LogLevel, message: string, meta?: LogMeta) => {
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${level.toUpperCase()}] ${message}${metaStr}`;
};

export const logger = {
  info(message: string, meta?: LogMeta) {
    if (__DEV__) console.log(format("info", message, meta));
    if (externalHooks?.info)
      externalHooks.info({ level: "info", message, meta });
  },
  warn(message: string, meta?: LogMeta) {
    if (__DEV__) console.warn(format("warn", message, meta));
    if (externalHooks?.warn)
      externalHooks.warn({ level: "warn", message, meta });
  },
  error(message: string, error?: unknown, meta?: LogMeta) {
    if (__DEV__) {
      console.error(format("error", message, meta), error);
    } else {
      // 운영 환경: 외부 로깅 연동 지점 (Sentry/Datadog 등)
      console.log(format("error", message, meta));
    }
    if (externalHooks?.error)
      externalHooks.error({ level: "error", message, error, meta });
  },
};

// 외부 로깅 연동 훅 인터페이스
export type ExternalLogPayload = {
  level: LogLevel;
  message: string;
  error?: unknown;
  meta?: LogMeta;
};

export type ExternalLogHook = (payload: ExternalLogPayload) => void;

export type ExternalLoggerHooks = {
  info?: ExternalLogHook;
  warn?: ExternalLogHook;
  error?: ExternalLogHook;
} | null;

let externalHooks: ExternalLoggerHooks = null;

export const setLoggerHooks = (hooks: ExternalLoggerHooks) => {
  externalHooks = hooks;
};
