// https://www.cnblogs.com/jiang08/articles/3171319.html
import { getBits, setBits } from './utils/helpers'

export const GifLZW = {
  /**
   * decode gif buffer
   * @param codeSize
   * @param buf
   * @returns
   */
  decode: (codeSize: number, buf: Uint8Array): Uint8Array => {
    function genTable () {
      return new Array(2 ** codeSize + 2).fill(0).map((_, index) => String.fromCharCode(index))
    }
    let table = genTable()
    const clearCode = 2 ** codeSize
    const endCode = 2 ** codeSize + 1
    let bitLength = codeSize + 1
    let stream = ''
    let decodeStart = true
    const byteLen = buf.length
    let byteIdx = 0
    let bitIdx = 0
    let requiredBits = bitLength
    let code = 0
    let k = ''
    let oldCode = 0
    while (byteIdx < byteLen) {
      requiredBits = bitLength
      code = 0
      // read code
      while (requiredBits !== 0) {
        if (8 - bitIdx >= requiredBits) {
          code += getBits(buf[byteIdx], bitIdx, requiredBits) << (bitLength - requiredBits)
          bitIdx += requiredBits
          requiredBits = 0
        } else {
          code += getBits(buf[byteIdx], bitIdx, 8 - bitIdx) << (bitLength - requiredBits)
          requiredBits -= 8 - bitIdx
          bitIdx = 8
        }
        // overflow
        if (bitIdx === 8) {
          byteIdx++
          bitIdx = 0
          if (byteIdx >= byteLen) break
        }
      }

      if (code === endCode) break
      // code is clear code, reset table and others
      if (code === clearCode) {
        table = genTable()
        bitLength = codeSize + 1
        decodeStart = true
        continue
      }
      // if code exists in table, append code to stream
      if (table[code] !== undefined) {
        // first code
        if (decodeStart) {
          stream += table[code]
          oldCode = code
          decodeStart = false
        } else {
          stream += table[code]
          k = table[code][0]
          table.push(table[oldCode] + k)
          oldCode = code
        }
      } else {
        // if not
        // console.log(table, code, oldCode)
        if (table[oldCode] === undefined) {
          console.log(oldCode, stream.length)
        }
        k = table[oldCode][0]
        stream += table[oldCode] + k
        table.push(table[oldCode] + k)
        oldCode = code
      }
      // check cap of table
      if (table.length >= 2 ** bitLength) {
        if (bitLength < 12) {
          bitLength++
        }
      }
    }
    const res = new Uint8Array(stream.length)
    for (let i = 0; i < stream.length; i++) {
      res[i] = stream.charCodeAt(i)
    }

    return res
  },

  /**
   * encode gif color indices buffer
   * @param codeSize
   * @param buf
   */
  encode: (codeSize: number, buf: Uint8Array): Uint8Array => {
    // generate original code table
    function genTable () {
      const t = new Map()
      new Array(2 ** codeSize).fill(0).map((_, index) => {
        t.set(String.fromCharCode(index), index)
      })
      return t
    }

    // write to buf
    function write (code: number) {
      let requiredBits = bitLength
      // if stream may not enough, expand stream
      if (byteIdx + 2 >= stream.length) {
        const newStream = new Uint8Array(stream.length + 256)
        newStream.set(stream)
        stream = newStream
      }
      while (requiredBits) {
        if (8 - bitIdx >= requiredBits) {
          stream[byteIdx] = setBits(stream[byteIdx], bitIdx, requiredBits, code)
          bitIdx += requiredBits
          requiredBits = 0
        } else {
          stream[byteIdx] = setBits(stream[byteIdx], bitIdx, 8 - bitIdx, code)
          code = code >> (8 - bitIdx)
          requiredBits -= 8 - bitIdx
          bitIdx = 8
        }
        if (bitIdx === 8) {
          bitIdx = 0
          byteIdx++
        }
      }
    }

    let table = genTable()
    const clearCode = 2 ** codeSize
    const endCode = 2 ** codeSize + 1
    let tableLength = 2 ** codeSize + 2
    let bitLength = codeSize + 1
    let curBitMaxTableLength = 2 ** bitLength
    // this will affect the size of the compressed buf
    // 4093 is more efficent in the example pic 'cat1.gif'
    // let maxTableLength = 2 ** 12
    const maxTableLength = 4093
    let stream = new Uint8Array(256)
    let byteIdx = 0
    let bitIdx = 0
    let p = ''
    let c = ''
    // first code in data stream must be clear code
    write(clearCode)

    for (let i = 0, len = buf.length; i < len; i++) {
      c = String.fromCharCode(buf[i])
      if (table.has(p + c)) {
        p = p + c
      } else {
        write(table.get(p))

        if (tableLength === maxTableLength) {
          write(clearCode)
          // reset code table and bitLength
          table = genTable()
          tableLength = 2 ** codeSize + 2
          bitLength = codeSize + 1
          curBitMaxTableLength = 2 ** bitLength
        } else if (tableLength === curBitMaxTableLength) {
          bitLength++
          curBitMaxTableLength = 2 ** bitLength
          table.set(p + c, tableLength++)
        } else {
          table.set(p + c, tableLength++)
        }

        p = c
        c = ''
      }
    }
    if (p) {
      write(table.get(p))
    }

    write(endCode)

    let final = null
    if (bitIdx) {
      final = stream.slice(0, byteIdx + 1)
    } else {
      final = stream.slice(0, byteIdx)
    }

    return final
  },
}
