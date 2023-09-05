import { hrtime } from "process";
import type { Logger } from "ts-log";

/**
 * Logs the amount of time a function takes to execute.
 */
export async function measureTime<T>(
  fn: () => T,
  logger: Logger,
  message: string,
): Promise<T> {
  const start = hrtime.bigint();
  const value = await fn();
  const nanoseconds = hrtime.bigint() - start;
  const milliseconds = Number(nanoseconds) / 1000000;
  logger.debug(message, { durationMs: milliseconds });
  return value;
}

/**
 * A no-op function.
 */
function nothing() {}

/**
 * A no-op instance of Logger.
 */
export const nullLogger: Logger = {
  trace: nothing,
  debug: nothing,
  info: nothing,
  warn: nothing,
  error: nothing,
};
