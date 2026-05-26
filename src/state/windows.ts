import { ref } from 'vue'

import type { OptionsWin, Rect, WindowLifecycle, WindowMode } from '@/types/window'

export type AppId = 'FileManager' | 'VideoPlayer'

export type WindowEventName =
  | 'blur'
  | 'close'
  | 'closed'
  | 'enter-full-screen'
  | 'focus'
  | 'hide'
  | 'maximize'
  | 'minimize'
  | 'move'
  | 'resize'
  | 'restore'
  | 'show'
  | 'unmaximize'
  | 'leave-full-screen'

export interface AppDefinition {
  icon: string
  id: AppId
  options?: OptionsWin
  title: string
}

export interface WindowRecord {
  alwaysOnTop: boolean
  appId?: AppId
  backgroundColor: string
  bounds: Rect
  icon: string
  id: number
  isFocused: boolean
  isResizable: boolean
  isVisible: boolean
  lifecycle: WindowLifecycle
  maximumSize: { width: number; height: number }
  minimumSize: { width: number; height: number }
  mode: WindowMode
  normalBounds: Rect
  options: Required<OptionsWin>
  restoreMode: Exclude<WindowMode, 'minimized'>
  title: string
  zIndex: number
}

export interface CreateWindowOptions {
  appId?: AppId
  icon?: string
  options?: OptionsWin
  title?: string
}

export interface OsWindowApi {
  id: number
  blur(): void
  close(): void
  destroy(): void
  focus(): void
  getBounds(): Rect
  getPosition(): [number, number]
  getSize(): [number, number]
  getTitle(): string
  hide(): void
  isAlwaysOnTop(): boolean
  isDestroyed(): boolean
  isFocused(): boolean
  isFullScreen(): boolean
  isMaximized(): boolean
  isMinimized(): boolean
  isResizable(): boolean
  isVisible(): boolean
  maximize(): void
  minimize(): void
  off(event: WindowEventName, listener: () => void): void
  on(event: WindowEventName, listener: () => void): void
  once(event: WindowEventName, listener: () => void): void
  restore(): void
  setAlwaysOnTop(flag: boolean): void
  setBounds(bounds: Partial<Rect>): void
  setFullScreen(flag: boolean): void
  setMaximumSize(width: number, height: number): void
  setMinimumSize(width: number, height: number): void
  setPosition(x: number, y: number): void
  setResizable(flag: boolean): void
  setSize(width: number, height: number): void
  setTitle(title: string): void
  show(): void
  showInactive(): void
  unmaximize(): void
}

type WindowListenerMap = Map<WindowEventName, Set<() => void>>

export const dockHeight = 48

export const appDefinitions: Record<AppId, AppDefinition> = {
  FileManager: {
    id: 'FileManager',
    title: '文件管理器',
    icon: '/icon/FileExplorer.svg',
    options: {
      width: 960,
      height: 640,
      minWidth: 720,
      minHeight: 480
    }
  },
  VideoPlayer: {
    id: 'VideoPlayer',
    title: '视频播放器',
    icon: '/icon/Windows/Videos.svg',
    options: {
      width: 910,
      height: 540,
      minWidth: 720,
      minHeight: 405
    }
  }
}

export const pinnedApps: AppId[] = ['FileManager', 'VideoPlayer']
export const windows = ref<WindowRecord[]>([])
export const activeWindowId = ref<number | null>(null)

const windowInstances = new Map<number, OsWindowApi>()
const windowListeners = new Map<number, WindowListenerMap>()

let nextWindowId = 1
let nextZIndex = 100

function getViewportBounds(mode: Exclude<WindowMode, 'normal' | 'minimized'>): Rect {
  const width = window.innerWidth
  const height = mode === 'fullscreen' ? window.innerHeight : window.innerHeight - dockHeight

  return { x: 0, y: 0, width, height }
}

function cloneRect(rect: Rect): Rect {
  return { ...rect }
}

function getWindowRecord(windowId: number) {
  return windows.value.find(item => item.id === windowId)
}

function getWindowListeners(windowId: number) {
  let listeners = windowListeners.get(windowId)
  if (!listeners) {
    listeners = new Map()
    windowListeners.set(windowId, listeners)
  }

  return listeners
}

