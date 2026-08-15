<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

interface Props {
  modelValue?: string | [string, string]
  isRange?: boolean
  format?: 'HH:mm' | 'HH:mm:ss'
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  format: 'HH:mm',
  placeholder: '选择时间',
  clearable: true,
  disabled: false,
  disabledHours: undefined,
  disabledMinutes: undefined,
  disabledSeconds: undefined,
  size: 'md',
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any]
  clear: []
}>()

const isOpen = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)
const pickerContainerRef = ref<HTMLElement | null>(null)

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const activeRangeTab = ref<'start' | 'end'>('start')

const displayValue = computed(() => {
  if (props.isRange) {
    if (Array.isArray(props.modelValue) && (props.modelValue[0] || props.modelValue[1])) {
      const start = props.modelValue[0] || '--:--'
      const end = props.modelValue[1] || '--:--'
      return `${start} 至 ${end}`
    }
    return ''
  }
  return typeof props.modelValue === 'string' ? props.modelValue : ''
})

const currentActiveTimeStr = computed(() => {
  if (props.isRange) {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : ['', '']
    return activeRangeTab.value === 'start' ? (arr[0] || '00:00:00') : (arr[1] || '00:00:00')
  }
  return typeof props.modelValue === 'string' ? (props.modelValue || '00:00:00') : '00:00:00'
})

const selectedHour = computed(() => {
  const parts = currentActiveTimeStr.value.split(':')
  return parts[0] || '00'
})

const selectedMinute = computed(() => {
  const parts = currentActiveTimeStr.value.split(':')
  return parts[1] || '00'
})

const selectedSecond = computed(() => {
  const parts = currentActiveTimeStr.value.split(':')
  return parts[2] || '00'
})

function updateTime(h: string, m: string, s: string = '00') {
  const val = props.format === 'HH:mm:ss' ? `${h}:${m}:${s}` : `${h}:${m}`
  if (props.isRange) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : ['', '']
    if (activeRangeTab.value === 'start') {
      current[0] = val
    } else {
      current[1] = val
    }
    emit('update:modelValue', [current[0], current[1]])
    emit('change', [current[0], current[1]])
  } else {
  emit('update:modelValue', val)
  emit('change', val)
  }
  formItem?.validate('change')
}

function selectHour(h: string) {
  if (isHourDisabled(Number(h))) return
  updateTime(h, selectedMinute.value, selectedSecond.value)
}

function selectMinute(m: string) {
  if (isMinuteDisabled(Number(m))) return
  updateTime(selectedHour.value, m, selectedSecond.value)
}

function selectSecond(s: string) {
  if (isSecondDisabled(Number(s))) return
  updateTime(selectedHour.value, selectedMinute.value, s)
}

function isHourDisabled(h: number): boolean {
  return props.disabledHours ? props.disabledHours().includes(h) : false
}

function isMinuteDisabled(m: number): boolean {
  return props.disabledMinutes ? props.disabledMinutes(Number(selectedHour.value)).includes(m) : false
}

function isSecondDisabled(s: number): boolean {
  return props.disabledSeconds ? props.disabledSeconds(Number(selectedHour.value), Number(selectedMinute.value)).includes(s) : false
}

function setNow() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  updateTime(h, m, s)
  if (!props.isRange) {
  isOpen.value = false
  }
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  if (props.isRange) {
    emit('update:modelValue', ['', ''])
    emit('change', ['', ''])
  } else {
  emit('update:modelValue', '')
  emit('change', '')
  }
  emit('clear')
  formItem?.validate('change')
}

