import { useState, useEffect } from "react"
import { PROFILE_ASPECT, CARD_ASPECT } from "./useProfessionalPhotoCropper"
import type { CropperStep } from "../types"

const CONTAINER_HEIGHT_DESKTOP = 260
const CONTAINER_HEIGHT_MOBILE = 240

export function useResponsiveCropSize(step: CropperStep) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowWidth < 900
  const modalPadding = isMobile ? 32 : 48
  const modalMaxWidth = 1120
  const availableWidth = Math.min(modalMaxWidth, windowWidth * (isMobile ? 1 : 0.9)) - modalPadding

  const containerHeight = isMobile ? CONTAINER_HEIGHT_MOBILE : CONTAINER_HEIGHT_DESKTOP

  if (step === "profile") {
    const cropWidth = availableWidth
    const cropHeight = Math.round(cropWidth / PROFILE_ASPECT)
    return {
      width: Math.round(cropWidth),
      height: Math.min(cropHeight, containerHeight),
    }
  }

  if (step === "card") {
    const cropHeight = containerHeight
    const cropWidth = Math.round(cropHeight * CARD_ASPECT)
    if (cropWidth > availableWidth) {
      return {
        width: Math.round(availableWidth),
        height: Math.round(availableWidth / CARD_ASPECT),
      }
    }
    return { width: cropWidth, height: cropHeight }
  }

  return { width: 0, height: 0 }
}
