import React, { useCallback, useEffect, useState, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Toolbar from './Toolbar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import './Editor.css';
import { Plugin, PluginKey } from 'prosemirror-state';
import { marked } from 'marked';

// Accordion component for displaying HTML and JSON output with copy functionality
const Accordion = ({ title, open, onClick, children, onCopy, copyLabel, copied }) => (
  <div className="accordion-item">
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <button className="accordion-title" onClick={onClick} aria-expanded={open} style={{ flex: 1 }}>
        {title}
        <span className="accordion-arrow">
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </span>
      </button>
      {open && (
        <Tooltip title={copied ? 'Copied!' : copyLabel} arrow>
          <button className="copy-btn" onClick={onCopy} style={{ marginLeft: 8 }}>
            <ContentCopyIcon fontSize="small" />
          </button>
        </Tooltip>
      )}
    </div>
    {open && <div className="accordion-content">{children}</div>}
  </div>
);

const Editor = () => {
  // State management for editor content and UI
  const [html, setHtml] = useState('');
  const [json, setJson] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('html');
  const editorContentRef = useRef();
  const [copied, setCopied] = useState({ html: false, json: false });

  // Initialize Tiptap editor with extensions and configuration
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link,
    ],
    content: '<p>Hello! Start editing...</p>',
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      setJson(editor.getJSON());
    },
    // Handle markdown paste: convert markdown to HTML before inserting
    editorProps: {
      handlePaste(view, event) {
        const clipboardText = event.clipboardData?.getData('text/plain');
        // Check if pasted content contains markdown syntax
        if (clipboardText && /[#*_`\-\[\]>]/.test(clipboardText)) {
          const html = marked.parse(clipboardText);
          // Clear selection and prepare for HTML insertion
          view.dispatch(
            view.state.tr.replaceSelectionWith(
              view.state.schema.nodeFromJSON(
                view.state.schema.node('doc', null, view.state.schema.node('paragraph', null, view.state.schema.text(''))).toJSON()
              )
            )
          );
          // Insert converted HTML content
          setTimeout(() => {
            view.dom.ownerDocument.defaultView.editor.commands.insertContent(html);
          }, 0);
          return true;
        }
        return false;
      },
    },
    // Additional ProseMirror plugin for markdown paste support
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('markdownPaste'),
          props: {
            handlePaste(view, event) {
              const clipboardText = event.clipboardData?.getData('text/plain');
              if (clipboardText && /[#*_`\-\[\]>]/.test(clipboardText)) {
                const html = marked.parse(clipboardText);
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodeFromJSON(
                      view.state.schema.node('doc', null, view.state.schema.node('paragraph', null, view.state.schema.text(''))).toJSON()
                    )
                  )
                );
                setTimeout(() => {
                  view.dom.ownerDocument.defaultView.editor.commands.insertContent(html);
                }, 0);
                return true;
              }
              return false;
            },
          },
        }),
      ];
    },
  });

  // Update HTML and JSON output when editor content changes
  useEffect(() => {
    if (editor) {
      setHtml(editor.getHTML());
      setJson(editor.getJSON());
    }
  }, [editor]);

  // Handle image upload: convert file to base64 and insert into editor
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!editor) return;
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    });
  };

  // Copy content to clipboard with visual feedback
  const handleCopy = (type, value) => {
    navigator.clipboard.writeText(value);
    setCopied(c => ({ ...c, [type]: true }));
    setTimeout(() => setCopied(c => ({ ...c, [type]: false })), 1200);
  };

  return (
    <div className={`editor-container${darkMode ? ' dark' : ''}`}>  
      {/* Dark mode toggle button */}
      <div className="toggle-row">
        <button className="dark-toggle" onClick={() => setDarkMode(dm => !dm)}>
          {darkMode ? <DarkModeIcon fontSize="small" style={{verticalAlign:'middle'}}/> : <LightModeIcon fontSize="small" style={{verticalAlign:'middle'}}/>}
          {darkMode ? ' Dark' : ' Light'}
        </button>
      </div>
      {/* Editor toolbar and content area */}
      <Toolbar editor={editor} darkMode={darkMode} onImageUpload={handleImageUpload} />
      <div
        className={`editor-content${dragOver ? ' drag-over' : ''}`}
        ref={editorContentRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <EditorContent editor={editor} />
      </div>
      {/* Output accordions for HTML and JSON */}
      <div className="output-accordion">
        <Accordion
          title="HTML Output"
          open={openAccordion === 'html'}
          onClick={() => setOpenAccordion(openAccordion === 'html' ? '' : 'html')}
          onCopy={() => handleCopy('html', html)}
          copyLabel="Copy HTML"
          copied={copied.html}
        >
          <pre>{html}</pre>
        </Accordion>
        <Accordion
          title="JSON Output"
          open={openAccordion === 'json'}
          onClick={() => setOpenAccordion(openAccordion === 'json' ? '' : 'json')}
          onCopy={() => handleCopy('json', JSON.stringify(json, null, 2))}
          copyLabel="Copy JSON"
          copied={copied.json}
        >
          <pre>{JSON.stringify(json, null, 2)}</pre>
        </Accordion>
      </div>
    </div>
  );
};

export default Editor; 