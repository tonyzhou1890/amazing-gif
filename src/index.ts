import { isFunc } from "./helpers"
import { Config, GifData, httpGifRequest } from './types'
import parser from "./parser"
import rAF from "./rAF"
import { render } from "./render"

const defaultConfig = {
  loop: true,
  auto: false,
  interface: true,
  skin: 'basic',
  speed: 1
}

const speedList = [0.5, 1.0, 1.5, 2.0]

class AMZGif {
  constructor(config: Config) {
    this._config = { ...defaultConfig, ...config }
    if (!speedList.includes(this._config.speed)) {
      this._config.speed = 1
    }
    this._imgEl = null
    this._canvas = null
    this._ctx = null
    this._offscreenCanvas = null
    this._offscreenCtx = null
    this._gifBuffer = null
    this.gifData = null
    this._update = this._update.bind(this)
    this._renderFrame = this._renderFrame.bind(this)
    this._togglePlay = this._togglePlay.bind(this)
    this._init()
  }

  _config: Config

  _imgEl: HTMLImageElement | null

  _canvas: HTMLCanvasElement | null

  _ctx: CanvasRenderingContext2D | null

  _offscreenCanvas: HTMLCanvasElement | null

  _offscreenCtx: CanvasRenderingContext2D | null

  _gifLoading = false

  _gifBuffer: ArrayBuffer | null

  gifData: GifData | null

  _frameTotal = 0

  _currFrame = -1

  _nextUpdateTime = performance.now()

  /**
   * @member isPlaying
   * @description play status
   */
  isPlaying = false

  /**
   * @member init
   */
  _init() {
    // init element
    // check img element
    if (!this._config.el) {
      this._errCall('未指定 img 元素', 'onError')
      return
    }

    if (this._config.el instanceof HTMLImageElement) {
      this._imgEl = this._config.el
    }
    if (typeof this._config.el === 'string') {
      const el = document.querySelector(this._config.el)
      if (!el) {
        this._errCall('未找到 img 元素 ' + this._config.el, 'onError')
        return
      }
      if (!(el instanceof HTMLImageElement)) {
        this._errCall('元素 ' + this._config.el + ' 不是图片', 'onError')
        return
      }
      this._imgEl = el
    }
    this._initCanvas()
    this._initContainer()
    // init controller

    // if config.auto is true, play gif at once
    if (this._config.auto === true) {
      this.play()
    }
    rAF(this._update)
  }

  /**
   * set width and height，and create canvas
   */
  _initCanvas() {
    const img = this._imgEl as HTMLImageElement
    // get width and height
    const rect = img.getBoundingClientRect()
    this._config.width = typeof this._config.width === 'number' ? this._config.width : rect?.width ?? 0
    this._config.height = typeof this._config.height === 'number' ? this._config.height : rect?.height ?? 0
    // create canvas
    this._canvas = document.createElement('canvas')
    this._canvas.addEventListener('click', this._togglePlay)
    this._canvas.width = this._config.width
    this._canvas.height = this._config.height
    this._canvas.style.width = this._config.width + 'px'
    this._canvas.style.height = this._config.height + 'px'
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D
    this._ctx.globalCompositeOperation = 'copy'
    img.addEventListener('load', () => {
      this._ctx?.drawImage(img, 0, 0, rect?.width ?? this._config.width, rect?.height ?? this._config.height, 0, 0, this._config.width ?? rect?.width, this._config.height ?? rect?.height)
    })
  }

  _initContainer() {
    const img = this._imgEl as HTMLImageElement
    // create container
    const container = document.createElement('div')
    container.style.width = this._config.width + 'px'
    container.style.height = this._config.height + 'px'
    container.style.position = 'relative'
    // set display as same as img element
    container.style.display = 'inline-block'
    if (this._canvas) {
      container.appendChild(this._canvas)
      img.parentElement?.replaceChild(container, img)
    }
  }

