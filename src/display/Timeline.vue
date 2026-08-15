<script setup lang="ts">
import { computed, provide, type Ref } from 'vue'

export interface TimelineContext {
  horizontal: Ref<boolean>
  itemPlacement: Ref<'left' | 'right'>
}

interface Props {
  horizontal?: boolean
  itemPlacement?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  horizontal: false,
  itemPlacement: 'left'
})

provide<TimelineContext>('fy-timeline', {
  horizontal: computed(() => props.horizontal),
  itemPlacement: computed(() => props.itemPlacement)
})
</script>

<template>
  <div
    :class="[
      'fy-timeline',
      horizontal ? 'fy-timeline--horizontal' : 'fy-timeline--vertical',
      `fy-timeline--placement-${itemPlacement}`
    ]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-timeline {
  display: flex;
  box-sizing: border-box;
  width: 100%;

  &--vertical {
    flex-direction: column;
  }

  &--horizontal {
    flex-direction: row;
    align-items: flex-start;
    overflow-x: auto;
  }
}
</style>
