import { unflatten, flatten } from "flat";

/**
 *
 * @param {Array} steps
 * @param {Array | undefined} extensions
 */
export default function (steps, extensions) {
  let currentSteps = steps;
  let prevStepsHashes = [];
  let currentStepHash = currentSteps.map(({ type }) => type).join(".");

  if (!extensions || extensions.length < 1) {
    return steps;
  }

  while (!prevStepsHashes.includes(currentStepHash)) {
    // extensions can't have a period in (and builtins don't contain periods either) so this makes a good delimiter
    prevStepsHashes.push(currentStepHash);
    currentSteps = currentSteps
      .map((step) => {
        if (!step?.type) {
          throw new Error(`no type for step ${JSON.stringify(step)}`);
        }
        if (!step.type.startsWith("extension")) {
          return step;
        }
        const extension = extensions.find(({ type }) => type === step.type);
        if (!extension) {
          throw new Error(
            `no extension exists for step ${JSON.stringify(step)}`
          );
        }

        return extension.steps.map((s) =>
          unflatten(
            Object.fromEntries(
              Object.entries(flatten(s)).map(([k, v]) => [
                k
                  .split(".")
                  .map((part) => step.params[part] ?? part)
                  .join("."),
                step.params[v] ?? v,
              ])
            )
          )
        );
      })
      .flat(1);
    if (!currentSteps.some((step) => step.type.startsWith("extension"))) {
      return currentSteps;
    }
    currentStepHash = currentSteps.map(({ type }) => type).join(".");
  }
  const e = new Error(`can't transform remaining extensions`);
  e.hashes = prevStepsHashes;
  throw e;
}
