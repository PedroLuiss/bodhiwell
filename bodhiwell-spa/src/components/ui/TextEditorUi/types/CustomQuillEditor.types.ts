export interface CustomEditorProps {
  value?: string;
  onChange: (content: string) => void;
  placeholder?: string;
}