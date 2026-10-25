import type { CropArea } from "../types"

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/webp",
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar el blob"))
        return
      }
      resolve(blob)
    }, type, quality)
  })
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  outputWidth: number,
  outputHeight: number,
  type = "image/webp",
  quality = 0.92
): Promise<Blob> {
  const image = await createImage(imageSrc)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No se pudo obtener el contexto 2D del canvas")
  }

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  return canvasToBlob(canvas, type, quality)
}
