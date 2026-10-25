export type CropCoordinates = {
  x: number
  y: number
  width: number
  height: number
}

export type CropResult = {
  originalFile: File
  profileOriginalFile: File
  cardOriginalFile: File
  profileCrop: CropCoordinates
  cardCrop: CropCoordinates
  profileBlob: Blob
  cardBlob: Blob
  profileUrl: string
  cardUrl: string
}

export type ProfessionalPhotoCropperProps = {
  open: boolean
  onClose: () => void
  onSave: (result: CropResult) => void
}

export type CropArea = CropCoordinates

export type CropperStep = "upload" | "profile" | "card" | "preview"

export const STEP_CONTENT = {
  upload: {
    stepText: "PASO 1 DE 4",
    title: "Cargar imagen",
    description: "Subí una imagen para generar la portada de tu perfil y la versión de tu tarjeta de presentación.",
  },
  profile: {
    stepText: "PASO 2 DE 4",
    title: "Ajustar portada del perfil",
    description: "Subí una foto preferentemente horizontal, clara y de hasta 8 MB. Después mové la imagen y ajustá el zoom hasta encontrar el encuadre que querés mostrar en tu perfil.",
  },
  card: {
    stepText: "PASO 3 DE 4",
    title: "Ajustar imagen para tarjeta",
    description: "Podés usar la misma foto o subir una diferente solo para la tarjeta. Después ajustá el encuadre vertical.",
  },
  preview: {
    stepText: "PASO 4 DE 4",
    title: "Revisar resultado final",
    description: "Revisá cómo se verá tu imagen en el perfil y en la tarjeta antes de guardar los cambios.",
  },
} as const
