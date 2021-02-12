import version from "../../../version";

export default {
  version: version,
  steps: [
    {
      type: "dispatch",
      params: {
        context: {
          querySelector: "querySelector",
        },
        event: "KeyboardEvent",
        args: ["change", {}],
        extraProperties: [
          {
            key: ["nested", "key"],
            value: "value",
          },
        ],
      },
    },
  ],
};
