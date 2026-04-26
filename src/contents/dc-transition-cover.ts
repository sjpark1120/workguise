import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.dcinside.com/*"],
  run_at: "document_start"
}

const TRANSITION_COVER_ID = "__workguise-transition-cover__"
const TRANSITION_SESSION_KEY = "__workguise_transitioning__"
const OVERLAY_Z_INDEX = 2147483647

if (sessionStorage.getItem(TRANSITION_SESSION_KEY) === "1") {
  sessionStorage.removeItem(TRANSITION_SESSION_KEY)

  const coverElement = document.createElement("div")
  coverElement.id = TRANSITION_COVER_ID
  coverElement.style.cssText = [
    "position:fixed!important",
    "inset:0!important",
    `z-index:${OVERLAY_Z_INDEX}!important`,
    "background:#ffffff!important",
    "pointer-events:all!important"
  ].join(";")
  document.documentElement.appendChild(coverElement)
}
