import { StringKeyObjType } from './types'
import { GifLZW } from './lzw'

const utils: StringKeyObjType = {
  gifLzwDecode: GifLZW.decode,
  gifLzwEncode: GifLZW.encode,
}

onmessage = e => {
  const { action, param, _sign } = e.data
  if (typeof utils[action] === 'function') {
    const res = {
      action,
      result: utils[action](...(param ?? [])),
      _sign,
    }
    postMessage(res)
  } else {
    console.log('指定操作不存在')
  }
}
