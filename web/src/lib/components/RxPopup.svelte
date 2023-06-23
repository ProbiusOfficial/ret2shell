<script lang="ts">
  import { popup, type PopupSettings, type Placement } from '$lib/utils/popup'

  export let name: string
  export let placement: Placement = 'bottom'
  export let event: 'click' | 'hover' | 'focus-blur' | 'focus-click' = 'click'
  export let offset = 16
  let clazz = ''
  export { clazz as class }

  $: buttonClasses = ['btn', clazz].filter(Boolean).join(' ')

  const popupSettings: PopupSettings = {
    event: event,
    target: name,
    placement: placement,
    middleware: {
      offset: offset,
    },
  }
</script>

<button class={buttonClasses} use:popup={popupSettings}>
  <slot name="button">
    <span class="w-5 h-5 icon-[fluent--chevron-down-16-regular]" />
  </slot>
</button>
<div class="rounded-box bg-neutral w-48 flex flex-col shadow-lg" data-popup={name}>
  <slot />
</div>
