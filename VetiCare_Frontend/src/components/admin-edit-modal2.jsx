function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;



    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;