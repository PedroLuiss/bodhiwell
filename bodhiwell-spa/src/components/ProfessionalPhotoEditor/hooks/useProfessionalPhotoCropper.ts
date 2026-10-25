import { useEffect, useId, useRef, useState } from "react"
import type { ChangeEvent } from "react"
import type { Area } from "react-easy-crop"

import { getCroppedImageBlob } from "../utils/cropImage"
import type { CropResult, ProfessionalPhotoCropperProps, CropperStep } from "../types"

export const PROFILE_ASPECT = 2.4
export const PROFILE_WIDTH = 1200
export const PROFILE_HEIGHT = 500

export const CARD_ASPECT = 0.8
export const CARD_WIDTH = 320
export const CARD_HEIGHT = 400

export function useProfessionalPhotoCropper({
  open,
  onClose,
  onSave,
}: ProfessionalPhotoCropperProps) {
  const initialInputRef = useRef<HTMLInputElement | null>(null)
  const cardInputRef = useRef<HTMLInputElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const [step, setStep] = useState<CropperStep>("upload")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [cardFile, setCardFile] = useState<File | null>(null)

  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [cardImageUrl, setCardImageUrl] = useState("")

  const [profileCrop, setProfileCrop] = useState({ x: 0, y: 0 })
  const [profileZoom, setProfileZoom] = useState(1)
  const [profileCroppedAreaPixels, setProfileCroppedAreaPixels] = useState<Area | null>(null)

  const [cardCrop, setCardCrop] = useState({ x: 0, y: 0 })
  const [cardZoom, setCardZoom] = useState(1)
  const [cardCroppedAreaPixels, setCardCroppedAreaPixels] = useState<Area | null>(null)

  const [previewProfileUrl, setPreviewProfileUrl] = useState("")
  const [previewCardUrl, setPreviewCardUrl] = useState("")

  const revokeUrl = (url: string) => {
    if (url) URL.revokeObjectURL(url)
  }

  const resetState = () => {
    revokeUrl(profileImageUrl)
    revokeUrl(cardImageUrl)
    revokeUrl(previewProfileUrl)
    revokeUrl(previewCardUrl)

    setStep("upload")
    setError("")
    setIsSaving(false)

    setProfileFile(null)
    setCardFile(null)

    setProfileImageUrl("")
    setCardImageUrl("")

    setProfileCrop({ x: 0, y: 0 })
    setProfileZoom(1)
    setProfileCroppedAreaPixels(null)

    setCardCrop({ x: 0, y: 0 })
    setCardZoom(1)
    setCardCroppedAreaPixels(null)

    setPreviewProfileUrl("")
    setPreviewCardUrl("")
  }

  useEffect(() => {
    if (!open) resetState()
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]

    if (!validTypes.includes(file.type)) {
      return "Formato no válido. Usá JPG, PNG o WEBP."
    }

    const maxMb = 8
    if (file.size > maxMb * 1024 * 1024) {
      return `La imagen supera los ${maxMb} MB permitidos.`
    }

    return ""
  }

  const handlePickInitialFile = () => {
    initialInputRef.current?.click()
  }

  const handlePickCardFile = () => {
    cardInputRef.current?.click()
  }

  const handleInitialFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      event.target.value = ""
      return
    }

    setError("")

    revokeUrl(profileImageUrl)
    revokeUrl(cardImageUrl)
    revokeUrl(previewProfileUrl)
    revokeUrl(previewCardUrl)

    const nextProfileUrl = URL.createObjectURL(file)
    const nextCardUrl = URL.createObjectURL(file)

    setProfileFile(file)
    setCardFile(file)

    setProfileImageUrl(nextProfileUrl)
    setCardImageUrl(nextCardUrl)

    setProfileCrop({ x: 0, y: 0 })
    setProfileZoom(1)
    setProfileCroppedAreaPixels(null)

    setCardCrop({ x: 0, y: 0 })
    setCardZoom(1)
    setCardCroppedAreaPixels(null)

    setPreviewProfileUrl("")
    setPreviewCardUrl("")

    setStep("profile")
    event.target.value = ""
  }

  const handleCardFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      event.target.value = ""
      return
    }

    setError("")

    revokeUrl(cardImageUrl)
    revokeUrl(previewCardUrl)

    const nextCardUrl = URL.createObjectURL(file)

    setCardFile(file)
    setCardImageUrl(nextCardUrl)
    setCardCrop({ x: 0, y: 0 })
    setCardZoom(1)
    setCardCroppedAreaPixels(null)
    setPreviewCardUrl("")

    event.target.value = ""
  }

  const onCropCompleteProfile = (_: Area, croppedAreaPixels: Area) => {
    setProfileCroppedAreaPixels(croppedAreaPixels)
  }

  const onCropCompleteCard = (_: Area, croppedAreaPixels: Area) => {
    setCardCroppedAreaPixels(croppedAreaPixels)
  }

  const handleGoToPreview = async () => {
    if (!profileCroppedAreaPixels || !cardCroppedAreaPixels || !profileImageUrl || !cardImageUrl) {
      return
    }

    try {
      setError("")
      revokeUrl(previewProfileUrl)
      revokeUrl(previewCardUrl)

      const profileBlob = await getCroppedImageBlob(
        profileImageUrl,
        profileCroppedAreaPixels,
        PROFILE_WIDTH,
        PROFILE_HEIGHT
      )

      const cardBlob = await getCroppedImageBlob(
        cardImageUrl,
        cardCroppedAreaPixels,
        CARD_WIDTH,
        CARD_HEIGHT
      )

      setPreviewProfileUrl(URL.createObjectURL(profileBlob))
      setPreviewCardUrl(URL.createObjectURL(cardBlob))
      setStep("preview")
    } catch {
      setError("No pudimos generar la vista previa. Probá nuevamente con otra imagen.")
    }
  }

  const handleConfirm = async () => {
    if (
      !profileFile ||
      !cardFile ||
      !profileCroppedAreaPixels ||
      !cardCroppedAreaPixels ||
      !profileImageUrl ||
      !cardImageUrl
    ) {
      return
    }

    try {
      setError("")
      setIsSaving(true)

      const profileBlob = await getCroppedImageBlob(
        profileImageUrl,
        profileCroppedAreaPixels,
        PROFILE_WIDTH,
        PROFILE_HEIGHT
      )

      const cardBlob = await getCroppedImageBlob(
        cardImageUrl,
        cardCroppedAreaPixels,
        CARD_WIDTH,
        CARD_HEIGHT
      )

      const result: CropResult = {
        originalFile: profileFile,
        profileOriginalFile: profileFile,
        cardOriginalFile: cardFile,
        profileCrop: {
          x: profileCroppedAreaPixels.x,
          y: profileCroppedAreaPixels.y,
          width: profileCroppedAreaPixels.width,
          height: profileCroppedAreaPixels.height,
        },
        cardCrop: {
          x: cardCroppedAreaPixels.x,
          y: cardCroppedAreaPixels.y,
          width: cardCroppedAreaPixels.width,
          height: cardCroppedAreaPixels.height,
        },
        profileBlob,
        cardBlob,
        profileUrl: URL.createObjectURL(profileBlob),
        cardUrl: URL.createObjectURL(cardBlob),
      }

      onSave(result)
      onClose()
    } catch {
      setError("No pudimos guardar la imagen procesada. Probá nuevamente.")
    } finally {
      setIsSaving(false)
    }
  }

  return {
    initialInputRef,
    cardInputRef,
    titleId,
    descriptionId,
    step,
    setStep,
    error,
    isSaving,
    profileFile,
    cardFile,
    profileImageUrl,
    cardImageUrl,
    profileCrop,
    setProfileCrop,
    profileZoom,
    setProfileZoom,
    cardCrop,
    setCardCrop,
    cardZoom,
    setCardZoom,
    previewProfileUrl,
    previewCardUrl,
    handlePickInitialFile,
    handlePickCardFile,
    handleInitialFileChange,
    handleCardFileChange,
    onCropCompleteProfile,
    onCropCompleteCard,
    handleGoToPreview,
    handleConfirm,
  }
}
