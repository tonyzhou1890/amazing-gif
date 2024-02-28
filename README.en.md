# amazing-gif

JavaScript GIF decoder、encoder、player.

[中文文档](./README.md)

## Introduction

For GIF pictures, the browser natively supports them, but it does not provide functions such as pausing, resuming playback, and of course, it does not provide decoding and encoding functions.

This package allows you to play GIFs like a video, pause, resume playback, previous frame, next frame, double speed, and more. You can also decode each frame to ImageData, and combine several images into GIFs.

## Functions

* Decode the GIF image to get the ImageData of each frame.
* Encode GIF images, quantize the ImageData of multiple pictures and then generate GIF images.
* Play GIF pictures with functions such as pause, resume, double speed, filters, etc.

## Usage

npm:
```
npm install amazing-gif

import * as AMZGif from 'amazing-gif'

<img id="example1" src="/path/assets/gif-pic-cover.jpg">

const amz = new AMZGif.GifPlayer({
  el: '#example1',
  src: 'path/gif.gif'
})
```
browser：
```
<script src="/path/dist/index.umd.min.js"></script>

<img id="example1" src="/path/assets/gif-pic-cover.jpg">

const amz = new AMZGif.GifPlayer({
  el: '#example1',
  src: 'path/gif.gif'
})
```

## Examples

[examples](./examples/index.html)

