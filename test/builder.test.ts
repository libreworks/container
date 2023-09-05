import { jest } from "@jest/globals";
import { Builder } from "../lib/builder.js";
import { Container } from "../lib/container.js";

describe("Builder", () => {
  describe("#construct", () => {
    test("should create an empty container", async () => {
      const obj = new Builder();
      const container = await obj.build();
      expect(container.getNames().length).toBe(0);
    });
  });

  describe("#constant", () => {
    test("is fluent", async () => {
      const obj = new Builder();
      const returned = obj.constant("foo", "bar");
      expect(returned).toStrictEqual(obj);
    });

    test("should register a constant", async () => {
      const name = "foobar";
      const value = new Set([123, 456]);
      const obj = new Builder();
      obj.constant(name, value);
      const container = await obj.build();
      const actual = await container.get(name);
      expect(actual).toStrictEqual(value);
    });
  });

  describe("#register", () => {
    test("is fluent", async () => {
      const obj = new Builder();
      const returned = obj.register("foo", () => "bar");
      expect(returned).toBe(obj);
    });

    test("should register a factory", async () => {
      const name = "foobar";
      const value = new Set([123, 456]);
      const obj = new Builder();
      obj.register(name, () => value);
      const container = await obj.build();
      const actual = await container.get(name);
      expect(actual).toBe(value);
    });

    test("should register an eager factory", async () => {
      const name = "foobar";
      const value = new Set([123, 456]);
      const obj = new Builder();
      const spy = jest.fn().mockImplementation(function (_) {
        return value;
      });
      obj.register(name, spy, ["@eager"]);
      const container = await obj.build();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(container);
    });
  });

  describe("#has", () => {
    test("works correctly", () => {
      const name = "foo";
      const obj = new Builder();
      obj.register(name, () => "bar");
      expect(obj.has(name)).toBeTruthy();
      expect(obj.has("baz")).toBeFalsy();
    });
  });

  describe("#build", () => {
    test("should be a Container", async () => {
      const obj = new Builder();
      const actual = await obj.build();
      expect(actual).toBeInstanceOf(Container);
    });

    test("should call reset", async () => {
      const obj = new Builder();
      const resetStub = jest.spyOn(obj, "reset");
      await obj.build();
      expect(resetStub).toHaveBeenCalledTimes(1);
    });
  });
});
