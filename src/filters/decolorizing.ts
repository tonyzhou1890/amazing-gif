/**
 * decolorizing filter
 * set rgb to the average of extremum
 */
export default function decolorizing (imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    const avg =
      ((Math.min(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]) +
        Math.max(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2])) /
        2) >>
      0
    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg
  }
  return imgData
}
