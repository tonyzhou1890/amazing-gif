import { AnyFuncType } from '../types'

export default function rAF (callbackQueue: Array<AnyFuncType>) {
  const interval = 1000 / 60
  let timer = 0
  let last = performance.now()
  let now = last
  let lastCall = last
  let timeOffset = 0
  let callOffset = 0
  function c (time: number) {
    if (interval <= time - last) {
      now = time - ((time - last) % interval)
      timeOffset = now - last
      callOffset = time - lastCall
      last = now
      lastCall = time
      callbackQueue.map(callback => {
        callback(time, timeOffset, callOffset)
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
