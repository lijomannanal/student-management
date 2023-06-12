import { createLogger, format, transports } from 'winston';

const { colorize, combine, metadata, timestamp, printf } = format;

const { LOG_LEVEL = 'info' } = process.env;

const customFormat = printf((info) => {
  const message = `${info.timestamp as string}\t[${info.metadata.filename as string}]\t${info.level}\t${
    info.message as string
  }`;

  if (info.level === 'ERROR' || info.level === 'INFO') {
    return colorize({ level: true }).colorize(info.level.toLowerCase(), message);
  }

  return message;
});

const changeLevelToUpperCase = format((info) => {
  info.level = info.level.toUpperCase();

  return info;
});

const appLogger = createLogger({
  level: LOG_LEVEL,
  exitOnError: false,
  format: combine(
    changeLevelToUpperCase(),
    metadata(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    customFormat,
  ),
  transports: [new transports.Console()],
});

class Logger {
  private readonly filename: string;
  constructor(filename: string) {
    this.filename = filename;
  }

  error(message: string): void {
    appLogger.error(message, { filename: this.filename });
  }

  warn(message: string): void {
    appLogger.warn(message, { filename: this.filename });
  }

  info(message: string): void {
    appLogger.info(message, { filename: this.filename });
  }

  verbose(message: string): void {
    appLogger.verbose(message, { filename: this.filename });
  }

  debug(message: string): void {
    appLogger.debug(message, { filename: this.filename });
  }

  silly(message: string): void {
    appLogger.silly(message, { filename: this.filename });
  }

  log(level: string, message: string): void {
    appLogger.log(level, message, { filename: this.filename });
  }
}

export default Logger;
