import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (module: string, action: string): boolean => {
    if (!user || !user.permissions) return false;

    // Check if the user permissions list contains the exact module and action
    return user.permissions.some(
      (p) =>
        p.module.toLowerCase() === module.toLowerCase() &&
        p.actions.includes(action)
    );
  };

  return {
    hasPermission,
    userPermissions: user?.permissions || [],
    userRole: user?.role || null,
  };
};
