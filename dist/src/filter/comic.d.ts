/**
 * black and white filter
 * r: |g – b + g + r| * r / 256
 * g: |b – g + b + r| * r / 256
 * b: |b – g + b + r| * g / 256
 */
export default function comic(imgData: ImageData): ImageData;
