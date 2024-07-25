export interface Box {
  x: number
  y: number
  width: number
  height: number
}
export interface LikeMouseEvent {
  clientX: number
  clientY: number
}

export const inBox = (e: MouseEvent | LikeMouseEvent, box: Box): boolean => {
  const r = { x1: box.x, y1: box.y, x2: box.x + box.width, y2: box.y + box.height }
  const { clientX, clientY } = e
  return clientX > r.x1 && clientX < r.x2 && clientY > r.y1 && clientY < r.y2
}
