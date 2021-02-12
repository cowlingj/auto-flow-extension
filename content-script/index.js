import {
  serializeError,
  getNested,
  makeArray,
  getContext,
} from "../utils/index.js";

/**
 *
 * @param {*} step
 * @returns {Promise}
 */
async function run(step) {
  switch (step.type) {
    case "log":
      return console.log(step.params.value);
    case "set": {
      const target = makeArray(step.context ?? []).reduce(
        (acc, cur) => getContext({ ...cur, context: acc }),
        window
      );
      const path = makeArray(step.params.key);
      getNested(target, path.slice(0, -1))[path[path.length]] =
        step.params.value;
      return;
    }
    case "call": {
      const target = makeArray(step.params.context ?? []).reduce(
        (acc, cur) => getContext({ ...cur, context: acc }),
        window
      );
      return target(...(step.params.args ?? []));
    }
    case "dispatch": {
      const ev = new window[step.params.event](...(step.params.args ?? []))(
        step.params.extraProperties ?? []
      ).forEach(({ key, value }) => {
        const path = makeArray(key);
        getNested(ev, path.slice(0, -1))[path[path.length - 1]] = value;
      });
      /** @type {EventTarget} */
      const target = makeArray(step.params.context ?? []).reduce(
        (acc, cur) => getContext({ ...cur, context: acc }),
        window
      );
      return target.dispatchEvent(ev);
    }
    case "wait":
      return new Promise((resolve) => {
        setTimeout(resolve, step.params.timeout);
      });
    default:
      throw new Error(`unsupported step type: "${step.type}"`);
  }
}

function onMessage(message, _sender, sendResponse) {
  switch (message.type) {
    case "content.log":
      console[message.kind](...message.args);
      return true;
    case "content.run":
      run(message.step)
        .then((data) => sendResponse(null, data))
        .catch((err) => sendResponse(serializeError(err), null));
      return true;
  }
  return false;
}
chrome.runtime.onMessage.addListener(onMessage);
