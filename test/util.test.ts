import { measureTime } from "../lib/util.js";

describe("#measureTime", () => {
  test("calls debug on logger", async () => {
    const expected = "foobar";
    const fn = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      return expected;
    };
    const debugFn = jest.fn();
    const logger = {
      debug: debugFn,
      info: () => {},
      error: () => {},
      warn: () => {},
      trace: () => {},
    };
    const message = "Something";
    const actual = await measureTime(fn, logger, message);
    expect(actual).toBe(expected);
    expect(debugFn).toHaveBeenCalledTimes(1);
    expect(debugFn).toHaveBeenCalledWith(
      message,
      expect.objectContaining({ durationMs: expect.any(Number) }),
    );
  });
});
