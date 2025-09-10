import { useAuth } from '../hooks/useAuth';

/**
 * Hook to check if the current user has the required permissions
 * @param {string|string[]} requiredRole - The role or roles required to access the resource
 * @param {boolean} requireVerification - Whether email verification is required (default: true)
 * @returns {{ hasPermission: boolean, isVerified: boolean, isAuthorized: boolean, isAdmin: boolean }}
 */
export const usePermissions = (requiredRole = null, requireVerification = true) => {
  const { currentUser, isAdmin, isAuthorized, isVerified } = useAuth();
  
  // If no user is logged in
  if (!currentUser) {
    return {
      hasPermission: false,
      isVerified: false,
      isAuthorized: false,
      isAdmin: false,
      message: 'You must be logged in to access this resource.'
    };
  }

  // Check if email verification is required
  const verified = !requireVerification || isVerified();
  
  // If no specific role is required, just check if user is verified (if required)
  if (!requiredRole) {
    return {
      hasPermission: verified,
      isVerified: verified,
      isAuthorized: isAuthorized(),
      isAdmin: isAdmin(),
      message: verified ? '' : 'Please verify your email to continue.'
    };
  }

  // Convert single role to array for consistent handling
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => {
    if (role === 'admin') return isAdmin();
    if (role === 'author') return isAuthorized();
    return currentUser.role === role;
  });

  // User has permission if they have the required role and are verified (if required)
  const hasPermission = hasRequiredRole && verified;

  return {
    hasPermission,
    isVerified: verified,
    isAuthorized: isAuthorized(),
    isAdmin: isAdmin(),
    message: !verified 
      ? 'Please verify your email to continue.' 
      : !hasRequiredRole 
        ? 'You do not have permission to access this resource.'
        : ''
  };
};

/**
 * Higher-Order Component to protect routes based on user permissions
 * @param {React.Component} Component - The component to protect
 * @param {Object} options - Permission options
 * @param {string|string[]} [options.requiredRole] - Required role(s) to access the component
 * @param {boolean} [options.requireVerification=true] - Whether email verification is required
 * @param {React.Component} [options.FallbackComponent] - Component to render if permission is denied
 * @returns {React.Component}
 */
export const withPermission = (Component, options = {}) => {
  const { 
    requiredRole = null, 
    requireVerification = true, 
    FallbackComponent = null 
  } = options;

  return function WithPermissionWrapper(props) {
    const { 
      hasPermission, 
      isVerified, 
      isAuthorized, 
      isAdmin, 
      message 
    } = usePermissions(requiredRole, requireVerification);

    // If no FallbackComponent is provided, don't render anything
    if (!hasPermission && !FallbackComponent) return null;
    
    // If user doesn't have permission, render the fallback component
    if (!hasPermission && FallbackComponent) {
      return (
        <FallbackComponent 
          {...props} 
          permissionInfo={{ isVerified, isAuthorized, isAdmin, message }}
        />
      );
    }

    // User has permission, render the protected component
    return <Component {...props} />;
  };
};
