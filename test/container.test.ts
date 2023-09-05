import { jest } from "@jest/globals";
import { Container, Provider } from "../src/container.js";

describe("Provider", () => {
  describe("#construct", () => {
    test("should present name and tags", async () => {
      const name = "foobar";
      const factory = () => {
        return new Map();
      };
      const tags = ["a", "b", "c"];
      const obj = new Provider(name, factory, tags);
      expect(obj.name).toStrictEqual(name);
      expect(obj.tags).toStrictEqual(new Set(tags));
    });
  });

  describe("#provide", () => {
    test("should return the factory component", async () => {
      const container = {};
      const component = new Set();
      const name = "foobar";
      const factory = () => component;
      const tags = ["a", "b", "c"];
      const obj = new Provider(name, factory, tags);
      // @ts-ignore
      let actual = await obj.provide(container);
      expect(actual).toBe(component);
      // do it again to check the caching behavior.
      // @ts-ignore
      actual = await obj.provide(container);
      expect(actual).toBe(component);
    });
  });
});

describe("Container", () => {
  describe("#get", () => {
    test("should return named component", async () => {
      const name = "foobar";
      const value = new Set([123, 456]);
      const provider = new Provider(name, () => value);
      const providers = new Map();
      providers.set(name, provider);
      const obj = new Container(providers);
      const actual = await obj.get(name);
      expect(actual).toBe(value);
    });

    test("should throw exception without named component", async () => {
      const name = "foobar";
      const provider = new Provider(name, () => "test");
      const providers = new Map();
      providers.set(name, provider);
      const object = new Container(providers);
      await expect(() => object.get("missing")).rejects.toMatchObject({
        name: "RangeError",
        message: "No component is registered under the name 'missing'",
      });
    });
  });

  describe("#getAll", () => {
    test("should return empty for empty argument", async () => {
      const object = new Container(new Map());
      const actual = await object.getAll([]);
      expect(actual).toStrictEqual([]);
    });

    test("should return all components requested", async () => {
      const provider1 = new Provider("foo", () => "foo");
      const provider2 = new Provider("bar", () => "bar");
      const provider3 = new Provider("baz", () => "baz");
      const providers = new Map();
      providers.set("foo", provider1);
      providers.set("bar", provider2);
      providers.set("baz", provider3);
      const obj = new Container(providers);
      const actual = await obj.getAll(["foo", "bar"]);
      expect(actual.length).toBe(2);
      expect(actual.includes("foo")).toBeTruthy();
      expect(actual.includes("bar")).toBeTruthy();
      expect(actual.includes("baz")).toBeFalsy();
    });
  });

  describe("#getAllTagged", () => {
    test("should return empty if no tags", async () => {
      const object = new Container(new Map());
      const actual = await object.getAllTagged("foobar");
      expect(actual).toStrictEqual([]);
    });

    test("should return tagged component", async () => {
      const provider1 = new Provider("foo", () => "foo", ["test"]);
      const provider2 = new Provider("bar", () => "bar", ["test"]);
      const provider3 = new Provider("baz", () => "baz", ["aoeuhtns"]);
      const providers = new Map();
      providers.set("foo", provider1);
      providers.set("bar", provider2);
      providers.set("baz", provider3);
      const obj = new Container(providers);
      const actual = await obj.getAllTagged("test");
      expect(actual.length).toBe(2);
      expect(actual.includes("foo")).toBeTruthy();
      expect(actual.includes("bar")).toBeTruthy();
      expect(actual.includes("baz")).toBeFalsy();
    });
  });

  describe("#has", () => {
    test("should return true if present", async () => {
      const name = "foobar";
      const provider = new Provider(name, () => "test");
      const providers = new Map();
      providers.set(name, provider);
      const object = new Container(providers);
      expect(object.has(name)).toBeTruthy();
    });

    test("should return false if missing", async () => {
      const name = "foobar";
      const provider = new Provider(name, () => "test");
      const providers = new Map();
      providers.set(name, provider);
      const object = new Container(providers);
      expect(object.has("aoeuhtns")).toBeFalsy();
    });
  });

  describe("#getNames", () => {
    test("returns an array of names", () => {
      const provider1 = new Provider("foo", () => "foo");
      const provider2 = new Provider("bar", () => "bar");
      const provider3 = new Provider("baz", () => "baz");
      const providers = new Map();
      providers.set("foo", provider1);
      providers.set("bar", provider2);
      providers.set("baz", provider3);
      const obj = new Container(providers);
      const names = obj.getNames();
      expect(names.length).toBe(3);
      expect(names).toStrictEqual(["foo", "bar", "baz"]);
    });
  });

  describe("#dispatchEvent", () => {
    test("should behave like a good EventTarget", async () => {
      const listener = jest.fn();
      const object = new Container(new Map());
      const event = new Event("testing");
      object.addEventListener("testing", listener);
      object.dispatchEvent(event);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(event);
    });
  });
});
