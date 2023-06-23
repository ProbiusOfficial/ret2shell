<script lang="ts">
  let clazz = ''
  export { clazz as class }

  $: classes = [
    'bg-base-content/5',
    'backdrop-blur',
    'border',
    'border-base-content/5',
    'rounded-box',
    'shadow-sm',
    'p-4 lg:p-8',
    clazz,
  ]
    .filter(Boolean)
    .join(' ')
</script>

<div class={classes}>
  <slot />
</div>
