import React from "react"
import Cropper from "react-easy-crop"
import { useProfessionalPhotoCropper, PROFILE_ASPECT, CARD_ASPECT } from "../hooks/useProfessionalPhotoCropper"

import type { ProfessionalPhotoCropperProps, CropperStep } from "../types"
import { STEP_CONTENT } from "../types"
import styles from "./ProfessionalPhotoCropper.module.scss"

export default function ProfessionalPhotoCropper(props: ProfessionalPhotoCropperProps) {
  const { open } = props

  const {
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
  } = useProfessionalPhotoCropper(props)


  if (!open) return null

  const cx = (...classes: (string | undefined | false)[]) => {
    return classes
      .filter(Boolean)
      .map((c) => (c ? styles[c] || c : ""))
      .join(" ")
  }

  const { stepText, title, description } = STEP_CONTENT[step as CropperStep]

  const isUsingDifferentCardPhoto =
    Boolean(profileFile && cardFile) && profileFile !== cardFile

  return (
    <div className={cx("bw-cropper-modal-backdrop")}>
      <div
        className={cx("bw-cropper-modal")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={cx("bw-cropper-header")}>
          <div className={cx("bw-cropper-heading")}>
            <p className={cx("bw-step-kicker")}>{stepText}</p>
            <h3 id={titleId}>{title}</h3>
            <p id={descriptionId} className={cx("bw-step-description")}>
              {description}
            </p>
          </div>

          <button type="button" className={cx("bw-ghost-btn")} onClick={props.onClose}>
            Cerrar
          </button>
        </div>

        <div className={cx("bw-cropper-body")}>
          <input
            ref={initialInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleInitialFileChange}
          />

          <input
            ref={cardInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleCardFileChange}
          />

          {step === "upload" && (
            <div className={cx("bw-upload-step")}>
              <button
                type="button"
                className={cx("bw-secondary-btn", "bw-upload-only-button")}
                onClick={handlePickInitialFile}
              >
                Seleccionar archivo
              </button>

              {error && <p className={cx("bw-field-error")}>{error}</p>}
            </div>
          )}

          {step !== "upload" && step !== "preview" && (
            <div className={cx("bw-cropper-stage")}>
              <div className={cx("bw-cropper-frame")}>
                <Cropper
                  image={step === "profile" ? profileImageUrl : cardImageUrl}
                  crop={step === "profile" ? profileCrop : cardCrop}
                  zoom={step === "profile" ? profileZoom : cardZoom}
                  aspect={step === "profile" ? PROFILE_ASPECT : CARD_ASPECT}
                  onCropChange={step === "profile" ? setProfileCrop : setCardCrop}
                  onZoomChange={step === "profile" ? setProfileZoom : setCardZoom}
                  onCropComplete={step === "profile" ? onCropCompleteProfile : onCropCompleteCard}
                  showGrid={false}
                  objectFit="cover"
                  restrictPosition={true}
                />
              </div>

              <div className={cx("bw-cropper-controls")}>
                <label className={cx("bw-zoom-label")} htmlFor="bw-zoom-range">
                  Zoom
                </label>

                <input
                  id="bw-zoom-range"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={step === "profile" ? profileZoom : cardZoom}
                  onChange={(e) =>
                    step === "profile"
                      ? setProfileZoom(Number(e.target.value))
                      : setCardZoom(Number(e.target.value))
                  }
                />
              </div>

              {error && <p className={cx("bw-field-error")}>{error}</p>}

              {step === "card" && isUsingDifferentCardPhoto && (
                <p className={cx("bw-inline-note", "bw-inline-note-centered")}>
                  Estás usando una foto distinta para la tarjeta.
                </p>
              )}
            </div>
          )}

          {step === "preview" && (
            <div className={cx("bw-preview-grid")}>
              <div className={cx("bw-preview-block")}>
                <span>Perfil</span>
                <div className={cx("bw-preview-horizontal")}>
                  {previewProfileUrl && (
                    <img src={previewProfileUrl} alt="Vista previa del perfil" />
                  )}
                </div>
              </div>

              <div className={cx("bw-preview-block")}>
                <span>Tarjeta</span>
                <div className={cx("bw-preview-vertical")}>
                  {previewCardUrl && (
                    <img src={previewCardUrl} alt="Vista previa de la tarjeta" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cx("bw-cropper-footer")}>
          {step === "upload" && (
            <>
              <button type="button" className={cx("bw-ghost-btn")} onClick={props.onClose}>
                Cancelar
              </button>
              <div />
            </>
          )}

          {step === "profile" && (
            <>
              <button type="button" className={cx("bw-ghost-btn")} onClick={() => setStep("upload")}>
                Volver
              </button>

              <button
                type="button"
                className={cx("bw-secondary-btn")}
                onClick={() => setStep("card")}
              >
                Continuar
              </button>
            </>
          )}

          {step === "card" && (
            <div className={cx("bw-footer-actions-group")}>
              <div className={cx("bw-footer-actions-left")}>
                <button type="button" className={cx("bw-ghost-btn")} onClick={() => setStep("profile")}>
                  Volver
                </button>
              </div>

              <div className={cx("bw-footer-actions-right")}>
                <button type="button" className={cx("bw-ghost-btn")} onClick={handlePickCardFile}>
                  Subir otra foto para tarjeta
                </button>

                <button
                  type="button"
                  className={cx("bw-secondary-btn")}
                  onClick={handleGoToPreview}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <>
              <button type="button" className={cx("bw-ghost-btn")} onClick={() => setStep("card")}>
                Volver a editar
              </button>

              <button
                type="button"
                className={cx("bw-primary-btn")}
                onClick={handleConfirm}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
