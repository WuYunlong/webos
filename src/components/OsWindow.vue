<template>
  <div
    ref="wrap"
    class="wrap"
    :class="{ minimized: isMinimized, fullscreen: isFullscreen, focused: windowItem.isFocused }"
    @contextmenu.stop.prevent
  >
    <div ref="win" class="win">
      <div class="info" :class="{ frame: options.frame && !isFullscreen, fullscreen: isFullscreen }">
        <slot />
      </div>
      <div
        class="head drag"
        :class="{ fullscreen: isFullscreen }"
        @dblclick="handleHeadDoubleClick"
        @contextmenu.stop.prevent="showWindowMenu"
      >
        <div class="name drag">
          <img class="app-icon drag" :src="windowItem.icon" :alt="windowItem.title" />
          <div class="text drag">
            {{ windowItem.title }}
          </div>
        </div>
        <div class="bar">
          <button class="btn min" type="button" @click.stop="handleMinimize">
            <span class="icon">
              <OsIcon name="win_bar_min" />
            </span>
          </button>
          <button class="btn max" type="button" @click.stop="handleToggleMaximize">
            <span class="icon">
              <OsIcon :name="isMaximized || isFullscreen ? 'win_bar_restore' : 'win_bar_max'" />
            </span>
          </button>
          <button class="btn close" type="button" @click.stop="handleClose">
            <span class="icon">
              <OsIcon name="win_bar_close" />
            </span>
          </button>
        </div>
      </div>
      <WinResize v-if="!isMoveBar && canResize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fromEvent, Subscription } from 'rxjs'

import type { PropType } from 'vue'
import type { MenuItem } from './contextmenu/type'
import type { OptionsWin, Rect } from '@/types/window'
import type { WindowRecord } from '@/state/windows'
import WinResize from './widget/WinResize.vue'
import { showMenu } from './contextmenu'
import { getWindowById, updateWindowBounds } from '@/state/windows'

import OsIcon from '@/components/OsIcon.vue'

interface MouseDownInfo extends Rect {
  clientX: number
  clientY: number
  innerHeight: number
  innerWidth: number
}

const props = defineProps({
  windowItem: { type: Object as PropType<WindowRecord>, required: true },
  index: { type: Number, default: 0 }
})

const winSelect = inject<(windowId: number, index: number) => void>('winSelect')
const winMove = inject<(e: MouseEvent) => void>('winMove')
const winMoveEnd = inject<() => void>('winMoveEnd')
const closeWindow = inject<(windowId: number) => void>('closeWindow')
const minimizeWindow = inject<(windowId: number) => void>('minimizeWindow')
const toggleMaximizeWindow = inject<(windowId: number) => void>('toggleMaximizeWindow')
const toggleFullscreenWindow = inject<(windowId: number) => void>('toggleFullscreenWindow')

const wrap = ref<HTMLElement>()
const win = ref<HTMLElement>()
const subscriptions = new Subscription()
let activeDragSubscriptions = new Subscription()
const isThumbPreview = ref(false)

const options = computed(() => props.windowItem.options as Required<OptionsWin>)
const isMinimized = computed(() => props.windowItem.mode === 'minimized')
const isMaximized = computed(() => props.windowItem.mode === 'maximized')
const isFullscreen = computed(() => props.windowItem.mode === 'fullscreen')
const canResize = computed(
  () => options.value.resizable && props.windowItem.isResizable && !isMaximized.value && !isFullscreen.value
)

const isMoveBar = ref(false)
const isResize = ref(false)

let isResizeT = false
let isResizeR = false
let isResizeL = false
let isResizeB = false

let scale = 1
let transformOrigin = '50%'
let transformY = 0

