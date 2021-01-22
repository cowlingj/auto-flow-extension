import { loadAllowedFlows, makeArray, serializeError } from "../utils/index.js";
import fileVersion from '../utils/version.js';
import validate from '../utils/validate.js';
import { content, run } from "../utils/message";

let currentFlowName = "default"
const initialFlows = {
  [currentFlowName]: {
    version: fileVersion,
    steps: []
  }
}
let flows = { ...initialFlows }
let currentFlow = flows[currentFlowName]
let currentStep = 0
chrome.devtools.panels.create("AutoFlow", "/dist/icons/icon-32.png", "/panel.html", async function(panel) {

  const loadedFlows = await loadAllowedFlows(content.warn)
  if (Object.keys(loadedFlows).length > 0) {
    flows = loadedFlows
  }
  const loadedCurrentFlowName = await new Promise((resolve) => 
    chrome.storage.local.get(['currentFlowName'], ({ currentFlowName }) => resolve(currentFlowName))
  )
  if (loadedCurrentFlowName && flows[loadedCurrentFlowName]) {
    currentFlowName = loadedCurrentFlowName
  } else {
    currentFlowName = Object.keys(flows)[0]
  }
  currentFlow = flows[currentFlowName]

  panel.onShown.addListener((/** @type {Window}*/ win) => {

    function show(qs) {
      win.document.querySelector(qs).classList.remove("hidden")
    }
    
    function hide(qs) {
      win.document.querySelector(qs).classList.add("hidden")
    }

    function toggle(qs) {
      win.document.querySelector(qs).classList.toggle("hidden")
    }

    function setDisabledAll(qs, disabled) {
      win.document.querySelectorAll(qs).forEach((n) => n.disabled = disabled)
    }

    function refreshStepThrough() {
      win.document.querySelector("#step-through-input").value = currentFlow.steps[currentStep] ? JSON.stringify(currentFlow.steps[currentStep], null, 2) : ""
    }

    function refreshList() {
      const availableFlowList = win.document.querySelector("#available-flow-list")
      availableFlowList.textContent = ''
      const availableFlowTemplate = win.document.querySelector("#available-flow-item").content
      Object.entries(flows).forEach(([key, value]) => {
        /** @type {Element} */
        const clone = availableFlowTemplate.cloneNode(true)
        let name = currentFlowName === key ? `[selected] ${key}` : key
        clone.querySelector("#available-flow-item-name").innerText = name
        const downloadAnchor = clone.querySelector("#available-flow-item-download")
        downloadAnchor.href = `data:application/json;base64,${btoa(JSON.stringify(value, null, 2))}`
        downloadAnchor.download = key

        const select = clone.querySelector("#available-flow-item-select")
        select.addEventListener('click', () => {
          currentStep = 0
          currentFlowName = key
          chrome.storage.local.set({ currentFlowName }, () => {});
          setStepThroughChanged(false)
          refreshStepThrough()
        })
        select.disabled = currentFlowName === key
        availableFlowList.appendChild(clone)
      });
    }

    function addFlow() {
      currentFlowName = win.document.querySelector("#add-flow-name").value
      
      const reader = new FileReader()
      reader.addEventListener('loadend', (ev) => {
        flows[currentFlowName] = JSON.parse(reader.result)
        saveFlows()
        setStepThroughChanged(false)
        refreshStepThrough()
        refreshList()
      })
      reader.readAsText(win.document.querySelector("#add-flow-file").files[0])    
    }

    function saveFlows() {
      if (Object.keys(flows).length === 0) {
        flows = initialFlows
      }
      if (!flows[currentFlow]) {
        currentFlowName = Object.keys(flows)[0]
      }
      currentFlow = flows[currentFlowName]
      chrome.storage.local.set({ flows, currentFlowName }, function() {
        content.log("flows saved successfully")
      });
    }

    function setStepThroughChanged(changed) {
      if (changed) {
        const downloadCurrentAnchor = win.document.querySelector("#step-through-download")
        downloadCurrentAnchor.href = `data:application/json;base64,${btoa(JSON.stringify(currentFlow, null, 2))}`
        downloadCurrentAnchor.download = currentFlowName
        show("#step-through-changed")
      } else {
        hide("#step-through-changed")
      }
    }

    win.document.querySelector("#step-through")
      .addEventListener("click", () => toggle("#step-through-controls"));

    win.document.querySelector("#add-flow")
      .addEventListener("click", () => {
        hide("#remove-flow-controls")
        show("#add-flow-controls")
      });
    win.document.querySelector("#remove-flow")
      .addEventListener("click", () => {
        hide("#add-flow-controls")
        show("#remove-flow-controls")
      });
    
    win.document.querySelector("#add-flow-name")
      .addEventListener("change", () => {
        win.document.querySelector("#add-flow-confirm").disabled = false
      })
    win.document.querySelector("#add-flow-confirm")
      .addEventListener("click", () => {
        const newFlowName =  win.document.querySelector("#add-flow-name").value
        if (newFlowName in flows) {
          win.document.querySelector("#add-flow-confirm").disabled = true
          show("#add-flow-overwrite-controls")
          return
        }
        addFlow()
        win.document.querySelector("#add-flow-name").value = ""
      })
    win.document.querySelector("#remove-flow-confirm")
      .addEventListener("click", () => {
        delete flows[win.document.querySelector("#remove-flow-name").value]
        saveFlows()
      })

    win.document.querySelector("#add-flow-overwrite-confirm")
      .addEventListener("click", () => {
        addFlow()
        hide("#add-flow-overwrite-controls")
        win.document.querySelector("#add-flow-confirm").disabled = false
        win.document.querySelector("#add-flow-name").value = ""
      })
    win.document.querySelector("#add-flow-overwrite-cancel")
      .addEventListener("click", () => {
        hide("#add-flow-overwrite-controls")
      })

    win.document.querySelector("#add-flow-cancel")
      .addEventListener("click", () => hide("#add-flow-controls"));
    win.document.querySelector("#remove-flow-cancel")
      .addEventListener("click", () => hide("#remove-flow-controls"));
    
    win.document.querySelector("#run").addEventListener("click", async () => {
      try {
        setDisabledAll('.disable-on-run', true)
        validate(currentFlow)
        await run(currentFlow.steps)
        currentStep = 0
      } catch (e) {
        content.error(serializeError(e))
      } finally {
        setDisabledAll('.disable-on-run', false)
      }
    });

    win.document.querySelector("#step-through-run")
      .addEventListener("click", async () => {
        const steps = makeArray(JSON.parse(win.document.querySelector("#step-through-input").value))
        const changed = JSON.stringify(steps) !== JSON.stringify([currentFlow.steps[currentStep]])
        try {
          setDisabledAll('.disable-on-run', true)
          validate({ ...currentFlow, steps })
          await run(steps)

          if (changed) {
            currentFlow.steps.splice(currentStep, 1, ...steps)
            setStepThroughChanged(true)
          }
          refreshStepThrough()
        } catch (e) {
          content.error('failed to run step')
          console.error(e)
        } finally {
          setDisabledAll('.disable-on-run', false)
        }
      });
    
    win.document.querySelector("#step-through-skip")
      .addEventListener("click", () => {
        currentStep += 1
        if (currentStep >= currentFlow.steps.length) {
          content.warn("There are no more steps to skip")
          currentStep = currentFlow.steps.length - 1
        }
        refreshStepThrough()
      });

    win.document.querySelector("#step-through-back")
      .addEventListener("click", () => {
        currentStep -= 1
        if (currentStep < 0) {
          content.warn("Cannot go back to prev step, this is the first step")
          currentStep = 0
        }
        refreshStepThrough()
      });
    
    win.document.querySelector("#step-through-insert-before")
      .addEventListener("click", () => {
        currentFlow.steps.splice(currentStep, 0, null)
        refreshStepThrough()
      });

    win.document.querySelector("#step-through-insert-after")
      .addEventListener("click", () => {
        currentStep += 1
        currentFlow.steps.splice(currentStep, 0, null)
        refreshStepThrough()
      });
    
    win.document.querySelector("#step-through-delete")
      .addEventListener("click", () => {
        currentFlow.steps.splice(currentStep, 1)
        currentStep = currentStep < 1 ? 0 : currentStep - 1
        refreshStepThrough()
      });
    
    win.document.querySelector("#step-through-overwrite")
      .addEventListener("click", () => {
        flows[currentFlowName] = currentFlow
        chrome.storage.local.set({ flows }, () => setStepThroughChanged(false))
        refreshStepThrough()
        refreshList()
      });

    refreshList()
    refreshStepThrough()
  });
});
