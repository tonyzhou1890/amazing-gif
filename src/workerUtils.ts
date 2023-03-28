import { StringKeyObjType } from './types'
import { GifLZW } from './lzw'
import { colorTransform, replaceRepetedIndices } from './utils/image'

const utils: StringKeyObjType = {
  gifLzwDecode: GifLZW.decode,
  gifLzwEncode: GifLZW.encode,
  colorTransform,
  replaceRepetedIndices,
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
