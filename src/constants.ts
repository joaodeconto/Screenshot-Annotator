import type { ToolConfig } from './types'

export const TOOLBAR: ToolConfig[] = [
  { id: 'arrow', label: 'Seta' },
  { id: 'rect', label: 'Retangulo' },
  { id: 'ellipse', label: 'Elipse' },
  { id: 'text', label: 'Texto' },
  { id: 'highlight', label: 'Marcador' },
  { id: 'redact', label: 'Redigir' },
  { id: 'blur', label: 'Pixelar' },
]

export const DEFAULT_CANVAS = { width: 1200, height: 700 }

export const ARROW_HEAD_SIZE_MULTIPLIER = 2.5
export const ARROW_MIN_HEAD_SIZE = 10
export const PIXELATE_SIZE = 12
export const HIGHLIGHT_ALPHA = 0.25
export const TEXT_SIZE_MULTIPLIER = 3
export const MIN_TEXT_SIZE = 12
export const COPY_FEEDBACK_DURATION = 2500
