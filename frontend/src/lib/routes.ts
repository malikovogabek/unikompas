import type { Role } from '@/types/api'

/** Landing page of a signed-in user. Single source for header, guards and login redirects. */
export function homePathFor(role: Role | undefined): string {
  return role === 'ADMIN' ? '/admin' : '/dashboard'
}
