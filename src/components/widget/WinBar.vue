<template>
  <div class="win-bar">
    <button class="bar-item">
      <OsIcon name="win_bar_min" />
    </button>
    <button
      class="bar-item"
      :class="{ show: subMenuShow }"
      @mouseenter="mouseEnter"
      @mouseleave="mouseLeave"
    >
      <OsIcon name="win_bar_max" />
      <div class="bar-tips" />
    </button>
    <button class="bar-item bar-item-close">
      <OsIcon name="win_bar_close" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import OsIcon from '../OsIcon.vue'

let timer: number
const subMenuShow = ref(false)
function mouseEnter() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    subMenuShow.value = true
  }, 1000)
}
function mouseLeave() {
  if (timer) {
    clearTimeout(timer)
  }
  subMenuShow.value = false
}
</script>

<style scoped lang="scss">
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
    font-size: 10px;
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
