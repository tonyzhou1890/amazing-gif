// https://www.cnblogs.com/jiang08/articles/3171319.html

/**
 * getBits
 * @param num 1 byte
 * @param bitIdx bit index(from right to left)
 * @param length required bits length
 */
function getBits(num: number, bitIdx: number, length: number) {
  return (num >> bitIdx) & ((1 << length) - 1)
}

export const GifLZW = {
  decode: (codeSize: number, buf: Uint8Array): Uint8Array => {
    function genTable() {
      return new Array((2 ** codeSize) + 2).fill(0).map((_, index) => String.fromCharCode(index))
    }
    let table = genTable()
    let clearCode = 2 ** codeSize
    let endCode = 2 ** codeSize + 1 
    let bitLength = codeSize + 1
    let stream = ''
    let decodeStart = true
    let byteLen = buf.length
    let byteIdx = 0
    let bitIdx = 0
    let requiredBits = bitLength
    let code = 0
    let k = ''
    let oldCode = 0
    while(byteIdx < byteLen) {
      requiredBits = bitLength
      code = 0
      // read code
      while(requiredBits !== 0) {
        if (8 - bitIdx >= requiredBits) {
          code += getBits(buf[byteIdx], bitIdx, requiredBits) << (bitLength - requiredBits)
          bitIdx += requiredBits
          requiredBits = 0
        } else {
          code += getBits(buf[byteIdx], bitIdx, 8 - bitIdx) << (bitLength - requiredBits)
          requiredBits -= (8 - bitIdx)
          bitIdx = 8
        }
        // overflow
        if (bitIdx === 8) {
          byteIdx++
          bitIdx = 0
        }
      }
      // console.log(bitIdx, bitLength, byteIdx, code)
      //
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
        k = table[oldCode][0]
        stream += table[oldCode] + k
        table.push(table[oldCode] + k)
        oldCode = code
      }
      // check cap of table
      if (table.length >= (2 ** bitLength)) {
        if (bitLength < 12) {
          bitLength++
        }
      }
    }
    let res = new Uint8Array(stream.length)
    for (let i = 0; i < stream.length; i++) {
      res[i] = stream.charCodeAt(i)
    }
    // console.log(res)
    return res
  }
}