<template>
  <div class="os-wallpaper">
    <div class="inner">
      <div class="img-wallpaper">
        <img :src :alt />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const src = ref('/wallpaper/001/light.jpg')
const alt = ref('')
</script>

<style scoped lang="scss">
.os-wallpaper {
  position: absolute;
  inset: 0;
  z-index: 0;
  user-select: none;
}
.inner {
  position: relative;
  width: 100%;
  height: 100%;
}
.img-wallpaper {
  position: absolute;
  inset: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
