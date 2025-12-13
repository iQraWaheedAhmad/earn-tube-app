import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, Mail } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  email?: string;
  type?: 'error' | 'warning' | 'info';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  email,
  type = 'error'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'info':
        return <Mail className="w-12 h-12 text-blue-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-red-500/10 border-red-500/30';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-background rounded-2xl shadow-2xl border border-border p-8 max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getBgColor()}`}>
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {title}
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {message}
          </p>

          {email && (
            <div className={`p-4 rounded-lg ${getBgColor()} mb-6`}>
              <p className="text-sm font-medium mb-2 text-foreground">
                Contact Support:
              </p>
              <p className="font-semibold text-foreground">
                {email}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="hero-gradient text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
