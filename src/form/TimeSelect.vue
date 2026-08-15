<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: string
  start?: string
  end?: string
  step?: string
  minTime?: string
  maxTime?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: string
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  start: '09:00',
  end: '18:00',
  step: '00:30',
  minTime: undefined,
  maxTime: undefined,
  placeholder: '请选择时间',
  clearable: true,
  disabled: false,
  size: 'md',
  prefixIcon: 'schedule',
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const timeOptions = computed(() => {
  const result: { value: string; disabled: boolean }[] = []
  const startMinutes = parseTime(props.start)
  const endMinutes = parseTime(props.end)
  const stepMinutes = parseTime(props.step) || 30

  const minMinutes = props.minTime ? parseTime(props.minTime) : -1
  const maxMinutes = props.maxTime ? parseTime(props.maxTime) : 9999

  for (let m = startMinutes; m <= endMinutes; m += stepMinutes) {
    const timeStr = formatTime(m)
    const isDisabled = (minMinutes !== -1 && m <= minMinutes) || (maxMinutes !== 9999 && m >= maxMinutes)
    result.push({
      value: timeStr,
      disabled: isDisabled
    })
  }
  return result
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToSelected()
    })
  }
}

function scrollToSelected() {
  if (!listRef.value) return
  const selectedEl = listRef.value.querySelector('.is-selected') as HTMLElement
  if (selectedEl) {
    listRef.value.scrollTop = selectedEl.offsetTop - 60
  }
}

function selectTime(time: string, disabled: boolean) {
  if (disabled) return
  emit('update:modelValue', time)
  emit('change', time)
  isOpen.value = false
  formItem?.validate('change')
}

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
  formItem?.validate('change')
}

function handleOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'fy-time-select',
      `fy-time-select--${size}`,
      {
        'fy-time-select--open': isOpen,
        'is-open': isOpen,
        'is-disabled': disabled,
        'is-block': block
      }
    ]"
  >
    <div class="fy-time-select__input-box" @click="toggleDropdown">
      <span v-if="prefixIcon" class="material-symbols-outlined fy-time-select__icon">
        {{ prefixIcon }}
      </span>

      <span v-if="modelValue" class="fy-time-select__value">{{ modelValue }}</span>
      <span v-else class="fy-time-select__placeholder">{{ placeholder }}</span>

      <span
        v-if="clearable && modelValue && !disabled"
        class="material-symbols-outlined fy-time-select__clear"
        title="清空"
        @click="handleClear"
      >
        cancel
      </span>
      <span v-else class="material-symbols-outlined fy-time-select__arrow">
        arrow_drop_down
      </span>
    </div>

    <!-- Dropdown Menu -->
    <transition name="fy-time-select-fade">
      <div v-if="isOpen" ref="listRef" class="fy-time-select__dropdown">
        <div
          v-for="item in timeOptions"
          :key="item.value"
          :class="[
            'fy-time-select__item',
            {
              'is-selected': modelValue === item.value,
              'is-disabled': item.disabled
            }
          ]"
          @click="selectTime(item.value, item.disabled)"
        >
          <span>{{ item.value }}</span>
          <span v-if="modelValue === item.value" class="material-symbols-outlined fy-time-select__check">
            check
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-time-select {
  position: relative;
  display: inline-block;
  user-select: none;
  font-family: inherit;

  &.is-open,
  &--open {
    z-index: 50;
  }

  &.is-block {
    display: block;
    width: 100%;
  }

  &__input-box {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    cursor: pointer;
    transition: border-color 0.2s var(--fy-ease-soft), box-shadow 0.2s var(--fy-ease-soft), background 0.2s var(--fy-ease-soft);

    &:hover:not(.is-disabled) {
      border-color: color-mix(in srgb, var(--fy-primary) 50%, transparent);
    }
  }

  &.is-open &__input-box {
    border-color: var(--fy-primary);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 14%, transparent);
  }

  &.is-disabled {
    opacity: 0.55;
    cursor: not-allowed;
    .fy-time-select__input-box {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__input-box {
    height: 32px;
    padding: 0 10px;
    font-size: var(--fy-font-size-xs);
    border-radius: var(--fy-r-sm);
  }

  &--md &__input-box {
    height: 40px;
    padding: 0 12px;
    font-size: var(--fy-font-size-base);
    border-radius: var(--fy-r-md);
  }

  &--lg &__input-box {
    height: 46px;
    padding: 0 16px;
    font-size: var(--fy-font-size-md);
    border-radius: var(--fy-r-lg);
  }

  &__icon {
    font-size: 18px;
    color: var(--fy-outline);
  }

  &__value {
    flex: 1;
    color: var(--fy-on-surface);
    font-weight: 500;
  }

  &__placeholder {
    flex: 1;
    color: var(--fy-outline);
  }

  &__clear {
    font-size: 18px;
    color: var(--fy-outline);
    transition: color 0.15s ease;

    &:hover {
      color: var(--fy-error);
    }
  }

  &__arrow {
    font-size: 20px;
    color: var(--fy-outline);
    transition: transform 0.2s var(--fy-ease-soft);
  }

  &.is-open &__arrow {
    transform: rotate(180deg);
  }

  /* Dropdown List */
  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    min-width: 140px;
    max-height: 220px;
    overflow-y: auto;
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    border-radius: var(--fy-r-md);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    padding: 4px;
    z-index: 1000;
    box-sizing: border-box;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: var(--fy-r-sm);
    font-size: var(--fy-font-size-sm);
    color: var(--fy-on-surface);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover:not(.is-disabled) {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      color: var(--fy-primary);
    }

    &.is-selected {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      font-weight: 600;
    }

    &.is-disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &__check {
    font-size: 16px;
  }
}

.fy-time-select-fade-enter-active,
.fy-time-select-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-soft);
}
.fy-time-select-fade-enter-from,
.fy-time-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
