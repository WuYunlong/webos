<template>
  <div class="os-dock">
    <div class="inner"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.os-dock {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  z-index: 20;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }
}
.inner {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
