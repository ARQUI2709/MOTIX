// src/presentation/components/templates/MainTemplate.jsx
// í³„ TEMPLATE: Template principal para todas las pÃ¡ginas

import React from 'react';
import { PageFooter } from '../shared/layout/PageFooter';

export const MainTemplate = ({
  children,
  showFooter = true,
  footerProps = {},
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <main className="flex-1">{children}</main>
      {showFooter && <PageFooter {...footerProps} />}
    </div>
  );
};
