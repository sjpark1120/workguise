export const TRANSITION_COVER_ID = "__workguise-transition-cover__"
export const TRANSITION_SESSION_KEY = "__workguise_transitioning__"

const TRANSITION_STYLE_ID = "__workguise-transition-cover-style__"

const SHEETS_ICON_SVG = `
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="3" fill="#34a853"/>
    <rect x="7" y="8" width="14" height="2" rx="1" fill="white"/>
    <rect x="7" y="13" width="14" height="2" rx="1" fill="white"/>
    <rect x="7" y="18" width="10" height="2" rx="1" fill="white"/>
  </svg>
`

const CHEVRON_DOWN_SVG = `
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path d="M1.5 3L4 5.5L6.5 3" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

const MENU_ITEMS = ["파일", "수정", "보기", "삽입", "서식", "데이터", "도구", "확장 프로그램", "도움말"]

const TOOLBAR_ITEMS = [
  "↶", "↷", "⎙", "🖌", "|", "100%▾", "|",
  "$", "%", ".0", ".00", "123▾", "|",
  "기본값▾", "|",
  "−", "12", "+", "|",
  "B", "I", "U", "S", "A", "|",
  "⬛", "⊞", "|",
  "≡", "⫴", "↵", "↻", "|",
  "⊤", "Σ"
]

function renderAppBar(): string {
  return `
    <div style="grid-area:appbar; display:flex; align-items:center; justify-content:space-between; padding:0 8px; background:#ffffff; border-bottom:1px solid #e8eaed;">
      <div style="display:flex; align-items:center; gap:6px;">
        <div style="width:32px; height:40px; display:flex; align-items:center; justify-content:center;">
          ${SHEETS_ICON_SVG}
        </div>
        <div>
          <div style="font-size:16px; font-weight:400; color:#202124; line-height:1.2;">Q2 Operations Tracker</div>
          <div style="display:flex; align-items:center; gap:4px; margin-top:1px; font-size:10px; color:#5f6368;">
            <span>☆</span><span>📁</span><span>✓ 저장됨</span>
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="display:flex; align-items:center; gap:4px; font-size:12px; color:#5f6368;">
          <button style="height:28px; padding:0 10px; border-radius:4px; border:1px solid #dadce0; background:#ffffff; color:#3c4043; font-size:12px; opacity:0.45;">‹ 이전</button>
          <span style="min-width:48px; text-align:center;">p. 1</span>
          <button style="height:28px; padding:0 10px; border-radius:4px; border:1px solid #dadce0; background:#ffffff; color:#3c4043; font-size:12px;">다음 ›</button>
        </div>
        <button style="height:28px; padding:0 12px; border-radius:4px; border:1px solid #dadce0; background:#ffffff; color:#3c4043; font-size:12px;">ON/OFF</button>
        <div style="height:32px; padding:0 16px; border-radius:4px; background:#1a73e8; color:#ffffff; font-size:13px; display:flex; align-items:center; font-weight:500;">공유</div>
      </div>
    </div>
  `
}

function renderMenuBar(): string {
  const items = MENU_ITEMS.map(
    name => `<span style="padding:4px 10px; border-radius:4px; cursor:default; white-space:nowrap;">${name}</span>`
  ).join("")

  return `
    <div style="grid-area:menubar; display:flex; align-items:center; gap:2px; padding:0 60px; background:#ffffff; font-size:13px; color:#202124; overflow:hidden; white-space:nowrap;">
      ${items}
    </div>
  `
}

function renderToolBar(): string {
  const items = TOOLBAR_ITEMS.map(item =>
    item === "|"
      ? `<div style="width:1px; height:20px; background:#e8eaed; margin:0 3px; flex-shrink:0;"></div>`
      : `<div style="height:28px; min-width:28px; padding:0 5px; display:flex; align-items:center; justify-content:center; border-radius:4px; flex-shrink:0;">${item}</div>`
  ).join("")

  return `
    <div style="grid-area:toolbar; display:flex; align-items:center; gap:1px; padding:0 8px; background:#f8f9fa; border-top:1px solid #e8eaed; border-bottom:1px solid #e8eaed; font-size:12px; color:#3c4043; overflow:hidden;">
      ${items}
      <div style="margin-left:auto; color:#5f6368; font-size:11px; white-space:nowrap; padding-right:4px;">Option+Q 토글</div>
    </div>
  `
}

function renderFilterBar(): string {
  return `
    <div style="grid-area:filterbar; display:flex; align-items:center; gap:12px; padding:0 12px; background:#ffffff; border-bottom:1px solid #e8eaed; overflow:hidden;">
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <button style="height:26px; border:1px solid #1a73e8; background:#e8f0fe; border-radius:14px; padding:0 10px; font-size:12px; color:#174ea6; font-weight:600; cursor:default;">전체글</button>
        <button style="height:26px; border:1px solid #dadce0; background:#ffffff; border-radius:14px; padding:0 10px; font-size:12px; color:#3c4043; cursor:default;">개념글</button>
        <button style="height:26px; border:1px solid #dadce0; background:#ffffff; border-radius:14px; padding:0 10px; font-size:12px; color:#3c4043; cursor:default;">공지</button>
      </div>
    </div>
  `
}

function renderFormulaBar(): string {
  return `
    <div style="grid-area:formula; display:flex; align-items:center; background:#ffffff; border-bottom:1px solid #e8eaed; font-size:13px;">
      <div style="width:80px; min-width:80px; height:100%; display:flex; align-items:center; justify-content:center; border-right:1px solid #e8eaed; color:#202124;">A1</div>
      <div style="width:18px; height:100%; display:flex; align-items:center; justify-content:center; border-right:1px solid #e8eaed; color:#5f6368; font-size:11px;">▾</div>
      <div style="padding:0 12px; height:100%; display:flex; align-items:center; border-right:1px solid #e8eaed; color:#5f6368; font-style:italic;">fx</div>
      <div style="flex:1; height:100%; padding:0 12px; display:flex; align-items:center; color:#202124;">행을 클릭하면 본문을 볼 수 있습니다.</div>
    </div>
  `
}

function renderSkeletonGrid(): string {
  const rows = Array.from({ length: 14 }, () => '<div class="wg-skeleton wg-grid-row"></div>').join("")

  return `
    <div style="grid-area:grid; min-height:0; background:#ffffff; border-right:1px solid #dadce0; padding:8px; overflow:hidden;">
      <div class="wg-skeleton wg-grid-head"></div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
        ${rows}
      </div>
    </div>
  `
}

function renderSkeletonPreview(): string {
  return `
    <div style="grid-area:preview; min-height:0; background:#ffffff; display:flex; flex-direction:column; overflow:hidden;">
      <div style="height:41px; border-bottom:1px solid #dadce0; padding:10px 12px; flex-shrink:0;">
        <div class="wg-skeleton wg-preview-title"></div>
      </div>
      <div style="padding:12px; display:flex; flex-direction:column; gap:10px;">
        <div class="wg-skeleton wg-block"></div>
        <div class="wg-skeleton wg-comment"></div>
        <div class="wg-skeleton wg-comment"></div>
      </div>
    </div>
  `
}

function renderSheetFooter(): string {
  const sheetTabs = [
    { label: "시트1", active: true },
    { label: "시트2", active: false },
    { label: "시트3", active: false }
  ].map(({ label, active }) => {
    const color = active ? "#1a73e8" : "#6e6e6e"
    const style = [
      "display:flex", "align-items:center", "gap:5px",
      "padding:0 14px", "font-size:12px", "cursor:default",
      `font-weight:${active ? 500 : 400}`,
      `color:${active ? "#1a73e8" : "#444746"}`,
      `background:${active ? "#ffffff" : "transparent"}`,
      "border-left:1px solid #c7c7c7", "border-right:1px solid #c7c7c7",
      `border-top:2px solid ${active ? "#1a73e8" : "transparent"}`,
      `margin-left:${active ? 0 : -1}px`
    ].join(";")

    const chevron = CHEVRON_DOWN_SVG.replace('stroke-width', `stroke="${color}" stroke-width`)

    return `<div style="${style}">${label}${chevron}</div>`
  }).join("")

  return `
    <div style="grid-area:sheetfooter; display:flex; align-items:stretch; justify-content:space-between; border-top:1px solid #c7c7c7; background:#f1f3f4; overflow:hidden;">
      <div style="display:flex; align-items:stretch;">
        <div style="width:34px; display:flex; align-items:center; justify-content:center; border-right:1px solid #c7c7c7; color:#444746; font-size:16px; cursor:default;">+</div>
        <div style="width:34px; display:flex; align-items:center; justify-content:center; border-right:1px solid #c7c7c7; color:#444746; cursor:default;">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 3h11M1 6.5h11M1 10h11" stroke="#444746" stroke-width="1.6" stroke-linecap="round"/></svg>
        </div>
        ${sheetTabs}
      </div>
      <div style="display:flex; align-items:stretch;">
        <div style="width:34px; display:flex; align-items:center; justify-content:center; border-left:1px solid #c7c7c7; color:#444746; cursor:default;">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 2.5L3.5 6.5L8.5 10.5" stroke="#444746" stroke-width="1.8" stroke-linecap="round"/></svg>
        </div>
        <div style="width:34px; display:flex; align-items:center; justify-content:center; border-left:1px solid #c7c7c7; color:#444746; cursor:default;">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4.5 2.5L9.5 6.5L4.5 10.5" stroke="#444746" stroke-width="1.8" stroke-linecap="round"/></svg>
        </div>
      </div>
    </div>
  `
}

export function createTransitionCoverElement({ zIndex }: { zIndex: number }): HTMLDivElement {
  const coverElement = document.createElement("div")
  coverElement.id = TRANSITION_COVER_ID
  coverElement.style.cssText = [
    "position:fixed!important",
    "inset:0!important",
    `z-index:${zIndex}!important`,
    "background:#ffffff!important",
    "pointer-events:all!important",
    "display:grid!important",
    "grid-template-columns:minmax(0,1fr) 340px!important",
    "grid-template-rows:52px 32px 40px 38px 34px minmax(0,1fr) 34px!important",
    "grid-template-areas:'appbar appbar' 'menubar menubar' 'toolbar toolbar' 'filterbar filterbar' 'formula formula' 'grid preview' 'sheetfooter sheetfooter'!important",
    "font-family:Google Sans,Arial,sans-serif!important",
    "color:#202124!important",
    "overflow:hidden!important",
    "box-sizing:border-box!important"
  ].join(";")

  coverElement.innerHTML = [
    renderAppBar(),
    renderMenuBar(),
    renderToolBar(),
    renderFilterBar(),
    renderFormulaBar(),
    renderSkeletonGrid(),
    renderSkeletonPreview(),
    renderSheetFooter()
  ].join("")

  return coverElement
}

export function injectTransitionCoverStyle() {
  if (document.getElementById(TRANSITION_STYLE_ID)) return

  const styleElement = document.createElement("style")
  styleElement.id = TRANSITION_STYLE_ID
  styleElement.textContent = `
    @keyframes wg-skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .wg-skeleton {
      border-radius: 6px;
      background: linear-gradient(90deg, #eceff1 25%, #f3f4f6 37%, #eceff1 63%);
      background-size: 400% 100%;
      animation: wg-skeleton-shimmer 1.4s linear infinite;
    }
    .wg-grid-head { height: 32px; }
    .wg-grid-row { height: 30px; }
    .wg-preview-title { height: 20px; width: 56%; }
    .wg-block { height: 160px; }
    .wg-comment { height: 56px; }
    @media (prefers-reduced-motion: reduce) {
      .wg-skeleton { animation: none; }
    }
  `
  document.documentElement.appendChild(styleElement)
}
