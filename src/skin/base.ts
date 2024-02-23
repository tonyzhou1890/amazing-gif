import AMZGif from '../player'
import { isFunc } from '../utils/helpers'
import { AnyFuncType, ValueChangeType } from '../types'

/**
 * base skin class
 */
export default class SkinBase {
  constructor (amzGif: AMZGif) {
    this.amzGif = amzGif
    this.cache = {}
    this.init()
  }

  cache: { [x: string]: unknown }

  keys: Array<string> = []
  watch: { [x: string]: AnyFuncType } = {}

  amzGif: AMZGif

  init () {
    this.dirtyChecking()
  }

  /**
   * check changes of data
   */
  dirtyChecking () {
    const changes: Array<ValueChangeType> = []
    let tempValue = null
    Object.keys(this.watch).map(key => {
      tempValue = this.getValue(key)
      if (this.cache[key] !== tempValue) {
        changes.push({
          key,
          oldValue: this.cache[key],
          newValue: tempValue,
        })
      }
    })
    // notify subscribers
    changes.map(async change => {
      if (isFunc(this.watch[change.key])) {
        await this.watch[change.key](change.newValue, change.oldValue)
      }
    })
  }

  /**
   * get value by key from amzGif
   */
  getValue (key: string) {
    const path = key.split('.').filter(v => v)
    let temp: any = this.amzGif
    for (let i = 0; i < path.length; i++) {
      temp = temp?.[path[i]]
      if (temp === undefined) break
    }
    return temp
  }
}
