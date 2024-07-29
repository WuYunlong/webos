<template>
  <span class="s stl t l" />
  <span class="s st t" />
  <span class="s str t r" />
  <span class="s sr r" />
  <span class="s sbr b r" />
  <span class="s sb b" />
  <span class="s sbl b l" />
  <span class="s sl l" />
</template>

<style scoped lang="scss">
$size: 8px;
$sizeHalf: 4px;
.s {
  display: block;
  position: absolute;
}
.stl,
.str,
.sbl,
.sbr {
  width: $size;
  height: $size;
}
.stl {
  top: -$sizeHalf;
  left: -$sizeHalf;
  cursor: nwse-resize;
}
.str {
  top: -$sizeHalf;
  right: -$sizeHalf;
  cursor: nesw-resize;
}
.sbl {
  bottom: -$sizeHalf;
  left: -$sizeHalf;
  cursor: nesw-resize;
}
.sbr {
  bottom: -$sizeHalf;
  right: -$sizeHalf;
  cursor: nwse-resize;
}
.st {
  top: -$sizeHalf;
  height: $size;
  left: $sizeHalf;
  right: $sizeHalf;
  cursor: ns-resize;
}
.sr {
  top: $sizeHalf;
  right: -$sizeHalf;
  bottom: $sizeHalf;
  width: $size;
  cursor: ew-resize;
}
.sb {
  bottom: -$sizeHalf;
  height: $size;
  left: $sizeHalf;
  right: $sizeHalf;
  cursor: ns-resize;
}
.sl {
  top: $sizeHalf;
  left: -$sizeHalf;
  bottom: $sizeHalf;
  width: $size;
  cursor: ew-resize;
}
</style>
