export default function rAF(callbackQueue: Array<Function>) {
  const now = performance.now()
  let interval = 1000 / 60
  let timer = 0
  let last = now
  function c(time: number) {
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
    cancel() {
      if (timer) {
        window.cancelAnimationFrame(timer)
      }
    }
  }
}