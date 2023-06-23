<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { theme } from '$lib/stores/theme'
  import RxButton from '$lib/components/RxButton.svelte'

  function toggleColorScheme(scheme: string) {
    $theme.colorScheme = scheme
  }

  function toggleLanguage(language: string) {
    if (language === $theme.language) return
    $theme.language = language
    setTimeout(() => {
      location.reload()
    })
  }
</script>

<div class="p-2 flex flex-col">
  <div class="text-sm opacity-60 p-1">{$_('theme.colorScheme')}</div>
  <div class="flex flex-row space-x-2">
    <RxButton ghost class="flex-1" on:click={() => toggleColorScheme('light')}>
      <span
        class="icon-[fluent--weather-sunny-16-regular] w-6 h-6"
        class:text-primary={$theme.colorScheme === 'light'}
      />
    </RxButton>
    <RxButton ghost class="flex-1" on:click={() => toggleColorScheme('dark')}>
      <span class="icon-[fluent--weather-moon-16-regular] w-6 h-6" class:text-primary={$theme.colorScheme === 'dark'} />
    </RxButton>
  </div>
  <div class="text-sm opacity-60 p-2">{$_('theme.language')}</div>
  <div class="flex flex-col">
    <RxButton
      ghost
      justify="start"
      class="flex-1"
      active={$theme.language === 'zh'}
      on:click={() => toggleLanguage('zh')}
    >
      <span class="icon-[fluent--local-language-16-regular] w-6 h-6" />
      <span>{$_('theme.simplifiedChinese')}</span>
    </RxButton>
    <RxButton
      ghost
      justify="start"
      class="flex-1"
      active={$theme.language === 'en'}
      on:click={() => toggleLanguage('en')}
    >
      <span class="icon-[fluent--local-language-16-regular] w-6 h-6" />
      <span>{$_('theme.english')}</span>
    </RxButton>
  </div>
</div>