function emitWindowEvent(windowId: number, event: WindowEventName) {
  const listeners = getWindowListeners(windowId).get(event)
  if (!listeners) {
    return
  }

  listeners.forEach(listener => listener())
}

function setFocusedWindow(windowId: number | null) {
  for (const item of windows.value) {
    item.isFocused = item.id === windowId
  }

  activeWindowId.value = windowId
}

function getTopVisibleWindow() {
  return [...windows.value]
    .filter(item => item.lifecycle !== 'destroyed' && item.mode !== 'minimized' && item.isVisible)
    .sort((a, b) => b.zIndex - a.zIndex)[0]
}

function syncActiveWindow() {
  const topWindow = getTopVisibleWindow()
  setFocusedWindow(topWindow?.id ?? null)
}

function closeWindowRecord(windowId: number) {
  const nextWindows = windows.value.filter(item => item.id !== windowId)
  windows.value = nextWindows
  windowInstances.delete(windowId)

  if (activeWindowId.value === windowId) {
    syncActiveWindow()
  }
}

function clampWidth(record: WindowRecord, width: number) {
  return Math.min(Math.max(width, record.minimumSize.width), record.maximumSize.width)
}

function clampHeight(record: WindowRecord, height: number) {
  return Math.min(Math.max(height, record.minimumSize.height), record.maximumSize.height)
}

function assignBounds(record: WindowRecord, nextBounds: Rect, origin: 'move' | 'resize' | 'system') {
  const width = clampWidth(record, nextBounds.width)
  const height = clampHeight(record, nextBounds.height)
  const bounds = { x: nextBounds.x, y: nextBounds.y, width, height }

  record.bounds = bounds
  if (record.mode === 'normal') {
    record.normalBounds = cloneRect(bounds)
  }

  emitWindowEvent(record.id, origin === 'move' ? 'move' : 'resize')
}

function applyMode(record: WindowRecord, mode: WindowMode) {
  if (mode === 'minimized') {
    record.restoreMode =
      record.mode === 'minimized' ? record.restoreMode : (record.mode as Exclude<WindowMode, 'minimized'>)
    record.mode = 'minimized'
    record.isVisible = false
    record.lifecycle = 'hidden'
    emitWindowEvent(record.id, 'minimize')
    if (activeWindowId.value === record.id) {
      syncActiveWindow()
    }
    return
  }

  const previousMode = record.mode
  record.mode = mode
  record.isVisible = true
  record.lifecycle = 'visible'

  if (mode === 'normal') {
    record.bounds = cloneRect(record.normalBounds)
  } else {
    if (previousMode === 'normal') {
      record.normalBounds = cloneRect(record.bounds)
    }
    record.bounds = getViewportBounds(mode)
  }

  if (previousMode === 'minimized') {
    emitWindowEvent(record.id, 'restore')
  } else if (mode === 'maximized' && previousMode !== 'maximized') {
    emitWindowEvent(record.id, 'maximize')
  } else if (mode === 'normal' && previousMode === 'maximized') {
    emitWindowEvent(record.id, 'unmaximize')
  }

  if (mode === 'fullscreen' && previousMode !== 'fullscreen') {
    emitWindowEvent(record.id, 'enter-full-screen')
  }
  if (mode !== 'fullscreen' && previousMode === 'fullscreen') {
    emitWindowEvent(record.id, 'leave-full-screen')
  }
}

function buildWindowOptions(appId?: AppId, options?: OptionsWin): Required<OptionsWin> {
  const baseOptions = appId ? appDefinitions[appId].options : undefined
  const offset = windows.value.length * 32

  return {
    width: 800,
    height: 600,
    x: 120 + offset,
    y: 72 + offset,
    minWidth: 320,
    minHeight: 200,
    maxWidth: Number.POSITIVE_INFINITY,
    maxHeight: Number.POSITIVE_INFINITY,
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
    hasShadow: true,
    ...baseOptions,
    ...options
  }
}

