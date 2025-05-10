import React, { useRef, useState } from 'react';
import './Toolbar.css';
import LinkModal from './LinkModal';
import Tooltip from '@mui/material/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import TitleIcon from '@mui/icons-material/Title';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

const Toolbar = ({ editor, darkMode, onImageUpload }) => {
  const fileInputRef = useRef();
  const [showImgMenu, setShowImgMenu] = useState(false);
  const [showImgModal, setShowImgModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  if (!editor) {
    return null;
  }

  // Image by URL
  const handleImageUrlInsert = (url) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImgModal(false);
    setShowImgMenu(false);
  };

  // Link by URL
  const handleLinkInsert = (url) => {
    if (url) {
      const { from, to, empty } = editor.state.selection;
      if (!empty) {
        // Apply link to selected text
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      } else {
        // Insert the URL as link text
        editor.chain().focus().insertContent(`<a href=\"${url}\">${url}</a>`).run();
      }
    }
    setShowLinkModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    setShowImgMenu(false);
    e.target.value = '';
  };

  return (
    <>
      <div className="toolbar">
        <Tooltip title="Bold (Ctrl+B)" arrow><button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><FormatBoldIcon /></button></Tooltip>
        <Tooltip title="Italic (Ctrl+I)" arrow><button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><FormatItalicIcon /></button></Tooltip>
        <Tooltip title="Underline (Ctrl+U)" arrow><button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}><FormatUnderlinedIcon /></button></Tooltip>
        <Tooltip title="Heading 1" arrow>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}>
            <span className="toolbar-label">H1</span>
          </button>
        </Tooltip>
        <Tooltip title="Heading 2" arrow>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>
            <span className="toolbar-label">H2</span>
          </button>
        </Tooltip>
        <Tooltip title="Heading 3" arrow>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>
            <span className="toolbar-label">H3</span>
          </button>
        </Tooltip>
        <span className="toolbar-divider" />
        <Tooltip title="Heading" arrow><button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}><TitleIcon fontSize="small" /></button></Tooltip>
        <span className="toolbar-divider" />
        <Tooltip title="Bullet List" arrow><button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}><FormatListBulletedIcon /></button></Tooltip>
        <Tooltip title="Numbered List" arrow><button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}><FormatListNumberedIcon /></button></Tooltip>
        <span className="toolbar-divider" />
        <Tooltip title="Blockquote" arrow><button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''}><FormatQuoteIcon /></button></Tooltip>
        <Tooltip title="Code Block" arrow><button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''}><CodeIcon /></button></Tooltip>
        <span className="toolbar-divider" />
        <div className="img-menu-wrapper">
          <Tooltip title="Insert Image" arrow><button type="button" onClick={() => setShowImgMenu((v) => !v)} aria-haspopup="true" aria-expanded={showImgMenu}><ImageIcon /></button></Tooltip>
          {showImgMenu && (
            <div className={`img-menu${darkMode ? ' dark' : ''}`}>
              <button type="button" onClick={() => { fileInputRef.current.click(); }}>From File</button>
              <button type="button" onClick={() => { setShowImgModal(true); }}>From URL</button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
          )}
        </div>
        <Tooltip title="Insert Link" arrow><button onClick={() => setShowLinkModal(true)}><LinkIcon /></button></Tooltip>
        <span className="toolbar-divider" />
        <Tooltip title="Undo (Ctrl+Z)" arrow><button onClick={() => editor.chain().focus().undo().run()}><UndoIcon /></button></Tooltip>
        <Tooltip title="Redo (Ctrl+Y)" arrow><button onClick={() => editor.chain().focus().redo().run()}><RedoIcon /></button></Tooltip>
      </div>
      <LinkModal
        open={showImgModal}
        onClose={() => { setShowImgModal(false); setShowImgMenu(false); }}
        onConfirm={handleImageUrlInsert}
        label="Insert Image URL"
        type="image"
      />
      <LinkModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onConfirm={handleLinkInsert}
        label="Insert Link URL"
        type="link"
      />
    </>
  );
};

export default Toolbar; 