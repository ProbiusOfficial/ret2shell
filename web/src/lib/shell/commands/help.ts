import type { ParseEntry } from 'shell-quote'
import type { RnixStdio } from '../stdio'
import type { Command } from './interface'
import type { RnixEnv } from '../shell'
import * as commands from '.'
import { get } from 'svelte/store'
import { i18n } from '$lib/i18n'

export class Help implements Command {
  name = 'help'
  man = 'help'
  func = async (io: RnixStdio, _args: ParseEntry[], origin: string, envp: RnixEnv) => {
    io.println(get(i18n).t('shell.helpWelcome'))
    for (const command of Object.values(commands)) {
      const cmd = new command()
    }
    return 0
  }
}
