<template>
  <div ref="splitRef" class="win-split-wrap" :class="{ tip, show }">
    <div class="win-split">
      <div class="item">
        <span class="s _01"></span>
        <span class="s _02"></span>
      </div>
      <div class="item">
        <span class="s _03"></span>
        <span class="s _04"></span>
      </div>
      <div class="item">
        <span class="s _01"></span>
        <span class="s _05"></span>
        <span class="s _06"></span>
      </div>
      <div class="item">
        <span class="s _07"></span>
        <span class="s _08"></span>
        <span class="s _05"></span>
        <span class="s _06"></span>
      </div>
      <div class="item">
        <span class="s _09"></span>
        <span class="s _10"></span>
        <span class="s _11"></span>
      </div>
      <div class="item">
        <span class="s _12"></span>
        <span class="s _13"></span>
        <span class="s _14"></span>
      </div>
    </div>
  </div>
  <div class="win-split-placeholder" ref="tipsWrapRef" v-show="show && scale">
    <div class="placeholder" ref="tipsRef"><span class="inner"></span></div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, inject } from 'vue'
import { inBox } from '@/utils'

const inSplitBox = inject<Function>('inSplitBox')
const outSplitBox = inject<Function>('outSplitBox')

const tip = ref(false)
const show = ref(false)
const scale = ref(false)
const splitRef = ref<HTMLElement>()
const tipsWrapRef = ref<HTMLElement>()
const tipsRef = ref<HTMLElement>()

// 鼠标位置检测
let nowInBoxName = ''
const posArr = [
  [],
  [0, 0, 50, 100],
  [50, 0, 50, 100],
  [0, 0, 66.666, 100],
  [66.666, 0, 33.333, 100],
  [50, 0, 50, 50],
  [50, 50, 50, 50],
  [0, 0, 50, 50],
  [0, 50, 50, 50],
  [0, 0, 33.333, 100],
  [33.333, 0, 33.333, 100],
  [66.666, 0, 33.333, 100],
  [0, 0, 25, 100],
  [25, 0, 50, 100],
  [75, 0, 25, 100]
]
const setPlaceHolder = (name: string) => {
  const index = parseInt(name.replace('_', ''), 10)
  const pos = posArr[index]

  const { width, height } = tipsWrapRef.value!.getBoundingClientRect()

  // tipsRef.value!.style.left = `${(pos[0] / 100) * width}px`
  // tipsRef.value!.style.top = `${(pos[1] / 100) * height}px`
  tipsRef.value!.style.transform = `translate3d(${(pos[0] / 100) * width}px, ${(pos[1] / 100) * height}px, 0)`
  tipsRef.value!.style.width = `${pos[2]}%`
  tipsRef.value!.style.height = `${pos[3]}%`
}

const checkMouseMove = (e: MouseEvent) => {
  tip.value = e.clientY < 400
  show.value = inBox(e, splitRef.value!.getBoundingClientRect())
  scale.value = show.value && e.clientY > 24

  for (const item of items) {
    const el = item as HTMLElement
    if (inBox(e, el.getBoundingClientRect())) {
      el.classList.add('selected')
      if (nowInBoxName !== el.classList[1]) {
        nowInBoxName = el.classList[1]
        setPlaceHolder(nowInBoxName)
      }
    } else {
      el.classList.remove('selected')
    }
  }
}

const reset = () => {
  tip.value = false
  show.value = false
}

watch(
  () => scale.value,
  (v) => {
    v ? inSplitBox && inSplitBox() : outSplitBox && outSplitBox()
  }
)

defineExpose({ checkMouseMove, reset })

let items: HTMLCollectionOf<Element> = document.getElementsByClassName('s')
onMounted(async () => {
  await nextTick()
  items = splitRef.value!.getElementsByClassName('s')
})
</script>

<style scoped lang="scss">
.win-split-wrap {
  position: absolute;
  left: 50%;
  padding-top: 24px;
  transform: translate3d(-50%, -150px, 0);
  transition: transform 0.2s;
  z-index: 10000;

  &.tip {
    transform: translate3d(-50%, -100px, 0);
  }

  &.show,
  &.tip.show {
    transform: translate3d(-50%, 0, 0);
  }
}

.win-split {
  position: relative;
  padding: 12px;
  box-sizing: border-box;
  z-index: 10;
  border-radius: 8px;
  border: 1px solid #a6b1b9;
  background-color: #f1f5f7;
  // backdrop-filter: blur(20px);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.05);

  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
}

$radiusSize: 5px;
$bgColor: #d6d8d9;
$borderColor: #858788;
$hoverBorderColor: #0067c0;
$hoverBgColor: #0067c0;

.item {
  width: 98px;
  height: 62px;
  background-color: #eee;
  display: inline-flex;
  margin-left: 12px;
  position: relative;

  &:first-child {
    margin-left: 0;
  }

  .s {
    display: block;
    position: absolute;
    box-sizing: border-box;
    background-color: $bgColor;
    border: 1px solid $borderColor;
  }
  .s.selected,
  .s:hover {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $hoverBgColor;
    border-color: $hoverBorderColor;
  }
}

._01 {
  width: 47px;
  height: 62px;
  left: 0;
  top: 0;
  border-radius: $radiusSize 0 0 $radiusSize;
}
._02 {
  width: 47px;
  height: 62px;
  top: 0;
  right: 0;
  border-radius: 0 $radiusSize $radiusSize 0;
}
._03 {
  width: 57px;
  height: 62px;
  left: 0;
  top: 0;
  border-radius: $radiusSize 0 0 $radiusSize;
}
._04 {
  width: 37px;
  height: 62px;
  top: 0;
  right: 0;
  border-radius: 0 $radiusSize $radiusSize 0;
}
._05 {
  width: 47px;
  height: 29px;
  top: 0;
  right: 0;
  border-top-right-radius: $radiusSize;
}
._06 {
  width: 47px;
  height: 29px;
  bottom: 0;
  right: 0;
  border-bottom-right-radius: $radiusSize;
}
._07 {
  width: 47px;
  height: 29px;
  left: 0;
  top: 0;
  border-top-left-radius: $radiusSize;
}
._08 {
  width: 47px;
  height: 29px;
  left: 0;
  bottom: 0;
  border-bottom-left-radius: $radiusSize;
}
._09 {
  top: 0;
  left: 0;
  height: 62px;
  width: 30px;
  border-radius: $radiusSize 0 0 $radiusSize;
}
._10 {
  top: 0;
  left: 34px;
  height: 62px;
  width: 30px;
}
._11 {
  top: 0;
  right: 0;
  height: 62px;
  width: 30px;
  border-radius: 0 $radiusSize $radiusSize 0;
}
._12 {
  top: 0;
  left: 0;
  height: 62px;
  width: 25px;
  border-radius: $radiusSize 0 0 $radiusSize;
}
._13 {
  top: 0;
  left: 29px;
  width: 40px;
  height: 62px;
}
._14 {
  top: 0;
  right: 0;
  height: 62px;
  width: 25px;
  border-radius: 0 $radiusSize $radiusSize 0;
}

.win-split-placeholder {
  position: absolute;
  inset: 0 0 48px 0;

  .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    transition: transform 0.2s;
  }

  .inner {
    position: absolute;
    inset: 8px;
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  }
}
</style>
