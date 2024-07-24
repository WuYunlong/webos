<template>
  <div ref="el" class="os-apps" @contextmenu.prevent.stop="(e) => showRightMenu(e)">
    <os-window :move-bar="moveBar">
      <div style="width: 100%; height: 40px; background-color: #f00" ref="moveBar"></div>
    </os-window>
    <span ref="select" class="select"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { showMenu } from './contextmenu'
import type { MenuItem } from './contextmenu/type'

import OsWindow from './OsWindow.vue'

const el = ref<EL>()
const select = ref<EL>()

const moveBar = ref<EL>()

const elMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) {
    return
  }
  el.value!.__mouseDown = e
  document.addEventListener('mousemove', elMouseMove)
  document.addEventListener('mouseup', elMouseUp)
}

const elMouseMove = (e: MouseEvent) => {
  const { clientX, clientY } = el.value!.__mouseDown
  let w = e.clientX - clientX
  let h = e.clientY - clientY

  if (Math.abs(w) < 3 || Math.abs(h) < 3) {
    return
  }

  let left = clientX
  let top = clientY
  if (w < 0) {
    left = clientX + w
  }
  if (h < 0) {
    top = clientY + h
  }
  w = Math.abs(w)
  h = Math.abs(h)
  select.value!.style.opacity = '1'
  select.value!.style.left = `${left}px`
  select.value!.style.top = `${top}px`
  select.value!.style.width = `${w}px`
  select.value!.style.height = `${h}px`
}

const elMouseUp = () => {
  select.value!.style.transition = 'opacity 0.2s'
  select.value!.style.opacity = '0'
  setTimeout(() => {
    select.value!.style.transition = ''
  }, 200)
  document.removeEventListener('mousemove', elMouseMove)
  document.removeEventListener('mouseup', elMouseUp)
}

const showRightMenu = (e: MouseEvent) => {
  console.log('2222222')
  const items: MenuItem[] = [
    {
      label: '查看',
      icon: '',
      click: () => {
        console.log('查看')
      }
    },
    {
      label: '排序方式',
      icon: '',
      click: () => {
        console.log('排序方式')
      }
    },
    {
      label: '刷新',
      icon: 'refresh_2_fill',
      click: () => {
        console.log('刷新')
      }
    },
    {
      type: 'line'
    },
    {
      label: '新建',
      icon: '',
      click: () => {
        console.log('新建')
      }
    },
    {
      label: '剪切',
      icon: '',
      click: () => {
        console.log('剪切')
      }
    },
    {
      label: '复制',
      icon: '',
      click: () => {
        console.log('复制')
      }
    },
    {
      label: '粘贴',
      icon: '',
      click: () => {
        console.log('粘贴')
      }
    }
  ]
  showMenu({ e, items })
}

onMounted(async () => {
  await nextTick()
  el.value!.addEventListener('mousedown', elMouseDown)
})
</script>

<style scoped lang="scss">
.os-apps {
  position: absolute;
  inset: 0;
  z-index: 10;
}
.select {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 0;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 200%;
    height: 200%;
    box-sizing: border-box;
    border: 1px solid rgba(22, 93, 255, 0.3);
    transform-origin: 0 0;
    transform: scale(0.5);
  }
}
</style>
