<script setup lang="ts" generic="T extends string">
import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'

// One pill-shaped segmented control for the whole site (Kaufen/Mieten, Referenzen …).
const props = withDefaults(defineProps<{
  options: { value: T, label: string }[]
  label: string
  /** 'accent': active segment in the action colour; 'neutral': active segment lifted on the surface */
  tone?: 'accent' | 'neutral'
  full?: boolean
  /** background of the track – use 'background' when the control sits on a secondary surface */
  surface?: 'secondary' | 'background'
}>(), { tone: 'neutral', full: false, surface: 'secondary' })
const model = defineModel<T>({ required: true })
// type="single" emits undefined when the active item is clicked again – keep the selection
const onUpdate = (v: unknown) => { if (typeof v === 'string' && v) model.value = v as T }
</script>

<template>
  <ToggleGroupRoot
    type="single"
    :model-value="model"
    :aria-label="label"
    class="h-12 items-center gap-1 rounded-full p-1"
    :class="[props.surface === 'secondary' ? 'bg-secondary' : 'bg-background', props.full ? 'flex w-full' : 'inline-flex']"
    @update:model-value="onUpdate"
  >
    <ToggleGroupItem
      v-for="o in options"
      :key="o.value"
      :value="o.value"
      class="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-muted-foreground outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none"
      :class="[
        props.full && 'flex-1',
        props.tone === 'accent'
          ? 'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          : 'data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
      ]"
    >
      {{ o.label }}
    </ToggleGroupItem>
  </ToggleGroupRoot>
</template>
