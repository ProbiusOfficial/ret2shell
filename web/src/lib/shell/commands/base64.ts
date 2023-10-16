import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'
import { get } from 'svelte/store'
import { i18n } from '$lib/i18n'

export class Base64 implements Command {
  name = 'base64'
  man = get(i18n).t('shell.base64.man')
  func = async (io: RnixStdio, args: ParseEntry[]) => {
    if (args.length !== 2) {
      io.logError(get(i18n).t('shell.base64.needArgs'))
      io.logInfo(get(i18n).t('shell.base64.usage'))
      return 1
    }
    const mode = args[0].toString().trim()
    const content = args[1].toString().trim()
    try {
      if (mode === '-d') {
        io.println(atob(content))
      } else if (mode === '-e') {
        io.println(btoa(content))
      } else {
        io.logError(get(i18n).t('shell.base64.needArgs'))
        io.logInfo(get(i18n).t('shell.base64.usage'))
        return 1
      }
    } catch {
      io.logError(get(i18n).t('shell.base64.invalid'))
      return 1
    }
    return 0
  }
}
