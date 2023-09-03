import { hrtime } from "process";
import type { Logger } from "ts-log";

/**
 * The symbol for the logger property.
 */
export const LOGGER = Symbol("logger");
/**
 * The symbol for a Map of provider instances.
 */
export const PROVIDERS = Symbol("providers");

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
