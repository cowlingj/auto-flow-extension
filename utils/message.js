async function getCurrentTab() {
  const baseTimeout = 1000
  const backoffRate = 2
  let attempt = 0
  for (; attempt < 3; attempt++) {
    try {
      console.log(await new Promise((resolve) => chrome.tabs.query(
        { active: true, currentWindow: true},
        resolve
      )))
      const tab = await new Promise((resolve) => chrome.tabs.query(
        {},
        (tabs) => resolve(tabs.find(({ active }) => active)))
      )
      if (!tab) {
        throw new Error()
      }
      return tab
    } catch {
      await new Promise((resolve) => { setTimeout(resolve, (backoffRate ** attempt) * baseTimeout)}) 
    }
  }
  throw new Error('current tab not found')
}

export async function run(/** @type {Array} */steps) {
  const queue = [...steps]
  let currentAttempt = 0
  let baseTimeout = 1000
  let backoffRate = 2

  while (queue.length > 0) {
    const step = queue.shift()
    try {
      const { id } = await getCurrentTab()
      await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          id,
          { type: 'content.run', step },
          null,
          (err, data) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError)
              return
            }
            if (err) {
              reject(err)
              return
            }
            currentAttempt = 0;
            resolve(data)
            return
          }
        )
      })
    } catch (err) {
      console.warn(err)
      currentAttempt++
      if (currentAttempt === 3) {
        throw new Error('failed step after 3rd attempt')
      }
      await new Promise((resolve) => { setTimeout(resolve, (backoffRate ** currentAttempt) * baseTimeout)}) 
      queue.unshift(step)
    }
  }
}

function makeLogger(kind = 'log') {
  return (...args) => {
    getCurrentTab()
      .then(({ id }) => chrome.tabs.sendMessage(
        id,
        { type: `content.log`, kind, args }
      ))
      .catch((err) => { console.warn('error in log message', err) })
  }
}

/** @type {Console} */
const content = Object.fromEntries(
  Object.getOwnPropertyNames(console)
    .filter(property => typeof console[property] === 'function')
    .map(property => [property, makeLogger(property)])
)

export { content }