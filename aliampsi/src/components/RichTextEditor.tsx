'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { upload } from '@vercel/blob/client';

/** Botón de la barra de herramientas. */
function Tool({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={[
        'inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm transition',
        active ? 'bg-ink text-paper' : 'text-ink hover:bg-sand',
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-line" aria-hidden />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileRef.current) fileRef.current.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) {
        const r = await upload(f.name, f, { access: 'public', handleUploadUrl: '/api/upload' });
        editor.chain().focus().setImage({ src: r.url }).run();
      }
    } catch {
      window.alert('No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const setLink = useCallback(() => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Dirección del enlace (dejá vacío para quitarlo):', previous || 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = window.prompt('Pegá el enlace del video (YouTube o Vimeo):');
    if (!url || !url.trim()) return;
    const clean = url.trim();
    editor
      .chain()
      .focus()
      .insertContent([
        { type: 'paragraph', content: [{ type: 'text', text: clean, marks: [{ type: 'link', attrs: { href: clean } }] }] },
        { type: 'paragraph' },
      ])
      .run();
  }, [editor]);

  const blockValue = editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
      ? 'h3'
      : editor.isActive('heading', { level: 4 })
        ? 'h4'
        : 'p';

  const setBlock = (v: string) => {
    const c = editor.chain().focus();
    if (v === 'p') c.setParagraph().run();
    else c.toggleHeading({ level: Number(v.replace('h', '')) as 2 | 3 | 4 }).run();
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-lg border border-line bg-paper/95 px-2 py-1.5 backdrop-blur">
      <select
        value={blockValue}
        onChange={(e) => setBlock(e.target.value)}
        className="mr-1 h-8 rounded border border-line bg-white px-2 text-sm text-ink"
        title="Estilo de texto"
        aria-label="Estilo de texto"
      >
        <option value="p">Párrafo</option>
        <option value="h2">Título 2</option>
        <option value="h3">Título 3</option>
        <option value="h4">Título 4</option>
      </select>

      <Divider />

      <Tool title="Negrita (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Tool>
      <Tool title="Itálica (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Tool>
      <Tool title="Subrayado (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </Tool>
      <Tool title="Tachado" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </Tool>
      <Tool title="Código" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        {'</>'}
      </Tool>

      <Divider />

      <Tool title="Lista con viñetas" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        ••
      </Tool>
      <Tool title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </Tool>
      <Tool title="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </Tool>
      <Tool title="Línea separadora" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </Tool>

      <Divider />

      <Tool title="Alinear a la izquierda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        ⬅
      </Tool>
      <Tool title="Centrar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        ↔
      </Tool>
      <Tool title="Alinear a la derecha" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        ➡
      </Tool>
      <Tool title="Justificar" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
        ☰
      </Tool>

      <Divider />

      <Tool title="Insertar enlace" active={editor.isActive('link')} onClick={setLink}>
        🔗
      </Tool>
      <label
        title="Insertar imagen"
        className="inline-flex h-8 cursor-pointer items-center justify-center rounded px-2 text-sm text-ink transition hover:bg-sand"
      >
        {uploading ? '…' : '🖼'}
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImage} disabled={uploading} />
      </label>
      <Tool title="Insertar video (YouTube o Vimeo)" onClick={addVideo}>
        🎬
      </Tool>

      <Divider />

      <Tool title="Quitar formato" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        ✕
      </Tool>
      <Tool title="Deshacer (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </Tool>
      <Tool title="Rehacer (Ctrl+Shift+Z)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </Tool>
    </div>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
  label = 'Contenido',
}: {
  name: string;
  defaultValue?: string | null;
  label?: string;
}) {
  const initial = defaultValue ?? '';
  const [html, setHtml] = useState(initial);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noreferrer' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Escribí acá el contenido…' }),
    ],
    content: initial,
    editorProps: {
      attributes: {
        class:
          'prose-editor min-h-[320px] max-w-none rounded-b-lg border border-t-0 border-line bg-white px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  // Contador simple de palabras
  const [words, setWords] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const text = editor.getText().trim();
      setWords(text ? text.split(/\s+/).length : 0);
    };
    update();
    editor.on('update', update);
    return () => {
      editor.off('update', update);
    };
  }, [editor]);

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="overflow-hidden rounded-lg">
        {editor ? (
          <>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className="min-h-[320px] rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink-muted">
            Cargando editor…
          </div>
        )}
      </div>
      <input type="hidden" name={name} value={html} />
      <p className="mt-1.5 text-xs text-ink-muted">
        {words} palabra{words === 1 ? '' : 's'} · Un enlace de YouTube o Vimeo solo en su párrafo se muestra como video.
      </p>
    </div>
  );
}
