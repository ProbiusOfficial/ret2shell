<script lang="ts">
  import { platform } from '$lib/stores/platform'
  import { _ } from 'svelte-i18n'
</script>

<svelte:head><title>{$_('account.register')} - {$platform.name}</title></svelte:head>
