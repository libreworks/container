import { dummyLogger, Logger } from "ts-log";
import { measureTime, LOGGER, PROVIDERS } from "./util.js";

const NAME = Symbol("name");
const TAGS = Symbol("tags");
const FACTORY = Symbol("factory");
const INSTANCE = Symbol("instance");

/**
 * A function that provides a value.
 */
export type Factory<V> = (container: Container) => V;

/**
 * A named object that provides a value.
 */
export class Provider<T = any> {
  private readonly [LOGGER]: Logger;
  private readonly [NAME]: string;
  private readonly [FACTORY]: Factory<T>;
  private readonly [TAGS]: Set<string>;
  private [INSTANCE]?: Promise<T>;

  /**
   * Creates a new Provider.
   *
   * @param {string} name - The name of the component.
   * @param {Function} factory - A function that returns the component.
   * @param {string[]} [tags=[]] - An array of string tags for the component.
   * @param {winston.Logger} [logger] - The winston logger.
   */
  public constructor(
    name: string,
    factory: Factory<T>,
    tags: string[] = [],
    logger: Logger = dummyLogger,
  ) {
    this[NAME] = name;
    this[FACTORY] = factory;
    this[TAGS] = new Set(tags);
    this[LOGGER] = logger;
  }

  /**
   * @returns {string} The component name.
   */
  public get name(): string {
    return this[NAME];
  }

  /**
   * @returns {Set<string>} The tags for the component.
   */
  public get tags(): Set<string> {
    return this[TAGS];
  }

  /**
   * Instantiates the component.
   *
   * @param {Container} container - The container object.
   * @returns {any} the component as produced by the factory function.
   * @throws {Error} if a circular dependency is detected.
   */
  public async provide(container: Container): Promise<T> {
    if (this[INSTANCE] === undefined) {
      this[LOGGER].debug(`Instantiating component: ${this[NAME]}`);
      this[INSTANCE] = measureTime(
        () => this[FACTORY](container),
        this[LOGGER],
        `Component instantiated: ${this[NAME]}`,
      );
      return this[INSTANCE];
    }
    return this[INSTANCE];
  }
}

const BYTAG = Symbol("byTag");

/**
 * A simplistic asynchronous dependency injection container.
 */
export class Container extends EventTarget {
  protected readonly [LOGGER]: Logger;
  private readonly [PROVIDERS]: Map<string, Provider<unknown>>;
  private readonly [BYTAG]: Map<string, Set<Provider<unknown>>>;

  /**
   * Create a new Container.
   *
   * @param providers - A Map of providers by name.
   * @param logger - The logger instance, default: no logs
   */
  public constructor(
    providers: Map<string, Provider<unknown>>,
    logger: Logger = dummyLogger,
  ) {
    super();
    this[PROVIDERS] = new Map(providers);
    const byTag = new Map();
    for (let provider of providers.values()) {
      for (let tag of provider.tags) {
        if (!byTag.has(tag)) {
          byTag.set(tag, new Set());
        }
        byTag.get(tag).add(provider);
      }
    }
    this[BYTAG] = byTag;
    this[LOGGER] = logger;
  }

  /**
   * Gets a named component from the container.
   *
   * @param {string} name - The component name.
   * @throws {RangeError} if no component is registered with the provided name.
   * @return {any} The registered component
   */
  public async get<T = any>(name: string): Promise<T> {
    if (!this[PROVIDERS].has(name)) {
      throw new RangeError(
        `No component is registered under the name '${name}'`,
      );
    }
    const provider = this[PROVIDERS].get(name) as Provider<T>;
    return provider.provide(this);
  }

  /**
   * Gets multiple named components from the container.
   *
   * @param {string[]} names - The component names.
   * @throws {RangeError} if no component is registered with one of the provided names.
   * @return {Array} The registered components
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
   * @param {string} tag - The tag.
   * @returns {Array} Any components found.
   */
  public getAllTagged<T = any>(tag: string): Promise<T[]> {
    if (!this[BYTAG].has(tag)) {
      return Promise.resolve([]);
    }
    const providers = this[BYTAG].get(tag)! as Set<Provider<T>>;
    return Promise.all(Array.from(providers, (p) => p.provide(this)));
  }

  /**
   * Gets the names of all registered components.
   *
   * @returns {string[]} The registered component names.
   */
  public getNames(): string[] {
    return Array.from(this[PROVIDERS].keys());
  }

  /**
   * Checks if the container holds a named component.
   *
   * If this method returns `true`, invoking `get` with the same parameter will
   * not throw a `RangeError`.
   *
   * @param {string} name - The component name.
   * @returns {boolean} Whether the component exists in the container
   */
  public has(name: string): boolean {
    return this[PROVIDERS].has(name);
  }
}
