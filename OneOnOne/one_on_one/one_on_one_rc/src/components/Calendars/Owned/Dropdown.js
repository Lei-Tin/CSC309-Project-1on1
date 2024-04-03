import React, { useState, useRef, useEffect } from 'react';

const useOutsideAlerter = (ref, onClose) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, onClose]);
};

const DropdownMenu = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => setIsOpen(false));

    return (
        <div ref={wrapperRef} className="dropdown-container">
            <button onClick={() => setIsOpen(!isOpen)} className="settings-icon">⚙️</button>
            {isOpen && (
                <ul className="setting-panel">
                    <li onClick={onEdit}>Edit</li>
                    <li onClick={onDelete}>Delete</li>
                </ul>
            )}
        </div>
    );
};
