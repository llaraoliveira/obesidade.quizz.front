'use client';

import { X, Edit, Trash2, Plus } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
}

export default function SideMenu({ isOpen, onClose, title, children, position = 'right' }: SideMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Lateral */}
      <div className={`
        fixed top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${position === 'right' ? 'right-0' : 'left-0'}
        ${isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}

// Componentes reutilizáveis para botões de ação
interface ActionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function ActionButton({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  className = ''
}: ActionButtonProps) {
  const baseClasses = 'w-full font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? 'Processando...' : children}
    </button>
  );
}

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: 'edit' | 'delete' | 'add';
}

export function IconButton({ onClick, children, title, variant = 'edit' }: IconButtonProps) {
  const baseClasses = 'p-2 rounded-lg transition-colors';
  
  const variantClasses = {
    edit: 'hover:bg-blue-100 text-blue-600',
    delete: 'hover:bg-red-100 text-red-600',
    add: 'hover:bg-green-100 text-green-600'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={title}
    >
      {children}
    </button>
  );
}
