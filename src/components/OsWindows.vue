<template>
  <div class="os-window-manager">
    <WinSplit ref="winSplitRef" />
    <OsWindow v-for="(item, index) in windows" :key="item.id" ref="apps" :index :window-item="item">
      <component :is="item.appId" />
    </OsWindow>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { fromEvent, Subscription } from 'rxjs'

import type { ComponentPublicInstance } from 'vue'

import OsWindow from './OsWindow.vue'
import WinSplit from './widget/WinSplit.vue'
import {
  activeWindowId,
  closeWindow,
  focusWindow,
  getWindowById,
  minimizeWindow,
  toggleFullscreenWindow,
  toggleMaximizeWindow,
  windows
} from '@/state/windows'

interface WindowInstance extends ComponentPublicInstance {
  setWinThumb: () => void
  setWinUnthumb: () => void
}

const app = ref<WindowInstance>()
const apps = ref<WindowInstance[]>([])
const winSplitRef = ref<InstanceType<typeof WinSplit>>()
const subscriptions = new Subscription()

let timer: number

function inSplitBox() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = window.setTimeout(() => app.value?.setWinThumb(), 17)
}

function outSplitBox() {
  if (timer) {
    clearTimeout(timer)
  }
  app.value?.setWinUnthumb()
}

function winSelect(windowId: number, index: number) {
  app.value = apps.value[index]
  focusWindow(windowId)
}

function winMove(e: MouseEvent) {
  winSplitRef.value?.checkMouseMove(e)
}

function winMoveEnd() {
  winSplitRef.value?.reset()
  app.value?.setWinUnthumb()
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key !== 'F11' || activeWindowId.value === null) {
    return
  }

  e.preventDefault()
  const activeWindow = getWindowById(activeWindowId.value)
  activeWindow?.setFullScreen(!activeWindow.isFullScreen())
}

provide('inSplitBox', inSplitBox)
provide('outSplitBox', outSplitBox)
provide('winSelect', winSelect)
provide('winMove', winMove)
provide('winMoveEnd', winMoveEnd)
provide('closeWindow', closeWindow)
provide('minimizeWindow', minimizeWindow)
provide('toggleMaximizeWindow', toggleMaximizeWindow)
provide('toggleFullscreenWindow', toggleFullscreenWindow)

onMounted(() => {
  subscriptions.add(fromEvent(document, 'keydown').subscribe(e => handleKeyDown(e as KeyboardEvent)))
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
  subscriptions.unsubscribe()
})
</script>

<style scoped lang="less">
.os-window-manager {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
</style>
