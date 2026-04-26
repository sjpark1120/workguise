import {
  ClientSideRowModelModule,
  ModuleRegistry,
  type CellClickedEvent,
  type ColDef
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import {
  BarChart3,
  Bold,
  CloudCheck,
  DollarSign,
  Filter,
  Folder,
  Italic,
  Link2,
  MessageSquare,
  Minus,
  PaintBucket,
  Paintbrush,
  Percent,
  Plus,
  Printer,
  Redo2,
  RotateCw,
  Sigma,
  Star,
  Strikethrough,
  Type,
  ChevronLeft,
  ChevronRight,
  Underline as UnderlineIcon,
  Undo2,
  WrapText
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import type { DcHeadFilterOption } from "~contents/dcinside"
import type { DcPostComment, DcPostRow } from "~parser/dcParser"

import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"

ModuleRegistry.registerModules([ClientSideRowModelModule])

export interface SheetViewProps {
  rows: DcPostRow[]
  selectedPost: DcPostRow | null
  selectedPostBodyText: string
  selectedPostComments: DcPostComment[]
  selectedPostImageUrls: string[]
  isDetailLoading: boolean
  selectedListKind: "all" | "recommend" | "notice"
  selectedHeadCode: number | null
  headFilters: DcHeadFilterOption[]
  currentPage: number
  onMovePreviousPage: () => void
  onMoveNextPage: () => void
  onSelectListKind: (kind: "all" | "recommend" | "notice") => void
  onSelectHeadFilter: (headCode: number | null) => void
  onSelectPost: (post: DcPostRow | null) => void
  onToggleOverlay: () => void
}

interface SelectedCell {
  rowId: string
  colId: string
  rowIndex: number
}

export function SheetView({
  rows,
  selectedPost,
  selectedPostBodyText,
  selectedPostComments,
  selectedPostImageUrls,
  isDetailLoading,
  selectedListKind,
  selectedHeadCode,
  headFilters,
  currentPage,
  onMovePreviousPage,
  onMoveNextPage,
  onSelectListKind,
  onSelectHeadFilter,
  onSelectPost,
  onToggleOverlay
}: SheetViewProps) {
  const COMMENT_PAGE_SIZE = 10
  const TOOLBAR_ICON_SIZE = 13
  const TOOLBAR_ICON_STROKE_WIDTH = 1.75
  const toolbarIconStroke = "#3c4043"
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENT_PAGE_SIZE)
  const visibleComments = selectedPostComments.slice(0, visibleCommentCount)
  const hasMoreComments = visibleCommentCount < selectedPostComments.length

  useEffect(() => {
    setVisibleCommentCount(COMMENT_PAGE_SIZE)
  }, [selectedPost?.id])

  const selectedCellName = useMemo(() => {
    if (!selectedCell) return "A1"

    const columnLetterByColId: Record<string, string> = {
      title: "A",
      author: "B",
      commentCount: "C",
      recommendCount: "D"
    }
    const columnLetter = columnLetterByColId[selectedCell.colId] ?? "A"
    const rowNumber = selectedCell.rowIndex + 1

    return `${columnLetter}${rowNumber}`
  }, [selectedCell])
  const formulaValueText = useMemo(() => {
    if (!selectedCell || !selectedPost)
      return "행을 클릭하면 본문을 볼 수 있습니다."

    const valueByColId: Record<string, string> = {
      title: selectedPost.title,
      author: selectedPost.author,
      commentCount: String(selectedPost.commentCount),
      recommendCount: String(selectedPost.recommendCount)
    }

    return valueByColId[selectedCell.colId] ?? selectedPost.title
  }, [selectedCell, selectedPost])

  const columnDefs = useMemo<ColDef<DcPostRow>[]>(
    () => [
      {
        colId: "rowNumber",
        headerName: "",
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        pinned: "left",
        lockPinned: true,
        sortable: false,
        filter: false,
        resizable: false,
        suppressMovable: true,
        valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
        cellStyle: {
          textAlign: "center",
          color: "#5f6368",
          background: "#f8f9fa",
          borderRight: "1px solid #dadce0",
          fontWeight: 500
        }
      },
      {
        field: "title",
        colId: "title",
        headerName: "A",
        flex: 2,
        minWidth: 280,
        cellClassRules: {
          "sheet-selected-cell": (params) =>
            Boolean(
              selectedCell &&
                params.data?.id === selectedCell.rowId &&
                params.column.getColId() === selectedCell.colId
            )
        }
      },
      {
        field: "author",
        colId: "author",
        headerName: "B",
        minWidth: 140,
        cellClassRules: {
          "sheet-selected-cell": (params) =>
            Boolean(
              selectedCell &&
                params.data?.id === selectedCell.rowId &&
                params.column.getColId() === selectedCell.colId
            )
        }
      },
      {
        field: "commentCount",
        colId: "commentCount",
        headerName: "C",
        maxWidth: 140,
        cellClassRules: {
          "sheet-selected-cell": (params) =>
            Boolean(
              selectedCell &&
                params.data?.id === selectedCell.rowId &&
                params.column.getColId() === selectedCell.colId
            )
        }
      },
      {
        field: "recommendCount",
        colId: "recommendCount",
        headerName: "D",
        maxWidth: 120,
        cellStyle: {
          color: "#1a73e8",
          fontWeight: 600,
          display: "flex",
          alignItems: "center"
        },
        cellClassRules: {
          "sheet-selected-cell": (params) =>
            Boolean(
              selectedCell &&
                params.data?.id === selectedCell.rowId &&
                params.column.getColId() === selectedCell.colId
            )
        }
      }
    ],
    [selectedCell]
  )

  const listKindFilters = [
    {
      id: "all",
      label: "전체글",
      onClick: () => onSelectListKind("all")
    },
    {
      id: "recommend",
      label: "개념글",
      onClick: () => onSelectListKind("recommend")
    },
    {
      id: "notice",
      label: "공지",
      onClick: () => onSelectListKind("notice")
    }
  ]
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#ffffff",
        color: "#202124",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 340px",
        gridTemplateRows: "52px 32px 40px 38px 34px minmax(0, 1fr) 34px",
        gridTemplateAreas: `
          "appbar appbar"
          "menubar menubar"
          "toolbar toolbar"
          "filterbar filterbar"
          "formula formula"
          "grid preview"
          "sheetfooter sheetfooter"
        `,
        fontFamily: "Google Sans, Arial, sans-serif",
        overflow: "hidden",
        boxSizing: "border-box"
      }}>
      {/* ── App Bar ── */}
      <div
        style={{
          gridArea: "appbar",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px 0 8px",
          background: "#ffffff",
          borderBottom: "1px solid #e8eaed"
        }}>
        {/* 좌측: 아이콘 + 파일명 + 즐겨찾기/저장 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Sheets 아이콘 (초록 사각형 3줄 느낌) */}
          <div
            style={{
              position: "relative",
              width: 32,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="3" fill="#34a853" />
              <rect x="7" y="8" width="14" height="2" rx="1" fill="white" />
              <rect x="7" y="13" width="14" height="2" rx="1" fill="white" />
              <rect x="7" y="18" width="10" height="2" rx="1" fill="white" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 400,
                color: "#202124",
                lineHeight: 1.2
              }}>
              Q2 Operations Tracker
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 1
              }}>
              <Star size={12} color="#5f6368" strokeWidth={1.8} />
              <Folder size={12} color="#5f6368" strokeWidth={1.8} />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  color: "#5f6368"
                }}>
                <CloudCheck size={12} color="#5f6368" strokeWidth={1.8} />
                저장됨
              </span>
            </div>
          </div>
        </div>
        {/* 우측: 페이지 이동 + 공유 버튼 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#5f6368"
            }}>
            <button
              onClick={onMovePreviousPage}
              disabled={currentPage <= 1}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 4,
                border: "1px solid #dadce0",
                background: "#ffffff",
                color: "#3c4043",
                fontSize: 12,
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                opacity: currentPage <= 1 ? 0.45 : 1
              }}>
              ‹ 이전
            </button>
            <span style={{ minWidth: 48, textAlign: "center" }}>
              p. {currentPage}
            </span>
            <button
              onClick={onMoveNextPage}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 4,
                border: "1px solid #dadce0",
                background: "#ffffff",
                color: "#3c4043",
                fontSize: 12,
                cursor: "pointer"
              }}>
              다음 ›
            </button>
          </div>
          <button
            onClick={onToggleOverlay}
            style={{
              height: 28,
              padding: "0 12px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              background: "#ffffff",
              color: "#3c4043",
              fontSize: 12,
              cursor: "pointer"
            }}>
            ON/OFF
          </button>
          <div
            style={{
              height: 32,
              padding: "0 16px",
              borderRadius: 4,
              background: "#1a73e8",
              color: "#ffffff",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              fontWeight: 500
            }}>
            공유
          </div>
        </div>
      </div>

      {/* ── Menu Bar ── */}
      <div
        style={{
          gridArea: "menubar",
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "0 60px",
          background: "#ffffff",
          fontSize: 13,
          color: "#202124",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}>
        {[
          "파일",
          "수정",
          "보기",
          "삽입",
          "서식",
          "데이터",
          "도구",
          "확장 프로그램",
          "도움말"
        ].map((menuName) => (
          <span
            key={menuName}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              cursor: "default",
              whiteSpace: "nowrap"
            }}>
            {menuName}
          </span>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          gridArea: "toolbar",
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: "0 8px",
          background: "#f8f9fa",
          borderTop: "1px solid #e8eaed",
          borderBottom: "1px solid #e8eaed",
          fontSize: 13,
          color: "#3c4043",
          overflowX: "auto",
          overflowY: "hidden"
        }}>
        {[
          { icon: <Undo2 size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "실행 취소" },
          { icon: <Redo2 size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "다시 실행" },
          { icon: <Printer size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "인쇄" },
          { icon: <Paintbrush size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "페인트 형식" },
          { sep: true },
          { label: "100%▾", title: "확대/축소" },
          { sep: true },
          { icon: <DollarSign size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "통화 형식" },
          { icon: <Percent size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "백분율 형식" },
          { label: ".0", title: "소수 줄이기" },
          { label: ".00", title: "소수 늘리기" },
          { label: "123▾", title: "형식 더보기" },
          { sep: true },
          { label: "기본값▾", title: "글꼴", wide: true },
          { sep: true },
          { icon: <Minus size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "글꼴 크기 줄이기" },
          { label: "12", title: "글꼴 크기" },
          { icon: <Plus size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "글꼴 크기 늘리기" },
          { sep: true },
          { icon: <Bold size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "굵게" },
          { icon: <Italic size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "기울임꼴" },
          { icon: <UnderlineIcon size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "밑줄" },
          { icon: <Strikethrough size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "취소선" },
          { icon: <Type size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "글자 색" },
          { sep: true },
          { icon: <PaintBucket size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "채우기 색" },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke={toolbarIconStroke} strokeWidth="1.3" />
                <path d="M1.5 5.5H12.5M1.5 8.5H12.5M5.5 1.5V12.5M8.5 1.5V12.5" stroke={toolbarIconStroke} strokeWidth="1.05" />
              </svg>
            ),
            title: "테두리"
          },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <rect x="1.5" y="2" width="5" height="10" rx="1.2" stroke={toolbarIconStroke} strokeWidth="1.3" />
                <rect x="7.5" y="2" width="5" height="10" rx="1.2" stroke={toolbarIconStroke} strokeWidth="1.3" />
                <path d="M6.5 7H7.5" stroke={toolbarIconStroke} strokeWidth="1.3" />
              </svg>
            ),
            title: "셀 병합"
          },
          { sep: true },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 3H12M4 6H10M2 9H12M4 12H10" stroke={toolbarIconStroke} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            ),
            title: "수평 정렬"
          },
          {
            icon: (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 2V12M7 4V10M11 2V12" stroke={toolbarIconStroke} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            ),
            title: "수직 정렬"
          },
          { icon: <WrapText size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "텍스트 줄바꿈" },
          { icon: <RotateCw size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "텍스트 회전" },
          { sep: true },
          { icon: <Link2 size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "링크 삽입" },
          { icon: <MessageSquare size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "댓글 삽입" },
          { icon: <BarChart3 size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "차트 삽입" },
          { sep: true },
          { icon: <Filter size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "필터 만들기" },
          { icon: <Sigma size={TOOLBAR_ICON_SIZE} strokeWidth={TOOLBAR_ICON_STROKE_WIDTH} />, title: "함수" }
        ].map((item, index) => {
          if ("sep" in item)
            return (
              <div
                key={`sep-${index}`}
                style={{
                  width: 1,
                  height: 20,
                  background: "#e8eaed",
                  margin: "0 3px",
                  flexShrink: 0
                }}
              />
            )
          return (
            <div
              key={`${item.title}-${index}`}
              title={item.title}
              style={{
                height: 28,
                minWidth: 28,
                padding: "0 5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                cursor: "default",
                flexShrink: 0,
                fontWeight: "bold" in item && item.bold ? 700 : 400,
                fontStyle: "italic" in item && item.italic ? "italic" : "normal",
                textDecoration: "underline" in item && item.underline
                  ? "underline"
                  : "strike" in item && item.strike
                    ? "line-through"
                    : "none",
                fontSize: item.wide ? 12 : 13
              }}>
              {"icon" in item ? item.icon : item.label}
            </div>
          )
        })}
        <div
          style={{
            marginLeft: "auto",
            color: "#5f6368",
            fontSize: 11,
            whiteSpace: "nowrap",
            paddingRight: 4
          }}>
          Option+Q 토글
        </div>
      </div>

      {/* ── List Filter Bar ── */}
      <div
        style={{
          gridArea: "filterbar",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 12px",
          background: "#ffffff",
          borderBottom: "1px solid #e8eaed",
          overflow: "hidden"
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0
          }}>
          {listKindFilters.map((filterItem) => (
            <button
              key={filterItem.id}
              onClick={filterItem.onClick}
              style={{
                height: 26,
                border:
                  filterItem.id === selectedListKind
                    ? "1px solid #1a73e8"
                    : "1px solid #dadce0",
                background:
                  filterItem.id === selectedListKind ? "#e8f0fe" : "#ffffff",
                borderRadius: 14,
                padding: "0 10px",
                fontSize: 12,
                color:
                  filterItem.id === selectedListKind ? "#174ea6" : "#3c4043",
                fontWeight: filterItem.id === selectedListKind ? 600 : 400,
                cursor: "pointer"
              }}>
              {filterItem.label}
            </button>
          ))}
        </div>
        <div
          style={{
            width: 1,
            height: 20,
            background: "#e8eaed",
            flexShrink: 0
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            overflowX: "auto",
            overflowY: "hidden"
          }}>
          {headFilters.map((filterItem) => (
            <button
              key={String(filterItem.code)}
              onClick={() => onSelectHeadFilter(filterItem.code)}
              style={{
                height: 26,
                border:
                  filterItem.code === selectedHeadCode
                    ? "1px solid #1a73e8"
                    : "1px solid #dadce0",
                background:
                  filterItem.code === selectedHeadCode ? "#e8f0fe" : "#f8f9fa",
                borderRadius: 14,
                padding: "0 10px",
                fontSize: 12,
                color:
                  filterItem.code === selectedHeadCode ? "#174ea6" : "#3c4043",
                fontWeight: filterItem.code === selectedHeadCode ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}>
              {filterItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Formula Bar ── */}
      <div
        style={{
          gridArea: "formula",
          display: "flex",
          alignItems: "center",
          gap: 0,
          borderBottom: "1px solid #e8eaed",
          padding: "0",
          background: "#ffffff",
          fontSize: 13
        }}>
        {/* 이름 박스 */}
        <div
          style={{
            width: 80,
            minWidth: 80,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #e8eaed",
            color: "#202124",
            fontWeight: 400,
            fontSize: 13
          }}>
          {selectedCellName}
        </div>
        {/* 드롭다운 화살표 */}
        <div
          style={{
            width: 18,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #e8eaed",
            color: "#5f6368",
            fontSize: 11
          }}>
          ▾
        </div>
        {/* fx 라벨 */}
        <div
          style={{
            padding: "0 12px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            borderRight: "1px solid #e8eaed",
            color: "#5f6368",
            fontSize: 13,
            fontStyle: "italic"
          }}>
          fx
        </div>
        {/* 수식 입력 */}
        <div
          style={{
            flex: 1,
            height: "100%",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            fontSize: 13,
            color: "#202124"
          }}>
          {formulaValueText}
        </div>
      </div>
      <div
        style={{
          gridArea: "grid",
          borderRight: "1px solid #dadce0",
          minHeight: 0
        }}>
        <div
          className="ag-theme-alpine workguise-sheets-grid"
          style={{ height: "100%", width: "100%" }}>
          <style>
            {`
              .workguise-sheets-grid {
                --ag-border-color: #dadce0;
                --ag-header-background-color: #f8f9fa;
                --ag-odd-row-background-color: #ffffff;
                --ag-row-hover-color: #f1f3f4;
                --ag-font-size: 12px;
                --ag-font-family: Arial, "Apple SD Gothic Neo", sans-serif;
              }
              .workguise-sheets-grid .ag-header-cell {
                border-right: 1px solid #dadce0;
                color: #5f6368;
                font-weight: 600;
                justify-content: center;
              }
              .workguise-sheets-grid .ag-header-cell-text {
                margin: 0 auto;
              }
              .workguise-sheets-grid .ag-cell {
                border-right: 1px solid #eceff1;
                border-bottom: 1px solid #eceff1;
              }
              .workguise-sheets-grid .sheet-selected-cell {
                position: relative;
                background: #e8f0fe;
                box-shadow: inset 0 0 0 2px #1a73e8;
              }
            `}
          </style>
          <AgGridReact<DcPostRow>
            rowData={rows}
            columnDefs={columnDefs}
            rowSelection={"single"}
            headerHeight={32}
            rowHeight={30}
            suppressCellFocus
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              cellStyle: {
                display: "flex",
                alignItems: "center"
              }
            }}
            overlayNoRowsTemplate={
              "<span style='padding:8px;color:#5f6368;'>표시할 행이 없습니다</span>"
            }
            onRowClicked={(event) => {
              const data = event.data
              if (!data) return

              const isClickingSelectedRow = selectedPost?.id === data.id
              if (isClickingSelectedRow) {
                onSelectPost(null)
                setSelectedCell(null)
                event.api.deselectAll()
                return
              }

              onSelectPost(data)
            }}
            onCellClicked={(event: CellClickedEvent<DcPostRow>) => {
              const rowId = event.data?.id
              const colId = event.column.getColId()
              if (!rowId) return
              if (colId === "rowNumber") return

              setSelectedCell({
                rowId,
                colId,
                rowIndex: event.node?.rowIndex ?? 0
              })
            }}
            animateRows
          />
        </div>
      </div>
      <div
        style={{
          gridArea: "preview",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}>
        <div
          style={{
            borderBottom: "1px solid #dadce0",
            padding: 12,
            fontSize: 12,
            fontWeight: 600
          }}>
          본문 미리보기
        </div>
        <div
          style={{
            padding: 12,
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
          <div style={{ color: "#5f6368", marginBottom: 8 }}>
            {selectedPost
              ? `${selectedPost.author} | 댓글 ${selectedPost.commentCount}`
              : "선택된 글 없음"}
          </div>
          <div>
            {isDetailLoading ? "본문 로딩 중..." : selectedPostBodyText}
          </div>
          <div style={{ borderTop: "1px solid #eceff1", paddingTop: 10 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>본문 이미지</div>
            {!selectedPostImageUrls.length ? (
              <div style={{ color: "#5f6368" }}>표시할 이미지가 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedPostImageUrls.slice(0, 6).map((imageUrl) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt="post-image"
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      border: "1px solid #eceff1",
                      objectFit: "cover",
                      maxHeight: 220,
                      background: "#f8f9fa"
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div style={{ borderTop: "1px solid #eceff1", paddingTop: 10 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>댓글</div>
            {!selectedPostComments.length ? (
              <div style={{ color: "#5f6368" }}>표시할 댓글이 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleComments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #eceff1",
                      borderRadius: 6,
                      padding: "8px 10px"
                    }}>
                    <div
                      style={{
                        color: "#5f6368",
                        fontSize: 11,
                        marginBottom: 4
                      }}>
                      {comment.author}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
                {hasMoreComments ? (
                  <button
                    onClick={() => setVisibleCommentCount((previousCount) => previousCount + COMMENT_PAGE_SIZE)}
                    style={{
                      height: 30,
                      border: "1px solid #dadce0",
                      borderRadius: 6,
                      background: "#ffffff",
                      color: "#3c4043",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer"
                    }}>
                    댓글 더보기 ({selectedPostComments.length - visibleCommentCount}개 남음)
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ── Sheet Footer ── */}
      <div
        style={{
          gridArea: "sheetfooter",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          borderTop: "1px solid #c7c7c7",
          background: "#f1f3f4",
          overflow: "hidden"
        }}>
        {/* 좌측: 시트 조작 버튼 + 탭 */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {/* + 버튼 */}
          <div
            style={{
              width: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid #c7c7c7",
              color: "#444746",
              cursor: "default",
              flexShrink: 0
            }}>
            <Plus size={14} strokeWidth={1.8} />
          </div>
          {/* ≡ 버튼 */}
          <div
            style={{
              width: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid #c7c7c7",
              color: "#444746",
              cursor: "default",
              flexShrink: 0
            }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 3h11M1 6.5h11M1 10h11" stroke="#444746" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          {/* 탭 영역 */}
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {/* 활성 탭 */}
            {[
              { label: "시트1", active: true },
              { label: "시트2", active: false },
              { label: "시트3", active: false }
            ].map((tab) => (
              <div
                key={tab.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "0 14px",
                  fontSize: 12,
                  fontWeight: tab.active ? 500 : 400,
                  color: tab.active ? "#1a73e8" : "#444746",
                  background: tab.active ? "#ffffff" : "transparent",
                  borderLeft: "1px solid #c7c7c7",
                  borderRight: "1px solid #c7c7c7",
                  borderTop: tab.active ? "2px solid #1a73e8" : "2px solid transparent",
                  cursor: "default",
                  whiteSpace: "nowrap",
                  marginLeft: tab.active ? 0 : -1
                }}>
                {tab.label}
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 3L4 5.5L6.5 3" stroke={tab.active ? "#1a73e8" : "#6e6e6e"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
        {/* 우측: 시트 탐색 화살표 */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div
            style={{
              width: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px solid #c7c7c7",
              color: "#444746",
              cursor: "default"
            }}>
            <ChevronLeft size={13} strokeWidth={1.8} />
          </div>
          <div
            style={{
              width: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderLeft: "1px solid #c7c7c7",
              color: "#444746",
              cursor: "default"
            }}>
            <ChevronRight size={13} strokeWidth={1.8} />
          </div>
        </div>
      </div>
    </div>
  )
}
