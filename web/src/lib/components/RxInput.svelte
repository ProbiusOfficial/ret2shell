<script lang="ts">
  import RxButton from './RxButton.svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  let clazz = ''
  export { clazz as class }
  export let hasError = false
  export let disabled = false
  export let readonly = false
  export let max: number | undefined = undefined
  export let min: number | undefined = undefined
  export let type: 'text' | 'password' | 'number' = 'text'
  export let maxlength: number | undefined = undefined
  export let placeholder: string | undefined = undefined
  export let value: string | number | undefined = undefined
  export let icon: string | undefined = undefined
  export let id: string | undefined = undefined
  export let name: string | undefined = undefined

  let passwordVisible = false

  function togglePasswordVisible() {
    passwordVisible = !passwordVisible
  }

  $: computedType = type == 'password' && passwordVisible ? 'text' : type

  $: classes = ['input', 'backdrop-blur', 'bg-base-content/5', 'min-w-0', hasError && 'input-error', clazz]
    .filter(Boolean)
    .join(' ')

  const handleInput = (e: Event) => {
    value = type == 'number' ? +(e.target as HTMLInputElement).value : (e.target as HTMLInputElement).value
    dispatch('input', value)
  }
</script>

{#if icon || type == 'password'}
  <div class="input-group">
    {#if icon}
      <span class="bg-base-content/20">
        <div class={`w-5 h-5 ${icon}`} />
      </span>
    {/if}
    <input
      {id}
      {name}
      class={classes}
      {placeholder}
      {maxlength}
      {min}
      {max}
      {disabled}
      {readonly}
      type={computedType}
      on:input={handleInput}
    />
    {#if type == 'password'}
      <RxButton on:click={togglePasswordVisible}>
        <!-- icon-[fluent--eye-16-regular] and icon-[fluent--eye-off-16-regular] -->
        <div class={`w-5 h-5 icon-[fluent--${passwordVisible ? 'eye' : 'eye-off'}-16-regular]`} />
      </RxButton>
    {/if}
  </div>
{:else}
  <input
    {id}
    class={classes}
    {placeholder}
    {maxlength}
    {min}
    {max}
    {disabled}
    {readonly}
    type={computedType}
    on:input={handleInput}
  />
{/if}
