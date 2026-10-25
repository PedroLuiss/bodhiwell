import React, { useEffect, useRef } from 'react';
import './RichTextEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

interface RTEProps {
    value: string;
    onChange: (html: string) => void;
    minHeight?: number;
    id?: string;
    placeholder?: string;
}

export const RichTextEditor: React.FC<RTEProps> = ({ value, onChange, minHeight = 160, id, placeholder }) => {
    const isExternalUpdate = useRef(false);
    const lastSent = useRef<string>(value);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Link.configure({ openOnClick: true, autolink: true }),
            Placeholder.configure({ placeholder: placeholder || 'Escribe aquí...' })
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastSent.current = html;
            onChange(html);
        }
    });

    useEffect(() => {
        if (!editor) return;
        if (value !== lastSent.current) {
            isExternalUpdate.current = true;
            editor.commands.setContent(value || '', { emitUpdate: false });
            lastSent.current = value;
            isExternalUpdate.current = false;
        }
    }, [value, editor]);

    return (
        <div className="tiptap-editor" id={id} style={{ border: '1px solid #d0d7de', borderRadius: 6, padding: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} label="B" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} label="I" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} label="S" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} label="H1" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} label="H2" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} label="H3" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} label="• List" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} label="1. List" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} label=">" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().undo().run()} label="Undo" />
                <ToolbarButton editor={editor} command={() => editor?.chain().focus().redo().run()} label="Redo" />
            </div>
            <EditorContent editor={editor} style={{ minHeight, outline: 'none' }} />
        </div>
    );
};

interface ToolbarButtonProps {
    editor: any;
    command: () => void;
    active?: boolean;
    label: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ command, active, label }) => {
    return (
        <button
            type="button"
            onClick={command}
            style={{
                background: active ? '#fe5f55' : '#f6f8fa',
                color: active ? '#fff' : '#333',
                border: '1px solid #d0d7de',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 12,
                cursor: 'pointer'
            }}
        >{label}</button>
    );
};
