import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface UseCustomQuillEditorProps {
  value?: string;
  onChange: (content: string) => void;
  placeholder: string;
}

export const useCustomQuillEditor = ({ 
  value, 
  onChange, 
  placeholder 
}: UseCustomQuillEditorProps) => {
  const [localValue, setLocalValue] = useState(value || '');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (value !== undefined && value !== localValue && !isTyping.current) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = useCallback((content: string) => {
    if (content === localValue) return;

    isTyping.current = true;
    setLocalValue(content);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      isTyping.current = false;
      onChange(content);
    }, 300);
  }, [localValue, onChange]);

  const cleanPlaceholder = useMemo(() => {
    return placeholder ? placeholder.replace(/<[^>]*>?/gm, '').trim() : '';
  }, [placeholder]);

  return {
    localValue,
    cleanPlaceholder,
    handleChange
  };
};