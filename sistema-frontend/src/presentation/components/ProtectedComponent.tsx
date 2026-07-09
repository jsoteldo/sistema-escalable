import React from 'react';
import { usePermissions } from '../../core/hooks/usePermissions';

interface ProtectedComponentProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback when permission denied
  behavior?: 'hide' | 'disable'; // Strategy to apply
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  module,
  action,
  children,
  fallback = null,
  behavior = 'hide',
}) => {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, action);

  if (allowed) {
    return <>{children}</>;
  }

  if (behavior === 'disable') {
    // If the behavior is disable, we inject a disabled state to children elements
    return (
      <div style={{ opacity: 0.6, cursor: 'not-allowed' }} title="No tienes permisos para esta acción">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Force disabled prop on basic interactive components (button, input, select, etc.)
            return React.cloneElement(child as React.ReactElement<any>, { disabled: true });
          }
          return child;
        })}
      </div>
    );
  }

  // Default behavior 'hide'
  return <>{fallback}</>;
};
