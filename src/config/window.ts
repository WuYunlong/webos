import type { OptionsWin } from '@/types/window'

export const Options: OptionsWin = {
  width: 800,
  height: 600,
  x: 0,
  y: 0,
  minWidth: 800,
  minHeight: 600,
  maxWidth: 1000,
  maxHeight: 800,
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  closable: true,
  focusable: true,
  alwaysOnTop: false,
  fullscreen: false,
  skipTaskbar: false,
  title: '',
  icon: '',
  frame: true,
  backgroundColor: 'rgba(0, 0, 0, 0)',
  hasShadow: true
}
