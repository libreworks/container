import type { Logger } from "ts-log";
import { measureTime, nullLogger } from "./util.js";

/**
 * A function that provides a value.
 */
export type Factory<V> = (container: Container) => V;

/**
 * A named object that provides a value.
 */
export class Provider<T = any> {
  readonly #logger: Logger;
  readonly #name: string;
  readonly #factory: Factory<T>;
  readonly #tags: Set<string>;
  #instance?: Promise<T>;

  /**
   * Creates a new Provider.
   *
   * @param name - The name of the component.
   * @param factory - A function that returns the component.
   * @param tags - An optional array of string tags for the component.
   * @param logger - The logger instance.
   */
  public constructor(
    name: string,
    factory: Factory<T>,
    tags: string[] = [],
    logger: Logger = nullLogger,
  ) {
    this.#name = name;
    this.#factory = factory;
    this.#tags = new Set(tags);
    this.#logger = logger;
  }

  /**
   * @returns The component name.
   */
  public get name(): string {
    return this.#name;
  }

  /**
   * @returns The tags for the component.
   */
  public get tags(): Set<string> {
    return this.#tags;
  }

  /**
   * Instantiates the component.
   *
   * @param container - The container object.
   * @returns the component as produced by the factory function.
   */
  public async provide(container: Container): Promise<T> {
    if (this.#instance === undefined) {
      this.#logger.debug(`Instantiating component: ${this.#name}`);
      this.#instance = measureTime(
        () => this.#factory(container),
        this.#logger,
        `Component instantiated: ${this.#name}`,
      );
      return this.#instance;
    }
    return this.#instance;
  }
}

/**
 * A simplistic asynchronous dependency injection container.
 */
export class Container extends EventTarget {
  readonly #logger: Logger;
  readonly #providers: Map<string, Provider<unknown>>;
  readonly #bytag: Map<string, Set<Provider<unknown>>>;

  /**
   * Create a new Container.
   *
   * @param providers - A Map of providers by name.
   * @param logger - The logger instance, default: no logs
   */
  public constructor(
    providers: Map<string, Provider<unknown>>,
    logger: Logger = nullLogger,
  ) {
    super();
    this.#logger = logger;

    this.#providers = new Map(providers);
    this.#logger.trace(`Number of value providers: ${providers.size}`);

    const byTag = new Map();
    for (let provider of providers.values()) {
      for (let tag of provider.tags) {
        if (!byTag.has(tag)) {
          byTag.set(tag, new Set());
        }
        byTag.get(tag).add(provider);
      }
    }
    this.#bytag = byTag;
    this.#logger.trace(`Number of tags: ${providers.size}`);
  }

  /**
   * Gets a named component from the container.
   *
   * @param name - The component name.
   * @throws {RangeError} if no component is registered with the provided name.
   * @returns A promise that resolves to the registered component
   */
  public async get<T = any>(name: string): Promise<T> {
    if (!this.#providers.has(name)) {
      throw new RangeError(
        `No component is registered under the name '${name}'`,
      );
    }
    const provider = this.#providers.get(name) as Provider<T>;
    return provider.provide(this);
  }

  /**
   * Gets multiple named components from the container.
   *
   * @param names - The component names.
   * @throws {RangeError} if no component is registered with one of the provided names.
   * @returns A Promise that resolves to the registered components
   */
  public getAll<T = any>(
    names: Iterable<string> | ArrayLike<string>,
  ): Promise<T[]> {
    const namesList = Array.from(names);
    if (namesList.length === 0) {
      return Promise.resolve([]);
    }
    return Promise.all(namesList.map((name) => this.get(name)));
  }

  /**
   * Gets any components registered under a specific tag.
   *
   * @param tag - The tag.
   * @returns A Promise that resolves to the tagged components.
   */
  public getAllTagged<T = any>(tag: string): Promise<T[]> {
    if (!this.#bytag.has(tag)) {
      return Promise.resolve([]);
    }
    const providers = this.#bytag.get(tag)! as Set<Provider<T>>;
    return Promise.all(Array.from(providers, (p) => p.provide(this)));
  }

  /**
   * Gets the names of all registered components.
   *
   * @returns The registered component names.
   */
  public getNames(): string[] {
    return Array.from(this.#providers.keys());
  }

  /**
   * Checks if the container holds a named component.
   *
   * If this method returns `true`, invoking `get` with the same parameter will
   * not throw a `RangeError`.
   *
   * @param name - The component name.
   * @returns Whether the component exists in the container
   */
  public has(name: string): boolean {
    return this.#providers.has(name);
  }
}
