# @libreworks/container

[![MIT](https://img.shields.io/github/license/libreworks/container)](https://github.com/libreworks/container/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/v/@libreworks/container)](https://www.npmjs.com/package/@libreworks/container)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/libreworks/container/release/main?label=release)](https://github.com/libreworks/container/actions/workflows/release.yml)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/libreworks/container?sort=semver)](https://github.com/libreworks/container/releases)
[![codecov](https://codecov.io/gh/libreworks/container/branch/main/graph/badge.svg?token=OHTRGNTSPO)](https://codecov.io/gh/libreworks/container)

A simple asynchronous dependency injection container and event target.

## Installation

```shell
npm install @libreworks/container
```

This library conforms to ECMAScript Modules (ESM). You can import this module using ESM or TypeScript syntax.

```TypeScript
import { Builder, Container, Producer } from "@libreworks/container";
```

If you're using CommonJS, you must use [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) instead.

## Usage

You can use this library to create a graph of objects with intertwined dependencies. These objects and values can even be produced asynchronously.

### Container

A container provides named values.

```typescript
import { Foobar } from "your-package-name-here";

// Assume we created a Container.
declare const container: Container;
// Retrieve a value by its name.
const myObject: Foobar = await container.get("MyObject");
// Retrieve multiple values by their names.
const allObjects: Foobar[] = await container.getAll(["MyObject", "Another"]);
// Retrieve values by tag.
const taggedByMe: Foobar[] = await container.getAllTagged("my-tag");
```

#### Events

The `Container` class extends the `EventTarget` class ([see MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)).

### Builder

In order to put together a `Container`, you can use the `Builder` class.

```typescript
const builder = new Builder()
  // Register a constant
  .constant("ExampleValue", "Lorem ipsum dolor sit amet")
  // Register an array.
  .constant("my.numbers", [1, 2, 3, 5, 8, 13, 21])
  // Register an object created synchronously.
  .register("RandomName", () => AnotherClass.doSomething())
  // Register an object created asynchronously.
  .register(
    "an-async-value",
    async (c) => {
      const myNumbers = await c.get("my.numbers");
      return await createNewThingy(myNumbers);
    },
    ["my-tag", "AnotherTag", "Yet another"]
  );

const container = await builder.build();

// Use the get method's generic type if you prefer.
const anAsyncValue = await container.get<MyClassName>("an-async-value");
```

You provide a name and a "factory" function when you call the `register` method. The factory function needs to return the value you want to register; it can be asynchronous or return a `Promise` as well.

Once the container is built, a call to `get` using the same name will invoke the factory function. The container provides itself as the first argument. That way, you can recursively locate other dependencies immediately before constructing the return value.

Since the container is an `EventTarget`, the factory function could broadcast an event, or the value returned by the factory function can register itself as an event listener. This feature allows objects inside the container to communicate in a loosely-coupled way.

The factory function will only ever be invoked once, no matter how many times `get` is invoked.

#### Eager Creation

Normally, values are lazy-loaded; they are created on-demand. However, you can provide the `@eager` tag when you call the `register` method to ensure your objects initialize themselves when the container is created.

```typescript
const builder = new Builder().register("FooBar", () => new Thingy(), [
  "@eager",
]);
const container = await builder.build();
// Thingy has already been instantiated.
```
