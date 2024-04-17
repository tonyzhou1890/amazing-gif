# amazing-gif

JavaScript GIF decoder、encoder、player.

## 简介

对于 GIF 图片，浏览器是原生支持的，但没有提供暂停、恢复播放等功能，当然也没有提供解码、编码功能。

此包让播放 GIF 可以像播放视频一样进行暂停、恢复播放、上一帧、下一帧、倍速等操作。还可以解码得到每一帧的 ImageData，以及将几张图片合成为 GIF。

## 功能

* 解码 GIF 图片，得到每一帧的 ImageData
* 编码 GIF 图片。可以将多个图片的 ImageData 量化为 GIF 的八位色，然后合成 GIF 图片。
* 播放 GIF 图片，提供暂停、恢复、倍速、滤镜等功能。

## 安装使用

npm:
```
npm install amazing-gif

import AMZGif from 'amazing-gif'

<img id="example1" src="/path/assets/gif-pic-cover.jpg">

const amz = new AMZGif.GifPlayer({
  el: '#example1',
  src: 'path/gif.gif'
})
```
浏览器：
```
<script src="/path/dist/index.umd.min.js"></script>

<img id="example1" src="/path/assets/gif-pic-cover.jpg">

const amz = new AMZGif.GifPlayer({
  el: '#example1',
  src: 'path/gif.gif'
})
```

## 样例

[样例](./examples/index.html)

