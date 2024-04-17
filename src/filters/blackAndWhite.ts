/**
 * black and white filter
 * if average value of rgb is smaller than 100, set rgb to 0, otherwise set rgba to 255
 */
export default function blackAndWhite (imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3
    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg >= 100 ? 255 : 0
  }
  return imgData
}
