<script setup lang="ts">
import { computed, provide, type Ref } from 'vue'

export interface CollapseContext {
  expandedNames: Ref<(string | number)[]>
  arrowPlacement: Ref<'left' | 'right'>
  toggleItem: (name: string | number) => void
}

interface Props {
  modelValue?: string | number | (string | number)[]
  accordion?: boolean
  arrowPlacement?: 'left' | 'right'
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  accordion: false,
  arrowPlacement: 'left',
  bordered: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
  change: [value: string | number | (string | number)[]]
}>()

const expandedList = computed<(string | number)[]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (props.modelValue !== undefined && props.modelValue !== '') return [props.modelValue]
  return []
})

function toggleItem(name: string | number) {
  if (props.accordion) {
    const isCurrentlyExpanded = expandedList.value.includes(name)
    const nextVal = isCurrentlyExpanded ? '' : name
    emit('update:modelValue', nextVal)
    emit('change', nextVal)
  } else {
    const current = [...expandedList.value]
    const idx = current.indexOf(name)
    if (idx !== -1) {
      current.splice(idx, 1)
    } else {
      current.push(name)
    }
    emit('update:modelValue', current)
    emit('change', current)
  }
}

provide<CollapseContext>('fy-collapse', {
  expandedNames: expandedList,
  arrowPlacement: computed(() => props.arrowPlacement),
  toggleItem
})
</script>

<template>
  <div
    :class="[
      'fy-collapse',
      { 'fy-collapse--bordered': bordered }
    ]"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-collapse {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: var(--fy-r-lg);
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 78%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  box-shadow: var(--fy-shadow-sm);
  overflow: hidden;

  &--bordered {
    border: 1px solid var(--fy-glass-border);
  }
}
</style>
