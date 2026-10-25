import { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import styles from './FileDropzone.module.scss';
import { DownloadIcon } from '../../icons/DownloadIcon';

interface FileDropzoneProps {
  onFileSelected: (file: File | null) => void;
  initialFile?: File | null;
  acceptedFileTypes?: Accept;
  maxFileSize?: number;
}

export const FileDropzone = ({
  onFileSelected,
  initialFile = null,
  acceptedFileTypes = { 'image/jpeg': [], 'image/png': [] },
  maxFileSize = 25 * 1024 * 1024,
}: FileDropzoneProps) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setSelectedFile(file);
    onFileSelected(file);
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
    maxSize: maxFileSize,
  });

  return (
    <div {...getRootProps()} className={styles['dropzone']}>
      <input {...getInputProps()} />

      <div className={styles['dropzone__icon']}>
        <DownloadIcon width={20} />
      </div>

      {isDragActive ? (
        <p className={styles['dropzone__text']}>{t('landing.FileDropzone.dropFileHere')}</p>
      ) : selectedFile ? (
        <p className={styles['dropzone__text']}>{t('landing.FileDropzone.file')} {selectedFile.name}</p>
      ) : (
        <p className={styles['dropzone__text']}>
          <span>{t('landing.FileDropzone.clickToUpload')}</span> {t('landing.FileDropzone.orDragHere')}
        </p>
      )}

      <p className={styles['dropzone__hint']}>
        {t('landing.FileDropzone.maxFileSize', { size: maxFileSize / (1024 * 1024) })}
      </p>
    </div>
  );
};