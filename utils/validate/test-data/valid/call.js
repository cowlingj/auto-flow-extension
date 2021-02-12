import version from "../../../version";

export default {
  version: version,
  steps: [
    {
      type: "call",
      params: {
        context: {
          querySelector: "querySelector",
        },
        args: [],
      },
    },
  ],
};
