import { Permission, Role, ROLE_PERMISSIONS } from './permission-definitions'
import { User } from '@/models/User'
import { CustomRole } from '@/models/CustomRole'

/**
 * Check if a user has a specific test management permission.
 * Checks in order: admin role → global ROLE_PERMISSIONS → custom role permissions.
 *
 * @param userId  - The authenticated user's ID
 * @param userRole - The user's global role string (e.g. 'admin', 'project_manager')
 * @param requiredPermission - The Permission enum value to check
 * @returns true if the user has the permission
 */
export async function hasTestPermission(
  userId: string,
  userRole: string,
  requiredPermission: Permission
): Promise<boolean> {
  const roleLower = (userRole || '').toLowerCase()

  // Admin / Super Admin → full access
  if (['admin', 'super_admin', 'superadmin'].includes(roleLower)) {
    return true
  }

  // Check the user's global ROLE_PERMISSIONS
  const rolePermissions = ROLE_PERMISSIONS[userRole as Role] || []
  if (rolePermissions.includes(requiredPermission)) {
    return true
  }

  // Check custom role permissions (e.g. QA custom role)
  try {
    const user = await User.findById(userId).select('customRole').lean() as any
    if (user?.customRole) {
      const customRole = await CustomRole.findById(user.customRole).select('permissions isActive').lean() as any
      if (customRole?.isActive && Array.isArray(customRole.permissions)) {
        if (customRole.permissions.includes(requiredPermission)) {
          return true
        }
      }
    }
  } catch {
    // Silently fail — deny by default
  }

  return false
}
