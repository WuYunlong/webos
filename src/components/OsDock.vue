<template>
  <div class="os-dock">
    <div class="inner">
      <div class="left"></div>
      <div class="center">
        <button class="item">
          <img src="/icon/win.svg" alt="" />
        </button>
        <button class="item">
          <img src="/icon/task.svg" alt="" />
        </button>
        <button class="item">
          <img src="/icon/finder.svg" alt="" />
        </button>
      </div>
      <div class="right"></div>
    </div>
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
  display: flex;
  z-index: 10;
  .left {
    width: 200px;
  }
  .center {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .right {
    width: 200px;
  }
  .item {
    width: 36px;
    height: 36px;
    box-sizing: border-box;
    padding: 2px;
    margin: 0 4px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0);
    transition: all 0.3s;
    user-select: none;
    position: relative;
    border: 0;

    &:before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 10;
    }

    img {
      position: relative;
      width: 100%;
      height: 100%;
      user-select: none;
      will-change: scale;
      transform: scale(1);
      transition: all 0.3s;
      z-index: 0;
    }
    &.active,
    &:hover,
    &:active {
      background-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.02);
    }
    &:active img {
      transform: scale(0.8);
    }
  }
}
</style>