  /**
   * @member play
   * play gif
   */
  async play() {
    // check gifBuffer, if it is null, load gif first
    if (this._gifBuffer === null) {
      if (!this._config.src) {
        return this._errCall('未指定 gif 图片地址', 'onError')
      }
      await this._getGif().catch((e: Error) => this._errCall(e.message, 'onLoadError'))
    }
    if (this._gifBuffer === null) {
      this._errCall('gif 不存在', 'onDataError')
      return
    }
    // try parse gifBuffer
    if (this.gifData === null) {
      const temp = parser(this._gifBuffer, this._errCall)
      if (!temp || !temp.header.isGif) return
      this.gifData = temp
      this._offscreenCanvas = document.createElement('canvas')
      this._offscreenCanvas.width = this.gifData?.header.width as number
      this._offscreenCanvas.height = this.gifData?.header.height as number
      this._offscreenCtx = this._offscreenCanvas.getContext('2d')
    }
    if (isFunc(this._config.onBeforePlay)) {
      const res = await (this._config.onBeforePlay as Function)()
      if (!res) return
    }
    this.isPlaying = true
    this._nextUpdateTime = Math.max(this._nextUpdateTime, performance.now())
    if (isFunc(this._config.onPlay)) {
      (this._config.onPlay as Function)()
    }
  }

  /**
   * pause
   */
  async pause() {
    if (isFunc(this._config.onBeforePause)) {
      const res = await (this._config.onBeforePause as Function)()
      if (!res) return
    }
    this.isPlaying = false
    if (isFunc(this._config.onPause)) {
      (this._config.onPause as Function)()
    }
  }

  /**
   * togglePlay by 
   */
  _togglePlay() {
    if (this._config.interactive === false) return
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  /**
   * update
   */
  _update(time: number) {
    if (!this.isPlaying || !this.gifData || !this._ctx || !this._offscreenCtx || document.hidden) return

    // If the time has not yet arrived, no action
    if (this._nextUpdateTime > time) return
    this._currFrame++
    if (this._checkEnd()) return
    this._renderFrame()
    
    // set nextUpdateTime
    while(this._nextUpdateTime <= time) {
      this._nextUpdateTime += Math.max(this.gifData.frames[this._currFrame].delay / this._config.speed, 1)
      if (this._nextUpdateTime <= time) {
        this._currFrame++
        if (this._checkEnd()) {
          // render the last frame
          this._currFrame = this.gifData.frames.length - 1
          this._renderFrame()
        }
      }
    }
  }

  _renderFrame() {
    const gifData = this.gifData as GifData
    const ctx = this._ctx as CanvasRenderingContext2D
    const offscreenCtx = this._offscreenCtx as CanvasRenderingContext2D

    // render will take some time
    const tempIsPlaying = this.isPlaying
    this.isPlaying = false
    render(ctx, offscreenCtx, gifData, this._currFrame)
    this.isPlaying = tempIsPlaying
  }

  _checkEnd() {
    if (this._currFrame > ((this.gifData as GifData).frames.length - 1)) {
      if (this._config.loop !== false) {
        this._currFrame = 0
      } else {
        this.isPlaying = false
        if (isFunc(this._config.onEnd)) {
          (this._config.onEnd as Function)()
        }
        return true
      }
    }
  }

  /**
   * play next frame munually
   * @returns 
   */
  nextFrame() {
    if (!this.gifData || !this._ctx || !this._offscreenCtx) {
      return this._errCall('数据未就绪', 'onError')
    }
    this._currFrame = (this._currFrame + 1) % this.gifData.frames.length
    this._renderFrame()
    this._nextUpdateTime = performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed
  }

  /**
   * play prev frame manually
   */
  prevFrame() {
    if (!this.gifData || !this._ctx || !this._offscreenCtx) {
      return this._errCall('数据未就绪', 'onError')
    }
    this._currFrame--
    if (this._currFrame < 0) {
      this._currFrame = this.gifData.frames.length - 1
    }
    this._renderFrame()
    this._nextUpdateTime = performance.now() + this.gifData.frames[this._currFrame].delay / this._config.speed
  }

  /**
   * get gif data
   */
  async _getGif() {
    this._gifLoading = true
    if (isFunc(this._config.httpRequest)) {
      try {
        const blob = await (this._config.httpRequest as httpGifRequest)(this._config.src as string)
        this._gifBuffer = await blob.arrayBuffer()
      } catch (e) {
        this._errCall((e as any)?.message, 'onLoadError')
      }
    } else {
      try {
        const res = await fetch(this._config.src as string)
        this._gifBuffer = await res.arrayBuffer()
      } catch(e) {
        this._errCall((e as any)?.message, 'onLoadError')
      }
    }
    this._gifLoading = false
  }

  /**
   * @ignore
   * handleError
   */
  _errCall(msg: string, funcName: 'onLoad' | 'onError' | 'onLoadError' | 'onDataError') {
    if (isFunc(this._config[funcName])) {
      this._config[funcName]?.(msg)
    } else if (isFunc(this._config.onError)) {
      this._config.onError?.(msg)
    } else {
      throw new Error(msg)
    }
  }
}

export default AMZGif