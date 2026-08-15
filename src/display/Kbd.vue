<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  keys?: string | string[]
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  keys: undefined,
  size: 'md',
  bordered: true
})

const keyList = computed<string[]>(() => {
  if (!props.keys) return []
  if (Array.isArray(props.keys)) return props.keys
  // Split symbols or words if separator used or string
  if (props.keys.includes('+')) {
    return props.keys.split('+').map((s) => s.trim())
  }
  return [props.keys]
})
</script>

<template>
  <span :class="['fy-kbd-group', `fy-kbd-group--${size}`]">
    <template v-if="keyList.length > 0">
      <kbd
        v-for="(keyItem, index) in keyList"
        :key="index"
        :class="['fy-kbd', { 'fy-kbd--bordered': bordered }]"
      >
        {{ keyItem }}
      </kbd>
    </template>
    <kbd v-else :class="['fy-kbd', { 'fy-kbd--bordered': bordered }]">
      <slot />
    </kbd>
  </span>
</template>

<style scoped lang="scss">
.fy-kbd-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;
  vertical-align: middle;

  &--sm {
    .fy-kbd {
      min-width: 18px;
      height: 18px;
      font-size: 10px;
      padding: 0 4px;
      border-radius: 4px;
    }
  }

  &--md {
    .fy-kbd {
      min-width: 22px;
      height: 22px;
      font-size: 11px;
      padding: 0 6px;
      border-radius: 5px;
    }
  }

  &--lg {
    .fy-kbd {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      padding: 0 8px;
      border-radius: 6px;
    }
  }
}

.fy-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 700;
  color: var(--fy-on-surface-variant);
  background: color-mix(in srgb, var(--fy-surface-container-high) 70%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 1.5px 0 color-mix(in srgb, var(--fy-outline) 30%, transparent);
  line-height: 1;

  &--bordered {
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
  }
}
</style>
