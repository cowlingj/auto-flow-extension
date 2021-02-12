import parseExtensions from "./parse-extensions";

const logStep = {
  type: "log",
  params: {
    value: "some value to log",
  },
};

const timeoutStep = {
  type: "timeout",
  params: {
    timeout: 1000,
  },
};

function makeExtensionName(id = "default") {
  return `extension-test-${id}`;
}

function makeExtensionDefinition(id = "default") {
  const extensionName = makeExtensionName(id);
  return {
    type: extensionName,
    steps: [
      {
        type: `result-${extensionName}-step-1`,
        params: {
          key1: "value1",
          key2: 2,
        },
      },
      {
        type: `result-${extensionName}-step-2`,
        params: {
          key3: "value3",
          key4: 4,
        },
      },
      {
        type: `result-${extensionName}-step-3`,
        params: {
          $extensionParamKey1: "$extensionParamKey2",
        },
      },
    ],
  };
}

function makeExtensionResults(params, id = "default") {
  const key = params["$extensionParamKey1"] ?? "$extensionParamKey1";
  const value = params["$extensionParamKey2"] ?? "$extensionParamKey2";
  const extensionName = makeExtensionName(id);
  return [
    {
      type: `result-${extensionName}-step-1`,
      params: {
        key1: "value1",
        key2: 2,
      },
    },
    {
      type: `result-${extensionName}-step-2`,
      params: {
        key3: "value3",
        key4: 4,
      },
    },
    {
      type: `result-${extensionName}-step-3`,
      params: {
        [key]: value,
      },
    },
  ];
}

