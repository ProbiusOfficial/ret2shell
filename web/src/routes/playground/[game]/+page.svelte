<script lang="ts">
  import { page } from '$app/stores'
  import { getGame } from '$lib/api/game'
    import Error from '$lib/blocks/Error.svelte'
  import RxButton from '$lib/components/RxButton.svelte'
  import { i18n } from '$lib/i18n'
  import type { Game } from '$lib/models/game'
  import { platform } from '$lib/stores/platform'
  import type { AxiosError } from 'axios'
  import Split from 'split.js'
  import { onMount } from 'svelte'

  onMount(() => {
    Split(['#challenge-list', '#challenge-detail'], {
      direction: 'vertical',
      gutterSize: 8,
      gutterAlign: 'center',
      minSize: 320,
      gutterStyle: (_dimension, gutterSize) => {
        return {
          height: `${gutterSize}px`,
          cursor: 'row-resize',
        }
      },
      gutter: (_index, direction) => {
        const gutter = document.createElement('div')
        gutter.className = `gutter gutter-${direction} border-b border-b-base-content/5`
        return gutter
      },
    })
  })

  let game: Game | null = null
  let error = 200

  let gameId = $page.params.game ? parseInt($page.params.game) || null : null
  if (gameId) {
    getGame(gameId)
      .then((res) => {
        game = res
      })
      .catch((err) => {
        error = (err as AxiosError).response?.status || 500
      })
  } else {
    error = 404
  }
</script>

<svelte:head><title>{game?.name || $i18n.t('playground.gameLoading')} - {$platform.name}</title></svelte:head>

{#if error - 200 < 100}
  <div class="flex-1 flex flex-col">
    <div id="challenge-list" class="flex flex-col">
      <div class="h-16 border-b border-b-base-content/5 flex flex-row items-center px-2 space-x-2 backdrop-blur">
        <RxButton ghost active>
          <span class="w-4 h-4 icon-[fluent--pin-16-regular]" />
          {$i18n.t('playground.gameIntro')}
        </RxButton>
        <div class="join">
          <RxButton class="join-item" ghost>
            <span class="w-4 h-4 icon-[fluent--braces-16-regular]" />
            Easy C++
          </RxButton>
          <RxButton class="join-item ml-0" ghost>
            <span class="w-4 h-4 icon-[fluent--dismiss-16-regular]" />
          </RxButton>
        </div>
      </div>
    </div>
    <div id="challenge-detail" class="flex flex-col backdrop-blur">
      <div class="h-16 border-b border-b-base-content/5 flex flex-row items-center px-2 space-x-2">
        <RxButton ghost active>
          <span class="w-4 h-4 icon-[fluent--code-16-regular]" />
          {$i18n.t('playground.terminal')}
        </RxButton>
        <RxButton ghost>
          <span class="w-4 h-4 icon-[fluent--checkmark-16-regular]" />
          {$i18n.t('playground.challengeAnswer')}
        </RxButton>
      </div>
    </div>
  </div>
  {:else}
  <Error status={error} />
{/if}
