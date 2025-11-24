export type Tool = 'arrow' | 'rect' | 'ellipse' | 'text' | 'highlight' | 'redact' | 'blur'

export type Point = { x: number; y: number }

export interface ToolConfig {
  id: Tool
  label: string
}

export interface DrawingContext {
  color: string
  thickness: number
  tool: Tool
}

export interface CanvasSize {
  width: number
  height: number
}
