<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export type DatePickerType = 'date' | 'daterange'

export interface DatePreset {
  label: string
  value: string | [string, string]
}

interface Props {
  modelValue?: string | [string, string]
  type?: DatePickerType
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  presets?: DatePreset[]
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'date',
  placeholder: '选择日期',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  clearable: true,
  disabled: false,
  size: 'md',
  block: false,
  presets: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string]]
  change: [value: string | [string, string]]
  clear: []
}>()

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const effectivePresets = computed<DatePreset[]>(() => {
  if (props.presets !== undefined) return props.presets
  const now = Date.now()
  return [
    { label: '今天', value: formatDate(new Date(now)) },
    { label: '明天', value: formatDate(new Date(now + 86400000)) },
    { label: '下周', value: formatDate(new Date(now + 7 * 86400000)) }
  ]
})

const isOpen = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)
const pickerContainerRef = ref<HTMLElement | null>(null)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDay {
  date: Date
  dateString: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isDisabled: boolean
  isRangeEnd: boolean
}

const displayValue = computed(() => {
  if (props.type === 'daterange') {
    if (Array.isArray(props.modelValue) && props.modelValue[0] && props.modelValue[1]) {
      return `${props.modelValue[0]} 至 ${props.modelValue[1]}`
    }
    return ''
  }
  return typeof props.modelValue === 'string' ? props.modelValue : ''
})

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startWeekday = firstDayOfMonth.getDay()

  const todayString = formatDate(today)
  const singleSelected = typeof props.modelValue === 'string' ? props.modelValue : ''
  const rangeStart = Array.isArray(props.modelValue) ? props.modelValue[0] : ''
  const rangeEnd = Array.isArray(props.modelValue) ? props.modelValue[1] : ''

  const days: CalendarDay[] = []

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    const dString = formatDate(d)
    days.push({
      date: d,
      dateString: dString,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dString === todayString,
      isSelected: props.type === 'date' ? dString === singleSelected : dString === rangeStart || dString === rangeEnd,
      isInRange: props.type === 'daterange' && rangeStart && rangeEnd ? dString > rangeStart && dString < rangeEnd : false,
      isRangeStart: props.type === 'daterange' && dString === rangeStart,
      isRangeEnd: props.type === 'daterange' && dString === rangeEnd,
      isDisabled
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    const dString = formatDate(d)
    days.push({
      date: d,
      dateString: dString,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dString === todayString,
      isSelected: props.type === 'date' ? dString === singleSelected : dString === rangeStart || dString === rangeEnd,
      isInRange: props.type === 'daterange' && rangeStart && rangeEnd ? dString > rangeStart && dString < rangeEnd : false,
      isRangeStart: props.type === 'daterange' && dString === rangeStart,
      isRangeEnd: props.type === 'daterange' && dString === rangeEnd,
      isDisabled
    })
  }

  // Next month leading days (fill up to 42 cells = 6 rows)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    const dString = formatDate(d)
    days.push({
      date: d,
      dateString: dString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dString === todayString,
      isSelected: props.type === 'date' ? dString === singleSelected : dString === rangeStart || dString === rangeEnd,
      isInRange: props.type === 'daterange' && rangeStart && rangeEnd ? dString > rangeStart && dString < rangeEnd : false,
      isRangeStart: props.type === 'daterange' && dString === rangeStart,
      isRangeEnd: props.type === 'daterange' && dString === rangeEnd,
      isDisabled
    })
  }

  return days
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function prevYear() {
  currentYear.value -= 1
}

