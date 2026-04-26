export interface DcPostRow {
  id: string
  title: string
  author: string
  commentCount: number
  recommendCount: number
  href: string
}

export interface DcPostDetail {
  bodyText: string
  comments: DcPostComment[]
  imageUrls: string[]
}

export interface DcPostComment {
  id: string
  author: string
  content: string
}

interface DcCommentApiItem {
  no?: string
  name?: string
  memo?: string
}

function parseCommentCount(rawText: string): number {
  const matchedNumber = rawText.match(/\[(\d+)\]/)
  if (!matchedNumber) return 0

  return Number(matchedNumber[1])
}

function parseRecommendCount({
  rowElement
}: {
  rowElement: HTMLTableRowElement
}): number {
  const recommendCellText =
    rowElement.querySelector<HTMLElement>("td.gall_recommend")?.textContent?.trim() ??
    rowElement.querySelector<HTMLElement>("td.gall_recom")?.textContent?.trim() ??
    ""
  const matchedNumber = recommendCellText.match(/\d+/)
  if (!matchedNumber) return 0

  return Number(matchedNumber[0])
}

function buildAbsoluteUrl(rawHref: string): string {
  if (!rawHref) return window.location.href

  try {
    return new URL(rawHref, window.location.origin).toString()
  } catch (_error) {
    return window.location.href
  }
}

function extractGalleryIdFromCurrentUrl(): string {
  const currentUrl = new URL(window.location.href)
  const galleryId = currentUrl.searchParams.get("id")
  if (!galleryId) return ""

  return galleryId
}

function extractPostNumberFromHref(rawHref: string): string {
  if (!rawHref) return ""

  try {
    const parsedUrl = new URL(rawHref, window.location.origin)
    const postNumberFromQuery = parsedUrl.searchParams.get("no")
    if (postNumberFromQuery) return postNumberFromQuery
  } catch (_error) {}

  const matchedPostNumber = rawHref.match(/(?:\?|&)no=(\d+)/)
  if (!matchedPostNumber) return ""

  return matchedPostNumber[1]
}

function extractPostNumberFromRow({
  rowElement
}: {
  rowElement: HTMLTableRowElement
}): string {
  const fromDataset =
    rowElement.getAttribute("data-no") ??
    rowElement.getAttribute("data-article-no") ??
    rowElement.getAttribute("data-num") ??
    ""
  if (fromDataset) return fromDataset

  const numberCellText = rowElement.querySelector<HTMLElement>("td.gall_num")?.textContent?.trim() ?? ""
  const matchedNumber = numberCellText.match(/\d+/)
  if (!matchedNumber) return ""

  return matchedNumber[0]
}

function buildDcViewPathname(currentPathname: string): string {
  if (currentPathname.includes("/board/lists")) return currentPathname.replace("/board/lists", "/board/view")
  if (currentPathname.includes("/lists")) return currentPathname.replace("/lists", "/view")
  return "/board/view"
}

function buildPostUrl({
  anchorHref,
  rowElement
}: {
  anchorHref: string
  rowElement: HTMLTableRowElement
}): string {
  const galleryId = extractGalleryIdFromCurrentUrl()
  const postNumberFromHref = extractPostNumberFromHref(anchorHref)
  const postNumberFromRow = extractPostNumberFromRow({ rowElement })
  const postNumber = postNumberFromHref || postNumberFromRow
  const isReadyToBuildViewUrl = Boolean(galleryId && postNumber)
  if (isReadyToBuildViewUrl) {
    const viewPathname = buildDcViewPathname(window.location.pathname)
    return `${window.location.origin}${viewPathname}?id=${encodeURIComponent(galleryId)}&no=${encodeURIComponent(postNumber)}`
  }

  return buildAbsoluteUrl(anchorHref)
}

function isPostLinkHref(rawHref: string): boolean {
  if (!rawHref) return false
  if (rawHref.startsWith("javascript:")) return false
  if (rawHref.includes("/board/view/")) return true
  if (/(?:\?|&)no=\d+/.test(rawHref)) return true
  return false
}

function findPostTitleAnchor({
  rowElement
}: {
  rowElement: HTMLTableRowElement
}): HTMLAnchorElement | null {
  const titleCell = rowElement.querySelector<HTMLElement>("td.gall_tit")
  if (!titleCell) return null

  const anchorElements = Array.from(titleCell.querySelectorAll<HTMLAnchorElement>("a"))
  const postAnchor = anchorElements.find((anchorElement) => isPostLinkHref(anchorElement.getAttribute("href") ?? ""))
  if (postAnchor) return postAnchor

  return titleCell.querySelector<HTMLAnchorElement>("a:not(.reply_numbox)")
}

