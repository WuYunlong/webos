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

    <div class="win-bar">
      <button class="bar-item"><os-icon name="subtract_fill" /></button>
      <button
        class="bar-item"
        :class="{ show: subMenuShow }"
        @mouseenter="barMinSizeMouseEnter"
        @mouseleave="barMinSizeMouseLeave"
      >
        <os-icon name="maximize" />
        <div class="bar-tips"></div>
      </button>
      <button class="bar-item bar-item-close"><os-icon name="close_fill" /></button>
    </div>

    <span class="s stl t l"></span>
    <span class="s st t"></span>
    <span class="s str t r"></span>
    <span class="s sr r"></span>
    <span class="s sbr b r"></span>
    <span class="s sb b"></span>
    <span class="s sbl b l"></span>
    <span class="s sl l"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { PropType } from 'vue'

interface EL extends HTMLElement {
  __rect: DOMRect
}

const props = defineProps({
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  top: { type: Number, default: 50 },
  left: { type: Number, default: 50 },
  zIndex: { type: Number, default: 10000 },
  moveBar: { type: Object as PropType<HTMLElement>, default: undefined }
})

const emits = defineEmits(['move', 'select'])

const win = ref<EL>()

let { innerWidth, innerHeight } = window
let isMoveBar = false
let isResize = false

let isResizeT = false
let isResizeR = false
let isResizeL = false
let isResizeB = false

let mouseDownClientX = 0
let mouseDownClientY = 0

const elMouseDown = (e: MouseEvent) => {
  e.stopPropagation()
  const winEl = win.value!
  winEl.__rect = win.value!.getBoundingClientRect()

  // 缓存变量 加速渲染
  innerWidth = window.innerWidth
  innerHeight = window.innerHeight
  isMoveBar = e.target === props.moveBar
  isResize = e.target.classList.contains('s')
  isResizeT = e.target.classList.contains('t')
  isResizeR = e.target.classList.contains('r')
  isResizeL = e.target.classList.contains('l')
  isResizeB = e.target.classList.contains('b')
  mouseDownClientX = e.clientX
  mouseDownClientY = e.clientY

  document.body.addEventListener('mousemove', elMouseMove)
  document.body.addEventListener('mouseup', elMouseUp)
  // document.body.addEventListener('mouseleave', elMouseUp)
}

const elMouseMove = (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  emits('select')

  const winEL = win.value!
  const { clientX, clientY } = e
  const { left, top, width, height } = winEL.__rect
  let { left: l, top: t, width: w, height: h } = winEL.__rect
  const changeX = clientX - mouseDownClientX
  const changeY = clientY - mouseDownClientY

  if (isMoveBar) {
    const p = { clientX: left + changeX, clientY: top + changeY }
    const box = { x1: -width / 2, y1: 0, x2: innerWidth - width / 2, y2: innerHeight - 96 }
    l = Math.max(Math.min(p.clientX, box.x2), box.x1)
    t = Math.max(Math.min(p.clientY, box.y2), box.y1)
    emits('move', e)
  } else if (isResize) {
    if (isResizeT) {
      t = top + changeY
      h = height - changeY
    }
    if (isResizeR) {
      w = width + changeX
    }
    if (isResizeB) {
      h = height + changeY
    }
    if (isResizeL) {
      l = left + changeX
      w = width - changeX
    }
  }

  if (l != left || t != top || w != width || h != height) {
    setWinPos(l, t, w, h)
  }
}

const elMouseUp = () => {
  document.body.removeEventListener('mousemove', elMouseMove)
  document.body.removeEventListener('mouseup', elMouseUp)
  // document.body.removeEventListener('mouseleave', elMouseUp)
}

let timer: number
const subMenuShow = ref(false)
const barMinSizeMouseEnter = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    subMenuShow.value = true
  }, 1000)
}

const barMinSizeMouseLeave = () => {
  if (timer) {
    clearTimeout(timer)
  }
  subMenuShow.value = false
}

const setWinPos = (x: number, y: number, w: number, h: number) => {
  const el = win.value!
  el.style.width = `${w}px`
  el.style.height = `${h}px`
  el.style.left = `${x}px`
  el.style.top = `${y}px`
}

const setWinCenter = () => {
  const { width, height } = win.value!.getBoundingClientRect()
  const { innerWidth, innerHeight } = window
  const x = (innerWidth - width) / 2
  const y = (innerHeight - height) / 2
  setWinPos(x, y, width, height)
}

onMounted(async () => {
  await nextTick()
  setWinPos(props.left, props.top, props.width, props.height)
  win.value!.style.zIndex = props.zIndex.toString()
  win.value!.addEventListener('mousedown', elMouseDown)
})

onUnmounted(() => {
  win.value!.removeEventListener('mousedown', elMouseDown)
  window.removeEventListener('resize', winResize)
})

defineExpose({ setWinPos, setWinCenter })
</script>

<style scoped lang="scss">
.os-window {
  display: block;
  position: absolute;
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
$size: 8px;
$sizeHalf: 4px;
.s {
  display: block;
  position: absolute;
}
.stl,
.str,
.sbl,
.sbr {
  width: $size;
  height: $size;
}
.stl {
  top: -$sizeHalf;
  left: -$sizeHalf;
  cursor: nwse-resize;
}
.str {
  top: -$sizeHalf;
  right: -$sizeHalf;
  cursor: nesw-resize;
}
.sbl {
  bottom: -$sizeHalf;
  left: -$sizeHalf;
  cursor: nesw-resize;
}
.sbr {
  bottom: -$sizeHalf;
  right: -$sizeHalf;
  cursor: nwse-resize;
}
.st {
  top: -$sizeHalf;
  height: $size;
  left: $sizeHalf;
  right: $sizeHalf;
  cursor: ns-resize;
}
.sr {
  top: $sizeHalf;
  right: -$sizeHalf;
  bottom: $sizeHalf;
  width: $size;
  cursor: ew-resize;
}
.sb {
  bottom: -$sizeHalf;
  height: $size;
  left: $sizeHalf;
  right: $sizeHalf;
  cursor: ns-resize;
}
.sl {
  top: $sizeHalf;
  left: -$sizeHalf;
  bottom: $sizeHalf;
  width: $size;
  cursor: ew-resize;
}

.win-bar {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  .bar-item {
    display: block;
    position: relative;
    width: 48px;
    height: 28px;
    border: 0;
    margin: 0;
    padding: 0;
    background-color: transparent;
  }
  .bar-item-close {
    border-radius: 0 6px 0 0;
  }
  .bar-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  .bar-item-close:hover {
    color: #fff;
    background-color: #c42b1d;
  }
  .bar-tips {
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
  .show .bar-tips {
    display: block;
  }
}
</style>