function nextYear() {
  currentYear.value += 1
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function handleSelectDay(day: CalendarDay) {
  if (day.isDisabled) return
  if (props.type === 'date') {
    emit('update:modelValue', day.dateString)
    emit('change', day.dateString)
    isOpen.value = false
    formItem?.validate('change')
  } else {
    // Date range selection
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : ['', '']
    if (!current[0] || (current[0] && current[1])) {
      current[0] = day.dateString
      current[1] = ''
      emit('update:modelValue', [current[0], ''])
    } else {
      if (day.dateString < current[0]) {
        current[1] = current[0]
        current[0] = day.dateString
      } else {
        current[1] = day.dateString
      }
      emit('update:modelValue', [current[0], current[1]])
      emit('change', [current[0], current[1]])
      isOpen.value = false
      formItem?.validate('change')
    }
  }
}

function handlePresetClick(preset: DatePreset) {
  emit('update:modelValue', preset.value)
  emit('change', preset.value)
  isOpen.value = false
  formItem?.validate('change')
}

function handleClear(event: MouseEvent) {
  event.stopPropagation()
  if (props.type === 'daterange') {
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
      'ui-date-picker',
      `ui-date-picker--${size}`,
      {
        'ui-date-picker--open': isOpen,
        'ui-date-picker--disabled': disabled,
        'ui-date-picker--block': block
      }
    ]"
  >
    <div class="ui-date-picker__input-box" @click="toggleDropdown">
      <span class="material-symbols-outlined ui-date-picker__icon">calendar_today</span>

      <span v-if="displayValue" class="ui-date-picker__text">
        {{ displayValue }}
      </span>
      <span v-else class="ui-date-picker__placeholder">
        {{ placeholder }}
      </span>

      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="ui-date-picker__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined ui-date-picker__arrow">
        expand_more
      </span>
    </div>

    <!-- Calendar Dropdown Popover -->
    <transition name="ui-date-picker-fade">
      <div v-if="isOpen" class="ui-date-picker__dropdown" @click.stop>
        <!-- Header Nav -->
        <div class="ui-date-picker__header">
          <button type="button" class="ui-date-picker__nav-btn" title="上一年" @click="prevYear">
            <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
          </button>
          <button type="button" class="ui-date-picker__nav-btn" @click="prevMonth">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="ui-date-picker__month-label">
            {{ currentYear }} 年 {{ currentMonth + 1 }} 月
          </span>
          <button type="button" class="ui-date-picker__nav-btn" @click="nextMonth">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <button type="button" class="ui-date-picker__nav-btn" title="下一年" @click="nextYear">
            <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
          </button>
        </div>

        <!-- Weekdays Row -->
        <div class="ui-date-picker__weekdays">
          <span v-for="w in weekDays" :key="w" class="ui-date-picker__weekday">{{ w }}</span>
        </div>

        <!-- Calendar Days Grid -->
        <div class="ui-date-picker__grid">
          <button
            v-for="(d, idx) in calendarDays"
            :key="idx"
            type="button"
            :class="[
              'ui-date-picker__cell',
              {
                'is-other-month': !d.isCurrentMonth,
                'is-disabled': d.isDisabled,
                'is-today': d.isToday,
                'is-selected': d.isSelected,
                'is-in-range': d.isInRange,
                'is-range-start': d.isRangeStart,
                'is-range-end': d.isRangeEnd
              }
            ]"
            :disabled="d.isDisabled"
            @click="handleSelectDay(d)"
          >
            <span class="ui-date-picker__cell-inner">
              {{ d.dayNumber }}
            </span>
          </button>
        </div>

        <!-- Quick Presets -->
        <div v-if="effectivePresets && effectivePresets.length > 0" class="ui-date-picker__presets">
          <button
            v-for="p in effectivePresets"
            :key="p.label"
            type="button"
            class="ui-date-picker__preset-btn"
            @click="handlePresetClick(p)"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.ui-date-picker {
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

    .ui-date-picker__input-box {
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
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__placeholder {
    flex: 1;
    color: var(--outline);
    font-weight: 400;
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

  /* Dropdown Calendar */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 150;
    min-width: 290px;
    padding: 14px;
    border-radius: var(--r-lg);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
  }

  &__month-label {
    font-size: var(--font-size-base);
    font-weight: 700;
    color: var(--on-surface);
  }

  &__nav-btn {
    border: none;
    background: transparent;
    color: var(--outline);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--r-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-high) 60%, transparent);
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 20px;
    }
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: var(--font-size-xs);
    font-weight: 700;
    color: var(--outline);
    padding: 4px 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }

  &__cell {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--r-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--on-surface);
    cursor: pointer;
    transition: background 0.15s var(--ease-soft), color 0.15s var(--ease-soft);

    &:hover:not(.is-selected) {
      background: color-mix(in srgb, var(--surface-container-high) 70%, transparent);
    }

    &.is-other-month {
      color: color-mix(in srgb, var(--outline) 60%, transparent);
      font-weight: 400;
    }

    &.is-today {
      color: var(--primary);
      border: 1px solid color-mix(in srgb, var(--primary) 40%, transparent);
    }

    &.is-selected {
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 700;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary) 40%, transparent);
    }

    &.is-in-range {
      background: color-mix(in srgb, var(--primary) 14%, transparent);
      border-radius: 0;
    }

    &.is-range-start {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.is-range-end {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  &__presets {
    display: flex;
    gap: 6px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 25%, transparent);
  }

  &__preset-btn {
    flex: 1;
    border: none;
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
    color: var(--on-surface);
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 6px 0;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      color: var(--primary);
    }
  }
}

.ui-date-picker-fade-enter-active,
.ui-date-picker-fade-leave-active {
  transition: opacity 0.18s var(--ease-soft), transform 0.18s var(--ease-out);
}
.ui-date-picker-fade-enter-from,
.ui-date-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
