import { register, init, getLocaleFromNavigator } from 'svelte-i18n'
import { theme } from '$lib/stores/theme'
import { get } from 'svelte/store'

register('en', () => import('./en.json'))
register('zh', () => import('./zh.json'))

init({
  fallbackLocale: 'en',
  initialLocale: get(theme).language || getLocaleFromNavigator(),
})
