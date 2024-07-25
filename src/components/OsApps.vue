<template>
  <div ref="el" class="os-apps" @contextmenu.prevent.stop="(e) => showRightMenu(e)">
    <div class="win-drap">
      <div class="item item-1-1">
        <span class="_01 lt lb h"></span>
        <span class="_02 rt rb h"></span>
      </div>
      <div class="item item-3-1">
        <span class="_01 lt lb h"></span>
        <span class="_02 rt rb h"></span>
      </div>
      <div class="item item-1-11">
        <span class="_01 lt lb h"></span>
        <span class="_02">
          <span class="_03 rt h"></span>
          <span class="_04 rb h"></span>
        </span>
      </div>
      <div class="item item-11-11">
        <span class="_01">
          <span class="_03 lt h"></span>
          <span class="_04 lb h"></span>
        </span>
        <span class="_02">
          <span class="_05 rt h"></span>
          <span class="_06 rb h"></span>
        </span>
      </div>
      <div class="item item-1-1-1">
        <span class="_01 lt lb h"></span>
        <span class="_02 h"></span>
        <span class="_03 rt rb h"></span>
      </div>
      <div class="item item-1-2-1">
        <span class="_01 lt lb h"></span>
        <span class="_02 h"></span>
        <span class="_03 rt rb h"></span>
      </div>
    </div>
    <div class="win-tips">
      <div class="inner"></div>
    </div>
    <os-window :moveBar @move="winMove">
      <div style="width: 100%; height: 48px; background-color: #fff" ref="moveBar"></div>
    </os-window>
    <span ref="select" class="select"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { showMenu } from './contextmenu'
import type { MenuItem } from './contextmenu/type'

import OsWindow from './OsWindow.vue'

interface EL extends HTMLElement {
  __mouseDown: MouseEvent
  __rect: DOMRect
}

const el = ref<EL>()
const select = ref<EL>()

const moveBar = ref<HTMLElement>()

const elMouseDown = (e: MouseEvent) => {
  if (e.button !== 0 || e.target !== el.value) {
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

// 窗口移动中
const winMove = (e: MouseEvent) => {
  console.log(e.clientX, e.clientY)
}
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
.win-drap {
  height: 88px;
  position: absolute;
  left: 50%;
  top: 24px;
  transform: translate3d(-50%, 0, 0);
  background-color: #f1f5f7;
  backdrop-filter: blur(20px);
  box-sizing: border-box;
  z-index: 100;
  border-radius: 8px;
  border: 1px solid #a6b1b9;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.05);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  $bgColor: #d6d8d9;
  $radiusSize: 5px;
  $borderColor: #858788;
  $hoverBorderColor: #0067c0;
  $hoverBgColor: #0067c0;

  .item {
    width: 98px;
    height: 62px;
    background-color: #eee;
    display: inline-flex;
    margin-left: 12px;
    align-items: center;
    justify-content: space-between;
    &:first-child {
      margin-left: 0;
    }
    span {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .lt {
      border-top-left-radius: $radiusSize;
    }
    .lb {
      border-bottom-left-radius: $radiusSize;
    }
    .rt {
      border-top-right-radius: $radiusSize;
    }
    .rb {
      border-bottom-right-radius: $radiusSize;
    }
    .h:hover {
      background-color: $hoverBgColor;
      border-color: $hoverBorderColor;
    }
  }
  .item-1-1 {
    span._01,
    span._02 {
      width: 47px;
      height: 62px;
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
  }
  .item-3-1 {
    span._01,
    span._02 {
      width: 57px;
      height: 62px;
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
    span._02 {
      width: 37px;
    }
  }
  .item-1-11 {
    span._01,
    span._02 {
      width: 47px;
      height: 62px;
    }
    span._01,
    span._03,
    span._04 {
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
    span._03,
    span._04 {
      height: 29px;
      width: 100%;
    }
  }
  .item-11-11 {
    span._01,
    span._02 {
      width: 47px;
      height: 62px;
    }
    span._03,
    span._04,
    span._05,
    span._06 {
      height: 29px;
      width: 100%;
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
  }
  .item-1-1-1 {
    span._01,
    span._02,
    span._03 {
      width: 30px;
      height: 62px;
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
  }
  .item-1-2-1 {
    span._01,
    span._02,
    span._03 {
      width: 25px;
      height: 62px;
      background-color: $bgColor;
      border: 1px solid $borderColor;
    }
    span._02 {
      width: 40px;
    }
  }
}
.win-tips {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  bottom: 48px;
  .inner {
    position: absolute;
    inset: 8px;
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 8px;
  }
}
</style>
