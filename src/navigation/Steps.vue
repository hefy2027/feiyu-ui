<script setup lang="ts">
import { computed, provide, type Ref } from 'vue'

export type StepsStatus = 'process' | 'finish' | 'error' | 'wait'

export interface StepsContext {
  current: Ref<number>
  status: Ref<StepsStatus>
  vertical: Ref<boolean>
  clickable: Ref<boolean>
  onStepClick: (stepIndex: number) => void
}

interface Props {
  current?: number
  status?: StepsStatus
  vertical?: boolean
  direction?: 'horizontal' | 'vertical'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  current: 1,
  status: 'process',
  vertical: undefined,
  direction: 'horizontal',
  clickable: false
})

const emit = defineEmits<{
  'update:current': [val: number]
  change: [val: number]
}>()

const isVertical = computed(() => props.vertical !== undefined ? props.vertical : props.direction === 'vertical')

function handleStepClick(stepIndex: number) {
  if (!props.clickable) return
  emit('update:current', stepIndex)
  emit('change', stepIndex)
}

provide<StepsContext>('ui-steps', {
  current: computed(() => props.current),
  status: computed(() => props.status),
  vertical: isVertical,
  clickable: computed(() => props.clickable),
  onStepClick: handleStepClick
})
</script>

<template>
  <div
    :class="[
      'ui-steps',
      isVertical ? 'ui-steps--vertical' : 'ui-steps--horizontal'
    ]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-steps {
  display: flex;
  width: 100%;
  box-sizing: border-box;

  &--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }

  &--vertical {
    flex-direction: column;
  }
}
</style>
