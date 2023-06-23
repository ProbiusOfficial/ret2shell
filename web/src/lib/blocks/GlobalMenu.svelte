<script lang="ts">
  import { _ } from 'svelte-i18n'
  import RxLink from '$lib/components/RxLink.svelte'
</script>

<li>
  <RxLink ghost justify="start" href="/playground">
    <span class="icon-[fluent--dumbbell-16-regular] w-6 h-6" />
    {$_('playground.title')}
  </RxLink>
</li>
<li>
  <RxLink ghost justify="start" href="/games">
    <span class="icon-[fluent--flag-16-regular] w-6 h-6" />
    {$_('games.title')}
  </RxLink>
</li>
<li>
  <RxLink ghost justify="start" href="/announcements">
    <span class="icon-[fluent--megaphone-16-regular] w-6 h-6" />
    {$_('announcements.title')}
  </RxLink>
</li>
<li>
  <RxLink ghost justify="start" href="/certs">
    <span class="icon-[fluent--trophy-16-regular] w-6 h-6" />
    {$_('certs.title')}
  </RxLink>
</li>
<li>
  <RxLink ghost justify="start" href="/admin">
    <span class="icon-[fluent--organization-16-regular] w-6 h-6" />
    {$_('admin.title')}
  </RxLink>
</li>
