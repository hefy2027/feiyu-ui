<script setup lang="ts">
interface Props {
  label: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false
})
</script>

<template>
  <div :class="['fy-option-group', { 'is-disabled': disabled }]">
    <div class="fy-option-group__label">
      {{ label }}
    </div>
    <div class="fy-option-group__list">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-option-group {
  &__label {
    padding: 6px 12px 4px;
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    color: var(--fy-outline);
    letter-spacing: 0.04em;
  }

  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}
</style>
