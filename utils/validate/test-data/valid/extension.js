import version from "../../../version";

export default {
  version: version,
  steps: [
    {
      type: "extension-test",
      params: {
        param: "value",
      },
    },
  ],
  extensions: [
    {
      type: "extension-test",
      steps: [],
    },
  ],
};
