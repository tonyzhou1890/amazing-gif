/**
 * black and white filter
 * r: r * 128 / (g + b + 1)
 * g: g * 128 / (r + b + 1)
 * b: b * 128 / (g + r + 1)
 */
export default function cast(imgData: ImageData): ImageData;