function renderWindow() {
  if (!wrap.value) {
    return
  }

  const { bounds, zIndex, isVisible } = props.windowItem
  wrap.value.style.display = isVisible ? 'block' : 'none'
  wrap.value.style.zIndex = `${zIndex + (isThumbPreview.value ? 10000 : 0)}`
  wrap.value.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0)`
  wrap.value.style.width = `${bounds.width}px`
  wrap.value.style.height = `${bounds.height}px`

  if (!isVisible) {
    setWinUnthumb()
  }
}

function setWinCenter() {
  const { width, height } = props.windowItem.bounds
  const x = (window.innerWidth - width) / 2
  const y = (window.innerHeight - height) / 2
  updateWindowBounds(props.windowItem.id, { x, y })
}

function getResizeWidth(width: number) {
  return Math.min(Math.max(width, props.windowItem.minimumSize.width), props.windowItem.maximumSize.width)
}

function getResizeHeight(height: number) {
  return Math.min(Math.max(height, props.windowItem.minimumSize.height), props.windowItem.maximumSize.height)
}

function winMouseDown(e: Event) {
  const target = e.target as HTMLElement
  if (typeof winSelect === 'function') {
    winSelect(props.windowItem.id, props.index)
  }

  if (isMaximized.value || isFullscreen.value) {
    return
  }

  const { bounds } = props.windowItem
  const { innerWidth, innerHeight } = window
  isMoveBar.value = options.value.movable && target.classList.contains('drag')
  isResize.value = canResize.value && target.classList.contains('s')
  isResizeT = target.classList.contains('t')
  isResizeR = target.classList.contains('r')
  isResizeL = target.classList.contains('l')
  isResizeB = target.classList.contains('b')

  if (!isMoveBar.value && !isResize.value) {
    return
  }

  const { clientX, clientY } = e as MouseEvent
  scale = 200 / bounds.width
  transformY = clientY - bounds.y + 16
  transformOrigin = `${((clientX - bounds.x) * 100) / bounds.width}%`
  const info = { clientX, clientY, innerWidth, innerHeight, ...bounds }

  activeDragSubscriptions.unsubscribe()
  activeDragSubscriptions = new Subscription()
  activeDragSubscriptions.add(fromEvent(document, 'mousemove').subscribe(e => winMouseMove(e, info)))
  activeDragSubscriptions.add(
    fromEvent(document, 'mouseup').subscribe(() => {
      if (isMoveBar.value) {
        isMoveBar.value = false
        winMoveEnd?.()
      }
      isResize.value = false
      transformY = 0
      scale = 1
      transformOrigin = '50%'
      activeDragSubscriptions.unsubscribe()
    })
  )
}

function winMouseMove(e: Event, info: MouseDownInfo) {
  const { clientX, clientY } = e as MouseEvent
  let { x, y, width, height } = info
  const cx = clientX - info.clientX
  const cy = clientY - info.clientY

  if (isMoveBar.value) {
    const left = info.x + cx
    const top = info.y + cy
    const box = { x1: -info.width / 2, y1: 0, x2: info.innerWidth - info.width / 2, y2: info.innerHeight - 96 }
    x = Math.max(Math.min(left, box.x2), box.x1)
    y = Math.max(Math.min(top, box.y2), box.y1)
    winMove?.(e as MouseEvent)
  } else if (isResize.value) {
    if (isResizeT) {
      const nextHeight = getResizeHeight(info.height - cy)
      y = info.y + (info.height - nextHeight)
      height = nextHeight
    }
    if (isResizeR) {
      width = getResizeWidth(info.width + cx)
    }
    if (isResizeB) {
      height = getResizeHeight(info.height + cy)
    }
    if (isResizeL) {
      const nextWidth = getResizeWidth(info.width - cx)
      x = info.x + (info.width - nextWidth)
      width = nextWidth
    }
  }

  updateWindowBounds(props.windowItem.id, { x, y, width, height })
}

function setWinThumb() {
  isThumbPreview.value = true
  renderWindow()
  win.value!.style.transformOrigin = `${transformOrigin} 0`
  win.value!.style.transform = `translate3d(0, ${transformY}px, 0) scale(${scale})`
}

function setWinUnthumb() {
  if (!wrap.value || !win.value) {
    return
  }

  isThumbPreview.value = false
  renderWindow()
  win.value.style.transform = 'translate3d(0, 0, 0) scale(1)'
}

function handleMinimize() {
  minimizeWindow?.(props.windowItem.id)
}

function handleToggleMaximize() {
  toggleMaximizeWindow?.(props.windowItem.id)
}

function handleToggleFullscreen() {
  toggleFullscreenWindow?.(props.windowItem.id)
}

function handleClose() {
  closeWindow?.(props.windowItem.id)
}

function handleHeadDoubleClick() {
  if (options.value.maximizable) {
    handleToggleMaximize()
  }
}

function showWindowMenu(e: MouseEvent) {
  const windowInstance = getWindowById(props.windowItem.id)
  if (!windowInstance) {
    return
  }

  const items: MenuItem[] = [
    {
      label: windowInstance.isMinimized() ? '恢复' : '最小化',
      icon: 'menu_view',
      click: () => {
        if (windowInstance.isMinimized()) {
          windowInstance.restore()
        } else {
          handleMinimize()
        }
      }
    },
    {
      label: windowInstance.isMaximized() ? '还原' : '最大化',
      icon: 'menu_show',
      click: () => {
        if (windowInstance.isMaximized()) {
          windowInstance.restore()
        } else {
          windowInstance.maximize()
        }
      }
    },
    {
      label: windowInstance.isFullScreen() ? '退出全屏' : '全屏',
      icon: 'menu_more',
      click: handleToggleFullscreen
    },
    {
      type: 'line'
    },
    {
      label: '关闭',
      icon: 'finder_delete',
      click: handleClose
    }
  ]

  showMenu({ e, items })
}

onMounted(async () => {
  await nextTick()
  renderWindow()
  subscriptions.add(fromEvent(wrap.value!, 'mousedown').subscribe(winMouseDown))
  subscriptions.add(fromEvent(window, 'resize').subscribe(() => renderWindow()))
})

watch(
  () => [
    props.windowItem.bounds.x,
    props.windowItem.bounds.y,
    props.windowItem.bounds.width,
    props.windowItem.bounds.height
  ],
  () => {
    renderWindow()
  }
)

watch(
  () => [props.windowItem.zIndex, props.windowItem.mode, props.windowItem.isVisible, props.windowItem.title],
  () => {
    renderWindow()
  }
)

onBeforeUnmount(() => {
  activeDragSubscriptions.unsubscribe()
  subscriptions.unsubscribe()
})

defineExpose({ setWinCenter, setWinThumb, setWinUnthumb })
</script>

<style scoped lang="less">
.wrap {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: auto;
}

.win {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0) scale(1);
  transition: transform 0.2s;
}

.info {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 0;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);

  &.frame {
    padding-top: 28px;
  }

  &.fullscreen {
    border-radius: 0;
  }
}

.head {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 28px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.fullscreen {
    background-color: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(20px);
  }
}

.name {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  min-width: 0;
}

.app-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}

.text {
  font-size: 12px;
  line-height: 1;
  color: rgba(17, 24, 39, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar {
  display: flex;

  .btn {
    position: relative;
    width: 48px;
    height: 28px;
    box-sizing: border-box;
    border: 0;
    margin: 0;
    font-size: 10px;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    display: block;
    width: 10px;
    height: 10px;
  }

  .btn.close {
    border-radius: 0 6px 0 0;
  }

  .btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .btn.close:hover {
    color: #fff;
    background-color: #c42b1d;
  }
}
</style>
