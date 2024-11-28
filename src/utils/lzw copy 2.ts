// https://www.cnblogs.com/jiang08/articles/3171319.html
import { bufferGrow, getBits, setBits } from './helpers'

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
    const encodeStart = performance.now()
    // generate original code table
    function genTable () {
      const t = new StringTable()
      new Array(2 ** codeSize).fill(0).map((_, index) => {
        t.set(new CharArray(index), index)
      })
      return t
    }

    // write to buf
    function write (code: number) {
      let requiredBits = bitLength
      // if stream may not enough, expand stream
      if (byteIdx + 2 >= stream.length) {
        const newStream = new Uint8Array(stream.length + 4096)
        newStream.set(stream)
        stream = newStream
      }
      while (requiredBits) {
        if (8 - bitIdx >= requiredBits) {
          // stream[byteIdx] = ((((1 << requiredBits) - 1) & code) << bitIdx) | stream[byteIdx]
          stream[byteIdx] = setBits(stream[byteIdx], bitIdx, requiredBits, code)
          bitIdx += requiredBits
          requiredBits = 0
        } else {
          // stream[byteIdx] = ((((1 << 8 - bitIdx) - 1) & code) << bitIdx) | stream[byteIdx]
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
    let stream = new Uint8Array(4096)
    let byteIdx = 0
    let bitIdx = 0
    let p = new CharArray()
    let pc = new CharArray()
    // first code in data stream must be clear code
    write(clearCode)

    for (let i = 0, len = buf.length; i < len; i++) {
      pc = p.clone().push(buf[i])
      if (table.has(pc)) {
        p = pc
      } else {
        write(table.get(p)!)

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
          table.set(pc, tableLength++)
        } else {
          table.set(pc, tableLength++)
        }

        p = new CharArray(buf[i])
      }
    }
    if (p.length) {
      write(table.get(p)!)
    }

    write(endCode)

    let final = null
    if (bitIdx) {
      final = stream.slice(0, byteIdx + 1)
    } else {
      final = stream.slice(0, byteIdx)
    }
    console.log('encode time: ', performance.now() - encodeStart)
    return final
  },
}

/**
 * lzw 压缩查找表
 */
class StringTable {
  // 索引为字符长度，元素为该长度的 CharArray 数组
  private groups: {
    key: CharArray
    value: number
  }[][] = []

  // 快速表，一个字节的数据可以直接根据索引查找
  private fastTable = new Uint8Array(256)

  set (key: CharArray, value: number) {
    if (key.length === 1) {
      this.fastTable[key.data[0]] = value
    } else {
      const existed = this._get(key)
      if (existed !== undefined) {
        existed.value = value
      } else {
        if (this.groups[key.length]) {
          this.groups[key.length].push({
            key,
            value,
          })
        } else {
          this.groups[key.length] = [
            {
              key,
              value,
            },
          ]
        }
      }
    }
  }

  get (key: CharArray) {
    if (key.length === 1) {
      return this.fastTable[key.data[0]]
    }
    return this._get(key)?.value
  }

  has (key: CharArray) {
    return this.get(key) !== undefined
  }

  private _get (key: CharArray) {
    const group = this.groups[key.length]
    if (group) {
      for (let i = 0; i < group.length; i++) {
        if (group[i].key.equal(key)) return group[i]
      }
    }
  }
}

/**
 * 不需要优化了，各个浏览器引擎差异较大。
 * 比如一张图在火狐需要 20s，可以优化到 5s，但在 edge 上，优化后反而需要 10s，而不优化只需要 2s。
 */
/**
 * 字符串数组
 */
class CharArray {
  constructor (num?: number) {
    if (num !== undefined) {
      this.push(num)
    }
  }

  data: Uint8Array = new Uint8Array(10)
  length = 0

  push (num: number) {
    this.data[this.length] = num
    this.length++
    if (this.length >= this.data.length) {
      this.data = bufferGrow(this.data, 10)!
    }
    return this
  }

  // 调用次数多，比较耗时
  equal (val: CharArray) {
    if (val.length !== this.length) return false
    for (let i = 0; i < val.length; i++) {
      if (val.data[i] !== this.data[i]) return false
    }
    return true
  }

  reset (num?: number) {
    this.length = 0
    if (num !== undefined) {
      this.push(num)
    }
    return this
  }

  // 调用次数多，比较耗时
  clone () {
    const temp = new CharArray()
    if (this.data.length > temp.data.length) {
      temp.data = new Uint8Array(this.data.length)
    }
    temp.data.set(this.data)
    // for (let i = 0; i < this.length; i++) {
    //   temp.data[i] = this.data[i]
    // }
    temp.length = this.length
    return temp
  }
}
