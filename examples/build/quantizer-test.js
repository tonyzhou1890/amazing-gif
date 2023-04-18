// 多 jpg 图片合成
function buildFromJpg() {
  const wrapperEl = document.querySelector('#ex1')

  const images = ['quantizer-1.png']

  const imagesEl = []

  images.map(item => {
    const img = document.createElement('img')
    img.onload = imgLoaded
    img.src = `../assets/${item}`
    imagesEl.push(img)
    wrapperEl.appendChild(img)
  })

  let loadCount = 0

  function imgLoaded() {
    console.log(loadCount)
    loadCount++
    if (loadCount === images.length) {
      const rects = imagesEl.map(item => {
        return item.getBoundingClientRect()
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const imageDataList = imagesEl.map((item, idx) => {
        canvas.width = rects[idx].width
        canvas.height = rects[idx].height
        ctx.drawImage(item, 0, 0)
        return ctx.getImageData(0, 0, canvas.width, canvas.height)
      })

      AMZGif.gifKit
        .build({
          repetition: 0,
          frames: imageDataList.map(item => {
            return {
              imageData: item,
            }
          }),
        })
        .then(res => {
          const blob = new Blob([res], { type: 'image/gif' })
          const objUrl = URL.createObjectURL(blob)
          const el = document.createElement('img')
          el.src = objUrl
          wrapperEl.appendChild(el)
          AMZGif.gifKit
            .build({
              repetition: 0,
              dithering: true,
              frames: imageDataList.map(item => {
                return {
                  imageData: item,
                }
              }),
            })
            .then(res => {
              const blob = new Blob([res], { type: 'image/gif' })
              const objUrl = URL.createObjectURL(blob)
              const el = document.createElement('img')
              el.src = objUrl
              wrapperEl.appendChild(el)
            })
        })
    }
  }
}

buildFromJpg()
