import { loadAllowedFlows } from "../utils"
import { content, run } from "../utils/message"

const list = document.querySelector('#flow-list')

async function refresh() {

  list.textContent = ''

  const flowItemTemplate = document.querySelector("#item").content  

  const flows = await loadAllowedFlows(content.warn)

  Object.entries(flows).forEach(([key, value]) => {
    /** @type {Element} */
    const clone = flowItemTemplate.cloneNode(true)
    clone.firstElementChild.innerText = key
    clone.firstElementChild
      .addEventListener("click", async function(/** @type {{ target: HTMLButtonElement}} */ev) {
        try {
          ev.target.disabled - true
          await run(value.steps)
        } catch (e) {
          content.warn(e)
        } finally {
          ev.target.disabled = false
        }
      });
    list.appendChild(clone);
  });

  list.appendChild(document.createElement('hr'))

  const refreshItem = flowItemTemplate.cloneNode(true)
  refreshItem.firstElementChild.addEventListener("click", refresh)
  refreshItem.firstElementChild.innerText = 'Refresh'
  list.appendChild(refreshItem)

}

refresh()

