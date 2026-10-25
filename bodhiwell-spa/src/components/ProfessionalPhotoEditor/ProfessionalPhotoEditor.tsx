import React, { useMemo, useState } from "react"
import ProfessionalPhotoCropper from "./ProfessionalPhotoCropper"
import type { CropResult } from "./types"
import styles from "./ProfessionalPhotoEditor.module.scss"

type Props = {
  initialImage?: string
  mode?: "create" | "edit"
}

export default function ProfessionalPhotoEditor({
  initialImage,
  mode = "edit",
}: Props) {
  const [displayImage, setDisplayImage] = useState(initialImage || "")
  const [cropperOpen, setCropperOpen] = useState(false)

  const hasImage = useMemo(() => Boolean(displayImage), [displayImage])

  const handleSave = (result: CropResult) => {
    setDisplayImage(result.profileUrl)
    console.log("Resultado crop:", result)
  }

  const cx = (...classes: (string | undefined | false)[]) => {
    return classes
      .filter(Boolean)
      .map((c) => (c ? styles[c] || c : ""))
      .join(" ")
  }

  return (
    <div className={cx("bw-tool-shell")}>
      <section className={cx("bw-stage-screen")} aria-label="Editor de imagen profesional">
        <div className={cx("bw-stage-media", hasImage ? "is-filled" : "is-empty")}>
          {hasImage ? (
            <img
              src={displayImage}
              alt="Imagen profesional actual"
              className={cx("bw-stage-photo")}
            />
          ) : (
            <div className={cx("bw-stage-empty")}>
              <div className={cx("bw-stage-empty-surface")} />
            </div>
          )}

          {mode === "edit" && (
            <div className={cx("bw-stage-actions")}>
              <button
                type="button"
                className={cx("bw-secondary-btn", "bw-stage-action-btn")}
                onClick={() => setCropperOpen(true)}
                aria-label={hasImage ? "Cambiar imagen" : "Subir imagen"}
              >
                {hasImage ? "Cambiar imagen" : "Subir imagen"}
              </button>
            </div>
          )}
        </div>
      </section>

      <ProfessionalPhotoCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
