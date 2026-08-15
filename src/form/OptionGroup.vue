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
  <div :class="['ui-option-group', { 'is-disabled': disabled }]">
    <div class="ui-option-group__label">
      {{ label }}
    </div>
    <div class="ui-option-group__list">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-option-group {
  &__label {
    padding: 6px 12px 4px;
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: var(--outline);
    letter-spacing: 0.04em;
  }

  &.is-disabled {
    opacity: 0.45;
    pointer-events: none;
  }
}
</style>
