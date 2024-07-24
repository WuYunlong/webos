<template>
  <div class="os-window" :style ref="win">
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
    <span class="s t l"></span>
    <span class="s t"></span>
    <span class="s t r"></span>
    <span class="s r"></span>
    <span class="s b r"></span>
    <span class="s b"></span>
    <span class="s b l"></span>
    <span class="s l"></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import type { PropType } from 'vue'
const props = defineProps({
  width: { type: Number, default: 800 },
  height: { type: Number, default: 600 },
  top: { type: Number, default: 50 },
  left: { type: Number, default: 50 },
  zIndex: { type: Number, default: 10 },
  moveBar: { type: Object as PropType<EL | undefined>, default: undefined }
})

const style = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    top: `${props.top}px`,
    left: `${props.left}px`,
    zIndex: props.zIndex
  }
})

const win = ref<EL>()

const elMouseDown = (e: MouseEvent) => {
  const winEl = win.value!
  winEl.__rect = win.value!.getBoundingClientRect()
  winEl.__mouseDown = e

  document.body.addEventListener('mousemove', elMouseMove)
  document.body.addEventListener('mouseup', elMouseUp)
}

const setPosition = (el: EL) => {
  el.style.top = el.__positon.top + 'px'
  el.style.left = el.__positon.left + 'px'
}

const elMouseMove = (e: MouseEvent) => {
  e.stopPropagation()
  const { clientX, clientY } = e
  const winEL = win.value!
  const { left, top, width, height } = winEL.__rect
  let l = left + (clientX - winEL.__mouseDown.clientX)
  let t = top + (clientY - winEL.__mouseDown.clientY)
  winEL.__positon = { left: l, top: t, width, height }
  setPosition(winEL)
}

const elMouseUp = () => {
  const { left, top, width, height } = win.value!.__positon
  console.log(left, top, width, height)
  document.body.removeEventListener('mousemove', elMouseMove)
  document.body.removeEventListener('mouseup', elMouseUp)
}

const initEvent = () => {
  if (props.moveBar) {
    props.moveBar.addEventListener('mousedown', elMouseDown)
  }
}
onMounted(async () => {
  await nextTick()
  initEvent()
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
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  overflow: hidden;
}
</style>
