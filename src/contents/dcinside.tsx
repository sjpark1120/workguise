import { useEffect, useMemo, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"

import { SheetView } from "~components/SheetView"
import { parsePostBodyTextFromHtml, parseDcPostRowsFromDocument, type DcPostDetail, type DcPostRow } from "~parser/dcParser"

export const config: PlasmoCSConfig = {
  matches: ["*://*.dcinside.com/*"]
}

const TOGGLE_SHORTCUT_KEY = "q"
const OVERLAY_Z_INDEX = 2147483646
export const TRANSITION_COVER_ID = "__workguise-transition-cover__"
export const TRANSITION_SESSION_KEY = "__workguise_transitioning__"
const PENDING_HEAD_CODE_SESSION_KEY = "__workguise_pending_head_code__"

export interface DcHeadFilterOption {
  code: number | null
  label: string
}

function showTransitionCover() {
  sessionStorage.setItem(TRANSITION_SESSION_KEY, "1")

  const hasExistingCover = Boolean(document.getElementById(TRANSITION_COVER_ID))
  if (hasExistingCover) return

  const coverElement = document.createElement("div")
  coverElement.id = TRANSITION_COVER_ID
  coverElement.style.cssText = [
    "position:fixed!important",
    "inset:0!important",
    `z-index:${OVERLAY_Z_INDEX + 1}!important`,
    "background:#ffffff!important",
    "pointer-events:all!important"
  ].join(";")
  document.documentElement.appendChild(coverElement)
}

function getCurrentPageNumber(): number {
  const url = new URL(window.location.href)
  const rawPage = url.searchParams.get("page") ?? "1"
  const pageNumber = Number(rawPage)
  if (!Number.isFinite(pageNumber) || pageNumber < 1) return 1

  return Math.floor(pageNumber)
}

function movePage({
  nextPage
}: {
  nextPage: number
}) {
  if (nextPage < 1) return

  showTransitionCover()
  const url = new URL(window.location.href)
  url.searchParams.set("page", String(nextPage))
  window.location.href = url.toString()
}

function clickListKindTab({
  kind,
  selectedHeadCode
}: {
  kind: "all" | "recommend" | "notice"
  selectedHeadCode: number | null
}) {
  const buttonElements = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".list_array_option .array_tab button")
  )
  const kindLabelMap: Record<typeof kind, string> = {
    all: "전체글",
    recommend: "개념글",
    notice: "공지"
  }
  const matchedButton = buttonElements.find((buttonElement) => {
    const onclickText = buttonElement.getAttribute("onclick") ?? ""
    const buttonLabel = buttonElement.textContent?.trim() ?? ""
    const hasKindCall = onclickText.includes("listKindTab") && onclickText.includes(`'${kind}'`)
    const hasLabelMatch = buttonLabel === kindLabelMap[kind]
    return hasKindCall || hasLabelMatch
  })

  if (!matchedButton) return

  const preservedHeadUrl = buildListKindUrlWithHead({
    buttonElement: matchedButton,
    headCode: selectedHeadCode
  })
  if (preservedHeadUrl) {
    clearPendingHeadCode()
    showTransitionCover()
    window.location.href = preservedHeadUrl
    return
  }

  showTransitionCover()
  matchedButton.click()
}

function clickHeadFilter({
  headCode
}: {
  headCode: number
}) {
  const anchorElements = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".list_array_option a")
  )
  const matchedAnchor = anchorElements.find((anchorElement) => {
    const onclickText = anchorElement.getAttribute("onclick") ?? ""
    return onclickText.includes("listSearchHead") && onclickText.includes(`(${headCode})`)
  })

  if (!matchedAnchor) return
  showTransitionCover()
  matchedAnchor.click()
}

function clearHeadFilter() {
  const url = new URL(window.location.href)
  const headParamKeys = ["headid", "head", "search_head"]
  const hasHeadParam = headParamKeys.some((paramKey) => url.searchParams.has(paramKey))

  if (hasHeadParam) {
    headParamKeys.forEach((paramKey) => url.searchParams.delete(paramKey))
    showTransitionCover()
    window.location.href = url.toString()
    return
  }

  const clearAnchor = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".list_array_option a")
  ).find((anchorElement) => {
    const label = anchorElement.textContent?.trim() ?? ""
    return label === "전체"
  })
  if (!clearAnchor) return

  showTransitionCover()
  clearAnchor.click()
}

function buildListKindUrlWithHead({
  buttonElement,
  headCode
}: {
  buttonElement: HTMLButtonElement
  headCode: number | null
}): string | null {
  if (headCode === null) return null

  const onclickText = buttonElement.getAttribute("onclick") ?? ""
  const rawTargetUrl = extractNavigationUrlFromOnclick({ onclickText })
  if (!rawTargetUrl) return null

  try {
    const nextUrl = new URL(rawTargetUrl, window.location.origin)
    const headParamKey = getPreferredHeadParamKey()
    nextUrl.searchParams.set(headParamKey, String(headCode))
    return nextUrl.toString()
  } catch (_error) {
    return null
  }
}

