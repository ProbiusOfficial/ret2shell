<script lang="ts">
  import RxButton from '$lib/components/RxButton.svelte'
  import RxInput from '$lib/components/RxInput.svelte'
  import RxLink from '$lib/components/RxLink.svelte'
  import { i18n } from '$lib/i18n'
  import type { Game } from '$lib/models/game'
  import { theme } from '$lib/stores/theme'
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte'

  export let playgrounds: Game[] = [
    {
      id: 1,
      updated_at: 0,
      name: '一天一道题，强壮逆向人',
      brief: 'RX的奇妙逆向练习贴',
      introduction: 'RX的奇妙逆向练习贴',
      start_time: 0,
      end_time: 0,
      register_time: 0,
      archive_time: 0,
      hidden: false,
      frozen: false,
      host_as_game: false,
      team_size_limit: 1,
      cover_path: 'string',
      enable_team_audit: false,
      can_register_after_started: true,
      institute_id: null,
    },
  ]
  export let games: Game[] = []
</script>

<OverlayScrollbarsComponent
  options={{
    scrollbars: { theme: $theme.colorScheme === 'light' ? 'os-theme-dark' : 'os-theme-light', autoHide: 'scroll' },
  }}
  class="w-full h-full flex flex-col relative print:hidden"
  defer
>
  <div class="h-32 bg-base-100 border-b border-b-base-content/5 flex flex-col sticky top-0 p-4">
    <h1 class="font-bold flex-1 flex flex-row justify-center items-center space-x-2">
      <span class="icon-[fluent--dumbbell-16-regular] w-6 h-6" />
      <span>
        {$i18n.t('playground.sideToc')}
      </span>
    </h1>
    <div class="flex-1 join">
      <RxInput class="join-item" />
      <RxButton square class="join-item ml-0">
        <span class="icon-[fluent--search-16-regular] w-6 h-6" />
      </RxButton>
    </div>
  </div>
  <div class="flex-1 flex-col">
    {#if playgrounds.length === 0 && games.length === 0}
      <p class="text-base font-semibold p-4 opacity-60 text-center">{$i18n.t('playground.emptyCategory')}</p>
    {/if}
    {#if playgrounds.length > 0}
      <h2 class="text-base font-semibold p-4 pb-0 flex flex-row items-center justify-center space-x-2 opacity-60">
        <span class="icon-[fluent--beaker-16-regular] w-6 h-6" />
        <span>
          {$i18n.t('playground.persistTitle')}
        </span>
      </h2>
      <div class="flex flex-col p-4">
        {#each playgrounds as item}
          <RxLink class="w-full" justify="start" ghost href={`/playground/${item.id}`}>
            <span class="icon-[fluent--bookmark-16-regular] w-6 h-6" />
            <span class="flex-1 text-start">{item.name}</span>
            <span class="icon-[fluent--chevron-right-16-regular] w-5 h-5" />
          </RxLink>
        {/each}
      </div>
    {/if}
    {#if games.length > 0}
      <h2 class="text-base font-semibold p-4 pb-0 flex flex-row items-center justify-center space-x-2 opacity-60">
        <span class="icon-[fluent--flag-16-regular] w-6 h-6" />
        <span>
          {$i18n.t('playground.gamesTitle')}
        </span>
      </h2>
      <div class="flex flex-col p-4">
        {#each playgrounds as item}
          <RxLink class="w-full" justify="start" ghost href={`/playground/${item.id}`}>
            <span class="icon-[fluent--archive-16-regular] w-6 h-6" />
            <span class="flex-1 text-start">{item.name}</span>
            <span class="icon-[fluent--chevron-right-16-regular] w-5 h-5" />
          </RxLink>
        {/each}
      </div>
    {/if}
  </div>
</OverlayScrollbarsComponent>