[spark-gif](https://spark-gif.dowhat.top)

## API

```
import AMZGif from 'amazing-gif'
// or
import {
  GifPlayer,
  decode,
  encode, 
  build, 
  filters, 
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

  值：id 或者 dom

  图片标签，必填。初始化的时候，这个标签会被一个`div`标签替换。`div`标签的`display`会被设为`inline-block`。如果`el`有`id`，创建的`div`会使用`el`的`id`。

  建议`img`的`src`指向一张静态图片，比如`gif`的第一张，避免网页一开始就加载完整`gif`，造成不必要的流量消耗。如果不在意流量，或者本来就打算网页一打开就播放，那可以直接指向`gif`文件。

* src

  值：String

  `gif`文件地址，必填。

* httpRequest

  值：Function

  获取图片的替代方法，选填。如果你的`gif`图片无法通过`fetch`直接获取，比如需要鉴权，那么你需要通过此属性定义获取`gif`的方法。该方法参数是`config.src`，返回值是`Blob`。

* loop

  值：Boolean

  是否循环播放，选填，默认`true`。一般`gif`都是循环播放的，除非你不希望循环播放，否则此项不需要填。

* auto

  值：Boolean

  是否自动播放，选填，默认`false`。如果你希望自动播放，请将该选项设置`true`。

* width

  值：Number

  图片宽度，选项，默认为`config.el`的宽度。

* height

  值：Number

  图片高度，选填，默认为`config.el`的高度。

* interactive

  值：Boolean

  图片是否可交互，选填，默认`true`。如果设为`false`，图片将无法通过点击的方式实现播放暂停。

* skin

  值：String

  播放器样式，选填，默认`basic`。播放器样式只有`basic`。如果你不需要，可以设置为任何非`basic`的值。如果你需要自定义播放器样式，可以设为非`basic`值之后自行实现样式，然后通过`api`的形式播放。

* speed

  值：Number

  播放速度，选填，默认`1`。可以选填`0.5/1/1.5/2`中的任一个。

* filter

  值：Function

  滤镜。可选。GifPlayer 类上自带了部分滤镜，也可以根据需求自己实现，或者使用 lena.js 和 image-filters-js 之类的库。

  ```
  const amz1 = new GifPlayer({
    el: '#example1',
    src: './assets/cat1.gif',
    speed: 1,
    auto: true,
    skin: 'basic',
    filter: filters.grayscale
  })
  ```
  |滤镜|说明|
  |--|--|
  |grayscale|灰度|
  |blackAndWhite|黑白|
  |reverse|反向|
  |decolorizing|去色|
  |monochromeRed|单色红|
  |monochromeGreen|单色绿|
  |monochromeBlue|单色蓝|
  |nostalgic|怀旧|
  |cast|熔铸|
  |frozen|冰冻|
  |comic|连环画|
  |brown|褐色|
  |boxBlur|模糊|

* onLoad

  值：Function

  `gif`加载完成的回调，选填。没有参数，无需返回值。自定义`httpRequest`的时候没有该回调。

* onLoadError

  值：Function

  `gif`加载失败的回调，选填。参数为错误信息字符串。除了网络错误，`Blob`转`ArrayBuffer`发生错误也会调用此回调。

* onDataError

  值：Function

  `gif`数据错误回调，选填。参数为错误信息字符串。

* onError

  值：Function

  错误回调，选填。当以上几个错误回调未定义时，会调用此方法。如果此方法也未定义，会抛出错误。

* onBeforePlay

  值：Function

  播放前回调，选填。没有参数。如果返回非`truly`值，将不会播放。

* onPlay

  值：Function

  播放回调，选填。没有参数。不需要返回值。

* onEnd

  值：Function

  结束回调，选填。没有参数。不需要返回值。如果循环播放，该回调将不会调用。

* onBeforePause

  值：Function

  暂停回调，选填。没有参数。如果返回非`truly`值，将不会暂停。

* onPause

  值：Function

  暂停回调，选填。没有参数。不需要返回值。


#### 实例 API：

```
const amz = new GifPlayer(config)
amz.xxx
```

* isLoading

  值：Boolean

  是否正在加载。

* isPlaying

  值：Boolean

  是否正在播放。

* isRendering

  值：Boolean

  是否正在渲染。

* play

  值：Function

  播放。
  ```
  const amz = new GifPlayer({
    el: '#example1',
    src: '/path/xxx.gif',
    auto: false
  })
  // 请确保 el 加载完毕再调用 play。因为包内部是在 el 的 load 事件里初始化的。
  amz.play()
  ```

* pause

  值：Function

  暂停。
  ```
  const amz = new GifPlayer({
    el: '#example1',
    src: '/path/xxx.gif',
    auto: false
  })
  // 仅加载 gif。
  // 请确保 el 加载完毕再调用 play。因为包内部是在 el 的 load 事件里初始化的。
  amz.play().then(() => amz.pause())
  ```

* nextFrame

  值：Function

  下一帧。不管`config.loop`是什么，`nextFrame`都可以一直调用。

* prevFrame

  值：Function

  上一帧。不管`config.loop`是什么，`prevFrame`都可以一直调用。

* jump

  值：Function

  跳帧。参数为帧下标。如果帧下标超出范围，会从下标0的帧开始。

* setSpeed

  值：Function

  设置播放速度。参数为`0.5/1/1.5/2`中的一个数字。

### decode

解码 GIF 图片，得到一个 GIF 描述对象(GifData)，包含 GIF 的头信息，各个帧的数据。参数如下：

* gifBuffer: GIF 图片的数据，ArrayBuffer 格式。

* errorCallback?：发生错误时的回调函数，参数为错误信息和错误类型（'onLoad' | 'onError' | 'onLoadError' | 'onDataError'）。如果没有配置该函数，请用 try……catch 处理错误，此时只有错误信息。

### encode

编码 GIF 图片，得到一个 GIF 图片的 Uint8Array 形式的数据。参数如下：

* gifData: GifData--包含头信息、扩展信息、帧信息的对象，比较复杂，所以不建议使用 encode 方法，如果需要合成 GIF，使用 build 方法更好。

### build

合成 GIF 图片，得到一个 GIF 图片的 Uint8Array 形式的数据。参数如下：

* data: ToBuildDataType--合成 GIF 所需要的数据。

  ToBuildDataType：
  |key|value|optional|comment|
  |--|--|--|--|
  |backgroundColor|string|yes|背景色，建议不填。默认黑色。|
  |repetition|number|yes|循环次数，0 代表无限循环，默认 0。|
  |dithering|boolean|yes|是否颜色抖动，颜色抖动可能会提高图片质量，但生成更耗时，默认 true|
  |frames|Array\<ToBuildFrameDataType\>|true|帧数据|

  ToBuildFrameDataType:
  |key|value|optional|comment|
  |--|--|--|--|
  |imageData|ImageData|false|帧图片的 ImageData 数据|
  |delay|number|true|帧延迟(ms)。即当前帧渲染后多久渲染下一帧。值需要是 10 的倍数，默认 10。不建议小于 10，因为大部分浏览器和图片查看器不支持|
  |disposalMethod|number|true|帧渲染之后的处理方式。1：保留，2：恢复背景色，3：回到上一帧状态。默认 1。|
  |setLocalColorTable|boolean|yes|是否设置局部颜色表。默认 false|

### getFrameImageData

得到指定帧的 ImageData 数据（原始帧，非合成后的渲染帧），可能比较慢。参数如下：

* gifData: GifData--decode 后的 GIF 数据。

* frameIndex: number--帧下标。

### getFramesImageData

得到所有帧的 ImageData 数据（原始帧，非合成后的渲染帧），比较慢。参数如下：

* gifData: GifData--decode 后的 GIF 数据。

### getCompositedFrameImageData

得到指定帧的渲染 ImageData 数据，可能比较慢。参数同 getFrameImageData。

### getCompositedFramesImageData

得到所有帧的渲染 ImageData 数据，比较慢。参数同 getFramesImageData。

## 参考文档

* [gif 格式图片详细解析](https://blog.csdn.net/wzy198852/article/details/17266507)
* [GIF格式解析](https://www.jianshu.com/p/38743ef278ac)
* [为什么有的GIF图片只会播放一遍，而有的会重复播放？关于gif你想知道的一切！](https://www.cnblogs.com/qkshhan/p/16202931.html)
* [GIF](https://en.wikipedia.org/wiki/GIF)
* [GIF图片原理和储存结构深入解析](https://www.linuxidc.com/Linux/2017-06/145156.htm)
* [gif 89a spec](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)
* [GIF格式文件解码](https://www.cnblogs.com/jiang08/articles/3171319.html)

## License

MIT