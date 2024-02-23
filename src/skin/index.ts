import AMZGif from '../player'
import BasicSkin from './basic'

export default function (amzGif: AMZGif) {
  if (amzGif._config.interactive) {
    if (amzGif._config.skin === 'basic') {
      return new BasicSkin(amzGif)
    }
  }
}