function handleClickOutside(event: MouseEvent) {
  if (pickerContainerRef.value && !pickerContainerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div
    ref="pickerContainerRef"
    :class="[
      'ui-time-picker',
      `ui-time-picker--${size}`,
      {
        'ui-time-picker--open': isOpen,
        'ui-time-picker--disabled': disabled,
        'ui-time-picker--block': block
      }
    ]"
  >
    <div class="ui-time-picker__input-box" @click="!disabled && (isOpen = !isOpen)">
      <span class="material-symbols-outlined ui-time-picker__icon">schedule</span>

      <span v-if="displayValue" class="ui-time-picker__text">
        {{ displayValue }}
      </span>
      <span v-else class="ui-time-picker__placeholder">
        {{ placeholder }}
      </span>

      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="ui-time-picker__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined ui-time-picker__arrow">
        expand_more
      </span>
    </div>

    <!-- Dropdown Time Columns -->
    <transition name="ui-time-picker-fade">
      <div v-if="isOpen" class="ui-time-picker__dropdown" @click.stop>
        <!-- Range Tabs -->
        <div v-if="isRange" class="ui-time-picker__range-tabs">
          <button
            type="button"
            :class="['ui-time-picker__tab-btn', { 'is-active': activeRangeTab === 'start' }]"
            @click="activeRangeTab = 'start'"
          >
            开始: {{ (Array.isArray(modelValue) && modelValue[0]) ? modelValue[0] : '--:--' }}
          </button>
          <button
            type="button"
            :class="['ui-time-picker__tab-btn', { 'is-active': activeRangeTab === 'end' }]"
            @click="activeRangeTab = 'end'"
          >
            结束: {{ (Array.isArray(modelValue) && modelValue[1]) ? modelValue[1] : '--:--' }}
          </button>
        </div>

        <div class="ui-time-picker__columns">
          <!-- Hours Column -->
          <div class="ui-time-picker__col">
            <div class="ui-time-picker__col-header">时</div>
            <div class="ui-time-picker__col-list">
              <button
                v-for="h in hours"
                :key="h"
                type="button"
                :class="['ui-time-picker__cell', { 'is-selected': h === selectedHour, 'is-disabled': isHourDisabled(Number(h)) }]"
                :disabled="isHourDisabled(Number(h))"
                @click="selectHour(h)"
              >
                {{ h }}
              </button>
            </div>
          </div>

          <!-- Minutes Column -->
          <div class="ui-time-picker__col">
            <div class="ui-time-picker__col-header">分</div>
            <div class="ui-time-picker__col-list">
              <button
                v-for="m in minutes"
                :key="m"
                type="button"
                :class="['ui-time-picker__cell', { 'is-selected': m === selectedMinute, 'is-disabled': isMinuteDisabled(Number(m)) }]"
                :disabled="isMinuteDisabled(Number(m))"
                @click="selectMinute(m)"
              >
                {{ m }}
              </button>
            </div>
          </div>

          <!-- Seconds Column (Optional) -->
          <div v-if="format === 'HH:mm:ss'" class="ui-time-picker__col">
            <div class="ui-time-picker__col-header">秒</div>
            <div class="ui-time-picker__col-list">
              <button
                v-for="s in seconds"
                :key="s"
                type="button"
                :class="['ui-time-picker__cell', { 'is-selected': s === selectedSecond, 'is-disabled': isSecondDisabled(Number(s)) }]"
                :disabled="isSecondDisabled(Number(s))"
                @click="selectSecond(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="ui-time-picker__footer">
          <button type="button" class="ui-time-picker__btn-now" @click="setNow">
            此刻
          </button>
          <button type="button" class="ui-time-picker__btn-ok" @click="isOpen = false">
            确定
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-time-picker {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;

  &--open {
    z-index: 50;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  &__input-box {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    border-radius: var(--r-md);
    background: color-mix(in srgb, var(--surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--outline-variant) 45%, transparent);
    transition:
      border-color 0.2s var(--ease-soft),
      box-shadow 0.2s var(--ease-soft),
      background 0.2s var(--ease-soft);
  }

  &--open &__input-box {
    border-color: color-mix(in srgb, var(--primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .ui-time-picker__input-box {
      cursor: not-allowed;
      background: color-mix(in srgb, var(--surface-container-low) 50%, transparent);
    }
  }

  /* Sizes */
  &--sm &__input-box {
    height: 32px;
    padding: 0 10px;
    font-size: var(--font-size-xs);
    border-radius: var(--r-sm);
  }

  &--md &__input-box {
    height: 40px;
    padding: 0 14px;
    font-size: var(--font-size-base);
    border-radius: var(--r-md);
  }

  &--lg &__input-box {
    height: 46px;
    padding: 0 16px;
    font-size: var(--font-size-md);
    border-radius: var(--r-lg);
  }

  &__icon {
    font-size: 18px;
    color: var(--outline);
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    color: var(--on-surface);
    font-weight: 500;
    white-space: nowrap;
  }

  &__placeholder {
    flex: 1;
    color: var(--outline);
  }

  &__arrow {
    font-size: 20px;
    color: var(--outline);
    margin-left: 6px;
    transition: transform 0.2s var(--ease-soft);
  }

  &--open &__arrow {
    transform: rotate(180deg);
  }

  &__clear {
    border: none;
    background: none;
    color: var(--outline);
    cursor: pointer;
    padding: 0;
    margin-left: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Dropdown */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 150;
    min-width: 180px;
    padding: 10px;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__range-tabs {
    display: flex;
    gap: 4px;
    padding: 3px;
    border-radius: var(--r-sm);
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
  }

  &__tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 5px 0;
    border-radius: var(--r-sm);
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: all 0.15s ease;

    &.is-active {
      background: var(--surface-container-lowest);
      color: var(--primary);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }
  }

  &__columns {
    display: flex;
    gap: 6px;
    max-height: 200px;
  }

  &__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 54px;
  }

  &__col-header {
    font-size: var(--font-size-xs);
    font-weight: 700;
    text-align: center;
    color: var(--outline);
    padding: 4px 0 6px;
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__col-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    max-height: 160px;
    padding: 4px 2px;
    scrollbar-width: thin;
  }

  &__cell {
    height: 28px;
    border: none;
    background: transparent;
    border-radius: var(--r-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--on-surface);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-selected) {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
    }

    &.is-selected {
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 700;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__btn-now {
    border: none;
    background: transparent;
    color: var(--primary);
    font-size: var(--font-size-xs);
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--r-sm);

    &:hover {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
    }
  }

  &__btn-ok {
    border: none;
    background: var(--primary);
    color: var(--on-primary);
    font-size: var(--font-size-xs);
    font-weight: 700;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: var(--r-sm);
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}

.ui-time-picker-fade-enter-active,
.ui-time-picker-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-time-picker-fade-enter-from,
.ui-time-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
