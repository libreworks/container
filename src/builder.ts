import { Logger } from "ts-log";
import { Container, Factory, Provider } from "./container.js";
import { measureTime, nullLogger } from "./util.js";

/**
 * Assembles configuration for a dependency injection container.
 */
export class Builder {
  readonly #logger: Logger;
  readonly #providers: Map<string, Provider<unknown>>;
  readonly #eager: Set<string>;

  /**
   * Creates a new Builder.
   *
   * @param logger - The logger instance.
   */
  constructor(logger: Logger = nullLogger) {
    this.#logger = logger;
    this.#providers = new Map();
    this.#eager = new Set();
  }

  /**
   * Abandons registered components and resets the builder to a default state.
   */
  reset() {
    this.#providers.clear();
    this.#eager.clear();
    this.#logger.debug("The container builder is now in the default state");
  }

  /**
   * Determines if a named component has been added to the builder.
   *
   * @param name - The component name to check.
   * @return Whether the component factory is present.
   */
  has(name: string): boolean {
    return this.#providers.has(name);
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
   * @param name - The name of the component.
   * @param factory - A function that returns the component.
   * @param tags - An optional array of string tags for the component.
   * @returns provides a fluent interface.
   */
  public register<T>(
    name: string,
    factory: Factory<T>,
    tags: string[] = [],
  ): this {
    const provider = new Provider(name, factory, tags, this.#logger);
    this.#providers.set(name, provider);
    if (provider.tags.has("@eager")) {
      this.#eager.add(name);
    }
    return this;
  }

  /**
   * Registers a constant value as a component.
   *
   * @param name - The name of the component.
   * @param value - The static value to register as the component.
   * @returns provides a fluent interface.
   */
  public constant<T>(name: string, value: T): this {
    this.#providers.set(
      name,
      new Provider(name, () => value, [], this.#logger),
    );
    return this;
  }

  /**
   * Builds a new container and resets the builder to a default state.
   *
   * @returns The Promised container.
   */
  public async build(): Promise<Container> {
    this.#logger.info(
      `Building a dependency injection container with ${
        this.#providers.size
      } components`,
    );
    const container = new Container(this.#providers);
    if (this.#eager.size > 0) {
      this.#logger.info(`Instantiating eager components: ${this.#eager}`);
      await measureTime(
        () => container.getAll(this.#eager),
        this.#logger,
        "Instantiated eager components",
      );
    }
    this.reset();
    return container;
  }
}
