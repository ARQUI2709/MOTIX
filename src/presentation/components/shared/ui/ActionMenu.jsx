// src/presentation/components/shared/ui/ActionMenu.jsx
// í¾¨ UI: MenÃº contextual de acciones

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Edit, Download, Trash2 } from 'lucide-react';

export const ActionMenu = ({ 
  actions = [],
  onAction,
  disabled = false,
  size = "sm"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    if (onAction && !action.disabled) {
      onAction(action.key, action);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "lg": return "w-10 h-10";
      case "md": return "w-8 h-8";
      default: return "w-7 h-7";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "lg": return "w-5 h-5";
      case "md": return "w-4 h-4";
      default: return "w-4 h-4";
    }
  };

  if (actions.length === 0 || disabled) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`${getButtonSize()} flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors`}
      >
        <MoreVertical className={getIconSize()} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {actions.map((action) => {
              const Icon = getActionIcon(action.key);
              return (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(action);
                  }}
                  disabled={action.disabled}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2 ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    action.destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const getActionIcon = (actionKey) => {
  const icons = {
    view: Eye, edit: Edit, download: Download, delete: Trash2,
    duplicate: Edit, export: Download
  };
  return icons[actionKey] || Eye;
};