function createWindowRecord(options: CreateWindowOptions): WindowRecord {
  const definition = options.appId ? appDefinitions[options.appId] : undefined
  const mergedOptions = buildWindowOptions(options.appId, options.options)
  const bounds = {
    x: mergedOptions.x,
    y: mergedOptions.y,
    width: mergedOptions.width,
    height: mergedOptions.height
  }

  return {
    id: nextWindowId++,
    appId: options.appId,
    title: options.title ?? definition?.title ?? mergedOptions.title,
    icon: options.icon ?? definition?.icon ?? mergedOptions.icon,
    options: mergedOptions,
    bounds,
    normalBounds: cloneRect(bounds),
    mode: mergedOptions.fullscreen ? 'fullscreen' : 'normal',
    restoreMode: mergedOptions.fullscreen ? 'fullscreen' : 'normal',
    lifecycle: 'created',
    isVisible: true,
    isFocused: false,
    isResizable: mergedOptions.resizable,
    alwaysOnTop: mergedOptions.alwaysOnTop,
    minimumSize: { width: mergedOptions.minWidth, height: mergedOptions.minHeight },
    maximumSize: { width: mergedOptions.maxWidth, height: mergedOptions.maxHeight },
    backgroundColor: mergedOptions.backgroundColor,
    zIndex: ++nextZIndex
  }
}

function createWindowApi(record: WindowRecord): OsWindowApi {
  const on = (event: WindowEventName, listener: () => void) => {
    const listeners = getWindowListeners(record.id)
    const bucket = listeners.get(event) ?? new Set<() => void>()
    bucket.add(listener)
    listeners.set(event, bucket)
  }

  const off = (event: WindowEventName, listener: () => void) => {
    const bucket = getWindowListeners(record.id).get(event)
    bucket?.delete(listener)
  }

  const once = (event: WindowEventName, listener: () => void) => {
    const wrapped = () => {
      off(event, wrapped)
      listener()
    }
    on(event, wrapped)
  }

  const focus = () => {
    const current = getWindowRecord(record.id)
    if (!current || current.lifecycle === 'destroyed') {
      return
    }

    current.isVisible = true
    current.lifecycle = 'visible'
    if (current.mode === 'minimized') {
      applyMode(current, current.restoreMode)
    }
    current.zIndex = ++nextZIndex
    setFocusedWindow(current.id)
    emitWindowEvent(current.id, 'focus')
    emitWindowEvent(current.id, 'show')
  }

  return {
    id: record.id,
    on,
    off,
    once,
    show() {
      focus()
    },
    showInactive() {
      const current = getWindowRecord(record.id)
      if (!current || current.lifecycle === 'destroyed') {
        return
      }

      current.isVisible = true
      current.lifecycle = 'visible'
      if (current.mode === 'minimized') {
        applyMode(current, current.restoreMode)
      }
      emitWindowEvent(current.id, 'show')
    },
    hide() {
      const current = getWindowRecord(record.id)
      if (!current || current.lifecycle === 'destroyed') {
        return
      }

      current.isVisible = false
      current.lifecycle = 'hidden'
      if (activeWindowId.value === current.id) {
        syncActiveWindow()
      }
      emitWindowEvent(current.id, 'hide')
    },
    close() {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      emitWindowEvent(current.id, 'close')
      current.lifecycle = 'closed'
      emitWindowEvent(current.id, 'closed')
      closeWindowRecord(current.id)
      windowListeners.delete(current.id)
    },
    destroy() {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.lifecycle = 'destroyed'
      closeWindowRecord(current.id)
      windowListeners.delete(current.id)
    },
    focus,
    blur() {
      const current = getWindowRecord(record.id)
      if (!current || activeWindowId.value !== current.id) {
        return
      }

      current.isFocused = false
      activeWindowId.value = null
      emitWindowEvent(current.id, 'blur')
      syncActiveWindow()
    },
    isFocused() {
      return getWindowRecord(record.id)?.isFocused ?? false
    },
    isVisible() {
      return getWindowRecord(record.id)?.isVisible ?? false
    },
    isDestroyed() {
      return !getWindowRecord(record.id)
    },
    maximize() {
      const current = getWindowRecord(record.id)
      if (!current || !current.options.maximizable) {
        return
      }

      applyMode(current, 'maximized')
      focus()
    },
    unmaximize() {
      const current = getWindowRecord(record.id)
      if (!current || current.mode !== 'maximized') {
        return
      }

      applyMode(current, 'normal')
      focus()
    },
    isMaximized() {
      return getWindowRecord(record.id)?.mode === 'maximized'
    },
    minimize() {
      const current = getWindowRecord(record.id)
      if (!current || !current.options.minimizable) {
        return
      }

      applyMode(current, 'minimized')
    },
    restore() {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      if (current.mode === 'minimized') {
        applyMode(current, current.restoreMode)
      } else if (current.mode !== 'normal') {
        applyMode(current, 'normal')
      }

      focus()
    },
    isMinimized() {
      return getWindowRecord(record.id)?.mode === 'minimized'
    },
    setFullScreen(flag: boolean) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      applyMode(current, flag ? 'fullscreen' : 'normal')
      focus()
    },
    isFullScreen() {
      return getWindowRecord(record.id)?.mode === 'fullscreen'
    },
    setBounds(bounds: Partial<Rect>) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      if (current.mode !== 'normal') {
        current.mode = 'normal'
      }

      assignBounds(
        current,
        {
          x: bounds.x ?? current.bounds.x,
          y: bounds.y ?? current.bounds.y,
          width: bounds.width ?? current.bounds.width,
          height: bounds.height ?? current.bounds.height
        },
        bounds.x !== undefined || bounds.y !== undefined ? 'move' : 'resize'
      )
    },
    getBounds() {
      return cloneRect(getWindowRecord(record.id)?.bounds ?? record.bounds)
    },
    setPosition(x: number, y: number) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      assignBounds(current, { ...current.bounds, x, y }, 'move')
    },
    getPosition() {
      const bounds = this.getBounds()
      return [bounds.x, bounds.y]
    },
    setSize(width: number, height: number) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      assignBounds(current, { ...current.bounds, width, height }, 'resize')
    },
    getSize() {
      const bounds = this.getBounds()
      return [bounds.width, bounds.height]
    },
    setMinimumSize(width: number, height: number) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.minimumSize = { width, height }
    },
    setMaximumSize(width: number, height: number) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.maximumSize = { width, height }
    },
    setResizable(flag: boolean) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.isResizable = flag
    },
    isResizable() {
      return getWindowRecord(record.id)?.isResizable ?? false
    },
    setAlwaysOnTop(flag: boolean) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.alwaysOnTop = flag
    },
    isAlwaysOnTop() {
      return getWindowRecord(record.id)?.alwaysOnTop ?? false
    },
    setTitle(title: string) {
      const current = getWindowRecord(record.id)
      if (!current) {
        return
      }

      current.title = title
    },
    getTitle() {
      return getWindowRecord(record.id)?.title ?? ''
    }
  }
}

