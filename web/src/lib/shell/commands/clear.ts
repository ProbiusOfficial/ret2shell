import { get } from 'svelte/store'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'
import { i18n } from '$lib/i18n'

export class Clear implements Command {
  name = 'clear'
  man = get(i18n).t('shell.clear.man')
  func = async (io: RnixStdio) => {
    io.clear()
    return 0
  }
}
