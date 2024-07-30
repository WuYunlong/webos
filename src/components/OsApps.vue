<template>
  <div ref="appsRef" class="os-apps" @contextmenu.prevent.stop="(e) => showRightMenu(e)">
    <span ref="selectRef" class="select" />
    <WinSplit ref="winSplitRef" />
    <OsWindow v-for="(item, index) in list" :key="index" ref="apps" :index>
      <component :is="item" />
    </OsWindow>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, provide, ref } from 'vue'
import { filter, fromEvent } from 'rxjs'
import { showMenu } from './contextmenu'

import type { MenuItem } from './contextmenu/type'

import OsWindow from './OsWindow.vue'
import WinSplit from './widget/WinSplit.vue'
import type { MoveRes } from '@/utils'
import { bindMouseMove } from '@/utils'

const list = ref<string[]>([])
const app = ref()
const apps = ref([])
const appsRef = ref<HTMLElement>()
const selectRef = ref<HTMLElement>()
const winSplitRef = ref()

// 右键菜单
function showRightMenu(e: MouseEvent) {
  const items: MenuItem[] = [
    {
      label: '查看',
      icon: 'finder_view',
      click: () => {
        list.value.push('FileManager')
      }
    },
    {
      label: '排序方式',
      icon: 'finder_sorting',
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
      icon: 'finder_add',
      click: () => {
        console.log('新建')
      }
    },
    {
      label: '剪切',
      icon: 'finder_cut',
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

// 窗口分割
let timer: number
function inSplitBox() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => app.value.setWinThumb(), 17)
}
function outSplitBox() {
  if (timer) {
    clearTimeout(timer)
  }
  app.value.setWinUnthumb()
}
provide('inSplitBox', inSplitBox)
provide('outSplitBox', outSplitBox)

// 窗口移动中
function winSelect(index: number) {
  app.value = apps.value[index]
}
function winMove(e: MouseEvent) {
  winSplitRef.value.checkMouseMove(e)
}
function winMoveEnd() {
  winSplitRef.value.reset()
  app.value.setWinUnthumb()
}
provide('winSelect', winSelect)
provide('winMove', winMove)
provide('winMoveEnd', winMoveEnd)

function mouseMove(e: MouseEvent, info: { clientX: number, clientY: number }) {
  const { clientX, clientY } = e as MouseEvent
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

  const moveSub = fromEvent(document, 'mousemove').subscribe(e => mouseMove(e, info))
  const upSub = fromEvent(document, 'mouseup').subscribe(() => {
    moveSub.unsubscribe()
    upSub.unsubscribe()
    selectRef.value!.style.transition = 'opacity 0.2s'
    selectRef.value!.style.opacity = '0'
    setTimeout(() => {
      selectRef.value!.style.width = '0'
      selectRef.value!.style.height = '0'
      selectRef.value!.style.transition = ''
    }, 200)
  })
}

onMounted(async () => {
  await nextTick()
  fromEvent(appsRef.value!, 'mousedown')
    .pipe(filter(e => e.button === 0 && e.target === appsRef.value))
    .subscribe(mouseDown)
})
// getAllWindows 获取所有窗口
// getFocusedWindow 获取当前窗口
// fromId 根据ID获取实例
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
  background-color: rgba(2, 120, 215, 0.2);
  border: 1px solid rgba(2, 120, 215, 0.8);
  opacity: 0;
}
.win-drap {
  height: 88px;
  position: absolute;
  left: 50%;
  top: 24px;
  transform: translate3d(-50%, 50%, 0);
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
    .h.active,
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
.win-tips-wrap {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 48px;
}
.win-tips {
  position: absolute;
  .inner {
    position: absolute;
    inset: 8px;
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 8px;
  }
}
.icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
