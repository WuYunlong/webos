<template>
  <div ref="workspaceRef" class="os-workspace" @contextmenu.prevent.stop="e => showRightMenu(e)">
    <span ref="selectRef" class="select" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { filter, fromEvent, Subscription } from 'rxjs'
import { showMenu } from './contextmenu'

import type { MenuItem } from './contextmenu/type'

import { openApp } from '@/state/windows'

const workspaceRef = ref<HTMLElement>()
const selectRef = ref<HTMLElement>()
const subscriptions = new Subscription()
let selectFadeTimer: ReturnType<typeof setTimeout> | null = null

function showRightMenu(e: MouseEvent) {
  const items: MenuItem[] = [
    {
      label: '打开文件管理器',
      icon: 'menu_view',
      click: () => {
        openApp('FileManager')
      }
    },
    {
      label: '打开视频播放器',
      icon: 'menu_add',
      click: () => {
        openApp('VideoPlayer')
      }
    },
    {
      type: 'line'
    },
    {
      label: '排序方式',
      icon: 'menu_sort',
      click: () => {
        console.log('排序方式')
      }
    },
    {
      label: '刷新',
      icon: 'menu_refresh',
      click: () => {
        console.log('刷新')
      }
    },
    {
      type: 'line'
    },
    {
      label: '新建',
      icon: 'menu_add',
      click: () => {
        console.log('新建')
      }
    },
    {
      type: 'line'
    },
    {
      label: '显示设置',
      icon: 'menu_show',
      click: () => {
        console.log('显示设置')
      }
    },
    {
      label: '个性化',
      icon: 'menu_person',
      click: () => {
        console.log('个性化')
      }
    },
    {
      type: 'line'
    },
    {
      label: '剪切',
      icon: 'menu_cut',
      click: () => {
        console.log('剪切')
      }
    },
    {
      label: '复制',
      icon: 'menu_copy',
      click: () => {
        console.log('复制')
      }
    },
    {
      label: '粘贴',
      icon: 'menu_paste',
      click: () => {
        console.log('粘贴')
      }
    },
    {
      type: 'line'
    },
    {
      label: '显示更多设置',
      icon: 'menu_more',
      click: () => {
        console.log('显示更多设置')
      }
    }
  ]
  showMenu({ e, items })
}

function mouseMove(e: MouseEvent, info: { clientX: number; clientY: number }) {
  const { clientX, clientY } = e
  const mw = clientX - info.clientX
  const mh = clientY - info.clientY

  const left = mw < 0 ? info.clientX + mw : info.clientX
  const top = mh < 0 ? info.clientY + mh : info.clientY

  selectRef.value!.style.opacity = '1'
  selectRef.value!.style.left = `${left}px`
  selectRef.value!.style.top = `${top}px`
  selectRef.value!.style.width = `${Math.abs(mw)}px`
  selectRef.value!.style.height = `${Math.abs(mh)}px`
}

function mouseDown(e: Event) {
  const { clientX, clientY } = e as MouseEvent
  const info = { clientX, clientY }

  const dragSubscriptions = new Subscription()
  dragSubscriptions.add(fromEvent(document, 'mousemove').subscribe(e => mouseMove(e as MouseEvent, info)))
  dragSubscriptions.add(
    fromEvent(document, 'mouseup').subscribe(() => {
      dragSubscriptions.unsubscribe()
      selectRef.value!.style.transition = 'opacity 0.2s'
      selectRef.value!.style.opacity = '0'
      if (selectFadeTimer) {
        clearTimeout(selectFadeTimer)
      }
      selectFadeTimer = setTimeout(() => {
        selectRef.value!.style.width = '0'
        selectRef.value!.style.height = '0'
        selectRef.value!.style.transition = ''
        selectFadeTimer = null
      }, 200)
    })
  )

  subscriptions.add(dragSubscriptions)
}

onMounted(async () => {
  await nextTick()
  subscriptions.add(
    fromEvent(workspaceRef.value!, 'mousedown')
      .pipe(filter(e => (e as MouseEvent).button === 0 && e.target === workspaceRef.value))
      .subscribe(mouseDown)
  )
})

onBeforeUnmount(() => {
  if (selectFadeTimer) {
    clearTimeout(selectFadeTimer)
  }
  subscriptions.unsubscribe()
})
</script>

<style scoped lang="less">
.os-workspace {
  position: absolute;
  inset: 0;
  z-index: 5;
}

.select {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  box-sizing: border-box;
  background-color: rgba(2, 120, 215, 0.2);
  border: 1px solid rgba(2, 120, 215, 0.8);
  opacity: 0;
}
</style>
