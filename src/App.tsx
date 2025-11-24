import './App.css'
import type { ChangeEvent, DragEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { APP_VERSION } from './version'

type Tool = 'arrow' | 'rect' | 'ellipse' | 'text' | 'highlight' | 'redact' | 'blur' | 'crop' | 'draw'
type Lang = 'pt' | 'en'
type ArrowStyle = 'solid' | 'open' | 'double' | 'curve'

type Point = { x: number; y: number }

const TOOLBAR: Array<{ id: Tool; label: string }> = [
  { id: 'arrow', label: 'Seta' },
  { id: 'rect', label: 'Retangulo' },
  { id: 'ellipse', label: 'Elipse' },
  { id: 'text', label: 'Texto' },
  { id: 'highlight', label: 'Marcador' },
  { id: 'redact', label: 'Redigir' },
  { id: 'blur', label: 'Pixelar' },
  { id: 'crop', label: 'Recortar' },
  { id: 'draw', label: 'Desenhar' },
]

const DEFAULT_CANVAS = { width: 1200, height: 700 }
const PREFS_KEY = 'screenshot-annotator-prefs'
const COLOR_PRESETS = ['#6ee7ff', '#ff5252', '#fbbf24', '#22c55e', '#a855f7', '#ffffff', '#111827']
const KEY_TOOL_MAP: Record<string, Tool> = {
  a: 'arrow',
  r: 'rect',
  e: 'ellipse',
  t: 'text',
  h: 'highlight',
  x: 'redact',
  b: 'blur',
  c: 'crop',
  d: 'draw',
}

const TOOL_LABELS: Record<Lang, Record<Tool, string>> = {
  pt: {
    arrow: 'Seta',
    rect: 'Retangulo',
    ellipse: 'Elipse',
    text: 'Texto',
    highlight: 'Marcador',
    redact: 'Redigir',
    blur: 'Pixelar',
    crop: 'Recortar',
    draw: 'Desenhar',
  },
  en: {
    arrow: 'Arrow',
    rect: 'Rectangle',
    ellipse: 'Ellipse',
    text: 'Text',
    highlight: 'Highlighter',
    redact: 'Redact',
    blur: 'Pixelate',
    crop: 'Crop',
    draw: 'Draw',
  },
}
const ARROW_LABELS: Record<Lang, Record<ArrowStyle, string>> = {
  pt: { solid: 'Cheia', open: 'Vazada', double: 'Dupla', curve: 'Curva' },
  en: { solid: 'Solid', open: 'Open', double: 'Double', curve: 'Curved' },
}

const STRINGS: Record<
  Lang,
  {
    title: string
    toolbarAria: string
    langLabel: string
    pasteBtn: string
    captureBtn: string
    captureLoading: string
    color: string
    thickness: string
    outline: string
    outlineColor: string
    arrowStyle: string
    roundness: string
    textOutline: string
    textOutlineColor: string
    undo: string
    clear: string
    copy: string
    export: string
    exportApply: string
    exportWidth: string
    exportHeight: string
    exportFormat: string
    hint: string
    copySuccess: string
    clipboardPrompt: string
    clipboardNone: string
    clipboardMissing: string
    captureUnsupported: string
    captureError: string
    clipboardUnavailable: string
    clipboardCopyError: string
    needImage: string
    publishTitle: string
    publishSteps: string[]
    canvasAria: string
    tagline: string
    textPlaceholder: string
    textLabel: string
    textSizeLabel: string
    textColorLabel: string
    ok: string
    pixelateLabel: string
    quickColors: string
    guidesTitle: string
    canvasLabel: string
    canvasSizeLabel: string
    canvasZoomLabel: string
    grid: string
    gridSize: string
    lockScaleLabel: string
    lockScaleHint: string
    markdownCopy: string
    markdownCopied: string
    markdownTooLarge: string
    shortcutsHint: string
  }
> = {
  pt: {
    title: 'Screenshot Annotator - One File',
    toolbarAria: 'Ferramentas',
    langLabel: 'Idioma',
    pasteBtn: 'Colar (Ctrl/+V)',
    captureBtn: 'Capturar Tela',
    captureLoading: 'Capturando...',
    color: 'Cor',
    thickness: 'Espessura',
    outline: 'Contorno',
    outlineColor: 'Cor do contorno',
    arrowStyle: 'Forma da seta',
    roundness: 'Arredondamento',
    textOutline: 'Contorno texto',
    textOutlineColor: 'Cor contorno texto',
    undo: 'Desfazer',
    clear: 'Limpar',
    copy: 'Copiar PNG',
    export: 'Exportar PNG',
    exportApply: 'Aplicar tamanho',
    exportWidth: 'Largura',
    exportHeight: 'Altura',
    exportFormat: 'Formato',
    hint: 'Dica: arraste uma imagem ou use Ctrl/+V. Clique e arraste para desenhar. Texto: clique para inserir.',
    copySuccess: 'Imagem copiada para o clipboard!',
    clipboardPrompt: 'Permita acesso ao clipboard ou use Ctrl/+V',
    clipboardNone: 'Nenhuma imagem encontrada no clipboard.',
    clipboardMissing: 'Clipboard API indisponivel. Use Exportar PNG para salvar.',
    captureUnsupported: 'Seu navegador nao suporta captura de tela.',
    captureError: 'Nao foi possivel capturar a tela. Permita o acesso e tente novamente.',
    clipboardUnavailable: 'Nao foi possivel gerar o PNG para copiar.',
    clipboardCopyError: 'Nao foi possivel copiar. Permita acesso ao clipboard e tente novamente.',
    needImage: 'Carregue uma imagem primeiro.',
    publishTitle: 'Como publicar (GitHub Pages - 3 passos)',
    publishSteps: [
      'Crie um repositorio no GitHub (ex.: screenshot-annotator).',
      'Rode o build e publique o conteudo da pasta dist.',
      'Em Settings > Pages, selecione Deploy from a branch, branch main, pasta /dist.',
    ],
    canvasAria: 'Area de edicao',
    tagline: 'Cole, anote e envie em segundos',
    textPlaceholder: 'Digite e Enter',
    textLabel: 'Texto',
    textSizeLabel: 'Tamanho da fonte',
    textColorLabel: 'Cor do texto',
    ok: 'OK',
    pixelateLabel: 'Pixelar (tamanho)',
    quickColors: 'Cores rapidas',
    guidesTitle: 'Canvas e guias',
    canvasLabel: 'Canvas',
    canvasSizeLabel: 'Tamanho',
    canvasZoomLabel: 'Zoom',
    grid: 'Grade de alinhamento',
    gridSize: 'Espacamento da grade',
    lockScaleLabel: 'Travar escala 1:1',
    lockScaleHint: 'Mantem pixels exatos; desabilita auto-fit.',
    markdownCopy: 'Copiar Markdown',
    markdownCopied: 'Markdown copiado!',
    markdownTooLarge: 'Imagem grande demais para Markdown inline. Exporte o PNG.',
    shortcutsHint:
      'Atalhos: A seta, R retangulo, E elipse, T texto, H marcador, X redigir, B pixelar, D desenhar, C recortar, G grade, L escala 1:1',
  },
  en: {
    title: 'Screenshot Annotator - One File',
    toolbarAria: 'Tools',
    langLabel: 'Language',
    pasteBtn: 'Paste (Ctrl/+V)',
    captureBtn: 'Capture Screen',
    captureLoading: 'Capturing...',
    color: 'Color',
    thickness: 'Thickness',
    outline: 'Outline',
    outlineColor: 'Outline color',
    arrowStyle: 'Arrow style',
    roundness: 'Roundness',
    textOutline: 'Text outline',
    textOutlineColor: 'Text outline color',
    undo: 'Undo',
    clear: 'Clear',
    copy: 'Copy PNG',
    export: 'Export PNG',
    exportApply: 'Apply size',
    exportWidth: 'Width',
    exportHeight: 'Height',
    exportFormat: 'Format',
    hint: 'Tip: drag an image or press Ctrl/+V. Click and drag to draw. Text: click to insert.',
    copySuccess: 'Image copied to clipboard!',
    clipboardPrompt: 'Allow clipboard access or press Ctrl/+V',
    clipboardNone: 'No image found in the clipboard.',
    clipboardMissing: 'Clipboard API unavailable. Use Export PNG to save.',
    captureUnsupported: 'Your browser does not support screen capture.',
    captureError: 'Could not capture the screen. Allow access and try again.',
    clipboardUnavailable: 'Could not generate the PNG to copy.',
    clipboardCopyError: 'Could not copy. Allow clipboard access and try again.',
    needImage: 'Load an image first.',
    publishTitle: 'How to publish (GitHub Pages - 3 steps)',
    publishSteps: [
      'Create a GitHub repository (e.g., screenshot-annotator).',
      'Run the build and publish the contents of the dist folder.',
      'In Settings > Pages, select Deploy from a branch, branch main, folder /dist.',
    ],
    canvasAria: 'Editing area',
    tagline: 'Paste, annotate, ship in seconds',
    textPlaceholder: 'Type and press Enter',
    textLabel: 'Text',
    textSizeLabel: 'Font size',
    textColorLabel: 'Text color',
    ok: 'OK',
    pixelateLabel: 'Pixelate (size)',
    quickColors: 'Quick colors',
    guidesTitle: 'Canvas & guides',
    canvasLabel: 'Canvas',
    canvasSizeLabel: 'Size',
    canvasZoomLabel: 'Zoom',
    grid: 'Alignment grid',
    gridSize: 'Grid spacing',
    lockScaleLabel: 'Lock scale 1:1',
    lockScaleHint: 'Keeps pixel-perfect view; disables auto-fit.',
    markdownCopy: 'Copy Markdown',
    markdownCopied: 'Markdown copied!',
    markdownTooLarge: 'Image is too large for inline Markdown. Export the PNG instead.',
    shortcutsHint:
      'Shortcuts: A arrow, R rectangle, E ellipse, T text, H highlight, X redact, B pixelate, D draw, C crop, G grid, L lock scale',
  },
}

declare global {
  interface Window {
    __snipPending?: string | null
  }
}

function rectFromPoints(a: Point, b: Point) {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  const width = Math.abs(a.x - b.x)
  const height = Math.abs(a.y - b.y)
  return { x, y, width, height }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0,
) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
  // @ts-ignore roundRect is available in modern browsers
  if ('roundRect' in ctx && typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    // @ts-ignore
    ctx.roundRect(x, y, width, height, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function strokeWithOutline(
  ctx: CanvasRenderingContext2D,
  pathFn: () => void,
  width: number,
  color: string,
  outlineEnabled: boolean,
  outlineColor: string,
) {
  if (outlineEnabled) {
    ctx.save()
    ctx.lineWidth = width + 4
    ctx.strokeStyle = outlineColor
    pathFn()
    ctx.stroke()
    ctx.restore()
  }
  ctx.lineWidth = width
  ctx.strokeStyle = color
  pathFn()
  ctx.stroke()
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  options: {
    fill?: boolean
    alpha?: number
    color: string
    width: number
    outlineEnabled: boolean
    outlineColor: string
    radius?: number
    strokeOnFill?: boolean
  },
) {
  const { x, y, width, height } = rectFromPoints(start, current)
  const {
    fill,
    alpha = 1,
    color,
    width: lineWidth,
    outlineEnabled,
    outlineColor,
    radius = 0,
    strokeOnFill = false,
  } = options
  if (fill) {
    ctx.save()
    ctx.globalAlpha = alpha
    roundRectPath(ctx, x, y, width, height, radius)
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
    if (outlineEnabled) {
      ctx.save()
      ctx.lineWidth = lineWidth + 3
      ctx.strokeStyle = outlineColor
      roundRectPath(ctx, x, y, width, height, radius)
      ctx.stroke()
      ctx.restore()
    }
    if (strokeOnFill) {
      ctx.save()
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      roundRectPath(ctx, x, y, width, height, radius)
      ctx.stroke()
      ctx.restore()
    }
    return
  }
  strokeWithOutline(
    ctx,
    () => roundRectPath(ctx, x, y, width, height, radius),
    lineWidth,
    color,
    outlineEnabled,
    outlineColor,
  )
}

function drawEllipse(
  ctx: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  options: {
    fill?: boolean
    alpha?: number
    color: string
    width: number
    outlineEnabled: boolean
    outlineColor: string
  },
) {
  const { x, y, width, height } = rectFromPoints(start, current)
  const { fill, alpha = 1, color, width: lineWidth, outlineEnabled, outlineColor } = options
  const path = () => {
    ctx.beginPath()
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
  }
  if (fill) {
    ctx.save()
    ctx.globalAlpha = alpha
    path()
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
    if (outlineEnabled) {
      ctx.save()
      ctx.lineWidth = lineWidth + 3
      ctx.strokeStyle = outlineColor
      path()
      ctx.stroke()
      ctx.restore()
    }
    ctx.save()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    path()
    ctx.stroke()
    ctx.restore()
    return
  }
  strokeWithOutline(ctx, path, lineWidth, color, outlineEnabled, outlineColor)
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  width: number,
  color: string,
  outlineEnabled: boolean,
  outlineColor: string,
  style: ArrowStyle,
) {
  const dx = current.x - start.x
  const dy = current.y - start.y
  const len = Math.hypot(dx, dy) || 1
  const nx = dx / len
  const ny = dy / len
  const normal = { x: -ny, y: nx }
  const curveStrength = Math.min(Math.max(len * 0.25, 30), 400)
  const ctrl = {
    x: (start.x + current.x) / 2 + normal.x * (style === 'curve' ? curveStrength : 0),
    y: (start.y + current.y) / 2 + normal.y * (style === 'curve' ? curveStrength : 0),
  }
  const headLength = Math.max(12, width * 3)
  const headWidth = headLength * 0.82
  const tipAngle = Math.atan2(headWidth, headLength)
  const isCurve = style === 'curve'
  const isOpen = style === 'open'
  const isDouble = style === 'double'

  const tangentAt = (origin: Point, control: Point, target: Point, t: number) => {
    // derivative of quadratic Bezier: 2*(1-t)*(ctrl-origin) + 2*t*(target-ctrl)
    const dxD = 2 * (1 - t) * (control.x - origin.x) + 2 * t * (target.x - control.x)
    const dyD = 2 * (1 - t) * (control.y - origin.y) + 2 * t * (target.y - control.y)
    const mag = Math.hypot(dxD, dyD) || 1
    return { x: dxD / mag, y: dyD / mag }
  }

  const curveTangentStart = isCurve ? tangentAt(start, ctrl, current, 0.01) : { x: nx, y: ny }
  const curveTangentEnd = isCurve ? tangentAt(start, ctrl, current, 0.99) : { x: nx, y: ny }

  const shaftStart = style === 'double'
    ? { x: start.x + curveTangentStart.x * headLength, y: start.y + curveTangentStart.y * headLength }
    : start
  const shaftEnd = { x: current.x - curveTangentEnd.x * headLength, y: current.y - curveTangentEnd.y * headLength }

  const drawHead = (
    tip: Point,
    dir: { x: number; y: number },
    strokeStyle: string,
    lineWidth: number,
    open: boolean,
    isOutline: boolean,
  ) => {
    const base = { x: tip.x - dir.x * headLength, y: tip.y - dir.y * headLength }
    const leftAngle = Math.atan2(dir.y, dir.x) + Math.PI - tipAngle
    const rightAngle = Math.atan2(dir.y, dir.x) + Math.PI + tipAngle
    const left = { x: tip.x + Math.cos(leftAngle) * headLength, y: tip.y + Math.sin(leftAngle) * headLength }
    const right = { x: tip.x + Math.cos(rightAngle) * headLength, y: tip.y + Math.sin(rightAngle) * headLength }

    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.fillStyle = strokeStyle
    if (open) {
      ctx.moveTo(tip.x, tip.y)
      ctx.lineTo(left.x, left.y)
      ctx.moveTo(tip.x, tip.y)
      ctx.lineTo(right.x, right.y)
      ctx.stroke()
    } else {
      ctx.moveTo(tip.x, tip.y)
      ctx.lineTo(left.x, left.y)
      ctx.lineTo(base.x, base.y)
      ctx.lineTo(right.x, right.y)
      ctx.closePath()
      if (isOutline) ctx.stroke()
      else ctx.fill()
    }
  }

  const drawArrowPass = (strokeStyle: string, lineWidth: number, isOutline: boolean) => {
    ctx.save()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (isCurve) {
      ctx.beginPath()
      ctx.moveTo(shaftStart.x, shaftStart.y)
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, shaftEnd.x, shaftEnd.y)
      ctx.stroke()
      drawHead(current, curveTangentEnd, strokeStyle, lineWidth, isOpen, isOutline)
      if (isDouble) {
        drawHead(
          start,
          { x: -curveTangentStart.x, y: -curveTangentStart.y },
          strokeStyle,
          lineWidth,
          isOpen,
          isOutline,
        )
      }
    } else {
      ctx.beginPath()
      ctx.moveTo(shaftStart.x, shaftStart.y)
      ctx.lineTo(shaftEnd.x, shaftEnd.y)
      ctx.stroke()
      drawHead(current, { x: nx, y: ny }, strokeStyle, lineWidth, isOpen, isOutline)
      if (isDouble) {
        drawHead(start, { x: -nx, y: -ny }, strokeStyle, lineWidth, isOpen, isOutline)
      }
    }
    ctx.restore()
  }

  if (outlineEnabled) {
    drawArrowPass(outlineColor, width + 4, true)
  }
  drawArrowPass(color, width, false)
}

function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  start: Point,
  current: Point,
  px = 12,
  dpr = 1,
) {
  const { x, y, width, height } = rectFromPoints(start, current)
  const scaledX = Math.round(x * dpr)
  const scaledY = Math.round(y * dpr)
  const scaledW = Math.round(width * dpr)
  const scaledH = Math.round(height * dpr)
  if (!scaledW || !scaledH) return

  let image: ImageData
  try {
    image = ctx.getImageData(scaledX, scaledY, scaledW, scaledH)
  } catch {
    return
  }
  const data = image.data
  const step = Math.max(4, Math.floor(px * dpr))

  for (let row = 0; row < scaledH; row += step) {
    for (let col = 0; col < scaledW; col += step) {
      const idx = (row * scaledW + col) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]

      for (let y2 = 0; y2 < step; y2 += 1) {
        for (let x2 = 0; x2 < step; x2 += 1) {
          const targetCol = col + x2
          const targetRow = row + y2
          if (targetCol >= scaledW || targetRow >= scaledH) continue
          const k = (targetRow * scaledW + targetCol) * 4
          data[k] = r
          data[k + 1] = g
          data[k + 2] = b
          data[k + 3] = a
        }
      }
    }
  }

  ctx.putImageData(image, scaledX, scaledY)
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const baseImageRef = useRef<HTMLImageElement | null>(null)
  const historyRef = useRef<ImageData[]>([])
  const snapshotRef = useRef<ImageData | null>(null)
  const startRef = useRef<Point | null>(null)
  const lastPosRef = useRef<Point | null>(null)
  const isDrawingRef = useRef(false)
  const floatingInputRef = useRef<HTMLDivElement | null>(null)
  const imageSizeRef = useRef<{ width: number; height: number } | null>(DEFAULT_CANVAS)
  const langRef = useRef<Lang>('pt')
  const textColorRef = useRef('#ffffff')
  const dprRef = useRef(1)

  const [tool, setTool] = useState<Tool>('arrow')
  const [strokeColor, setStrokeColor] = useState('#ff5252')
  const [thickness, setThickness] = useState(8)
  const [isCaptureLoading, setIsCaptureLoading] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [copyFeedbackKind, setCopyFeedbackKind] = useState<'copy' | 'markdown' | null>(null)
  const [lang, setLang] = useState<Lang>('pt')
  const [outlineEnabled, setOutlineEnabled] = useState(false)
  const [outlineColor, setOutlineColor] = useState('#000000')
  const [arrowStyle, setArrowStyle] = useState<ArrowStyle>('solid')
  const [roundness, setRoundness] = useState(10)
  const [pixelSize, setPixelSize] = useState(12)
  const [textColor, setTextColor] = useState('#ffffff')
  const [textOutlineEnabled, setTextOutlineEnabled] = useState(false)
  const [textOutlineColor, setTextOutlineColor] = useState('#000000')
  const [exportWidth, setExportWidth] = useState(DEFAULT_CANVAS.width)
  const [exportHeight, setExportHeight] = useState(DEFAULT_CANVAS.height)
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png')
  const [lockScale, setLockScale] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [gridSize, setGridSize] = useState(24)
  const [canvasScale, setCanvasScale] = useState(100)
  const [canvasMeta, setCanvasMeta] = useState(DEFAULT_CANVAS)
  const [collapsed, setCollapsed] = useState<Record<'stroke' | 'guides' | 'text' | 'export', boolean>>({
    stroke: false,
    guides: false,
    text: true,
    export: true,
  })

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(PREFS_KEY) : null
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<{
        strokeColor: string
        thickness: number
        lang: Lang
        outlineEnabled: boolean
        outlineColor: string
        arrowStyle: ArrowStyle
        roundness: number
        pixelSize: number
        textColor: string
        textOutlineEnabled: boolean
        textOutlineColor: string
        exportWidth: number
        exportHeight: number
        exportFormat: 'image/png' | 'image/jpeg' | 'image/webp'
        lockScale: boolean
        showGrid: boolean
        gridSize: number
      }>
      if (parsed.strokeColor) setStrokeColor(parsed.strokeColor)
      if (parsed.thickness) setThickness(parsed.thickness)
      if (parsed.lang) setLang(parsed.lang)
      if (typeof parsed.outlineEnabled === 'boolean') setOutlineEnabled(parsed.outlineEnabled)
      if (parsed.outlineColor) setOutlineColor(parsed.outlineColor)
      if (parsed.arrowStyle) setArrowStyle(parsed.arrowStyle)
      if (typeof parsed.roundness === 'number') setRoundness(parsed.roundness)
      if (typeof parsed.pixelSize === 'number') setPixelSize(parsed.pixelSize)
      if (parsed.textColor) setTextColor(parsed.textColor)
      if (typeof parsed.textOutlineEnabled === 'boolean') setTextOutlineEnabled(parsed.textOutlineEnabled)
      if (parsed.textOutlineColor) setTextOutlineColor(parsed.textOutlineColor)
      if (parsed.exportWidth) setExportWidth(parsed.exportWidth)
      if (parsed.exportHeight) setExportHeight(parsed.exportHeight)
      if (parsed.exportFormat) setExportFormat(parsed.exportFormat)
      if (typeof parsed.lockScale === 'boolean') setLockScale(parsed.lockScale)
      if (typeof parsed.showGrid === 'boolean') setShowGrid(parsed.showGrid)
      if (typeof parsed.gridSize === 'number') setGridSize(parsed.gridSize)
    } catch {
      // ignore bad prefs
    }
  }, [])

  useEffect(() => {
    try {
      const prefs = {
        strokeColor,
        thickness,
        lang,
        outlineEnabled,
        outlineColor,
        arrowStyle,
        roundness,
        pixelSize,
        textColor,
        textOutlineEnabled,
        textOutlineColor,
        exportWidth,
        exportHeight,
        exportFormat,
        lockScale,
        showGrid,
        gridSize,
      }
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // ignore storage errors
    }
  }, [
    arrowStyle,
    exportFormat,
    exportHeight,
    exportWidth,
    lang,
    outlineColor,
    outlineEnabled,
    pixelSize,
    roundness,
    strokeColor,
    textColor,
    textOutlineColor,
    textOutlineEnabled,
    thickness,
    lockScale,
    showGrid,
    gridSize,
  ])

  const toolRef = useRef<Tool>('arrow')
  const colorRef = useRef(strokeColor)
  const thicknessRef = useRef(thickness)
  const copyFeedbackTimer = useRef<number | null>(null)
  const cropHistoryRef = useRef<{ dataUrl: string }[]>([])
  const outlineEnabledMem = useRef(outlineEnabled)
  const outlineColorMem = useRef(outlineColor)
  const arrowStyleMem = useRef<ArrowStyle>(arrowStyle)
  const roundnessMem = useRef(roundness)
  const pixelSizeMem = useRef(pixelSize)
  const lockScaleRef = useRef(false)

  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  useEffect(() => {
    colorRef.current = strokeColor
  }, [strokeColor])

  useEffect(() => {
    thicknessRef.current = thickness
  }, [thickness])
  useEffect(() => {
    langRef.current = lang
  }, [lang])
  useEffect(() => {
    outlineEnabledMem.current = outlineEnabled
  }, [outlineEnabled])
  useEffect(() => {
    outlineColorMem.current = outlineColor
  }, [outlineColor])
  useEffect(() => {
    arrowStyleMem.current = arrowStyle
  }, [arrowStyle])
  useEffect(() => {
    roundnessMem.current = roundness
  }, [roundness])
  useEffect(() => {
    pixelSizeMem.current = pixelSize
  }, [pixelSize])
  useEffect(() => {
    textColorRef.current = textColor
  }, [textColor])
  useEffect(() => {
    lockScaleRef.current = lockScale
  }, [lockScale])

  const removeFloatingInput = useCallback(() => {
    if (floatingInputRef.current) {
      floatingInputRef.current.remove()
      floatingInputRef.current = null
    }
  }, [])

  const redrawBase = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const img = baseImageRef.current
    if (img) {
      const dpr = window.devicePixelRatio || 1
      ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr)
    }
  }, [])

  const setCanvasSize = useCallback(
    (width: number, height: number, options?: { noScale?: boolean }) => {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      const stage = stageRef.current
      if (!canvas || !ctx) return
      const stageWidth = stage ? Math.max(stage.clientWidth - 24, 200) : width
      const useNoScale = options?.noScale ?? lockScaleRef.current
      const scale = useNoScale ? 1 : Math.min(1, stageWidth / width)
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      canvas.style.width = `${width * scale}px`
      canvas.style.height = `${height * scale}px`
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setCanvasScale(Math.round(scale * 100))
      redrawBase()
    },
    [redrawBase, setCanvasScale],
  )
  useEffect(() => {
    const size = imageSizeRef.current
    if (size) {
      setCanvasSize(size.width, size.height)
    }
  }, [lockScale, setCanvasSize])

  const captureCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return null
    try {
      return ctx.getImageData(0, 0, canvas.width, canvas.height)
    } catch {
      return null
    }
  }, [])

  const syncUndoState = useCallback(() => {
    setCanUndo(historyRef.current.length > 1)
  }, [])

  const pushHistory = useCallback(() => {
    const snap = captureCanvas()
    if (!snap) return
    historyRef.current.push(snap)
    syncUndoState()
  }, [captureCanvas, syncUndoState])

  const restoreSnapshot = useCallback(
    (img?: ImageData | null) => {
      const ctx = ctxRef.current
      if (!ctx) return
      if (img) {
        ctx.putImageData(img, 0, 0)
        return
      }
      const last = historyRef.current[historyRef.current.length - 1]
      if (last) {
        ctx.putImageData(last, 0, 0)
      } else {
        redrawBase()
      }
    },
    [redrawBase],
  )

  const getCanvasPoint = useCallback((event: MouseEvent | PointerEvent): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    const dpr = window.devicePixelRatio || 1
    const naturalWidth = canvas.width / dpr
    const naturalHeight = canvas.height / dpr
    const scaleX = naturalWidth / rect.width
    const scaleY = naturalHeight / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }, [])

  const drawCurrentTool = useCallback(
    (start: Point | null, current: Point | null) => {
      const ctx = ctxRef.current
      if (!ctx || !start || !current) return
      const width = Math.max(1, thicknessRef.current || 1)
      const color = colorRef.current
      const outlineOn = outlineEnabledMem.current
      const outlineColor = outlineColorMem.current
      const radius = roundnessMem.current
      const pxSize = pixelSizeMem.current
      const dpr = dprRef.current || 1
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.globalCompositeOperation = 'source-over'
      switch (toolRef.current) {
        case 'crop': {
          // Crop uses a confirm on mouseup; no preview drawn onto canvas.
          break
        }
        case 'rect':
          drawRect(ctx, start, current, {
            fill: false,
            color,
            width,
            outlineEnabled: outlineOn,
            outlineColor,
            radius,
          })
          break
        case 'ellipse':
          drawEllipse(ctx, start, current, {
            fill: false,
            color,
            width,
            outlineEnabled: outlineOn,
            outlineColor,
          })
          break
        case 'arrow':
          drawArrow(
            ctx,
            start,
            current,
            width,
            color,
            outlineOn,
            outlineColor,
            arrowStyleMem.current,
          )
          break
        case 'highlight':
          drawRect(ctx, start, current, {
            fill: true,
            alpha: 0.25,
            color,
            width,
            outlineEnabled: false,
            outlineColor,
            radius,
            strokeOnFill: false,
          })
          break
        case 'redact':
          drawRect(ctx, start, current, {
            fill: true,
            alpha: 1,
            color,
            width,
            outlineEnabled: false,
            outlineColor,
            radius,
          })
          break
        case 'blur':
          pixelateRegion(ctx, start, current, pxSize, dpr)
          break
        default:
          break
      }
    },
    [],
  )

  const addTextAt = useCallback((point: Point) => {
    removeFloatingInput()
    const canvas = canvasRef.current
    if (!canvas) return
    const strings = STRINGS[langRef.current]

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const naturalWidth = canvas.width / dpr || 1
    const naturalHeight = canvas.height / dpr || 1
    const ratioX = rect.width / naturalWidth
    const ratioY = rect.height / naturalHeight
    const left = rect.left + point.x * ratioX + window.scrollX
    const top = rect.top + point.y * ratioY + window.scrollY

    const container = document.createElement('div')
    container.className = 'floating-input'
    container.style.left = `${left}px`
    container.style.top = `${top}px`

    const inputId = `floating-text-${Date.now()}`
    const textInput = document.createElement('input')
    textInput.type = 'text'
    textInput.id = inputId
    textInput.name = 'floating-text'
    textInput.placeholder = strings.textPlaceholder
    textInput.size = 24

    const sizeInput = document.createElement('input')
    sizeInput.type = 'number'
    sizeInput.name = 'floating-text-size'
    sizeInput.min = '10'
    sizeInput.max = '120'
    sizeInput.value = String(Math.max(12, thicknessRef.current * 3))
    sizeInput.setAttribute('aria-label', strings.textSizeLabel)

    const colorPicker = document.createElement('input')
    colorPicker.type = 'color'
    colorPicker.name = 'floating-text-color'
    colorPicker.value = textColorRef.current
    colorPicker.setAttribute('aria-label', strings.textColorLabel)

    const label = document.createElement('label')
    label.setAttribute('for', inputId)
    label.textContent = strings.textLabel

    const okButton = document.createElement('button')
    okButton.type = 'button'
    okButton.className = 'btn'
    okButton.textContent = strings.ok

    container.append(label, textInput, sizeInput, colorPicker, okButton)
    document.body.appendChild(container)
    floatingInputRef.current = container
    textInput.focus()

    const cleanup = () => {
      container.remove()
      if (floatingInputRef.current === container) {
        floatingInputRef.current = null
      }
    }

    const commit = () => {
      const text = textInput.value.trim()
      const size = Math.max(10, Number(sizeInput.value) || 16)
      const chosenColor = colorPicker.value || textColorRef.current
      cleanup()
      if (!text) return
      const ctx = ctxRef.current
      if (!ctx) return
      setTextColor(chosenColor)
      ctx.save()
      ctx.fillStyle = chosenColor
      ctx.font = `bold ${size}px system-ui, -apple-system, 'Segoe UI', sans-serif`
      ctx.textBaseline = 'top'
      if (textOutlineEnabled) {
        ctx.lineWidth = Math.max(1, size / 6)
        ctx.strokeStyle = textOutlineColor
        ctx.strokeText(text, point.x, point.y)
      }
      ctx.fillText(text, point.x, point.y)
      ctx.restore()
      pushHistory()
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        commit()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        cleanup()
      }
    }

    container.addEventListener('keydown', handleKey)
    okButton.addEventListener('click', commit)
  }, [pushHistory, removeFloatingInput, setTextColor])

  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) {
      if (cropHistoryRef.current.length) {
        const prev = cropHistoryRef.current.pop()
        if (prev) {
          loadImage(prev.dataUrl)
        }
      }
      return
    }
    historyRef.current.pop()
    const prev = historyRef.current[historyRef.current.length - 1]
    if (prev) {
      const ctx = ctxRef.current
      if (ctx) ctx.putImageData(prev, 0, 0)
    } else {
      redrawBase()
    }
    syncUndoState()
  }, [redrawBase, syncUndoState])

  const loadImage = useCallback(
    (src: string, cleanup?: () => void, options?: { preserveCropHistory?: boolean }) => {
      const preserveCropHistory = options?.preserveCropHistory
      if (!preserveCropHistory) {
        cropHistoryRef.current = []
      }
      const img = new Image()
      img.onload = () => {
        removeFloatingInput()
        setLockScale(false)
        baseImageRef.current = img
        historyRef.current = []
        isDrawingRef.current = false
        startRef.current = null
        lastPosRef.current = null
        snapshotRef.current = null
        const width = img.naturalWidth || img.width || DEFAULT_CANVAS.width
        const height = img.naturalHeight || img.height || DEFAULT_CANVAS.height
        imageSizeRef.current = { width, height }
        setCanvasMeta({ width, height })
        setCanvasSize(width, height)
        redrawBase()
        pushHistory()
        setHasImage(true)
        setExportWidth(Math.round((img.naturalWidth || img.width || DEFAULT_CANVAS.width)))
        setExportHeight(Math.round((img.naturalHeight || img.height || DEFAULT_CANVAS.height)))
        cleanup?.()
      }
      img.onerror = () => cleanup?.()
      img.src = src
    },
    [pushHistory, redrawBase, removeFloatingInput, setCanvasMeta, setCanvasSize],
  )

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          loadImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
      event.target.value = ''
    },
    [loadImage],
  )

  const cropToSelection = useCallback(
    (a: Point, b: Point) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const prevUrl = canvas.toDataURL('image/png')
      cropHistoryRef.current.push({ dataUrl: prevUrl })
      const { x, y, width, height } = rectFromPoints(a, b)
      const cropW = Math.max(1, Math.round(width))
      const cropH = Math.max(1, Math.round(height))
      if (cropW < 2 || cropH < 2) return
      const dpr = dprRef.current || 1
      const temp = document.createElement('canvas')
      temp.width = Math.round(cropW * dpr)
      temp.height = Math.round(cropH * dpr)
      const tctx = temp.getContext('2d')
      if (!tctx) return
      tctx.drawImage(
        canvas,
        Math.round(x * dpr),
        Math.round(y * dpr),
        cropW * dpr,
        cropH * dpr,
        0,
        0,
        cropW * dpr,
        cropH * dpr,
      )
      const dataUrl = temp.toDataURL('image/png')
      loadImage(dataUrl, undefined, { preserveCropHistory: true })
    },
    [loadImage],
  )

  const applyExportSize = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    const targetW = Math.max(1, exportWidth)
    const targetH = Math.max(1, exportHeight)
    const off = document.createElement('canvas')
    off.width = canvas.width
    off.height = canvas.height
    const offCtx = off.getContext('2d')
    if (!offCtx) return
    offCtx.drawImage(canvas, 0, 0)

    imageSizeRef.current = { width: targetW, height: targetH }
    setCanvasMeta({ width: targetW, height: targetH })
    setCanvasSize(targetW, targetH, { noScale: true })
    const newCtx = ctxRef.current
    const newCanvas = canvasRef.current
    if (!newCtx || !newCanvas) return
    newCtx.save()
    newCtx.setTransform(1, 0, 0, 1, 0, 0)
    newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height)
    const dxPx = (newCanvas.width - off.width) / 2
    const dyPx = (newCanvas.height - off.height) / 2
    newCtx.drawImage(off, dxPx, dyPx)
    newCtx.restore()
    const snapshotUrl = newCanvas.toDataURL('image/png')
    const img = new Image()
    img.onload = () => {
      baseImageRef.current = img
    }
    img.src = snapshotUrl
    pushHistory()
    setHasImage(true)
  }, [exportHeight, exportWidth, pushHistory, setCanvasMeta, setCanvasSize])

  const clearCanvas = useCallback(() => {
    removeFloatingInput()
    isDrawingRef.current = false
    startRef.current = null
    lastPosRef.current = null
    snapshotRef.current = null
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    if (!baseImageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }
    redrawBase()
    pushHistory()
  }, [pushHistory, redrawBase, removeFloatingInput])

  const handleStageDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer?.files?.[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            loadImage(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [loadImage],
  )

  const handleClipboardButton = useCallback(async () => {
    const strings = STRINGS[langRef.current]
    if (!navigator.clipboard || !('read' in navigator.clipboard)) {
      alert(strings.clipboardPrompt)
      return
    }
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const url = URL.createObjectURL(blob)
            loadImage(url, () => URL.revokeObjectURL(url))
            return
          }
        }
      }
      alert(strings.clipboardNone)
    } catch (err) {
      console.error(err)
      alert(strings.clipboardPrompt)
    }
  }, [loadImage])

  const handlePasteEvent = useCallback(
    (event: ClipboardEvent) => {
      const strings = STRINGS[langRef.current]
      const items = event.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.includes('image')) {
          const blob = item.getAsFile()
          if (blob) {
            const url = URL.createObjectURL(blob)
            loadImage(url, () => URL.revokeObjectURL(url))
            return
          }
        }
      }
      alert(strings.clipboardNone)
    },
    [loadImage],
  )

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const targetW = Math.max(1, exportWidth)
    const targetH = Math.max(1, exportHeight)
    const tmp = document.createElement('canvas')
    tmp.width = targetW
    tmp.height = targetH
    const tctx = tmp.getContext('2d')
    if (!tctx) return
    tctx.drawImage(canvas, 0, 0, targetW, targetH)
    const link = document.createElement('a')
    link.href = tmp.toDataURL(exportFormat, exportFormat === 'image/jpeg' ? 0.92 : 0.98)
    link.download = `annotated-${Date.now()}.${exportFormat === 'image/png' ? 'png' : exportFormat === 'image/jpeg' ? 'jpg' : 'webp'}`
    link.click()
    link.remove()
  }, [exportFormat, exportHeight, exportWidth])

  const handleCapture = useCallback(async () => {
    const strings = STRINGS[langRef.current]
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert(strings.captureUnsupported)
      return
    }
    setIsCaptureLoading(true)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      })
      const [track] = stream.getVideoTracks()
      const video = document.createElement('video')
      video.srcObject = stream
      video.muted = true
      await video.play()
      const settings = track?.getSettings()
      const width = settings?.width || video.videoWidth || DEFAULT_CANVAS.width
      const height = settings?.height || video.videoHeight || DEFAULT_CANVAS.height
      const temp = document.createElement('canvas')
      temp.width = width
      temp.height = height
      const tempCtx = temp.getContext('2d')
      tempCtx?.drawImage(video, 0, 0, width, height)
      const dataUrl = temp.toDataURL('image/png')
      loadImage(dataUrl)
      video.pause()
      stream.getTracks().forEach((t) => t.stop())
    } catch (err) {
      console.error(err)
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        alert(strings.captureError)
      }
    } finally {
      setIsCaptureLoading(false)
    }
  }, [loadImage])

  const showFeedback = useCallback(
    (kind: 'copy' | 'markdown') => {
      const strings = STRINGS[langRef.current]
      const message = kind === 'markdown' ? strings.markdownCopied : strings.copySuccess
      setCopyFeedback(message)
      setCopyFeedbackKind(kind)
      if (copyFeedbackTimer.current) {
        window.clearTimeout(copyFeedbackTimer.current)
      }
      copyFeedbackTimer.current = window.setTimeout(() => {
        setCopyFeedback(null)
        setCopyFeedbackKind(null)
        copyFeedbackTimer.current = null
      }, 2500)
    },
    [],
  )

  const copyCanvasToClipboard = useCallback(async () => {
    if (!hasImage) return
    const canvas = canvasRef.current
    if (!canvas) return
    const strings = STRINGS[langRef.current]
    const clipboardSupported =
      typeof navigator !== 'undefined' &&
      !!navigator.clipboard?.write &&
      typeof ClipboardItem !== 'undefined'
    if (!clipboardSupported) {
      alert(strings.clipboardMissing)
      return
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), exportFormat),
    )
    if (!blob) {
      alert(strings.clipboardUnavailable)
      return
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      showFeedback('copy')
    } catch (error) {
      console.error(error)
      alert(strings.clipboardCopyError)
    }
  }, [hasImage, showFeedback])

  const copyMarkdownSnippet = useCallback(async () => {
    if (!hasImage) return
    const canvas = canvasRef.current
    if (!canvas) return
    const strings = STRINGS[langRef.current]
    if (!navigator.clipboard?.writeText) {
      alert(strings.clipboardMissing)
      return
    }
    const dataUrl = canvas.toDataURL('image/png')
    const prefix = 'data:image/png;base64,'
    const estimatedBytes = Math.max(0, Math.round((dataUrl.length - prefix.length) * 0.75))
    const maxBytes = 1.8 * 1024 * 1024
    if (estimatedBytes > maxBytes) {
      alert(strings.markdownTooLarge)
      return
    }
    const markdown = `![Annotation](${dataUrl})`
    try {
      await navigator.clipboard.writeText(markdown)
      showFeedback('markdown')
    } catch (error) {
      console.error(error)
      alert(strings.clipboardCopyError)
    }
  }, [hasImage, showFeedback])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx
    imageSizeRef.current = DEFAULT_CANVAS
    setCanvasMeta(DEFAULT_CANVAS)
    setCanvasSize(DEFAULT_CANVAS.width, DEFAULT_CANVAS.height)
  }, [setCanvasSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!baseImageRef.current) {
        alert(STRINGS[langRef.current].needImage)
        return
      }
      if (toolRef.current === 'text') {
        return
      }
      event.preventDefault()
      canvas.setPointerCapture(event.pointerId)
      isDrawingRef.current = true
      const start = getCanvasPoint(event)
      if (!start) return
      startRef.current = start
      lastPosRef.current = start
      snapshotRef.current = toolRef.current === 'draw' ? null : captureCanvas()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDrawingRef.current) return
      event.preventDefault()
      const point = getCanvasPoint(event)
      if (!point) return
      const tool = toolRef.current
      if (tool === 'draw') {
        const ctx = ctxRef.current
        if (!ctx || !lastPosRef.current) return
        ctx.save()
        ctx.strokeStyle = colorRef.current
        ctx.lineWidth = Math.max(1, thicknessRef.current || 1)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
        ctx.restore()
        lastPosRef.current = point
        return
      }
      lastPosRef.current = point
      restoreSnapshot(snapshotRef.current)
      drawCurrentTool(startRef.current, point)
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDrawingRef.current) return
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
      const finalPoint =
        typeof event.clientX === 'number' ? getCanvasPoint(event) : lastPosRef.current
      const activeTool = toolRef.current
      if (activeTool === 'draw') {
        isDrawingRef.current = false
        startRef.current = null
        lastPosRef.current = null
        snapshotRef.current = null
        pushHistory()
        return
      }
      restoreSnapshot(snapshotRef.current)
      drawCurrentTool(startRef.current, finalPoint)
      if (activeTool === 'crop' && startRef.current && finalPoint) {
        cropToSelection(startRef.current, finalPoint)
        isDrawingRef.current = false
        startRef.current = null
        lastPosRef.current = null
        snapshotRef.current = null
        return
      }
      isDrawingRef.current = false
      startRef.current = null
      lastPosRef.current = null
      snapshotRef.current = null
      pushHistory()
    }

    const handleClick = (event: MouseEvent) => {
      if (toolRef.current !== 'text' || !baseImageRef.current) return
      const point = getCanvasPoint(event)
      if (point) addTextAt(point)
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('click', handleClick)
    }
  }, [addTextAt, captureCanvas, drawCurrentTool, getCanvasPoint, pushHistory, restoreSnapshot])

  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent)
    return () => window.removeEventListener('paste', handlePasteEvent)
  }, [handlePasteEvent])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const target = event.target as HTMLElement | null
      const isTypingTarget =
        !!target &&
        (!!target.closest('input, textarea, select') ||
          (target as HTMLElement).isContentEditable ||
          target.tagName === 'TEXTAREA')
      if (event.ctrlKey || event.metaKey) {
        if (key === 'z') {
          event.preventDefault()
          undo()
        } else if (key === 'c') {
          event.preventDefault()
          copyCanvasToClipboard()
        }
        return
      }
      if (isTypingTarget) return
      const mappedTool = KEY_TOOL_MAP[key]
      if (mappedTool) {
        event.preventDefault()
        setTool(mappedTool)
        return
      }
      if (key === 'g') {
        event.preventDefault()
        setShowGrid((prev) => !prev)
        return
      }
      if (key === 'l') {
        event.preventDefault()
        setLockScale((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [copyCanvasToClipboard, setLockScale, setShowGrid, setTool, undo])

  useEffect(() => {
    if (window.__snipPending) {
      loadImage(window.__snipPending)
      window.__snipPending = null
    }
  }, [loadImage])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(() => {
      const size = imageSizeRef.current
      if (size) {
        setCanvasSize(size.width, size.height)
      }
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [setCanvasSize])

  useEffect(() => () => removeFloatingInput(), [removeFloatingInput])

  useEffect(
    () => () => {
      if (copyFeedbackTimer.current) {
        window.clearTimeout(copyFeedbackTimer.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (!copyFeedbackKind) return
    const nextMessage =
      copyFeedbackKind === 'markdown' ? STRINGS[lang].markdownCopied : STRINGS[lang].copySuccess
    if (copyFeedback !== nextMessage) {
      setCopyFeedback(nextMessage)
    }
  }, [copyFeedback, copyFeedbackKind, lang])

  const strings = STRINGS[lang]
  const gridStyle = showGrid
    ? {
        backgroundImage:
          'linear-gradient(to right, rgba(110, 231, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(110, 231, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: `${Math.max(4, gridSize)}px ${Math.max(4, gridSize)}px`,
      }
    : undefined

  const toggleSection = (key: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-title">{strings.title}</div>
          <div className="brand-sub">{strings.tagline}</div>
        </div>
        <div className="bar-actions">
          <button className="icon-btn" type="button" title={strings.hint} aria-label={strings.hint}>
            i
          </button>
          <div className="pill subtle">v{APP_VERSION}</div>
          <div className="pill subtle">
            {strings.canvasSizeLabel}: {canvasMeta.width}x{canvasMeta.height}px
          </div>
          <div className="pill subtle">
            {strings.canvasZoomLabel}: {canvasScale}%
          </div>
          <button type="button" className="btn ghost" onClick={handleExport} disabled={!hasImage}>
            {strings.export}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="tool-rail" role="toolbar" aria-label={strings.toolbarAria}>
          {TOOLBAR.map((toolItem) => (
            <button
              key={toolItem.id}
              type="button"
              className={`rail-btn ${tool === toolItem.id ? 'active' : ''}`}
              aria-pressed={toolItem.id === tool}
              onClick={() => setTool(toolItem.id)}
              title={TOOL_LABELS[lang][toolItem.id]}
            >
              <span className="rail-icon">
                {{
                  arrow: '->',
                  rect: '[]',
                  ellipse: '()',
                  text: 'T',
                  highlight: 'HL',
                  redact: 'X',
                  blur: 'PX',
                  crop: 'CR',
                  draw: 'DR',
                }[toolItem.id]}
              </span>
              <span className="rail-label">{TOOL_LABELS[lang][toolItem.id]}</span>
            </button>
          ))}
          <div className="rail-spacer" />
          <button type="button" className="rail-btn" onClick={undo} disabled={!canUndo}>
            UNDO
            <span className="rail-label">{strings.undo}</span>
          </button>
          <button type="button" className="rail-btn" onClick={clearCanvas}>
            CLR
            <span className="rail-label">{strings.clear}</span>
          </button>
        </aside>

        <main className="workspace">
          <div className="command-bar">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="btn"
              onChange={handleFileChange}
            />
            <button type="button" className="btn" onClick={handleClipboardButton}>
              {strings.pasteBtn}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleCapture}
              disabled={isCaptureLoading}
            >
              {isCaptureLoading ? strings.captureLoading : strings.captureBtn}
            </button>
            {copyFeedback && <div className="hint success">{copyFeedback}</div>}
          </div>

          <div
            className="stage"
            id="stage"
            ref={stageRef}
            style={gridStyle}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleStageDrop}
          >
            <canvas
              ref={canvasRef}
              width={DEFAULT_CANVAS.width}
              height={DEFAULT_CANVAS.height}
              aria-label={strings.canvasAria}
            />
          </div>
        </main>

        <aside className="side-panel">
          <div className="panel">
            <button
              type="button"
              className="panel-title collapsed-trigger"
              onClick={() => toggleSection('stroke')}
              aria-expanded={!collapsed.stroke}
            >
              [S] {strings.thickness}
              <span className="chevron">{collapsed.stroke ? 'v' : '^'}</span>
            </button>
            {!collapsed.stroke && (
              <div className="panel-content">
                <label className="stacked">
                  <span>{strings.thickness}</span>
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={thickness}
                    onChange={(event) => setThickness(Number(event.target.value) || 1)}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.color}</span>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(event) => setStrokeColor(event.target.value)}
                  />
                </label>
                <div className="swatches">
                  <span className="swatches-label">{strings.quickColors}</span>
                  <div className="swatch-row">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`swatch ${strokeColor === preset ? 'active' : ''}`}
                        style={{ backgroundColor: preset }}
                        aria-label={`${strings.color} ${preset}`}
                        onClick={() => setStrokeColor(preset)}
                      />
                    ))}
                  </div>
                </div>
                <label className="stacked">
                  <span>{strings.outline}</span>
                  <input
                    type="checkbox"
                    checked={outlineEnabled}
                    onChange={(event) => setOutlineEnabled(event.target.checked)}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.outlineColor}</span>
                  <input
                    type="color"
                    value={outlineColor}
                    onChange={(event) => setOutlineColor(event.target.value)}
                    disabled={!outlineEnabled}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.arrowStyle}</span>
                  <select
                    value={arrowStyle}
                    onChange={(event) => setArrowStyle(event.target.value as ArrowStyle)}
                  >
                    <option value="solid">{ARROW_LABELS[lang].solid}</option>
                    <option value="open">{ARROW_LABELS[lang].open}</option>
                    <option value="double">{ARROW_LABELS[lang].double}</option>
                    <option value="curve">{ARROW_LABELS[lang].curve}</option>
                  </select>
                </label>
                <label className="stacked">
                  <span>{strings.roundness}</span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={roundness}
                    onChange={(event) => setRoundness(Math.max(0, Number(event.target.value) || 0))}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.pixelateLabel}</span>
                  <input
                    type="number"
                    min={4}
                    max={80}
                    value={pixelSize}
                    onChange={(event) => setPixelSize(Math.max(4, Number(event.target.value) || 4))}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="panel">
            <button
              type="button"
              className="panel-title collapsed-trigger"
              onClick={() => toggleSection('guides')}
              aria-expanded={!collapsed.guides}
            >
              [G] {strings.guidesTitle}
              <span className="chevron">{collapsed.guides ? 'v' : '^'}</span>
            </button>
            {!collapsed.guides && (
              <div className="panel-content">
                <div className="meta-row">
                  <span>{strings.canvasSizeLabel}</span>
                  <strong>
                    {canvasMeta.width} x {canvasMeta.height}px
                  </strong>
                </div>
                <div className="meta-row">
                  <span>{strings.canvasZoomLabel}</span>
                  <strong>{canvasScale}%</strong>
                </div>
                <label className="inline">
                  <input
                    type="checkbox"
                    checked={lockScale}
                    onChange={(event) => setLockScale(event.target.checked)}
                  />
                  <div>
                    <div className="inline-label">{strings.lockScaleLabel}</div>
                    <div className="hint small">{strings.lockScaleHint}</div>
                  </div>
                </label>
                <label className="inline">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(event) => setShowGrid(event.target.checked)}
                  />
                  <div className="inline-label">{strings.grid}</div>
                </label>
                <label className="stacked">
                  <span>{strings.gridSize}</span>
                  <input
                    type="number"
                    min={4}
                    max={200}
                    value={gridSize}
                    onChange={(event) =>
                      setGridSize(Math.max(4, Math.min(200, Number(event.target.value) || gridSize)))
                    }
                    disabled={!showGrid}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="panel">
            <button
              type="button"
              className="panel-title collapsed-trigger"
              onClick={() => toggleSection('text')}
              aria-expanded={!collapsed.text}
            >
              [T] {strings.textLabel}
              <span className="chevron">{collapsed.text ? 'v' : '^'}</span>
            </button>
            {!collapsed.text && (
              <div className="panel-content">
                <label className="stacked">
                  <span>{strings.textColorLabel}</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.textOutline}</span>
                  <input
                    type="checkbox"
                    checked={textOutlineEnabled}
                    onChange={(event) => setTextOutlineEnabled(event.target.checked)}
                  />
                </label>
                <label className="stacked">
                  <span>{strings.textOutlineColor}</span>
                  <input
                    type="color"
                    value={textOutlineColor}
                    onChange={(event) => setTextOutlineColor(event.target.value)}
                    disabled={!textOutlineEnabled}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="panel">
            <button
              type="button"
              className="panel-title collapsed-trigger"
              onClick={() => toggleSection('export')}
              aria-expanded={!collapsed.export}
            >
              [X] {strings.export}
              <span className="chevron">{collapsed.export ? 'v' : '^'}</span>
            </button>
            {!collapsed.export && (
              <div className="panel-content">
                <div className="stacked">
                  <span>{strings.exportWidth}</span>
                  <input
                    type="number"
                    min={16}
                    max={8000}
                    value={exportWidth}
                    onChange={(event) => setExportWidth(Number(event.target.value) || exportWidth)}
                  />
                </div>
                <div className="stacked">
                  <span>{strings.exportHeight}</span>
                  <input
                    type="number"
                    min={16}
                    max={8000}
                    value={exportHeight}
                    onChange={(event) => setExportHeight(Number(event.target.value) || exportHeight)}
                  />
                </div>
                <div className="stacked">
                  <span>{strings.exportFormat}</span>
                  <select
                    value={exportFormat}
                    onChange={(event) =>
                      setExportFormat(event.target.value as 'image/png' | 'image/jpeg' | 'image/webp')
                    }
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </div>
                <div className="actions">
                  <button type="button" className="btn ghost full" onClick={applyExportSize}>
                    {strings.exportApply}
                  </button>
                  <button
                    type="button"
                    className="btn full"
                    onClick={copyCanvasToClipboard}
                    disabled={!hasImage}
                  >
                    {strings.copy}
                  </button>
                  <button
                    type="button"
                    className="btn ghost full"
                    onClick={copyMarkdownSnippet}
                    disabled={!hasImage}
                  >
                    {strings.markdownCopy}
                  </button>
                  <button
                    type="button"
                    className="btn ghost full"
                    onClick={handleExport}
                    disabled={!hasImage}
                  >
                    {strings.export}
                  </button>
                </div>
                <div className="hint small">{strings.shortcutsHint}</div>
                <label className="stacked">
                  <span>{strings.langLabel}</span>
                  <select
                    className="lang-switch"
                    value={lang}
                    onChange={(event) => setLang(event.target.value as Lang)}
                    aria-label={strings.langLabel}
                  >
                    <option value="pt">Portuguese</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