[spark-gif](https://spark-gif.dowhat.top)

## API

```
import * as AMZGif from 'amazing-gif'
// or
import {
  GifPlayer,
  decode,
  encode, 
  build, 
  filter, 
  getFrameImageData, 
  getFramesImageData, 
  getCompositedFrameImageData, getCompositedFramesImageData
} from 'amazing-gif'
```

### GifPlayer

```
new GifPlayer(config)
```

#### config：

* el

  type：id or dom

  Image tag, required. On initialization, this tag is replaced with a 'div' tag. The 'display' of the 'div' tag will be set to 'inline-block'. If 'el' has 'id', the created 'div' will use 'el''s 'id'.

  It is recommended that the 'src' of 'img' point to a static image, such as the first frame of 'gif', to avoid unnecessary data consumption caused by loading the full 'gif' at the beginning of the web page. If you don't care about data, or if you plan to play the gif as soon as the page is opened, you can point directly to the 'gif' file.

* src

  type：String

  The address of `gif` file，required。

* httpRequest

  type：Function

  Alternative to getting an image, optional. If your 'gif' image cannot be obtained directly through 'fetch', for example, authentication is required, then you need to define the method of obtaining 'gif' through this attribute. The method parameter is 'config.src' and the return value is 'Blob'.

* loop

  type：Boolean

  Whether to play in a loop, optional, default 'true'. Generally, 'gif' is looped, unless you don't want it to loop, you don't need to fill it in.

* auto

  type：Boolean

  Whether it plays auto-or not, optional, default 'false'. If you want autoplay, set the option to 'true'.

* width

  type：Number

  Image width, optional, defaults to the width of 'config.el'.

* height

  值：Number

  Image height, optional, defaults to the height of 'config.el'

* interactive

  type：Boolean

  Whether the image is interactive or not, optional, default 'true'. If this parameter is set to 'false', the image will not be able to be clicked to pause.

* skin

  type：String
  Player style, optional, default 'basic'. The player style is only 'basic'. If you don't need it, you can set it to any value other than 'basic'. If you need to customize the player style, you can set it to a non-'basic' value and then implement the style yourself, and then play it in the form of 'API'.
  ```
  const amz = new GifPlayer(/***/)
  class CustomSkin extends SkinBase {/* See src/skin/basic.ts */}
  new CustomSkin(amz)
  ```

* speed

  type：Number

  Playback speed, optional, default '1'. You can choose any of '0.5/1/1.5/2'.

* filter

  type：Function

  Filter. Optional. Some filters come with the GifPlayer class, or you can implement them yourself according to your needs.

  ```
  const amz1 = new GifPlayer({
    el: '#example1',
    src: './assets/cat1.gif',
    speed: 1,
    auto: true,
    skin: 'basic',
    filter: filter.grayscale
  })
  ```

  filter list:

  * grayscale
  * blackAndWhite
  * reverse
  * decolorizing
  * monochromeRed
  * monochromeGreen
  * monochromeBlue
  * nostalgic
  * cast
  * frozen
  * comic
  * brown
  * boxBlur

* onLoad

  type：Function

  The callback after the gif load is complete, optional. There are no parameters, no return value. There is no such callback when customizing httpRequest.

* onLoadError

  type：Function

  Callback for gif loading failure, optional. The parameter is an error message string. In addition to network errors, this callback is also invoked if an error occurs when 'Blob' turns to 'ArrayBuffer'.

* onDataError

  type：Function

  GIF data error callback, optional. The parameter is an error message string.

* onError

  type：Function

  Error callback, optional. This method is called when the above error callbacks are undefined. If this method is also not defined, an error is thrown.

* onBeforePlay

  type：Function

  Callback before playback, optional. There are no parameters. If a non-truly value is returned, it will not be played.

* onPlay

  type：Function

  Play callback, optional. There are no parameters. No return value is required.

* onEnd

  type：Function

  End callback, optional. There are no parameters. No return value is required. If it loops, the callback will not be called.

* onBeforePause

  type：Function

  Pause callback, optional. There are no parameters. If a non-truly value is returned, it will not be paused.

* onPause

  type：Function

  Pause callback, optional. There are no parameters. No return value is required.

#### Instance API：

```
const amz = new GifPlayer(config)
amz.xxx
```

* isLoading

  type：Boolean

  Whether it is loading.

* isPlaying

  type：Boolean

  Whether or not it is playing.

* isRendering

  type：Boolean

  Whether or not it is rendering.

* play

  type：Function

  Play GIF.
  ```
  const amz = new GifPlayer({
    el: '#example1',
    src: '/path/xxx.gif',
    auto: false
  })
  // Make sure the 'el' is loaded before calling play. This is because the package internals are initialized in the load event of el.
  amz.play()
  ```

* pause

  type：Function

  Pause play.
  ```
  const amz = new GifPlayer({
    el: '#example1',
    src: '/path/xxx.gif',
    auto: false
  })
  // Make sure the 'el' is loaded before calling play. This is because the package internals are initialized in the load event of el.
  amz.play().then(() => amz.pause())
  ```

* nextFrame

  type：Function

  Next frame. Regardless of what 'config.loop' is, 'nextFrame' can be called all the time.

* prevFrame

  type：Function

  Previous frame. 'prevFrame' can be called all the time, no matter what 'config.loop' is.

* jump

  type：Function

  Frame skipping. The parameter is a frame index. If the index is out of range, it starts at the frame with index 0.

* setSpeed

  type：Function

  Set the play speed. The parameter is a number in '0.5/1/1.5/2'.
### decode

Decode the GIF image to get a GIF description object (GifData), which contains the header information of the GIF and the data of each frame. The parameters are as follows:

* gifBuffer: The ArrayBuffer of gif image.

* errorCallback?：The callback function in the event of an error, with the parameters of the error message and the error type ('onLoad' | 'onError' | 'onLoadError' | 'onDataError'）。 If you don't have this function configured, use try...... catch handles the error, at which point there is only an error message.

### encode

Encode the GIF image to get the data in the form of a Uint8Array of the GIF image. The parameters are as follows:

* gifData: GifData--Objects that contain header information, extension information, and frame information are more complex, so it is not recommended to use the encode method, and if you need to generate GIF image, it is better to use the build method.

### build

Generate the GIF image in the form of a Uint8Array. The parameters are as follows:

* data: ToBuildDataType--The data needed to generate GIF.

  ToBuildDataType：
  |key|value|optional|comment|
  |--|--|--|--|
  |backgroundColor|string|yes|Background color, it is recommended not to fill in. Default black.|
  |repetition|number|yes|The number of loops, 0 for infinite loops, defaults to 0.|
  |dithering|boolean|yes|Whether the color is dithering or not, color dithering may improve the quality of the picture, but it is more time-consuming to generate, and the default is true|
  |frames|Array\<ToBuildFrameDataType\>|true|The data of frames.|

  ToBuildFrameDataType:
  |key|value|optional|comment|
  |--|--|--|--|
  |imageData|ImageData|false|The ImageData of frame|
  |delay|number|true|Frame Delay (ms). That is, how long after the current frame is rendered the next frame. The value needs to be a multiple of 10, with the default being 10. It is not recommended to be less than 10 as most browsers and image viewers do not support it.|
  |disposalMethod|number|true|How frames are processed after they are rendered. 1: Retain, 2: Restore the background color, 3: Return to the previous frame state. Default is 1.|
  |setLocalColorTable|boolean|yes|Whether to set a local color table. The default is false.|

### getFrameImageData

Get the raw data of frame, this may take some time. Parameters:

* gifData: GifData

* frameIndex: number

### getFramesImageData

Get the raw data of all frames, this will take some time. Parameters:

* gifData: GifData

### getCompositedFrameImageData

Get the rendered ImageData data of the frame, this may take some time. The parameter is the same as getFrameImageData.

### getCompositedFramesImageData

Get the rendered ImageData data of all frames, this will take some time. The parameter is the same as getFrameImageData.

## Reference

* [gif 格式图片详细解析](https://blog.csdn.net/wzy198852/article/details/17266507)
* [GIF格式解析](https://www.jianshu.com/p/38743ef278ac)
* [为什么有的GIF图片只会播放一遍，而有的会重复播放？关于gif你想知道的一切！](https://www.cnblogs.com/qkshhan/p/16202931.html)
* [GIF](https://en.wikipedia.org/wiki/GIF)
* [GIF图片原理和储存结构深入解析](https://www.linuxidc.com/Linux/2017-06/145156.htm)
* [gif 89a spec](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)
* [GIF格式文件解码](https://www.cnblogs.com/jiang08/articles/3171319.html)

## License

MIT