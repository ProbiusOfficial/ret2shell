import { _ } from 'svelte-i18n'
import { get } from 'svelte/store'

export interface User {
  id: number
  name: string
  email: string
  level: number
  intro: string
  cover_path: string | null
  institute_info: string | null
  institute_id: number | null
  hidden: boolean
  banned: boolean
}

export function getUserRole(level: number): string {
  switch (level) {
    case 0:
      return get(_)('account.unverified')
    case 1:
      return get(_)('account.player')
    case 2:
      return get(_)('account.domainAdmin')
    case 3:
      return get(_)('account.superAdmin')
    default:
      return get(_)('account.unknown')
  }
}
