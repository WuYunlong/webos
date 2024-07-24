<template>
  <div class="os-desktop">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.os-desktop {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
