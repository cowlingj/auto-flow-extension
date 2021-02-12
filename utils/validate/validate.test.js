import validate from ".";
import fs from "fs";
import path from "path";

describe("validate", () => {
  describe("succeeds for examples", () => {
    it.each(fs.readdirSync(path.resolve("examples")).map((file) => [file]))(
      "%s",
      async (name) => {
        validate(await import(path.resolve("examples", name)));
      }
    );
  });

  describe("succeeds for valid flows", () => {
    it.each(
      fs
        .readdirSync(path.resolve(__dirname, "test-data", "valid"))
        .map((file) => [file])
    )("%s", async (name) => {
      validate(
        (await import(path.resolve(__dirname, "test-data", "valid", name)))
          .default
      );
    });
  });

  describe("fails for invalid flows", () => {
    it.each(
      fs
        .readdirSync(path.resolve(__dirname, "test-data", "invalid"))
        .map((file) => [file])
    )("%s", async (name) => {
      const flow = (
        await import(path.resolve(__dirname, "test-data", "invalid", name))
      ).default;
      expect(() => validate(flow)).toThrow();
    });
  });
});

// TODO: tests are giving false parse errors seem to be incorrect
