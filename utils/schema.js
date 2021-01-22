export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Flow",
  "description": "A single flow for use in Auto Flow browser extension",
  "type": "object",
  "properties": {
    "version": {
      "description": "semver version",
      "type": "string",
      "pattern": "^0\\.0\\.[0-9]+.*"
    },
    "steps": {
      "description": "series of actions to carry out in flow",
      "type": "array",
      "items": {
        "anyOf": [
          {
            "title": "call",
            "description": "call a function on an element, the window, or a (nested) property of the window",
            "type": "object",
            "properties": {
              "type": {
                "const": "call"
              },
              "key": {
                "type": ["string", "array"],
                "items": {
                  "type": "string"
                }
              },
              "args": {
                "type": "array"
              }
            },
            "required": ["type", "key", "args"],
            "oneOf": [{
              "properties": {
                "querySelector": {
                  "type": "string"
                }
              },
              "required": ["querySelector"]
            }, {
              "properties": {
                "xpath": {
                  "type": "string"
                }
              },
              "required": ["xpath"]
            }, {
              "properties": {
                "window": {
                  "type": ["string", "array"],
                  "items": {
                    "type": "string"
                  }
                }
              },
              "required": ["window"]
            }]
          },
          {
            "title": "wait",
            "description": "wait for a number of milliseconds",
            "type": "object",
            "properties": {
              "type": {
                "const": "wait"
              },
              "timeout": {
                "type": "integer",
                "minimum": 0
              }
            },
            "required": ["type", "timeout"]
          },
          {
            "title": "log",
            "description": "log a value",
            "type": "object",
            "properties": {
              "type": {
                "const": "log"
              }
            },
            "required": ["type"],
            "oneOf": [{
              "properties": {
                "value": {}
              },
              "required": ["value"]
            }]
          },
          {
            "title": "set",
            "description": "set a property on an element",
            "type": "object",
            "properties": {
              "type": {
                "const": "set"
              },
              "key": {
                "type": ["string", "array"],
                "items": {
                  "type": "string"
                }
              },
              "value": {}
            },
            "required": ["type", "key", "value"],
            "oneOf": [{
              "properties": {
                "querySelector": {
                  "type": "string"
                }
              },
              "required": ["querySelector"]
            }, {
              "properties": {
                "xpath": {
                  "type": "string"
                }
              },
              "required": ["xpath"]
            }]
          },
          {
            "title": "call",
            "description": "call a function on an element, the window, or a (nested) property of the window",
            "type": "object",
            "properties": {
              "type": {
                "const": "call"
              },
              "key": {
                "type": ["string", "array"],
                "items": {
                  "type": "string"
                }
              },
              "args": {
                "type": "array"
              }
            },
            "required": ["type", "key", "args"],
            "oneOf": [{
              "properties": {
                "querySelector": {
                  "type": "string"
                }
              },
              "required": ["querySelector"]
            }, {
              "properties": {
                "xpath": {
                  "type": "string"
                }
              },
              "required": ["xpath"]
            }, {
              "properties": {
                "window": {
                  "type": ["string", "array"],
                  "items": {
                    "type": "string"
                  }
                }
              },
              "required": ["window"]
            }]
          },
          {
            "title": "dispatch",
            "description": "dispatch an event on a tatget",
            "type": "object",
            "properties": {
              "type": {
                "const": "dispatch"
              },
              "event": {
                "type": "string"
              },
              "args": {
                "type": "array"
              },
              "extraProperties": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "key": {
                      "type": ["string", "array"],
                      "items": {
                        "type": "string"
                      }
                    },
                    "value": {}
                  },
                  "required": ["key", "value"]
                }
              }
            },
            "required": ["type", "event", "args", "extraProperties"],
            "oneOf": [{
              "properties": {
                "querySelector": {
                  "type": "string"
                }
              },
              "required": ["querySelector"]
            }, {
              "properties": {
                "xpath": {
                  "type": "string"
                }
              },
              "required": ["xpath"]
            }, {
              "properties": {
                "window": {
                  "type": ["string", "array"],
                  "items": {
                    "type": "string"
                  }
                }
              },
              "required": ["window"]
            }]
          }
        ]
      }
    }
  },
  "required": ["version", "steps"]
}