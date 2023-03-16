import Worker from 'web-worker:./workerUtils.ts'
import { WorkerJobType, WorkerJobWrapType } from './types'

const workerNum = Math.max(window.navigator.hardwareConcurrency - 1, 1) // 线程数量
const quene = new Map()
const waiting: Array<WorkerJobWrapType> = []
const workers = new Array(workerNum).fill(null).map((_, index) => {
  return {
    index,
    worker: new Worker(),
    idle: true, // 是否空闲
  }
})

workers.map(item => {
  item.worker.addEventListener('message', e => {
    if (!e.data || !e.data._sign) {
      console.error('worker 返回数据错误')
      quene.get(e.data._sign).reject('worker 返回数据错误')
    } else {
      quene.get(e.data._sign).resolve(e.data.result)
      quene.delete(e.data._sign)
      item.idle = true
      // 尝试接受新任务
      assignJob()
    }
  })
})

/**
 * 将等待队列中的任务加入空闲线程
 */
function assignJob () {
  let idleWorker = null
  let waitingJob = null
  if (waiting.length) {
    idleWorker = workers.find(item => item.idle)
    if (idleWorker) {
      idleWorker.idle = false
      waitingJob = waiting.shift() as WorkerJobWrapType
      quene.set(waitingJob._sign, waitingJob.p)

      idleWorker.worker.postMessage(
        {
          ...waitingJob.job,
          _sign: waitingJob._sign,
        },
        waitingJob.job.transferable || []
      )
    }
  }
}

/**
 * @param job {
 *  action: '',
 *  param: [],
 * }
 */
export default (job: WorkerJobType) => {
  return new Promise((resolve, reject) => {
    const _sign = Date.now() * Math.random()
    waiting.push({
      _sign,
      job,
      p: { resolve, reject },
    })
    // 分配线程
    assignJob()
  })
}
