import React, { useState, useEffect } from 'react';
import './LinkModal.css';

const LinkModal = ({ open, onClose, onConfirm, label, type = 'link' }) => {
  const [value, setValue] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (open) {
      setValue('');
      setImgError(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{label}</h3>
        <input
          type="text"
          placeholder={type === 'image' ? 'Paste image URL...' : 'Paste link URL...'}
          value={value}
          onChange={e => {
            setValue(e.target.value);
            setImgError(false);
          }}
          autoFocus
        />
        {type === 'image' && value && (
          <div className="modal-img-preview">
            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
            <img
              src={value}
              alt="Preview"
              onError={() => setImgError(true)}
              style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8, borderRadius: 6, border: '1px solid #eee' }}
            />
            {imgError && <div className="modal-img-error">Image not found or invalid URL.</div>}
          </div>
        )}
        <div className="modal-actions">
          <button onClick={onClose} className="modal-cancel">Cancel</button>
          <button
            onClick={() => onConfirm(value)}
            className="modal-confirm"
            disabled={!value || (type === 'image' && imgError)}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal; 