function extractNavigationUrlFromOnclick({
  onclickText
}: {
  onclickText: string
}): string {
  if (!onclickText) return ""

  const locationAssignMatch = onclickText.match(/(?:location\.href|document\.location(?:\.href)?)\s*=\s*['"]([^'"]+)['"]/)
  if (locationAssignMatch?.[1]) return locationAssignMatch[1]

  const locationReplaceMatch = onclickText.match(/location\.replace\(\s*['"]([^'"]+)['"]\s*\)/)
  if (locationReplaceMatch?.[1]) return locationReplaceMatch[1]

  const openCallMatch = onclickText.match(/window\.open\(\s*['"]([^'"]+)['"]/)
  if (openCallMatch?.[1]) return openCallMatch[1]

  return ""
}

function getPreferredHeadParamKey(): string {
  const headParamKeys = ["headid", "head", "search_head"]
  const url = new URL(window.location.href)
  const matchedKey = headParamKeys.find((paramKey) => url.searchParams.has(paramKey))
  if (matchedKey) return matchedKey

  return "headid"
}

function parseActiveListKindFromDocument(): "all" | "recommend" | "notice" {
  const buttonElements = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".list_array_option .array_tab button")
  )

  const activeButton = buttonElements.find((buttonElement) => {
    const className = buttonElement.className
    const isActiveByClass = className.includes("on") || className.includes("sel")
    return isActiveByClass
  })
  if (!activeButton) return "all"

  const activeLabel = activeButton.textContent?.trim() ?? ""
  if (activeLabel === "개념글") return "recommend"
  if (activeLabel === "공지") return "notice"
  return "all"
}

function parseActiveHeadCodeFromDocument(): number | null {
  const anchorElements = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".list_array_option a")
  )
  const activeAnchor = anchorElements.find((anchorElement) => {
    const className = anchorElement.className
    return className.includes("on") || className.includes("sel")
  })
  if (!activeAnchor) return null

  const onclickText = activeAnchor.getAttribute("onclick") ?? ""
  const matchedCode = onclickText.match(/listSearchHead\((\d+)\)/)
  if (!matchedCode) return null

  return Number(matchedCode[1])
}

function parseHeadFiltersFromDocument(): DcHeadFilterOption[] {
  const anchorElements = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".list_array_option a")
  )
  const parsedFilters = anchorElements
    .map((anchorElement) => {
      const label = anchorElement.textContent?.trim() ?? ""
      if (!label) return null

      const onclickText = anchorElement.getAttribute("onclick") ?? ""
      const matchedCode = onclickText.match(/listSearchHead\((\d+)\)/)
      if (!matchedCode) return null

      return {
        code: Number(matchedCode[1]),
        label
      }
    })
    .filter((filterOption): filterOption is { code: number; label: string } => Boolean(filterOption))

  const uniqueFilters = parsedFilters.filter((filterOption, index, filterArray) => {
    const firstIndex = filterArray.findIndex((candidate) => candidate.code === filterOption.code)
    return firstIndex === index
  })

  return [{ code: null, label: "전체" }, ...uniqueFilters]
}

function savePendingHeadCode({
  headCode
}: {
  headCode: number
}) {
  sessionStorage.setItem(PENDING_HEAD_CODE_SESSION_KEY, String(headCode))
}

function clearPendingHeadCode() {
  sessionStorage.removeItem(PENDING_HEAD_CODE_SESSION_KEY)
}

function readPendingHeadCode(): number | null {
  const rawHeadCode = sessionStorage.getItem(PENDING_HEAD_CODE_SESSION_KEY)
  if (!rawHeadCode) return null

  const parsedHeadCode = Number(rawHeadCode)
  if (!Number.isFinite(parsedHeadCode)) {
    clearPendingHeadCode()
    return null
  }

  return parsedHeadCode
}

