<script lang="ts">
  import { createField } from 'felte'
  import RxInput from './RxInput.svelte'
  import RxPopup from './RxPopup.svelte'
  import RxCalendar from './RxCalendar.svelte'
  import { i18n } from '$lib/i18n'
  import RxButton from './RxButton.svelte'
  import { onMount } from 'svelte'

  export let value = 0
  let storedValue = 0
  export let name: string

  let hour = 0
  let minute = 0

  // hour - 2 -> hour + 2 then % 24
  let availableHours = Array.from({ length: 5 }, (_, i) => (hour + i - 2 + 24) % 24)
  // minute - 20 -> minute + 20 then % 60, step = 10
  let availableMinutes = Array.from({ length: 5 }, (_, i) => (minute + (i - 2) * 10 + 600) % 60)

  const timezone =
    (new Date().getTimezoneOffset() > 0 ? '' : '+') +
    (0 - new Date().getTimezoneOffset() / 60).toString().padStart(2, '0') +
    ':00'

  $: watchTimeSelector(hour, minute)
  function watchTimeSelector(h: number, m: number) {
    const date = new Date(value * 1000)
    date.setHours(h)
    date.setMinutes(m)
    availableHours = Array.from({ length: 5 }, (_, i) => (h + i - 2 + 24) % 24)
    availableMinutes = Array.from({ length: 5 }, (_, i) => (m + (i - 2) * 10 + 600) % 60)
    value = date.getTime() / 1000
    storedValue = value
    onInput(value)
    onBlur()
  }

  $: watchValue(value)
  function watchValue(v: number) {
    if (v !== storedValue) {
      const date = new Date(v * 1000)
      hour = date.getHours()
      minute = date.getMinutes()
      availableHours = Array.from({ length: 5 }, (_, i) => (hour + i - 2 + 24) % 24)
      availableMinutes = Array.from({ length: 5 }, (_, i) => (minute + (i - 2) * 10 + 600) % 60)
      storedValue = v
    }
  }

  const { field, onInput, onBlur } = createField(name)

  onMount(() => watchValue(value))

  $: selectedDays = [new Date(value * 1000)]
</script>

<div class="flex-1 relative flex flex-row">
  <input type="number" class="hidden" {name} bind:value use:field />
  <RxInput
    icon="icon-[fluent--calendar-20-regular]"
    readonly
    value={`${new Date(value * 1000).toLocaleString()} ${timezone}`}
  >
    <RxPopup
      class="join-item ml-0 !rounded-r-lg bg-base-content/5 border-none backdrop-blur"
      name={`${name}Popup`}
      popupWidth="auto"
      event="click-blur"
    >
      <span slot="button" class="icon-[fluent--calendar-20-regular] w-5 h-5"></span>
      <div class="flex flex-row space-x-2 min-w-max">
        <RxCalendar
          class="bg-neutral"
          {selectedDays}
          on:select={(e) => {
            let selected = e.detail
            selected.setHours(hour)
            selected.setMinutes(minute)
            value = selected.getTime() / 1000
            onInput(value)
            onBlur()
          }}
        ></RxCalendar>
        <div class="rounded-lg bg-neutral w-16 flex flex-col space-y-2 items-center">
          <span class="p-2 font-bold">{$i18n.t('form.hour')}</span>
          <RxButton
            ghost
            on:click={() => {
              hour -= 1
              hour = (hour + 24) % 24
            }}
          >
            <span class="icon-[fluent--chevron-double-up-20-regular] w-5 h-5"></span>
          </RxButton>
          <div class="flex-1 flex flex-col justify-center">
            {#each availableHours as item}
              <RxButton ghost active={item === hour} on:click={() => (hour = item)}>
                <span class="text-base">{item.toString().padStart(2, '0')}</span>
              </RxButton>
            {/each}
          </div>
          <RxButton
            ghost
            on:click={() => {
              hour += 1
              hour %= 24
            }}
          >
            <span class="icon-[fluent--chevron-double-down-20-regular] w-5 h-5"></span>
          </RxButton>
        </div>
        <div class="rounded-lg bg-neutral w-16 flex flex-col space-y-2 items-center">
          <span class="p-2 font-bold">{$i18n.t('form.minute')}</span>
          <RxButton
            ghost
            on:click={() => {
              minute -= 10
              minute = (minute + 60) % 60
            }}
          >
            <span class="icon-[fluent--chevron-double-up-20-regular] w-5 h-5"></span>
          </RxButton>
          <div class="flex-1 flex flex-col justify-center">
            {#each availableMinutes as item}
              <RxButton ghost active={item === minute} on:click={() => (minute = item)}>
                <span class="text-base">{item.toString().padStart(2, '0')}</span>
              </RxButton>
            {/each}
          </div>
          <RxButton
            ghost
            on:click={() => {
              minute += 10
              minute %= 60
            }}
          >
            <span class="icon-[fluent--chevron-double-down-20-regular] w-5 h-5"></span>
          </RxButton>
        </div>
      </div>
    </RxPopup>
  </RxInput>
</div>