export function createOsWindow(options: CreateWindowOptions) {
  const record = createWindowRecord(options)
  windows.value.push(record)
  const api = createWindowApi(record)
  windowInstances.set(record.id, api)

  if (record.mode === 'fullscreen') {
    record.bounds = getViewportBounds('fullscreen')
  }

  api.show()
  return api
}

export function getWindowById(windowId: number) {
  return windowInstances.get(windowId)
}

export function openApp(appId: AppId) {
  const existingWindow = windows.value.find(item => item.appId === appId)
  if (existingWindow) {
    const api = getWindowById(existingWindow.id)
    api?.show()
    return api
  }

  return createOsWindow({ appId })
}

export function focusWindow(windowId: number) {
  getWindowById(windowId)?.focus()
}

export function minimizeWindow(windowId: number) {
  getWindowById(windowId)?.minimize()
}

export function closeWindow(windowId: number) {
  getWindowById(windowId)?.close()
}

export function toggleMaximizeWindow(windowId: number) {
  const windowInstance = getWindowById(windowId)
  if (!windowInstance) {
    return
  }

  if (windowInstance.isMaximized()) {
    windowInstance.restore()
  } else {
    windowInstance.maximize()
  }
}

export function toggleFullscreenWindow(windowId: number) {
  const windowInstance = getWindowById(windowId)
  if (!windowInstance) {
    return
  }

  windowInstance.setFullScreen(!windowInstance.isFullScreen())
}

export function updateWindowBounds(windowId: number, bounds: Partial<Rect>) {
  getWindowById(windowId)?.setBounds(bounds)
}
