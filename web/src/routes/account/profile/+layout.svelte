<script lang="ts">
  import { goto } from '$app/navigation'
  import { user } from '$lib/stores/user'

  if (!$user.isLoggedIn) {
    goto('/account/login')
  }
</script>

<slot />
