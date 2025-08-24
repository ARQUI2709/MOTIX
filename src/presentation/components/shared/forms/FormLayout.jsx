// src/presentation/components/shared/forms/FormLayout.jsx
// í´§ FORMS: Layout consistente para formularios

import React from 'react';
import { Save, X, RotateCcw } from 'lucide-react';

export const FormLayout = ({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitText = "Guardar",
  cancelText = "Cancelar",
  isSubmitting = false,
  showCancel = true,
  submitDisabled = false,
  className = ""
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !isSubmitting) onSubmit(e);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-6">{children}</div>

        {(onSubmit || onCancel) && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            {onCancel && showCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2 inline" />
                {cancelText}
              </button>
            )}

            {onSubmit && (
              <button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                className={`px-6 py-2 text-sm font-medium rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                  isSubmitting || submitDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 mr-2 inline animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="w-4 h-4 mr-2 inline" />
                )}
                {isSubmitting ? 'Guardando...' : submitText}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
