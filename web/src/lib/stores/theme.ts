import { getLocaleFromNavigator } from 'svelte-i18n'
import { writable } from 'svelte/store'
import { browser } from '$app/environment'

class ThemeStore {
  colorScheme = 'dark'
  language = 'en'
  constructor() {
    if (browser) {
      const stored = localStorage.getItem('theme')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.colorScheme = parsed.colorScheme
        this.language = parsed.language
        return
      }
      const systemPrefersTheme =
        window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemPrefersLanguage = getLocaleFromNavigator()
      this.colorScheme = systemPrefersTheme ? 'dark' : 'light'
      this.language = systemPrefersLanguage ? systemPrefersLanguage : 'en'
    }
  }
}

export const theme = writable(new ThemeStore())

theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem('theme', JSON.stringify(value))
  }
})
