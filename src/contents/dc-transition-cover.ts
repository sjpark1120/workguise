import type { PlasmoCSConfig } from "plasmo"

import {
  TRANSITION_COVER_ID,
  TRANSITION_SESSION_KEY,
  createTransitionCoverElement,
  injectTransitionCoverStyle
} from "~lib/transition-cover"

export { TRANSITION_COVER_ID, TRANSITION_SESSION_KEY }

export const config: PlasmoCSConfig = {
  matches: ["*://*.dcinside.com/*"],
  run_at: "document_start"
}

const OVERLAY_Z_INDEX = 2147483647

if (sessionStorage.getItem(TRANSITION_SESSION_KEY) === "1") {
  sessionStorage.removeItem(TRANSITION_SESSION_KEY)

  injectTransitionCoverStyle()
  const coverElement = createTransitionCoverElement({ zIndex: OVERLAY_Z_INDEX })
  document.documentElement.appendChild(coverElement)
}
