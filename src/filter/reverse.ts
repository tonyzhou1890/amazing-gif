/**
 * reverse filter
 * subtract rgb from 255
 */
export default function reverse(imgData: ImageData) {
  for (let i = 0, len = imgData.data.length; i < len; i += 4) {
    imgData.data[i] = 255 - imgData.data[i]
    imgData.data[i + 1] = 255 - imgData.data[i + 1]
    imgData.data[i + 2] = 255 - imgData.data[i + 2]
  }
  return imgData
}