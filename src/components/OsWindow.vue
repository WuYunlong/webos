<template>
  <div ref="wrap" class="wrap" @contextmenu.stop.prevent>
    <div ref="win" class="win">
      <div class="info" :class="{ frame }">
        <slot />
      </div>
      <div class="head drag">
        <div class="name">
          <div class="icon" />
          <div class="text" />
        </div>
        <div class="bar">
          <button class="btn min">
            <OsIcon name="win_bar_min" />
          </button>
          <button class="btn max">
            <OsIcon name="win_bar_max" />
            <div class="bar-split" />
          </button>
          <button class="btn close">
            <OsIcon name="win_bar_close" />
          </button>
        </div>
      </div>
      <WinResize v-if="!isMoveBar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, onMounted, ref, watch } from 'vue'
import { fromEvent } from 'rxjs'

import WinResize from './widget/WinResize.vue'
import OsIcon from '@/components/OsIcon.vue'

const props = defineProps({
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  top: { type: Number, default: 200 },
  left: { type: Number, default: 200 },
  zIndex: { type: Number, default: 100 },
  index: { type: Number, default: 0 },
  frame: { type: Boolean, default: true }
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

console.log(emits)

const winSelect = inject<(index: number) => void>('winSelect')
const winMove = inject<(e: MouseEvent) => void>('winMove')
const winMoveEnd = inject<() => void>('winMoveEnd')

const wrap = ref<HTMLElement>()
const win = ref<HTMLElement>()
const zIndex = ref<number>(props.zIndex)

watch(
  () => zIndex.value,
  (v) => {
    wrap.value!.style.zIndex = v.toString()
  }
)

function setWinPos(x: number, y: number, w: number, h: number) {
  wrap.value!.style.transform = `translate3d(${x}px, ${y}px, 0)`
  wrap.value!.style.width = `${w}px`
  wrap.value!.style.height = `${h}px`
}

function setWinCenter() {
  const { width, height } = wrap.value!.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  const x = (innerWidth - width) / 2
  const y = (innerHeight - height) / 2
  setWinPos(x, y, width, height)
}

// 窗口移动
const isMoveBar = ref(false)
const isResize = ref(false)

let isResizeT = false
let isResizeR = false
let isResizeL = false
let isResizeB = false

let scale = 1
let transformOrigin = '50%'
let transformY = 0

interface MouseDownInfo {
  clientX: number
  clientY: number
  innerWidth: number
  innerHeight: number
  width: number
  height: number
  left: number
  top: number
}

function winMouseDown(e: Event) {
  const target = e.target! as HTMLElement
  if (typeof winSelect === 'function') {
    winSelect(props.index)
  }

  const { width, height, top, left } = wrap.value!.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  isMoveBar.value = target.classList.contains('drag')
  isResize.value = target.classList.contains('s')
  isResizeT = target.classList.contains('t')
  isResizeR = target.classList.contains('r')
  isResizeL = target.classList.contains('l')
  isResizeB = target.classList.contains('b')

  const { clientX, clientY } = e as MouseEvent
  scale = 200 / width
  transformY = clientY - top + 16
  transformOrigin = `${(clientX - left) * 100 / width}%`
  const info = { clientX, clientY, width, height, left, top, innerWidth, innerHeight }
  const moveSub = fromEvent(document, 'mousemove').subscribe(e => winMouseMove(e, info))
  const upSub = fromEvent(document, 'mouseup').subscribe(() => {
    if (isMoveBar.value) {
      isMoveBar.value = false
      if (typeof winMoveEnd === 'function') {
        winMoveEnd()
      }
    }
    isResize.value = false
    transformY = 0
    scale = 1
    transformOrigin = '50%'
    moveSub.unsubscribe()
    upSub.unsubscribe()
  })
}

function winMouseMove(e: Event, info: MouseDownInfo) {
  const { clientX, clientY } = e as MouseEvent
  const { left, top, width, height, innerWidth, innerHeight } = info
  let { left: l, top: t, width: w, height: h } = info
  const cx = clientX - info.clientX
  const cy = clientY - info.clientY

  if (isMoveBar.value) {
    const p = { clientX: left + cx, clientY: top + cy }
    const box = { x1: -width / 2, y1: 0, x2: innerWidth - width / 2, y2: innerHeight - 96 }
    l = Math.max(Math.min(p.clientX, box.x2), box.x1)
    t = Math.max(Math.min(p.clientY, box.y2), box.y1)
    if (typeof winMove === 'function') {
      winMove(e as MouseEvent)
    }
  }
  else if (isResize.value) {
    if (isResizeT) {
      t = top + cy
      h = height - cy
    }
    if (isResizeR) {
      w = width + cx
    }
    if (isResizeB) {
      h = height + cy
    }
    if (isResizeL) {
      l = left + cx
      w = width - cx
    }
  }

  if (l !== left || t !== top || w !== width || h !== height) {
    setWinPos(l, t, w, h)
  }
}

function setWinThumb() {
  if (zIndex.value < 10000) {
    zIndex.value += 10000
  }
  wrap.value!.style.zIndex = `${zIndex.value}`
  win.value!.style.transformOrigin = `${transformOrigin} 0`
  win.value!.style.transform = `translate3d(0, ${transformY}px, 0) scale(${scale})`
}

function setWinUnthumb() {
  if (zIndex.value > 10000) {
    zIndex.value -= 10000
  }
  win.value!.style.transform = `translate3d(0, 0, 0) scale(1)`
}

onMounted(async () => {
  await nextTick()

  setWinPos(props.left, props.top, props.width, props.height)
  wrap.value!.style.zIndex = zIndex.value.toString()
  fromEvent(wrap.value!, 'mousedown').subscribe(winMouseDown)
})

defineExpose({ setWinPos, setWinCenter, setWinThumb, setWinUnthumb })

// destroy close blur focus isFocused isDestroyed show showInactive hide isVisible
// maximize unmaximize isMaximized  minimize restore isMinimized
// setFullScreen isFullScreen isNormal setBackgroundColor setBounds getBounds
// getBackgroundColor
// console.log(emits)
</script>

<style scoped lang="scss">
.wrap {
  position: absolute;
  left: 0;
  top: 0;
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
}

.head {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bar {
  display: flex;

  .btn {
    position: relative;
    width: 48px;
    height: 28px;
    box-sizing: border-box;
    padding: 9px 19px;
    border: 0;
    margin: 0;
    font-size: 10px;
    background-color: transparent;
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

.bar-split {
  position: absolute;
  top: 28px;
  left: 50%;
  width: 200px;
  height: 120px;
  transform: translate3d(-50%, 0, 0);
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  display: none;
}
</style>
