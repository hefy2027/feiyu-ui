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
const formItem = inject<FormItemContext | null>('fy-form-item', null)
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
      'fy-time-picker',
      `fy-time-picker--${size}`,
      {
        'fy-time-picker--open': isOpen,
        'fy-time-picker--disabled': disabled,
        'fy-time-picker--block': block
      }
    ]"
  >
    <div class="fy-time-picker__input-box" @click="!disabled && (isOpen = !isOpen)">
      <span class="material-symbols-outlined fy-time-picker__icon">schedule</span>

      <span v-if="displayValue" class="fy-time-picker__text">
        {{ displayValue }}
      </span>
      <span v-else class="fy-time-picker__placeholder">
        {{ placeholder }}
      </span>

      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="fy-time-picker__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined fy-time-picker__arrow">
        expand_more
      </span>
    </div>

    <!-- Dropdown Time Columns -->
    <transition name="fy-time-picker-fade">
      <div v-if="isOpen" class="fy-time-picker__dropdown" @click.stop>
        <!-- Range Tabs -->
        <div v-if="isRange" class="fy-time-picker__range-tabs">
          <button
            type="button"
            :class="['fy-time-picker__tab-btn', { 'is-active': activeRangeTab === 'start' }]"
            @click="activeRangeTab = 'start'"
          >
            开始: {{ (Array.isArray(modelValue) && modelValue[0]) ? modelValue[0] : '--:--' }}
          </button>
          <button
            type="button"
            :class="['fy-time-picker__tab-btn', { 'is-active': activeRangeTab === 'end' }]"
            @click="activeRangeTab = 'end'"
          >
            结束: {{ (Array.isArray(modelValue) && modelValue[1]) ? modelValue[1] : '--:--' }}
          </button>
        </div>

        <div class="fy-time-picker__columns">
          <!-- Hours Column -->
          <div class="fy-time-picker__col">
            <div class="fy-time-picker__col-header">时</div>
            <div class="fy-time-picker__col-list">
              <button
                v-for="h in hours"
                :key="h"
                type="button"
                :class="['fy-time-picker__cell', { 'is-selected': h === selectedHour, 'is-disabled': isHourDisabled(Number(h)) }]"
                :disabled="isHourDisabled(Number(h))"
                @click="selectHour(h)"
              >
                {{ h }}
              </button>
            </div>
          </div>

          <!-- Minutes Column -->
          <div class="fy-time-picker__col">
            <div class="fy-time-picker__col-header">分</div>
            <div class="fy-time-picker__col-list">
              <button
                v-for="m in minutes"
                :key="m"
                type="button"
                :class="['fy-time-picker__cell', { 'is-selected': m === selectedMinute, 'is-disabled': isMinuteDisabled(Number(m)) }]"
                :disabled="isMinuteDisabled(Number(m))"
                @click="selectMinute(m)"
              >
                {{ m }}
              </button>
            </div>
          </div>

          <!-- Seconds Column (Optional) -->
          <div v-if="format === 'HH:mm:ss'" class="fy-time-picker__col">
            <div class="fy-time-picker__col-header">秒</div>
            <div class="fy-time-picker__col-list">
              <button
                v-for="s in seconds"
                :key="s"
                type="button"
                :class="['fy-time-picker__cell', { 'is-selected': s === selectedSecond, 'is-disabled': isSecondDisabled(Number(s)) }]"
                :disabled="isSecondDisabled(Number(s))"
                @click="selectSecond(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="fy-time-picker__footer">
          <button type="button" class="fy-time-picker__btn-now" @click="setNow">
            此刻
          </button>
          <button type="button" class="fy-time-picker__btn-ok" @click="isOpen = false">
            确定
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-time-picker {
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
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 42%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    transition:
      border-color 0.2s var(--fy-ease-soft),
      box-shadow 0.2s var(--fy-ease-soft),
      background 0.2s var(--fy-ease-soft);
  }

  &--open &__input-box {
    border-color: color-mix(in srgb, var(--fy-primary) 55%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--fy-primary) 14%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .fy-time-picker__input-box {
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
    padding: 0 14px;
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
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    color: var(--fy-on-surface);
    font-weight: 500;
    white-space: nowrap;
  }

  &__placeholder {
    flex: 1;
    color: var(--fy-outline);
  }

  &__arrow {
    font-size: 20px;
    color: var(--fy-outline);
    margin-left: 6px;
    transition: transform 0.2s var(--fy-ease-soft);
  }

  &--open &__arrow {
    transform: rotate(180deg);
  }

  &__clear {
    border: none;
    background: none;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 0;
    margin-left: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--fy-on-surface);
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
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__range-tabs {
    display: flex;
    gap: 4px;
    padding: 3px;
    border-radius: var(--fy-r-sm);
    background: color-mix(in srgb, var(--fy-surface-container-high) 50%, transparent);
  }

  &__tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    font-size: var(--fy-font-size-xs);
    font-weight: 600;
    padding: 5px 0;
    border-radius: var(--fy-r-sm);
    color: var(--fy-on-surface-variant);
    cursor: pointer;
    transition: all 0.15s ease;

    &.is-active {
      background: var(--fy-surface-container-lowest);
      color: var(--fy-primary);
      font-weight: 700;
      box-shadow: var(--fy-shadow-sm);
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
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    text-align: center;
    color: var(--fy-outline);
    padding: 4px 0 6px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
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
    border-radius: var(--fy-r-sm);
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-on-surface);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover:not(.is-selected) {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    }

    &.is-selected {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      font-weight: 700;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
  }

  &__btn-now {
    border: none;
    background: transparent;
    color: var(--fy-primary);
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--fy-r-sm);

    &:hover {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
    }
  }

  &__btn-ok {
    border: none;
    background: var(--fy-primary);
    color: var(--fy-on-primary);
    font-size: var(--fy-font-size-xs);
    font-weight: 700;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: var(--fy-r-sm);
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}

.fy-time-picker-fade-enter-active,
.fy-time-picker-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-time-picker-fade-enter-from,
.fy-time-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
