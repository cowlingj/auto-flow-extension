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

/**
 * @returns {Element | null}
 * @param {{ querySelector?: string, xpath?: string, context?: Window }} p0
 */
export function getTarget({ querySelector, xpath, context = window }) {  
  let target = null

  if (!querySelector || !xpath) {
    return target
  }
  if (querySelector) {
    target = context.document.querySelector(qs)
  }
  if (xpath) {
    target = context.document.evaluate(xpath, context.document)
  }
  if (!target) {
    throw new Error(`no element found matching ${querySelector ?? xpath}`)
  }
  return target
}

/**
 * @returns {any}
 * @param {{ querySelector?: string, xpath?: string, context?: Window, key?: string | Array<string> }} p0
 */
export function getContext({ querySelector, xpath, context = window, key = [] }) {
  return getNested(getTarget({querySelector, xpath, context}) ?? context, makeArray(key))
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