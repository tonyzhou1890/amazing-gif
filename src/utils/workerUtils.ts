import { StringKeyObjType } from '../types'
import { GifLZW } from './lzw'
import { colorTransform, replaceRepeatedIndices } from './image'

const utils: StringKeyObjType = {
  gifLzwDecode: GifLZW.decode,
  gifLzwEncode: GifLZW.encode,
  colorTransform,
  replaceRepeatedIndices,
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
    console.log(`action ${action} not found`)
  }
}
