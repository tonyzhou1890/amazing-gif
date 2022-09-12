import AMZGif from "..";
import SkinBase from "./base";
import playSvg from "./assets/play.svg"
import loadingSvg from "./assets/loading.svg"
import { errMsgs } from "../helpers";

export default class BasicSkin extends SkinBase {
  constructor(amzGif: AMZGif) {
    super(amzGif)
    this.handlePlay = this.handlePlay.bind(this)
    this.dirtyChecking = this.dirtyChecking.bind(this)
    this.init()
    this.setWatch()
  }

  playDiv: HTMLDivElement | null = null
  playImg: HTMLImageElement | null = null

  loadingDiv: HTMLDivElement | null = null
  loadingImg: HTMLImageElement | null = null
  loadingImgRoate = 0

  init() {
    const container = (this.amzGif._canvas as HTMLCanvasElement).parentElement
    if (!container) {
      this.amzGif._errCall(errMsgs.skinError, 'onError')
      return
    }
    const rect = container.getBoundingClientRect()
    const playDiv = this.genMask(rect.width, rect.height)
    playDiv.style.zIndex = '1'
    playDiv.style.display = 'none'
    playDiv.style.cursor = 'pointer'
    playDiv.addEventListener('click', this.handlePlay.bind(this))
    this.playDiv = playDiv
    const playImg = document.createElement('img')
    playImg.src = playSvg
    playImg.style.width = '60px'
    playImg.style.height = '60px'
    playImg.style.opacity = '0.6'
    this.playImg = playImg
    playDiv.appendChild(playImg)
    container.appendChild(playDiv)

    const loadingDiv = this.genMask(rect.width, rect.height)
    this.loadingDiv = loadingDiv
    loadingDiv.style.zIndex = '2'
    loadingDiv.style.display = 'none'
    const loadingImg = document.createElement('img')
    this.loadingImg = loadingImg
    loadingImg.src = loadingSvg
    loadingImg.style.width = '60px'
    loadingImg.style.height = '60px'
    loadingImg.style.opacity = '0.6'
    loadingDiv.appendChild(loadingImg)
    container.appendChild(loadingDiv)

    this.amzGif._rAFCallbackQueue.push(this.dirtyChecking.bind(this))
  }

  genMask(width: number, height: number) {
    const div = document.createElement('div')
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
    div.style.width = width + 'px'
    div.style.height = height + 'px'
    div.style.position = 'absolute'
    div.style.left = '0'
    div.style.top = '0'
    div.style.display = 'flex'
    div.style.justifyContent = 'center'
    div.style.alignItems = 'center'
    return div
  }

  setWatch(): void {
    this.watch['isPlaying'] = (newValue: boolean) => {
      if (this.playDiv) {
        this.playDiv.style.display = newValue || this.amzGif.isLoading ? 'none' : 'flex'
      }
    }
    this.watch['isLoading'] = (newValue: boolean) => {
      if (this.loadingDiv) {
        this.loadingDiv.style.display = newValue ? 'flex' : 'none'
        if (newValue && this.loadingImg) {
          this.loadingImg.style.transform = `rotate(${this.loadingImgRoate += 1}deg)`
        }
      }
    }
  }

  handlePlay() {
    if (!this.amzGif.isPlaying) {
      this.amzGif.play()
    }
  }
}