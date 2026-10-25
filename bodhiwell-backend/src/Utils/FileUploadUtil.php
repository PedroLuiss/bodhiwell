<?php

namespace App\Utils;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\String\Slugger\SluggerInterface;

class FileUploadUtil
{
    public function __construct(
        private array $uploadsConfig,
        private SluggerInterface $slugger
    ) {}

    /**
     * @param UploadedFile
     * @param string       
     * @return string             
     * @throws FileException
     */
    public function upload(UploadedFile $file, string $type): string
    {
        if (!isset($this->uploadsConfig[$type])) {
            throw new FileException("Tipo '{$type}' no configurado.");
        }

        $cfg       = $this->uploadsConfig[$type];
        $dir       = $cfg['directory'];
        $maxSize   = $cfg['max_size'];
        $mimeTypes = $cfg['mime_types'];

        if ($file->getSize() > $maxSize) {
            throw new FileException('Fichero demasiado grande.');
        }

        if (!in_array($file->getMimeType(), $mimeTypes, true)) {
            throw new FileException('Tipo de fichero no permitido.');
        }

        $original = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safe     = $this->slugger->slug($original);
        $newName  = sprintf('%s-%s.%s', $safe, uniqid(), $file->guessExtension());

        try {
            $file->move($dir, $newName);
        } catch (\Exception $e) {
            throw new FileException('Error al guardar fichero.');
        }

        $folderMap = [
            'profile_images' => 'profiles',
            'certificates'   => 'certificates',
            'profile_banners' => 'banners', 
            'documents'      => 'docs',
        ];

        if (!isset($folderMap[$type])) {
            $folder = $type;
        } else {
            $folder = $folderMap[$type];
        }

        return sprintf('/uploads/%s/%s', $folder, $newName);
    }
}