export function parseDcPostRowsFromDocument({
  targetDocument
}: {
  targetDocument: Document
}): DcPostRow[] {
  const rowElements = Array.from(
    targetDocument.querySelectorAll<HTMLTableRowElement>("tr.ub-content")
  )

  if (!rowElements.length) return []

  return rowElements
    .map((rowElement, rowIndex) => {
      const titleAnchor = findPostTitleAnchor({ rowElement })
      const titleNode = rowElement.querySelector<HTMLElement>("td.gall_tit")
      const authorNode =
        rowElement.querySelector<HTMLElement>("td.gall_writer") ??
        rowElement.querySelector<HTMLElement>("[data-nick]")

      const rawTitle = titleAnchor?.textContent ?? titleNode?.textContent ?? ""
      const title = rawTitle.replace(/\[\d+\]/g, "").trim()
      const commentCount = parseCommentCount(titleNode?.textContent ?? "")
      const recommendCount = parseRecommendCount({ rowElement })
      const author = authorNode?.getAttribute("data-nick") ?? authorNode?.textContent?.trim() ?? "-"
      const href = buildPostUrl({
        anchorHref: titleAnchor?.getAttribute("href") ?? "",
        rowElement
      })
      const isValidPost = Boolean(title && /^https?:\/\//.test(href))

      if (!isValidPost) return null

      return {
        id: `${rowIndex}-${title}`,
        title,
        author,
        commentCount,
        recommendCount,
        href
      }
    })
    .filter((postRow): postRow is DcPostRow => Boolean(postRow))
}

function htmlToReadableText({
  sourceElement
}: {
  sourceElement: HTMLElement
}): string {
  const sourceHtml = sourceElement.innerHTML
  const withLineBreaks = sourceHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
  const plainText = withLineBreaks.replace(/<[^>]+>/g, " ")
  const normalizedText = plainText
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()

  return normalizedText
}

function parseBodyImageUrls({
  bodyElement
}: {
  bodyElement: HTMLElement
}): string[] {
  const imageNodes = Array.from(bodyElement.querySelectorAll<HTMLImageElement>("img"))
  const imageUrls = imageNodes
    .map((imageNode) => {
      const rawSrc =
        imageNode.getAttribute("src") ??
        imageNode.getAttribute("data-src") ??
        imageNode.getAttribute("data-original") ??
        ""
      if (!rawSrc) return ""

      try {
        return new URL(rawSrc, window.location.origin).toString()
      } catch (_error) {
        return ""
      }
    })
    .filter((imageUrl) => Boolean(imageUrl))

  return Array.from(new Set(imageUrls))
}

function parsePostCommentsFromDocument({
  parsedDocument
}: {
  parsedDocument: Document
}): DcPostComment[] {
  const commentNodes = Array.from(
    parsedDocument.querySelectorAll<HTMLElement>(
      ".comment_box .comment_wrap .comment_list li, .view_comment li.ub-content, .cmt_list li"
    )
  )

  return commentNodes
    .map((commentNode, index) => {
      const author =
        commentNode.querySelector<HTMLElement>(".gall_writer, .nickname, .nick, .ip")?.textContent?.trim() ?? "익명"
      const content =
        commentNode.querySelector<HTMLElement>(".usertxt, .comment_memo, .txt, p")?.textContent?.trim() ??
        commentNode.textContent?.trim() ??
        ""
      const normalizedContent = content.replace(/\s+/g, " ").trim()
      if (!normalizedContent) return null

      return {
        id: `${index}-${author}`,
        author,
        content: normalizedContent
      }
    })
    .filter((comment): comment is DcPostComment => Boolean(comment))
}

export function parsePostBodyTextFromHtml({
  htmlText,
  commentsJson
}: {
  htmlText: string
  commentsJson?: {
    comments?: DcCommentApiItem[] | null
  } | null
}): DcPostDetail {
  const htmlParser = new DOMParser()
  const parsedDocument = htmlParser.parseFromString(htmlText, "text/html")
  const bodyElement =
    parsedDocument.querySelector<HTMLElement>(".write_div") ??
    parsedDocument.querySelector<HTMLElement>(".view_content_wrap") ??
    parsedDocument.querySelector<HTMLElement>(".gallview_contents")
  const bodyText = bodyElement ? htmlToReadableText({ sourceElement: bodyElement }) : ""
  const imageUrls = bodyElement ? parseBodyImageUrls({ bodyElement }) : []
  const comments = parseCommentsFromApi({
    commentsJson
  }) ?? parsePostCommentsFromDocument({ parsedDocument })

  if (!bodyText) {
    return {
      bodyText: "본문을 찾지 못했습니다.",
      comments,
      imageUrls
    }
  }

  return {
    bodyText,
    comments,
    imageUrls
  }
}

function parseCommentsFromApi({
  commentsJson
}: {
  commentsJson?: {
    comments?: DcCommentApiItem[] | null
  } | null
}): DcPostComment[] | null {
  const comments = commentsJson?.comments
  if (!comments || !Array.isArray(comments)) return null

  return comments
    .map((comment, index) => {
      const author = (comment.name ?? "익명").trim()
      const rawMemo = comment.memo ?? ""
      const memoAsText = htmlToPlainText({ htmlText: rawMemo })
      const content = memoAsText.replace(/\s+/g, " ").trim()
      if (!content) return null

      return {
        id: `${comment.no ?? index}-${author}`,
        author,
        content
      }
    })
    .filter((comment): comment is DcPostComment => Boolean(comment))
}

function htmlToPlainText({
  htmlText
}: {
  htmlText: string
}): string {
  const htmlParser = new DOMParser()
  const parsedDocument = htmlParser.parseFromString(`<div>${htmlText}</div>`, "text/html")
  return parsedDocument.body.textContent?.trim() ?? ""
}
