import validate from './validate'

export function makeArray(possibleArray) {
  if (!Array.isArray(possibleArray)) {
    return [possibleArray]
  }
  return possibleArray
}

export function getNested(root, path) {
  return path.reduce((target, key) => target?.[key], root)
}

export function querySelectorOrError(qs) {
  const target = document.querySelector(qs)
  if (!target) {
    throw new Error(`no element found matching ${qs}`)
  }
  return target
}

export function xpathOrError(xpath) {
  const target = document.evaluate(xpath, document)
  if (!target) {
    throw new Error(`no element found matching ${xpath}`)
  }
  return target
}

export function serializeError(err) {
  console.log(err)
  return JSON.stringify(err, Object.getOwnPropertyNames(err))
}

export async function loadAllowedFlows(/** @type {Function} */warn) {
  const flows = await new Promise((resolve) => {
    chrome.storage.local.get(['flows'], ({ flows }) => resolve(flows ?? {}))
  });
  return Object.fromEntries(Object.entries(flows).filter(([name, flow]) => {
    try {
      validate(flow)
      return true
    } catch(e) {
      if (warn) {
        warn(`invalid flow "${NavigationPreloadManager}" - ${e.message}`)
      }
      return false
    }
  }))
}