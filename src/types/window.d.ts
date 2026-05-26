export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export type WindowMode = 'normal' | 'minimized' | 'maximized' | 'fullscreen'

export type WindowLifecycle = 'created' | 'visible' | 'hidden' | 'closed' | 'destroyed'

export interface OptionsWin {
  width?: number
  height?: number
  x?: number
  y?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  resizable?: boolean
  movable?: boolean
  minimizable?: boolean
  maximizable?: boolean
  closable?: boolean
  focusable?: boolean
  alwaysOnTop?: boolean
  fullscreen?: boolean
  skipTaskbar?: boolean
  title?: string
  icon?: string
  frame?: boolean
  backgroundColor?: string
  hasShadow?: boolean
}
