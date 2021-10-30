import { AccessTokenPayload, Permission, UserPermissions } from './tokenUtils'

export function tokenHasPermission(
  token: AccessTokenPayload,
  checkedPermission: Permission,
): boolean {
  return !!token.permissions[checkedPermission]
}

export function userHasPermission(
  permissions: UserPermissions,
  checkedPermission: Permission,
): boolean {
  return Object.keys(permissions).includes(checkedPermission)
}
