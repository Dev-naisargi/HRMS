import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            <div className={`relative bg-white dark:bg-gray-900 w-full ${maxWidth} rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800`}>
                <div className="px-8 py-6 flex items-center justify-between shrink-0">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