describe("parse extension", () => {
  it.each([
    [
      "returns unaltered steps if extensions undefined",
      [logStep, timeoutStep],
      undefined,
      [logStep, timeoutStep],
    ],
    [
      "returns unaltered steps if extensions is empty",
      [logStep, timeoutStep],
      [],
      [logStep, timeoutStep],
    ],
    [
      "returns unaltered steps if steps dont include extensions",
      [logStep, timeoutStep],
      [makeExtensionDefinition()],
      [logStep, timeoutStep],
    ],
    [
      "replaces steps with empty extension steps",
      [logStep, { type: makeExtensionName() }, timeoutStep],
      [{ type: makeExtensionName(), steps: [] }],
      [logStep, timeoutStep],
    ],
    [
      "replaces steps with extension steps with no params",
      [logStep, { type: makeExtensionName(), params: {} }, timeoutStep],
      [makeExtensionDefinition()],
      [logStep, ...makeExtensionResults({}), timeoutStep],
    ],
    [
      "replaces steps with extension steps with a value param",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey2: { value: 2 },
          },
        },
        timeoutStep,
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({ $extensionParamKey2: { value: 2 } }),
        timeoutStep,
      ],
    ],
    [
      "replaces steps with extension steps with a key param",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey1: "extension-param-value",
          },
        },
        timeoutStep,
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({
          $extensionParamKey1: "extension-param-value",
        }),
        timeoutStep,
      ],
    ],
    [
      "replaces steps with extension steps with key and value params",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey1: "extension-param-value",
            $extensionParamKey2: { value: 2 },
          },
        },
        timeoutStep,
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({
          $extensionParamKey1: "extension-param-value",
          $extensionParamKey2: { value: 2 },
        }),
        timeoutStep,
      ],
    ],
    [
      "replaces multiple steps with extension steps with key and value params",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey1: "extension-param-value",
          },
        },
        timeoutStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey2: { value: 2 },
          },
        },
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({
          $extensionParamKey1: "extension-param-value",
        }),
        timeoutStep,
        ...makeExtensionResults({ $extensionParamKey2: { value: 2 } }),
      ],
    ],
    [
      "replaces multiple steps with extension steps from multple extensions with key and value params",
      [
        logStep,
        {
          type: makeExtensionName("id-1"),
          params: {
            $extensionParamKey1: "extension-param-value",
          },
        },
        timeoutStep,
        {
          type: makeExtensionName("id-2"),
          params: {
            $extensionParamKey2: { value: 2 },
          },
        },
      ],
      [makeExtensionDefinition("id-1"), makeExtensionDefinition("id-2")],
      [
        logStep,
        ...makeExtensionResults(
          { $extensionParamKey1: "extension-param-value" },
          "id-1"
        ),
        timeoutStep,
        ...makeExtensionResults({ $extensionParamKey2: { value: 2 } }, "id-2"),
      ],
    ],
    [
      "does not replace values more than one for the same extension",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey1: "$extensionParamKey2",
          },
        },
        timeoutStep,
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({ $extensionParamKey1: "$extensionParamKey2" }),
        timeoutStep,
      ],
    ],
    [
      "extensions with the same params do not interfere with each other",
      [
        logStep,
        {
          type: makeExtensionName("id-1"),
          params: {
            $extensionParamKey1: "extension-param-value-1",
          },
        },
        timeoutStep,
        {
          type: makeExtensionName("id-2"),
          params: {
            $extensionParamKey1: "extension-param-value-2",
          },
        },
      ],
      [makeExtensionDefinition("id-1"), makeExtensionDefinition("id-2")],
      [
        logStep,
        ...makeExtensionResults(
          { $extensionParamKey1: "extension-param-value-1" },
          "id-1"
        ),
        timeoutStep,
        ...makeExtensionResults(
          { $extensionParamKey1: "extension-param-value-2" },
          "id-2"
        ),
      ],
    ],
    [
      "non-string keys are handled",
      [
        logStep,
        {
          type: makeExtensionName(),
          params: {
            $extensionParamKey1: { key: "value" },
          },
        },
        timeoutStep,
      ],
      [makeExtensionDefinition()],
      [
        logStep,
        ...makeExtensionResults({ $extensionParamKey1: { key: "value" } }),
        timeoutStep,
      ],
    ],
    [
      "meta-extensions (extensions resolving to extensions) are handled correctly",
      [
        logStep,
        {
          type: "extension-meta",
          params: {
            $extensionParamKeyMeta1: "meta1",
            $extensionParamKeyMeta2: { value: "meta2" },
          },
        },
        timeoutStep,
        {
          type: makeExtensionName("id-2"),
          params: {
            $extensionParamKey1: "extension-param-value-1",
          },
        },
      ],
      [
        {
          type: "extension-meta",
          steps: [
            {
              type: makeExtensionName("id-1"),
              params: {
                $extensionParamKey1: "$extensionParamKeyMeta1",
                $extensionParamKey2: "$extensionParamKeyMeta2",
              },
            },
          ],
        },
        makeExtensionDefinition("id-1"),
        makeExtensionDefinition("id-2"),
      ],
      [
        logStep,
        ...makeExtensionResults(
          {
            $extensionParamKey1: "meta1",
            $extensionParamKey2: { value: "meta2" },
          },
          "id-1"
        ),
        timeoutStep,
        ...makeExtensionResults(
          { $extensionParamKey1: "extension-param-value-1" },
          "id-2"
        ),
      ],
    ],
  ])("%s", (_name, steps, extensions, expectedResult) => {
    expect(parseExtensions(steps, extensions)).toEqual(expectedResult);
  });

  it.each([
    [
      "throws an error for extensions used without definitions",
      [
        logStep,
        { type: makeExtensionDefinition("doesnt-exist"), params: {} },
        timeoutStep,
      ],
      [makeExtensionDefinition("exists")],
    ],
    [
      "throws an error for meta-extensions that resolve to extensions without definitions",
      [
        logStep,
        {
          type: "extension-meta",
          params: {},
        },
        timeoutStep,
      ],
      [
        {
          type: "extension-meta",
          steps: [
            {
              type: makeExtensionName("doesnt-exist"),
              params: {},
            },
          ],
        },
      ],
    ],
    [
      "throws an error if steps is not an object",
      "not an object",
      [makeExtensionDefinition()],
    ],
    ["throws an error if steps is null", null, [makeExtensionDefinition()]],
    [
      "throws an error if steps is undefined",
      undefined,
      [makeExtensionDefinition()],
    ],
    [
      "throws an error if step type is undefined",
      [{ type: undefined, params: {} }],
      [makeExtensionDefinition()],
    ],
    [
      "throws an error if step type is null",
      [{ type: null, params: {} }],
      [makeExtensionDefinition()],
    ],
    [
      "throws an error if step params is undefined",
      [{ type: null, params: undefined }],
      [makeExtensionDefinition()],
    ],
    [
      "throws an error if step params is null",
      [{ type: null, params: undefined }],
      [makeExtensionDefinition()],
    ],
    [
      "throws an error if step params is not an object",
      [{ type: null, params: "not an object" }],
      [makeExtensionDefinition()],
    ],
    [
      "throws an error for an extension that resolves to itself",
      [
        {
          type: "extension-meta",
          params: {},
        },
      ],
      [
        {
          type: "extension-meta",
          steps: [
            {
              type: "extension-meta",
              params: {},
            },
          ],
        },
      ],
    ],
    [
      "throws an error for an extension that resolves to itself with different value",
      [
        {
          type: "extension-meta",
          params: {
            key1: "value1",
          },
        },
      ],
      [
        {
          type: "extension-meta",
          steps: [
            {
              type: "extension-meta",
              params: {
                key2: "value2",
              },
            },
          ],
        },
      ],
    ],
    [
      "throws an error for cyclic extensions",
      [
        {
          type: "extension-meta",
          params: {
            key1: "value1",
          },
        },
      ],
      [
        {
          type: "extension-meta",
          steps: [
            {
              type: "extension-meta",
              params: {
                key2: "value2",
              },
            },
          ],
        },
      ],
    ],
  ])("%s", (_name, steps, extensions) => {
    expect(() => {
      parseExtensions(steps, extensions);
    }).toThrow();
  });
});
