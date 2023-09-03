import { dummyLogger, Logger } from "ts-log";
import { Container, Factory, Provider } from "./container.js";
import { measureTime, LOGGER, PROVIDERS } from "./util.js";

const EAGER = Symbol("eager");

/**
 * Assembles configuration for a dependency injection container.
 */
export class Builder {
  private readonly [LOGGER]: Logger;
  private readonly [PROVIDERS]: Map<string, Provider<unknown>>;
  private readonly [EAGER]: Set<string>;

  /**
   * Creates a new Builder.
   *
   * @param logger - The logger instance.
   */
  constructor(logger: Logger = dummyLogger) {
    this[LOGGER] = logger;
    this[PROVIDERS] = new Map();
    this[EAGER] = new Set();
  }

  /**
   * Abandons registered components and resets the builder to a default state.
   */
  reset() {
    this[PROVIDERS].clear();
    this[EAGER].clear();
    this[LOGGER].debug("The container builder is now in the default state");
  }

  /**
   * Determines if a named component has been added to the builder.
   *
   * @param name - The component name to check.
   * @return Whether the component factory is present.
   */
  has(name: string): boolean {
    return this[PROVIDERS].has(name);
  }

  /**
   * Registers a component.
   *
   * The `factory` parameter must be a `Function` that returns the component.
   * You can provide an async function or one that returns a `Promise`.
   *
   * The `tags` parameter must be an `Array` of `string` values. There are a few
   * tags with special meanings:
   * - `@eager` - The component will be instantiated when the container is built.
   *
   * @param {string} name - The name of the component.
   * @param {Function} factory - A function that returns the component.
   * @param {string[]} [tags=[]] - An array of string tags for the component.
   * @return {Builder} provides a fluent interface.
   */
  public register<T>(
    name: string,
    factory: Factory<T>,
    tags: string[] = [],
  ): this {
    const provider = new Provider(name, factory, tags, this[LOGGER]);
    this[PROVIDERS].set(name, provider);
    if (provider.tags.has("@eager")) {
      this[EAGER].add(name);
    }
    return this;
  }

  /**
   * Registers a constant value as a component.
   *
   * @param {string} [name] - The name of the component.
   * @param {any} [value] - The static value to register as the component.
   * @return {Builder} provides a fluent interface.
   */
  public constant<T>(name: string, value: T): this {
    this[PROVIDERS].set(
      name,
      new Provider(name, () => value, [], this[LOGGER]),
    );
    return this;
  }

  /**
   * Builds a new container and resets the builder to a default state.
   *
   * @return {Container} The container.
   */
  public async build(): Promise<Container> {
    this[LOGGER].info(
      `Building a dependency injection container with ${this[PROVIDERS].size} components`,
    );
    const container = new Container(this[PROVIDERS]);
    if (this[EAGER].size > 0) {
      this[LOGGER].info(`Instantiating eager components: ${this[EAGER]}`);
      await measureTime(
        () => container.getAll(this[EAGER]),
        this[LOGGER],
        "Instantiated eager components",
      );
    }
    this.reset();
    return container;
  }
}
