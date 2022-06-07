/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export enum LogLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2,
  QUIET = 3,
}

export interface LoggerOptions {
  useTimestamp?: boolean;
  mode?: LogLevel;
}

export class Logger {
  private _context: Console;

  private _mode: LogLevel = LogLevel.ERROR;

  private _useTimestamp: boolean = false;

  public get mode(): LogLevel {
    return this._mode;
  }

  public set mode(value: LogLevel) {
    this._mode = value;
  }

  private buildMessage(type: string, place: string) {
    let result = `${type} => `;
    if (this._useTimestamp) result += `[${(new Date()).toISOString()}] `;
    result += `${place} | `;
    return result;
  }

  constructor(options: LoggerOptions = {}) {
    this._context = console;

    if (options.mode != null) this._mode = options.mode;
    if (options.useTimestamp != null) this._useTimestamp = options.useTimestamp;
  }

  public info(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.INFO) this._context.info(this.buildMessage('INFO', place), ...optionalParams);
  }

  public warn(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.WARN) this._context.warn(this.buildMessage('WARN', place), ...optionalParams);
  }

  public error(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.ERROR) this._context.error(this.buildMessage('ERROR', place), ...optionalParams);
  }

  public catchAndLogError(place: string, promise: Promise<any>): void {
    promise.catch((error) => this.error(place, error));
  }
}

export const logger = new Logger({ useTimestamp: true });

export const loginfo = logger.info.bind(logger);

export const logwarn = logger.warn.bind(logger);

export const logerror = logger.error.bind(logger);
