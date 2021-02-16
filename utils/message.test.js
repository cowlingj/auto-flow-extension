describe("message", () => {
  describe("logger", () => {
    it.todo("has the same methods as console");
    it.todo("sends a message to the current tab");
    it.todo("retries if tab is undefined");
  });

  describe("run", () => {
    it.todo("sends message to current tab");
    it.todo("retries if tab is undefined");
    it.todo("last error retries 3 times - succeeds on 3rd attempt");
    it.todo("last error retries 3 times - fails on all attempts");
    it.todo("fails on chrome last error");
    it.todo("fails on run message callback error");
  });
});
