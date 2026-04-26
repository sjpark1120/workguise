import type { PlasmoMessaging } from "@plasmohq/messaging"

function extractValueByInputId({
  htmlText,
  inputId
}: {
  htmlText: string
  inputId: string
}): string {
  const escapedId = inputId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const inputPattern = new RegExp(
    `<input[^>]*id=["']${escapedId}["'][^>]*value=["']([^"']*)["']`,
    "i"
  )
  const matchedValue = htmlText.match(inputPattern)
  if (!matchedValue) return ""

  return matchedValue[1]
}

async function fetchCommentsJson({
  postUrl,
  htmlText
}: {
  postUrl: string
  htmlText: string
}) {
  const parsedPostUrl = new URL(postUrl)
  const galleryId = parsedPostUrl.searchParams.get("id") ?? ""
  const postNumber = parsedPostUrl.searchParams.get("no") ?? ""
  const esnoValue = extractValueByInputId({
    htmlText,
    inputId: "e_s_n_o"
  })
  const gallTypeValue =
    extractValueByInputId({
      htmlText,
      inputId: "_GALLTYPE_"
    }) || "G"
  const secretArticleKey = extractValueByInputId({
    htmlText,
    inputId: "secret_article_key"
  })
  const isReadyForCommentApi = Boolean(galleryId && postNumber && esnoValue)
  if (!isReadyForCommentApi) return null

  const requestBody = new URLSearchParams({
    id: galleryId,
    no: postNumber,
    cmt_id: galleryId,
    cmt_no: postNumber,
    focus_cno: "",
    focus_pno: "",
    e_s_n_o: esnoValue,
    comment_page: "1",
    sort: "",
    prevCnt: "0",
    board_type: "",
    _GALLTYPE_: gallTypeValue,
    secret_article_key: secretArticleKey
  })
  const commentResponse = await fetch("https://gall.dcinside.com/board/comment/", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
      referer: postUrl
    },
    body: requestBody
  })
  if (!commentResponse.ok) return null

  return commentResponse.json()
}

const handler: PlasmoMessaging.MessageHandler = async (request, response) => {
  const postUrl = String(request.body?.postUrl ?? "")
  if (!postUrl) {
    response.send({
      ok: false,
      errorMessage: "URL이 비어 있습니다."
    })
    return
  }

  if (!/^https?:\/\//.test(postUrl)) {
    response.send({
      ok: false,
      errorMessage: "유효하지 않은 게시글 URL입니다."
    })
    return
  }

  try {
    const requestWithCredentials = await fetch(postUrl, {
      credentials: "include"
    })
    if (requestWithCredentials.ok) {
      const htmlText = await requestWithCredentials.text()
      const commentsJson = await fetchCommentsJson({
        postUrl,
        htmlText
      })
      response.send({
        ok: true,
        htmlText,
        commentsJson
      })
      return
    }

    const fallbackRequest = await fetch(postUrl)
    if (!fallbackRequest.ok) {
      response.send({
        ok: false,
        errorMessage: `본문 로딩 실패 (status: ${requestWithCredentials.status})`
      })
      return
    }

    const htmlText = await fallbackRequest.text()
    const commentsJson = await fetchCommentsJson({
      postUrl,
      htmlText
    })
    response.send({
      ok: true,
      htmlText,
      commentsJson
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류"
    response.send({
      ok: false,
      errorMessage: `본문 로딩 중 오류가 발생했습니다. (${errorMessage})`
    })
  }
}

export default handler
