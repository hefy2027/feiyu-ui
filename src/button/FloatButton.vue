<script setup lang="ts">
import { computed } from 'vue'
import Badge from '../display/Badge.vue'

export type FloatButtonShape = 'circle' | 'square'
export type FloatButtonType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  icon?: string
  shape?: FloatButtonShape
  type?: FloatButtonType
  badge?: number | string
  badgeDot?: boolean
  tooltip?: string
  description?: string
  href?: string
  target?: string
  disabled?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'add',
  shape: 'circle',
  type: 'default',
  badge: undefined,
  badgeDot: false,
  tooltip: '',
  description: '',
  href: undefined,
  target: '_self',
  disabled: false,
  ariaLabel: '悬浮操作'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}
</script>

<template>
  <div class="ui-float-btn-wrap" :title="tooltip || undefined">
    <Badge
      :value="badge"
      :dot="badgeDot"
      :offset="[4, 4]"
    >
      <component
        :is="href && !disabled ? 'a' : 'button'"
        :type="href && !disabled ? undefined : 'button'"
        :href="disabled ? undefined : href"
        :target="disabled ? undefined : target"
        :class="[
          'ui-float-btn',
          `ui-float-btn--${shape}`,
          `ui-float-btn--${type}`,
          {
            'is-disabled': disabled,
            'ui-float-btn--with-desc': description || $slots.description
          }
        ]"
        :disabled="disabled"
        :aria-label="ariaLabel"
        :aria-disabled="disabled"
        @click="handleClick"
      >
        <slot>
          <slot name="icon">
            <span v-if="icon" class="material-symbols-outlined ui-float-btn__icon">
              {{ icon }}
            </span>
          </slot>
          <span
            v-if="description || $slots.description"
            class="ui-float-btn__description"
          >
            <slot name="description">{{ description }}</slot>
          </span>
        </slot>
      </component>
    </Badge>
  </div>
</template>

<style scoped lang="scss">
.ui-float-btn-wrap {
  display: inline-flex;
  position: relative;
}

.ui-float-btn {
  min-width: 44px;
  width: 44px;
  height: 44px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
  cursor: pointer;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: var(--on-surface);
  background: color-mix(in srgb, var(--surface-container-high) 85%, transparent);

  &--circle {
    border-radius: 50%;
  }

  &--square {
    border-radius: var(--r-lg);
  }

  &__icon {
    font-size: 22px;
    line-height: 1;
  }

  &__description {
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
    margin-top: 2px;
    text-align: center;
  }

  &:hover:not(.is-disabled) {
    transform: translateY(-3px) scale(1.05);
    box-shadow: var(--shadow-lg), 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:active:not(.is-disabled) {
    transform: translateY(0) scale(0.96);
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Types */
  &--primary {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
    box-shadow: var(--shadow-md), 0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent);
  }

  &--success {
    background: var(--success, #22c55e);
    color: #fff;
    border-color: var(--success, #22c55e);
  }

  &--danger {
    background: var(--danger, #ef4444);
    color: #fff;
    border-color: var(--danger, #ef4444);
  }

  &--warning {
    background: var(--warning, #f59e0b);
    color: #fff;
    border-color: var(--warning, #f59e0b);
  }

  &--info {
    background: var(--info, #38bdf8);
    color: #fff;
    border-color: var(--info, #38bdf8);
  }
}
</style>
