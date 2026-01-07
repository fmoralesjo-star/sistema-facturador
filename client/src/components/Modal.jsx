import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;

    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                minWidth: '500px',
                maxWidth: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ✕
                </button>
                {children}
            </div>
        </div>,
        modalRoot
    );
};

export default Modal;
