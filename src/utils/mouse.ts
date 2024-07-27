interface Point {
  x: number
  y: number
}
export interface MoveRes {
  start: Point
  end: Point
  move: Point
}

export const bindMouseMove = (
  el: HTMLElement,
  move: (res: MoveRes, e?: MouseEvent) => void,
  down: (e: MouseEvent) => boolean = () => true,
  up: () => void = () => {}
) => {
  let downClientX = 0
  let downClientY = 0
  const onMouseDown = (e: MouseEvent) => {
    if (typeof down === 'function') {
      if (!down(e)) {
        return
      }
    }
    downClientX = e.clientX
    downClientY = e.clientY
    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const res = {
      start: { x: downClientX, y: downClientY },
      end: { x: clientX, y: clientY },
      move: { x: clientX - downClientX, y: clientY - downClientY }
    }
    move(res, e)
  }

  const onMouseUp = () => {
    typeof up === 'function' && up()
    document.body.removeEventListener('mousemove', onMouseMove)
    document.body.removeEventListener('mouseup', onMouseUp)
  }

  el.addEventListener('mousedown', onMouseDown)
}
