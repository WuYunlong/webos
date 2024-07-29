<template>
  <div class="os-app">
    <div class="head">
      <slot name="head" />
    </div>
    <div class="body">
      <div class="side">
        <slot name="side" />
      </div>
      <div class="main">
        <slot />
      </div>
    </div>
    <div class="foot">
      <slot name="foot" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.os-app {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
}
.body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
}
.main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
</style>
