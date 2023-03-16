import { AnyFuncType } from './types'

export default function rAF (callbackQueue: Array<AnyFuncType>) {
  const now = performance.now()
  const interval = 1000 / 60
  let timer = 0
  let last = now
  function c (time: number) {
    if (interval <= time - last) {
      last = time - ((time - last) % interval)
      callbackQueue.map(callback => {
        callback(time)
      })
    }
    timer = window.requestAnimationFrame(c)
  }
  timer = window.requestAnimationFrame(c)
  return {
    cancel () {
      if (timer) {
        window.cancelAnimationFrame(timer)
      }
    },
  }
}
