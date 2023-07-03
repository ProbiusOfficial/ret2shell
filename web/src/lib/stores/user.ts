import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import type { User } from '$lib/models/user'

class UserStore {
  token = ''
  id = -1
  name = ''
  level = -1
  isLoggedIn = false
  info: User = {} as User

  constructor() {
    if (browser) {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.token = parsed.token
        this.id = parsed.id
        this.name = parsed.name
        this.level = parsed.level
        this.isLoggedIn = parsed.isLoggedIn
        this.info = parsed.info
        return
      }
    }
  }
}

export const user = writable(new UserStore())

user.subscribe((value) => {
  if (browser) localStorage.setItem('user', JSON.stringify(value))
})
