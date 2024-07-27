<template>
  <div class="os-window" ref="win" @contextmenu.stop.prevent>
    <div class="inner">
      <div class="head">
        <slot name="head" />
      </div>
      <div class="body">
        <div class="side">
          <slot name="side" />
        </div>
        <div class="main">
          <slot />
        </div>
      </div>
      <div class="foot">
        <slot name="foot" />
      </div>
    </div>
    <win-bar />
    <win-resize v-if="!isMoveBar" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { bindMouseMove } from '@/utils'

import type { PropType } from 'vue'
import type { MoveRes } from '@/utils'

import WinBar from './widget/WinBar.vue'
import WinResize from './widget/WinResize.vue'

const props = defineProps({
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  top: { type: Number, default: 200 },
  left: { type: Number, default: 200 },
  zIndex: { type: Number, default: 100 },
  moveBar: { type: Object as PropType<HTMLElement>, default: undefined }
})

const emits = defineEmits(['move', 'moveEnd', 'select'])

const win = ref<HTMLElement>()
const zIndex = ref<number>(props.zIndex)

watch(
  () => zIndex.value,
  (v) => {
    win.value!.style.zIndex = v.toString()
  }
)

const setWinPos = (x: number, y: number, w: number, h: number) => {
  // win.value!.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
  win.value!.style.width = `${w}px`
  win.value!.style.height = `${h}px`
  win.value!.style.left = `${x}px`
  win.value!.style.top = `${y}px`
}

const setWinCenter = () => {
  const { width, height } = win.value!.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  const x = (innerWidth - width) / 2
  const y = (innerHeight - height) / 2
  setWinPos(x, y, width, height)
}

// 窗口移动
let winRect: DOMRect
let { innerWidth, innerHeight } = window
let isMoveBar = ref(false)
let isResize = ref(false)

let isResizeT = false
let isResizeR = false
let isResizeL = false
let isResizeB = false

let scale = 1
let transformOrigin = '50%'
let thumbMarginTop = 0

const winMouseDown = (e: MouseEvent): boolean => {
  e.stopPropagation()
  const target = e.target! as HTMLElement

  winRect = win.value!.getBoundingClientRect()
  innerWidth = window.innerWidth
  innerHeight = window.innerHeight
  isMoveBar.value = target === props.moveBar
  isResize.value = target.classList.contains('s')
  isResizeT = target.classList.contains('t')
  isResizeR = target.classList.contains('r')
  isResizeL = target.classList.contains('l')
  isResizeB = target.classList.contains('b')

  return true
}

const winMouseMove = (res: MoveRes, e?: MouseEvent) => {
  e!.stopPropagation()
  e!.preventDefault()

  const { left, top, width, height } = winRect
  let { left: l, top: t, width: w, height: h } = winRect

  // 开始判断
  if (isMoveBar.value) {
    // if (scale == 1 && width != 200) {
    thumbMarginTop = res.start.y - top + 16

    transformOrigin = `${((res.start.x - left) * 100) / width}%`
    // }
    const p = { clientX: left + res.move.x, clientY: top + res.move.y }
    const box = { x1: -width / 2, y1: 0, x2: innerWidth - width / 2, y2: innerHeight - 96 }
    l = Math.max(Math.min(p.clientX, box.x2), box.x1)
    t = Math.max(Math.min(p.clientY, box.y2), box.y1)
    emits('move', e!)
  } else if (isResize.value) {
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

  if (l != left || t != top || w != width || h != height) {
    setWinPos(l, t, w, h)
  }
}

const winMouseUp = () => {
  if (isMoveBar.value) {
    emits('moveEnd')
  }
  isMoveBar.value = false
  isResize.value = false
}

const setWinThumb = () => {
  if (zIndex.value < 10000) {
    zIndex.value += 10000
  }
  scale = 200 / win.value!.getBoundingClientRect().width
  win.value!.style.marginTop = `${thumbMarginTop}px`
  win.value!.style.transformOrigin = `${transformOrigin}  -16px`
  win.value!.style.zIndex = `${zIndex.value}`
  win.value!.style.transform = `scale(${scale})`
}

const setWinUnthumb = () => {
  if (scale == 1 && win.value!.style.marginTop == '0') {
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
