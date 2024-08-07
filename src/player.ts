import { errMsgs, isFunc } from './utils/helpers'
import { AnyFuncType, Config, EventFuncNameType, GifData, httpGifRequest } from './types'
import { defaultConfig, speedList } from './config'
import decode from './decode'
import rAF from './utils/rAF'
import { render } from './utils/render'
import initSkin from './skin'

class GifPlayer {
  constructor (config: Config) {
    this._config = { ...defaultConfig, ...config }
    if (!speedList.includes(this._config.speed)) {
      this._config.speed = 1
    }
    this._update = this._update.bind(this)
    this._renderFrame = this._renderFrame.bind(this)
    this._togglePlay = this._togglePlay.bind(this)
    this._init()
  }

  speedList = speedList

  _config: Config

  _imgEl: HTMLImageElement | null = null

  _canvas: HTMLCanvasElement | null = null

  _ctx: CanvasRenderingContext2D | null = null

  _offscreenCanvas: HTMLCanvasElement | null = null

  _offscreenCtx: CanvasRenderingContext2D | null = null

  _gifBuffer: ArrayBuffer | null = null

  gifData: GifData | null = null

  _duration = 0

  _currFrame = -1

  _repetitionTimes = 0

  // completed repetition times
  _repetition = 0
  // time of gif playing
  _time = 0

  _rAFCallbackQueue: Array<AnyFuncType> = []

  /**
   * loading gif
   */
  isLoading = false

  /**
   * @member isPlaying
   * @description play status
   */
  isPlaying = false

  /**
   * is rendering
   */
  isRendering = false

  /**
   * @member init
   */
  _init () {
    // init element
    // check img element
    if (!this._config.el) {
      this._errCall(errMsgs.noConfigEl, 'onError')
      return
    }

    if (this._config.el instanceof HTMLImageElement) {
      this._imgEl = this._config.el
    }
    if (typeof this._config.el === 'string') {
      const el = document.querySelector(this._config.el)
      if (!el) {
        this._errCall(errMsgs.noImg + this._config.el, 'onError')
        return
      }
      if (!(el instanceof HTMLImageElement)) {
        this._errCall(errMsgs.notImg(this._config.el), 'onError')
        return
      }
      this._imgEl = el
    }
    setTimeout(() => {
      this._initCanvas()
      this._initContainer()
      // init controller
      initSkin(this)

      // if config.auto is true, play gif at once
      if (this._config.auto === true) {
        this.play()
      }
      this._rAFCallbackQueue.push(this._update)
      rAF(this._rAFCallbackQueue)
    })
  }

  /**
   * set width and height，and create canvas
   */
  _initCanvas () {
    const img = this._imgEl as HTMLImageElement
    // get width and height
    const rect = img.getBoundingClientRect()

    this._config.width =
      typeof this._config.width === 'number' ? this._config.width : rect?.width ?? 0
    this._config.height =
      typeof this._config.height === 'number' ? this._config.height : rect?.height ?? 0
    // create canvas
    this._canvas = document.createElement('canvas')
    this._canvas.style.cursor = 'pointer'
    this._canvas.addEventListener('click', this._togglePlay)
    this._canvas.width = this._config.width
    this._canvas.height = this._config.height
    this._canvas.style.width = this._config.width + 'px'
    this._canvas.style.height = this._config.height + 'px'
    this._ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D
    this._ctx.globalCompositeOperation = 'copy'
    this._ctx?.drawImage(
      img,
      0,
      0,
      rect?.width ?? this._config.width,
      rect?.height ?? this._config.height,
      0,
      0,
      this._config.width ?? rect?.width,
      this._config.height ?? rect?.height
    )
  }

