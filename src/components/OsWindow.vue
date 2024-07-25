<template>
  <div class="os-window" :style ref="win" @contextmenu.stop.prevent>
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
import { computed, ref, onMounted, nextTick } from 'vue'
import type { PropType } from 'vue'

interface EL extends HTMLElement {
  __rect: DOMRect
  __mouseDown: MouseEvent
  __positon: {
    left: number
    top: number
    width: number
    height: number
  }
}

const props = defineProps({
  width: { type: Number, default: 600 },
  height: { type: Number, default: 400 },
  top: { type: Number, default: 50 },
  left: { type: Number, default: 50 },
  zIndex: { type: Number, default: 10 },
  moveBar: { type: Object as PropType<HTMLElement>, default: undefined }
})

const emits = defineEmits(['move'])

const width = ref<Number>(props.width)
const left = ref<Number>(props.left)
const top = ref<Number>(props.top)
const height = ref<Number>(props.height)

const style = computed(() => {
  return {
    width: `${width.value}px`,
    height: `${height.value}px`,
    top: `${top.value}px`,
    left: `${left.value}px`,
    zIndex: props.zIndex
  }
})

const win = ref<EL>()

const setPosition = (el: EL) => {
  width.value = el.__positon.width
  height.value = el.__positon.height
  left.value = el.__positon.left
  top.value = el.__positon.top
}

const elMouseDown = (e: MouseEvent) => {
  e.stopPropagation()

  const winEl = win.value!
  winEl.__rect = win.value!.getBoundingClientRect()
  winEl.__mouseDown = e

  document.body.addEventListener('mousemove', elMouseMove)
  document.body.addEventListener('mouseup', elMouseUp)
  document.body.addEventListener('mouseleave', elMouseUp)
}

const elMouseMove = (e: MouseEvent) => {
  e.stopPropagation()
  const { innerWidth, innerHeight } = window
  const { clientX, clientY } = e
  const winEL = win.value!
  const target = winEL.__mouseDown.target as HTMLElement
  const { clientX: ox, clientY: oy } = winEL.__mouseDown
  const { left, top, width, height } = winEL.__rect
  let { left: l, top: t, width: w, height: h } = winEL.__rect

  const cy = clientY - oy
  const cx = clientX - ox

  if (target === props.moveBar) {
    l = left + cx
    t = top + cy
    l = -width / 2 > l ? -width / 2 : l
    l = innerWidth - width / 2 < l ? innerWidth - width / 2 : l
    t = t < 0 ? 0 : t
    t = innerHeight - 96 < t ? innerHeight - 96 : t
    emits('move', e)
  } else if (target.classList.contains('s')) {
    if (target.classList.contains('t')) {
      t = top + cy
      h = height - cy
    }
    if (target.classList.contains('r')) {
      w = width + cx
    }
    if (target.classList.contains('b')) {
      h = height + cy
    }
    if (target.classList.contains('l')) {
      l = left + cx
      w = width - cx
    }
  }
  if (l != left || t != top || w != width || h != height) {
    winEL.__positon = { left: l, top: t, width: w, height: h }
    setPosition(winEL)
  }
}

const elMouseUp = () => {
  document.body.removeEventListener('mousemove', elMouseMove)
  document.body.removeEventListener('mouseup', elMouseUp)
  document.body.removeEventListener('mouseleave', elMouseUp)
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

onMounted(async () => {
  await nextTick()
  win.value!.addEventListener('mousedown', elMouseDown)
})
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