function DcinsideContentOverlay() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true)
  const [postRows, setPostRows] = useState<DcPostRow[]>([])
  const [selectedPost, setSelectedPost] = useState<DcPostRow | null>(null)
  const [postDetailByUrl, setPostDetailByUrl] = useState<Record<string, DcPostDetail>>({})
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [selectedListKind, setSelectedListKind] = useState<"all" | "recommend" | "notice">("all")
  const [selectedHeadCode, setSelectedHeadCode] = useState<number | null>(null)
  const [headFilters, setHeadFilters] = useState<DcHeadFilterOption[]>([{ code: null, label: "전체" }])

  // React가 마운트되고 SheetView가 렌더되면 전환 커버 제거
  useEffect(() => {
    document.getElementById(TRANSITION_COVER_ID)?.remove()
  }, [])

  useEffect(() => {
    const nextRows = parseDcPostRowsFromDocument({ targetDocument: document })
    setPostRows(nextRows)
    setSelectedPost(nextRows[0] ?? null)
    const activeListKind = parseActiveListKindFromDocument()
    const activeHeadCode = parseActiveHeadCodeFromDocument()
    setSelectedListKind(activeListKind)
    setSelectedHeadCode(activeHeadCode)
    setHeadFilters(parseHeadFiltersFromDocument())

    const pendingHeadCode = readPendingHeadCode()
    const shouldRestorePendingHeadCode = Boolean(
      pendingHeadCode !== null &&
      pendingHeadCode !== activeHeadCode
    )
    if (!shouldRestorePendingHeadCode) {
      clearPendingHeadCode()
      return
    }

    clearPendingHeadCode()
    clickHeadFilter({ headCode: pendingHeadCode })
  }, [])

  useEffect(() => {
    if (!selectedPost) return
    if (postDetailByUrl[selectedPost.href]) return

    let isMounted = true

    async function loadSelectedPostBody() {
      setIsDetailLoading(true)
      const detailResponse = await sendToBackground<{
        postUrl: string
      }, {
        ok: boolean
        htmlText?: string
        commentsJson?: {
          comments?: Array<{
            no?: string
            name?: string
            memo?: string
          }> | null
        } | null
        errorMessage?: string
      }>({
        name: "fetch-post-detail",
        body: {
          postUrl: selectedPost.href
        }
      })
      if (!isMounted) return

      const bodyText = detailResponse.ok
        ? parsePostBodyTextFromHtml({
            htmlText: detailResponse.htmlText ?? "",
            commentsJson: detailResponse.commentsJson
          })
        : {
            bodyText: detailResponse.errorMessage ?? "본문을 불러오지 못했습니다.",
            comments: [],
            imageUrls: []
          }

      setPostDetailByUrl((previousMap) => ({
        ...previousMap,
        [selectedPost.href]: bodyText
      }))
      setIsDetailLoading(false)
    }

    loadSelectedPostBody()
    return () => {
      isMounted = false
    }
  }, [selectedPost, postDetailByUrl])

  useEffect(() => {
    function handleToggleOverlay(event: KeyboardEvent) {
      const isToggleShortcut = event.altKey && event.key.toLowerCase() === TOGGLE_SHORTCUT_KEY
      if (!isToggleShortcut) return

      event.preventDefault()
      setIsOverlayVisible((previousValue) => !previousValue)
    }

    window.addEventListener("keydown", handleToggleOverlay)
    return () => window.removeEventListener("keydown", handleToggleOverlay)
  }, [])

  const overlayStyle = useMemo(
    () => ({
      position: "fixed" as const,
      inset: 0,
      zIndex: OVERLAY_Z_INDEX,
      display: isOverlayVisible ? "block" : "none"
    }),
    [isOverlayVisible]
  )

  return (
    <div style={overlayStyle}>
      <SheetView
        rows={postRows}
        selectedPost={selectedPost}
        selectedPostBodyText={selectedPost ? postDetailByUrl[selectedPost.href]?.bodyText ?? "본문을 불러오지 못했습니다." : "행을 선택해 주세요."}
        selectedPostComments={selectedPost ? postDetailByUrl[selectedPost.href]?.comments ?? [] : []}
        selectedPostImageUrls={selectedPost ? postDetailByUrl[selectedPost.href]?.imageUrls ?? [] : []}
        isDetailLoading={isDetailLoading}
        selectedListKind={selectedListKind}
        selectedHeadCode={selectedHeadCode}
        headFilters={headFilters}
        currentPage={getCurrentPageNumber()}
        onMovePreviousPage={() => movePage({ nextPage: getCurrentPageNumber() - 1 })}
        onMoveNextPage={() => movePage({ nextPage: getCurrentPageNumber() + 1 })}
        onSelectListKind={(kind) => {
          const isClickingSelectedKind = selectedListKind === kind
          const nextKind = isClickingSelectedKind ? "all" : kind
          if (selectedHeadCode !== null) savePendingHeadCode({ headCode: selectedHeadCode })
          else clearPendingHeadCode()
          setSelectedListKind(nextKind)
          clickListKindTab({
            kind: nextKind,
            selectedHeadCode
          })
        }}
        onSelectHeadFilter={(headCode) => {
          if (headCode === null) {
            clearPendingHeadCode()
            setSelectedHeadCode(null)
            clearHeadFilter()
            return
          }

          const isClickingSelectedHead = selectedHeadCode === headCode
          if (isClickingSelectedHead) {
            clearPendingHeadCode()
            setSelectedHeadCode(null)
            clearHeadFilter()
            return
          }

          savePendingHeadCode({ headCode })
          setSelectedHeadCode(headCode)
          clickHeadFilter({ headCode })
        }}
        onSelectPost={setSelectedPost}
        onToggleOverlay={() => setIsOverlayVisible((previousValue) => !previousValue)}
      />
    </div>
  )
}

export default DcinsideContentOverlay
