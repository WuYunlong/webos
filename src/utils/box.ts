export interface Box {
  left: number
  top: number
  width: number
  height: number
}

export interface LikeMouseEvent {
  clientX: number
  clientY: number
}

export const inBox = (e: MouseEvent | LikeMouseEvent, box: Box): boolean => {
  const r = { x1: box.left, y1: box.top, x2: box.left + box.width, y2: box.top + box.height }
  const { clientX, clientY } = e
  return clientX > r.x1 && clientX < r.x2 && clientY > r.y1 && clientY < r.y2
}
