import version from "../../../version";

export default {
  version: version,
  steps: [
    {
      type: "call",
      context: {
        xpath: "xpath",
        querySelector: "querySelector",
      },
      args: [],
    },
  ],
};
