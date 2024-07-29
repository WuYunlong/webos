<template>
  <div ref="win" class="os-window" @contextmenu.stop.prevent>
    <div class="inner">
      <slot />
    </div>
    <WinBar />
    <WinResize v-if="!isMoveBar" />
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, onMounted, ref, watch } from 'vue'
import WinBar from './widget/WinBar.vue'
import WinResize from './widget/WinResize.vue'
import { bindMouseMove } from '@/utils'

import type { MoveRes } from '@/utils'

const props = defineProps({
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  top: { type: Number, default: 200 },
  left: { type: Number, default: 200 },
  zIndex: { type: Number, default: 100 },
  index: { type: Number, default: 0 }
})

const emits = defineEmits([
  'blur',
  'focus',
  'show',
  'hide',
  'maximize',
  'unmaximize',
  'minimize',
  'restore',
  'resize',
  'resized',
  'will-move',
  'moved',
  'enter-full-screen',
  'leave-full-screen',
  'always-on-top-changed'
])
const winSelect = inject<(index: number) => void>('winSelect')
const winMove = inject<(e: MouseEvent) => void>('winMove')
const winMoveEnd = inject<() => void>('winMoveEnd')

const win = ref<HTMLElement>()
const zIndex = ref<number>(props.zIndex)

watch(
  () => zIndex.value,
  (v) => {
    win.value!.style.zIndex = v.toString()
  }
)

function setWinPos(x: number, y: number, w: number, h: number) {
  // win.value!.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  win.value!.style.width = `${w}px`
  win.value!.style.height = `${h}px`
  win.value!.style.left = `${x}px`
  win.value!.style.top = `${y}px`
}

function setWinCenter() {
  const { width, height } = win.value!.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  const x = (innerWidth - width) / 2
  const y = (innerHeight - height) / 2
  setWinPos(x, y, width, height)
}

// 窗口移动
let winRect: DOMRect
let { innerWidth, innerHeight } = window
const isMoveBar = ref(false)
const isResize = ref(false)

let isResizeT = false
let isResizeR = false
let isResizeL = false
let isResizeB = false

let scale = 1
let transformOrigin = '50%'
let thumbMarginTop = 0

function winMouseDown(e: MouseEvent): boolean {
  // e.stopPropagation()
  const target = e.target! as HTMLElement

  if (typeof winSelect === 'function') {
    winSelect(props.index)
  }

  winRect = win.value!.getBoundingClientRect()
  innerWidth = window.innerWidth
  innerHeight = window.innerHeight
  isMoveBar.value = target.classList.contains('drag')
  isResize.value = target.classList.contains('s')
  isResizeT = target.classList.contains('t')
  isResizeR = target.classList.contains('r')
  isResizeL = target.classList.contains('l')
  isResizeB = target.classList.contains('b')

  return true
}

function winMouseMove(res: MoveRes, e?: MouseEvent) {
  // e!.stopPropagation()
  // e!.preventDefault()

  const { left, top, width, height } = winRect
  let { left: l, top: t, width: w, height: h } = winRect

  // 开始判断
  if (isMoveBar.value) {
    thumbMarginTop = res.start.y - top + 16
    transformOrigin = `${((res.start.x - left) * 100) / width}%`

    const p = { clientX: left + res.move.x, clientY: top + res.move.y }
    const box = { x1: -width / 2, y1: 0, x2: innerWidth - width / 2, y2: innerHeight - 96 }
    l = Math.max(Math.min(p.clientX, box.x2), box.x1)
    t = Math.max(Math.min(p.clientY, box.y2), box.y1)
    if (typeof winMove === 'function') {
      winMove(e!)
    }
    // emits('move', e!)
  }
  else if (isResize.value) {
    if (isResizeT) {
      t = top + res.move.y
      h = height - res.move.y
    }
    if (isResizeR) {
      w = width + res.move.x
    }
    if (isResizeB) {
      h = height + res.move.y
    }
    if (isResizeL) {
      l = left + res.move.x
      w = width - res.move.x
    }
  }

  if (l !== left || t !== top || w !== width || h !== height) {
    setWinPos(l, t, w, h)
  }
}

function winMouseUp() {
  if (isMoveBar.value) {
    if (typeof winMoveEnd === 'function') {
      winMoveEnd()
    }
    // emits('moveEnd')
  }
  isMoveBar.value = false
  isResize.value = false
}

function setWinThumb() {
  if (zIndex.value < 10000) {
    zIndex.value += 10000
  }
  scale = 200 / win.value!.getBoundingClientRect().width
  win.value!.style.marginTop = `${thumbMarginTop}px`
  win.value!.style.transformOrigin = `${transformOrigin}  -16px`
  win.value!.style.zIndex = `${zIndex.value}`
  win.value!.style.transform = `scale(${scale})`
}

function setWinUnthumb() {
  if (scale === 1 && win.value!.style.marginTop === '0') {
    return
  }
  if (zIndex.value > 10000) {
    zIndex.value -= 10000
  }
  win.value!.style.marginTop = '0'
  win.value!.style.zIndex = `${zIndex.value}`
  win.value!.style.transform = `scale(1)`
  scale = 1
}

onMounted(async () => {
  await nextTick()
  setWinPos(props.left, props.top, props.width, props.height)
  win.value!.style.zIndex = zIndex.value.toString()
  bindMouseMove(win.value!, winMouseMove, winMouseDown, winMouseUp)
})

defineExpose({ setWinPos, setWinCenter, setWinThumb, setWinUnthumb })

// destroy close blur focus isFocused isDestroyed show showInactive hide isVisible
// maximize unmaximize isMaximized  minimize restore isMinimized
// setFullScreen isFullScreen isNormal setBackgroundColor setBounds getBounds
// getBackgroundColor
console.log(emits)
</script>

<style scoped lang="scss">
.os-window {
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  transition: transform 0.2s;
}
.inner {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
