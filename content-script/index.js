import { querySelectorOrError, xpathOrError, serializeError, getNested, makeArray } from '../utils/index.js'

/**
 * @returns {Element | null}
 * @param {{ querySelector?: string, xpath?: string }} p0
 */
function getTarget({ querySelector, xpath }) {
  if (querySelector) {
    return querySelectorOrError(querySelector)
  }
  if (xpath) {
    return xpathOrError(xpath)
  }
  return null
}

/**
 * 
 * @param {*} step
 * @returns {Promise} 
 */
async function run(step) {
  switch (step.type) {
    case "log":
      return console.log(step.value)
    case "set": {
      const target = getTarget(step) ?? getNested(window, makeArray(step.window ?? []))
      const path = makeArray(step.key)
      getNested(target, path.slice(0, -1))[path[path.length - 1]] = step.value
      return
    }
    case "call": {
      const target = getTarget(step) ?? getNested(window, makeArray(step.window ?? []))
      const path = makeArray(step.key)
      return getNested(target, path.slice(0, -1))[path[path.length - 1]](...step.args)
    }
    case "dispatch": {
      const ev = new window[step.event](...step.args)
      (step.extraProperties ?? []).forEach(({ key, value }) => {
        const path = makeArray(key)
        getNested(ev, path.slice(0, -1))[path[path.length - 1]] = value
      })
      /** @type {EventTarget} */
      const target = getTarget(step) ?? getNested(window, makeArray(step.window ?? []))
      return target.dispatchEvent(ev)
    }
    case "wait":
      return new Promise(resolve => { setTimeout(resolve, step.timeout); })
    default: throw new Error(`unsupported step type: "${step.type}"`)
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