/ src/presentation/components/shared/ui/NotificationToast.jsx
// 🎨 UI: Sistema de notificaciones

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = ({ 
  message, 
  type = "info", 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50", border: "border-green-200", 
          text: "text-green-800", icon: CheckCircle, iconColor: "text-green-600"
        };
      case "error":
        return {
          bg: "bg-red-50", border: "border-red-200",
          text: "text-red-800", icon: XCircle, iconColor: "text-red-600"
        };
      default:
        return {
          bg: "bg-blue-50", border: "border-blue-200",
          text: "text-blue-800", icon: Info, iconColor: "text-blue-600"
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
    }`}>
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          </div>
          <button
            onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
            className={`${styles.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};