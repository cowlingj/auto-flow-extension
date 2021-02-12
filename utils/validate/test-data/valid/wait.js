import version from "../../../version";

export default {
  version: version,
  steps: [
    {
      type: "wait",
      params: {
        timeout: 1000,
      },
    },
  ],
};
