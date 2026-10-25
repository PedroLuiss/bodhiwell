<?php

namespace App\Utils;

use Symfony\Component\HttpFoundation\File\UploadedFile;

final class FileValidator
{
    public function assertImage(UploadedFile $file, int $maxBytes = 5_000_000): void
    {
        if (!$file->isValid()) {
            throw new \RuntimeException('Error al subir la imagen.', 400);
        }
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        $mime = $file->getMimeType();
        if (!in_array($mime, $allowed, true)) {
            throw new \RuntimeException('Formato de imagen no permitido. Usa JPG, PNG o WEBP.', 422);
        }
        if ($maxBytes > 0 && $file->getSize() > $maxBytes) {
            throw new \RuntimeException('Imagen demasiado grande (máx 5MB).', 413);
        }
    }
}
