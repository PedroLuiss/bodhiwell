import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './CustomQuillEditor.scss';

import { QUILL_FORMATS, QUILL_MODULES } from './constant/CustomQuillEditor.constant';
import { CustomEditorProps } from './types/CustomQuillEditor.types';

import { useCustomQuillEditor } from './hooks/useCustomQuillEditor';

const CustomQuillEditor: React.FC<CustomEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Compártenos tu experiencia y tu sentir...' 
}) => {
    
  const { 
    localValue, 
    cleanPlaceholder, 
    handleChange 
  } = useCustomQuillEditor({ value, onChange, placeholder });

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill 
        theme="snow"
        value={localValue}
        onChange={handleChange}
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        placeholder={cleanPlaceholder}
      />
    </div>
  );
};

export default CustomQuillEditor;