  _initContainer () {
    const img = this._imgEl as HTMLImageElement
    // create container
    const container = document.createElement('div')
    if (img.id) {
      container.id = img.id
    }
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
   * 重启
   * @param config
   * @desc 重启播放器，可以更换 gif
   */
  async restart (config?: Config) {
    this._config = { ...this._config, ...config, el: this._config.el }
    await this.pause()
    this._gifBuffer = null
    this.gifData = null
    this._duration = 0
    this._currFrame = -1
    this._time = 0
    this._repetition = 0
    await this.play()
  }

  /**
   * @member play
   * play gif
   */
  async play () {
    // check gifBuffer, if it is null, load gif first
    if (this._gifBuffer === null) {
      if (!this._config.src && !isFunc(this._config.httpRequest)) {
        return this._errCall(errMsgs.noGifUrl, 'onError')
      }
      await this._getGif().catch((e: Error) => this._errCall(e.message, 'onLoadError'))
    }
    if (this._gifBuffer === null) {
      return
    }
    // try parse gifBuffer
    if (this.gifData === null) {
      const temp = await decode(this._gifBuffer, this._errCall)
      if (!temp || !temp.header.isGif) return
      this.gifData = temp
      this._duration = temp.frames.reduce(
        (prev, frame) => prev + (frame.gceFlag ? frame.delay || 0 : 100),
        0
      )

      if (this._config.loop === true) {
        this._repetitionTimes = 0
      } else if (this._config.loop === false) {
        this._repetitionTimes = 1
      } else {
        this._repetitionTimes = temp.appExt?.repetitionTimes || 0
      }

      this._offscreenCanvas = document.createElement('canvas')
      this._offscreenCanvas.width = this.gifData?.header.width as number
      this._offscreenCanvas.height = this.gifData?.header.height as number
      this._offscreenCtx = this._offscreenCanvas.getContext('2d')
    }
    if (isFunc(this._config.onBeforePlay)) {
      const res = await (this._config.onBeforePlay as AnyFuncType)()
      if (!res) return
    }

    // if gif is ended, re-play
    if (this._checkEnd()) {
      this._repetition = 0
    }
    this.isPlaying = true

    if (isFunc(this._config.onPlay)) {
      (this._config.onPlay as AnyFuncType)()
    }
  }

  /**
   * pause
   */
  async pause () {
    if (isFunc(this._config.onBeforePause)) {
      const res = await (this._config.onBeforePause as AnyFuncType)()
      if (!res) return
    }
    this.isPlaying = false
    if (isFunc(this._config.onPause)) {
      (this._config.onPause as AnyFuncType)()
    }
  }

  /**
   * play next frame munually
   * @returns
   */
  nextFrame () {
    if (!this.gifData || !this._ctx || !this._offscreenCtx) {
      return this._errCall(errMsgs.notReady, 'onError')
    }
    if (this.isRendering) return errMsgs.isRendering
    this._currFrame = (this._currFrame + 1) % this.gifData.frames.length
    this._renderFrame()
    this._syncGIFTime()
  }

  /**
   * play prev frame manually
   */
  prevFrame () {
    if (!this.gifData || !this._ctx || !this._offscreenCtx) {
      return this._errCall(errMsgs.notReady, 'onError')
    }
    if (this.isRendering) return errMsgs.isRendering
    this._currFrame--
    if (this._currFrame < 0) {
      this._currFrame = this.gifData.frames.length - 1
    }
    this._renderFrame()
    this._syncGIFTime()
  }

  /**
   * jump
   */
  jump (frameIndex: number) {
    if (!this.gifData) {
      return this._errCall(errMsgs.notReady, 'onError')
    }
    if (typeof frameIndex !== 'number') {
      return this._errCall(errMsgs.wrongParam, 'onError')
    }
    if (this.isRendering) return errMsgs.isRendering

    if (frameIndex < 0 || frameIndex > this.gifData.frames.length - 1) {
      frameIndex = 0
    }
    this._currFrame = frameIndex
    this._renderFrame()
    this._time = performance.now()
  }

  /**
   * set speed
   */
  setSpeed (speed: number) {
    if (this.speedList.includes(speed)) {
      this._config.speed = speed
      return true
    }
    return false
  }

  _syncGIFTime () {
    if (this._currFrame === -1) {
      this._time = 0
    } else {
      this._time = 0
      for (let i = 0; i < this._currFrame; i++) {
        this._time += this.gifData?.frames[this._currFrame]?.delay || 0
      }
    }
  }

  _getFrameIndexByTime () {
    if (this._duration <= this._time) {
      return this.gifData!.frames.length - 1
    } else {
      let t = 0
      let f = 0
      while (t <= this._time) {
        const frame = this.gifData!.frames[f]
        t += frame.gceFlag ? frame.delay : 100
        f++
      }
      return f - 1
    }
  }

  /**
   * togglePlay by
   */
  _togglePlay () {
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
  _update (time: number, timeOffset: number) {
    if (
      !this.isPlaying ||
      this.isRendering ||
      !this.gifData ||
      !this._ctx ||
      !this._offscreenCtx ||
      document.hidden
    )
      return

    this._time += timeOffset * this._config.speed
    // set time
    // static image, infinite loop
    if (this._duration === 0) {
      this._time = 0
    } else {
      this._repetition += (this._time / this._duration) >> 0
      this._time %= this._duration
    }
    this._currFrame = this._getFrameIndexByTime()
    this._renderFrame()
    if (this._checkEnd()) {
      this.isPlaying = false
      if (isFunc(this._config.onEnd)) {
        (this._config.onEnd as AnyFuncType)()
      }
      return
    }
    this._renderFrame()
  }

  _renderFrame () {
    const gifData = this.gifData as GifData
    const ctx = this._ctx as CanvasRenderingContext2D
    const offscreenCtx = this._offscreenCtx as CanvasRenderingContext2D

    // render will take some time
    this.isRendering = true
    render(ctx, offscreenCtx, gifData, this._currFrame, (imgData: ImageData) => {
      if (isFunc(this._config.filter)) {
        return (this._config.filter as AnyFuncType)(imgData)
      }
      return imgData
    })
    this.isRendering = false
  }

  _checkEnd () {
    // check repetition
    if (!this._repetitionTimes || this._repetitionTimes > this._repetition) {
      return false
    } else {
      return true
    }
  }

  /**
   * get gif data
   */
  async _getGif () {
    this.isLoading = true
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
        if (isFunc(this._config.onLoad)) {
          (this._config.onLoad as AnyFuncType)()
        }
      } catch (e) {
        this._errCall((e as any)?.message, 'onLoadError')
      }
    }
    this.isLoading = false
  }

  /**
   * @ignore
   * handleError
   */
  _errCall (msg: string, funcName: EventFuncNameType): undefined {
    if (isFunc(this._config[funcName])) {
      this._config[funcName]?.(msg)
    } else if (isFunc(this._config.onError)) {
      this._config.onError?.(msg)
    } else {
      throw new Error(msg)
    }
    return undefined
  }
}

export default GifPlayer
