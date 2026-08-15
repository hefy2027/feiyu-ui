<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import type { FormItemContext } from './FormItem.vue'
import Button from '../button/Button.vue'
import Space from '../layout/Space.vue'

export interface DateTimePreset {
  label: string
  value: string
}

interface Props {
  modelValue?: string | [string, string]
  type?: 'datetime' | 'datetimerange'
  placeholder?: string
  format?: string // e.g. 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DD HH:mm'
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  presets?: DateTimePreset[]
  showSeconds?: boolean
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '选择日期与时间',
  format: 'YYYY-MM-DD HH:mm:ss',
  clearable: true,
  disabled: false,
  size: 'md',
  block: false,
  presets: undefined,
  showSeconds: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string]]
  change: [value: string | [string, string]]
  clear: []
}>()

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function constructSingleValue(date: string, h: string, m: string, s: string): string {
  const d = date || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const timeStr = props.showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
  return `${d} ${timeStr}`
}

function formatDateTime(d: Date, withSeconds = true): string {
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hour = pad(d.getHours())
  const min = pad(d.getMinutes())
  const sec = pad(d.getSeconds())
  return withSeconds
    ? `${year}-${month}-${day} ${hour}:${min}:${sec}`
    : `${year}-${month}-${day} ${hour}:${min}`
}

const isOpen = ref(false)
const formItem = inject<FormItemContext | null>('ui-form-item', null)
const pickerRef = ref<HTMLElement | null>(null)

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-11

const startDate = ref('')
const startHour = ref('09')
const startMinute = ref('00')
const startSecond = ref('00')

const endDate = ref('')
const endHour = ref('18')
const endMinute = ref('00')
const endSecond = ref('00')

const displayValue = computed(() => {
  if (props.type === 'datetimerange') {
    if (Array.isArray(props.modelValue) && (props.modelValue[0] || props.modelValue[1])) {
      const start = props.modelValue[0] || '开始时间'
      const end = props.modelValue[1] || '结束时间'
      return `${start} 至 ${end}`
    }
    return ''
  }
  return typeof props.modelValue === 'string' ? props.modelValue : ''
})

function parseInitialValue(val?: string | [string, string]) {
  const now = new Date()
  if (props.type === 'datetimerange') {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : ['', '']
    const startParts = (arr[0] || '').split(' ')
    const endParts = (arr[1] || '').split(' ')

    startDate.value = startParts[0] || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    if (startParts[1]) {
      const tp = startParts[1].split(':')
      startHour.value = tp[0] || '00'
      startMinute.value = tp[1] || '00'
      startSecond.value = tp[2] || '00'
    }

    endDate.value = endParts[0] || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    if (endParts[1]) {
      const tp = endParts[1].split(':')
      endHour.value = tp[0] || '00'
      endMinute.value = tp[1] || '00'
      endSecond.value = tp[2] || '00'
    }
    return
  }

  const singleVal = typeof val === 'string' ? val : ''
  if (!singleVal) {
    startDate.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    startHour.value = pad(now.getHours())
    startMinute.value = pad(now.getMinutes())
    startSecond.value = pad(now.getSeconds())
    return
  }

  const parts = singleVal.split(' ')
  if (parts[0]) {
    startDate.value = parts[0]
    const [y, m] = parts[0].split('-').map(Number)
    if (y && m) {
      currentYear.value = y
      currentMonth.value = m - 1
    }
  }
  if (parts[1]) {
    const timeParts = parts[1].split(':')
    startHour.value = timeParts[0] || '00'
    startMinute.value = timeParts[1] || '00'
    startSecond.value = timeParts[2] || '00'
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      parseInitialValue(val)
    }
  },
  { immediate: true }
)

const hours = Array.from({ length: 24 }, (_, i) => pad(i))
const minutes = Array.from({ length: 60 }, (_, i) => pad(i))
const seconds = Array.from({ length: 60 }, (_, i) => pad(i))
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDay {
  dateStr: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isDisabled: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startWeekday = firstDayOfMonth.getDay()

  const todayDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const days: CalendarDay[] = []

  // Prev month filler
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const prevYear = month === 0 ? year - 1 : year
  const prevMonth = month === 0 ? 12 : month
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const dateObj = new Date(prevYear, prevMonth - 1, d)
    const dStr = `${prevYear}-${pad(prevMonth)}-${pad(d)}`
    const isSelected = props.type === 'datetimerange'
      ? (dStr === startDate.value || dStr === endDate.value)
      : (dStr === startDate.value)
    const isInRange = props.type === 'datetimerange' && startDate.value && endDate.value
      ? (dStr > startDate.value && dStr < endDate.value) : false
    days.push({
      dateStr: dStr,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dStr === todayDateStr,
      isSelected,
      isInRange,
      isRangeStart: props.type === 'datetimerange' && dStr === startDate.value,
      isRangeEnd: props.type === 'datetimerange' && dStr === endDate.value,
      isDisabled: props.disabledDate ? props.disabledDate(dateObj) : false
    })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${pad(month + 1)}-${pad(i)}`
    const dateObj = new Date(year, month, i)
    const isSelected = props.type === 'datetimerange'
      ? (dStr === startDate.value || dStr === endDate.value)
      : (dStr === startDate.value)
    const isInRange = props.type === 'datetimerange' && startDate.value && endDate.value
      ? (dStr > startDate.value && dStr < endDate.value) : false
    days.push({
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dStr === todayDateStr,
      isSelected,
      isInRange,
      isRangeStart: props.type === 'datetimerange' && dStr === startDate.value,
      isRangeEnd: props.type === 'datetimerange' && dStr === endDate.value,
      isDisabled: props.disabledDate ? props.disabledDate(dateObj) : false
    })
  }

  // Next month filler
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 1 : month + 2
    const dStr = `${nextYear}-${pad(nextMonth)}-${pad(i)}`
    const dateObj = new Date(nextYear, nextMonth - 1, i)
    const isSelected = props.type === 'datetimerange'
      ? (dStr === startDate.value || dStr === endDate.value)
      : (dStr === startDate.value)
    const isInRange = props.type === 'datetimerange' && startDate.value && endDate.value
      ? (dStr > startDate.value && dStr < endDate.value) : false
    days.push({
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dStr === todayDateStr,
      isSelected,
      isInRange,
      isRangeStart: props.type === 'datetimerange' && dStr === startDate.value,
      isRangeEnd: props.type === 'datetimerange' && dStr === endDate.value,
      isDisabled: props.disabledDate ? props.disabledDate(dateObj) : false
    })
  }

  return days
})

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

function handleSelectDate(day: CalendarDay) {
  if (day.isDisabled) return
  if (props.type === 'datetimerange') {
    if (!startDate.value || (startDate.value && endDate.value)) {
      startDate.value = day.dateStr
      endDate.value = ''
    } else if (startDate.value && !endDate.value) {
      if (day.dateStr < startDate.value) {
        endDate.value = startDate.value
        startDate.value = day.dateStr
      } else {
        endDate.value = day.dateStr
      }
    }
  } else {
    startDate.value = day.dateStr
  }
  if (!day.isCurrentMonth) {
    const [y, m] = day.dateStr.split('-').map(Number)
    currentYear.value = y
    currentMonth.value = m - 1
  }
}

function handleConfirm() {
  if (props.type === 'datetimerange') {
    const startD = startDate.value || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    const endD = endDate.value || startD
    const startVal = constructSingleValue(startD, startHour.value, startMinute.value, startSecond.value)
    const endVal = constructSingleValue(endD, endHour.value, endMinute.value, endSecond.value)
    emit('update:modelValue', [startVal, endVal])
    emit('change', [startVal, endVal])
  } else {
    const singleD = startDate.value || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    const finalVal = constructSingleValue(singleD, startHour.value, startMinute.value, startSecond.value)
    emit('update:modelValue', finalVal)
    emit('change', finalVal)
  }
  isOpen.value = false
  formItem?.validate('change')
}

function handleSelectNow() {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const h = pad(now.getHours())
  const m = pad(now.getMinutes())
  const s = pad(now.getSeconds())

  if (props.type === 'datetimerange') {
    startDate.value = todayStr
    startHour.value = h
    startMinute.value = m
    startSecond.value = s
    endDate.value = todayStr
    endHour.value = h
    endMinute.value = m
    endSecond.value = s
    const val = constructSingleValue(todayStr, h, m, s)
    emit('update:modelValue', [val, val])
    emit('change', [val, val])
  } else {
    startDate.value = todayStr
    startHour.value = h
    startMinute.value = m
    startSecond.value = s
    const val = constructSingleValue(todayStr, h, m, s)
    emit('update:modelValue', val)
    emit('change', val)
  }
  isOpen.value = false
  formItem?.validate('change')
}

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  formItem?.validate('change')
}

function handleClickOutside(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
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
    ref="pickerRef"
    :class="[
      'ui-datetime-picker',
      `ui-datetime-picker--${size}`,
      {
        'ui-datetime-picker--open': isOpen,
        'ui-datetime-picker--disabled': disabled,
        'ui-datetime-picker--block': block
      }
    ]"
  >
    <div class="ui-datetime-picker__input-box" @click="!disabled && (isOpen = !isOpen)">
      <span class="material-symbols-outlined ui-datetime-picker__icon">calendar_clock</span>

      <span v-if="displayValue" class="ui-datetime-picker__text">
        {{ displayValue }}
      </span>
      <span v-else class="ui-datetime-picker__placeholder">
        {{ placeholder }}
      </span>

      <button
        v-if="clearable && displayValue && !disabled"
        type="button"
        class="ui-datetime-picker__clear"
        aria-label="清空"
        @click="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined ui-datetime-picker__arrow">
        expand_more
      </span>
    </div>

    <!-- Dropdown Panel -->
    <Transition name="ui-dt-fade">
      <div v-if="isOpen" class="ui-datetime-picker__dropdown" @click.stop>
          <!-- Date Section -->
          <div class="ui-datetime-picker__date-panel">
            <div class="ui-datetime-picker__header">
              <button type="button" class="ui-datetime-picker__nav-btn" title="上一年" @click="prevYear">
                <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
              </button>
              <button type="button" class="ui-datetime-picker__nav-btn" @click="prevMonth">
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <span class="ui-datetime-picker__month-label">
                {{ currentYear }} 年 {{ currentMonth + 1 }} 月
              </span>
              <button type="button" class="ui-datetime-picker__nav-btn" @click="nextMonth">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
              <button type="button" class="ui-datetime-picker__nav-btn" title="下一年" @click="nextYear">
                <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
              </button>
            </div>

            <div class="ui-datetime-picker__weekdays">
              <span v-for="w in weekDays" :key="w" class="ui-datetime-picker__weekday">{{ w }}</span>
            </div>

            <div class="ui-datetime-picker__grid">
              <button
                v-for="(d, idx) in calendarDays"
                :key="idx"
                type="button"
                :class="[
                  'ui-datetime-picker__cell',
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
                @click="handleSelectDate(d)"
              >
                <span class="ui-datetime-picker__cell-inner">
                  {{ d.dayNumber }}
                </span>
              </button>
            </div>
          </div>

        <!-- Bottom Time Section -->
        <div class="ui-datetime-picker__time-bar">
          <template v-if="type !== 'datetimerange'">
            <div class="ui-datetime-picker__time-group">
              <span class="ui-datetime-picker__time-label">时间</span>
              <div class="ui-datetime-picker__time-box">
                <select v-model="startHour" class="ui-datetime-picker__select">
                  <option v-for="h in hours" :key="h" :value="h">{{ h }} 时</option>
                </select>
                <span class="ui-datetime-picker__colon">:</span>
                <select v-model="startMinute" class="ui-datetime-picker__select">
                  <option v-for="m in minutes" :key="m" :value="m">{{ m }} 分</option>
                </select>
                <template v-if="showSeconds">
                  <span class="ui-datetime-picker__colon">:</span>
                  <select v-model="startSecond" class="ui-datetime-picker__select">
                    <option v-for="s in seconds" :key="s" :value="s">{{ s }} 秒</option>
                  </select>
                </template>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="ui-datetime-picker__range-time-container">
              <div class="ui-datetime-picker__time-unit">
                <span class="ui-datetime-picker__unit-title">开始</span>
                <div class="ui-datetime-picker__time-box">
                  <select v-model="startHour" class="ui-datetime-picker__select">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span class="ui-datetime-picker__colon">:</span>
                  <select v-model="startMinute" class="ui-datetime-picker__select">
                    <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <template v-if="showSeconds">
                    <span class="ui-datetime-picker__colon">:</span>
                    <select v-model="startSecond" class="ui-datetime-picker__select">
                      <option v-for="s in seconds" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </template>
                </div>
              </div>

              <span class="ui-datetime-picker__range-separator">至</span>

              <div class="ui-datetime-picker__time-unit">
                <span class="ui-datetime-picker__unit-title">结束</span>
                <div class="ui-datetime-picker__time-box">
                  <select v-model="endHour" class="ui-datetime-picker__select">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <span class="ui-datetime-picker__colon">:</span>
                  <select v-model="endMinute" class="ui-datetime-picker__select">
                    <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <template v-if="showSeconds">
                    <span class="ui-datetime-picker__colon">:</span>
                    <select v-model="endSecond" class="ui-datetime-picker__select">
                      <option v-for="s in seconds" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer Actions -->
        <div class="ui-datetime-picker__footer">
          <button type="button" class="ui-datetime-picker__btn-link" @click="handleSelectNow">
            此刻
          </button>
          <div class="ui-datetime-picker__btn-actions">
            <button type="button" class="ui-datetime-picker__btn-ghost" @click="isOpen = false">
              取消
            </button>
            <button type="button" class="ui-datetime-picker__btn-primary" @click="handleConfirm">
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.ui-datetime-picker {
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

    .ui-datetime-picker__input-box {
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
    transition: color 0.15s ease;

    &:hover {
      color: var(--on-surface);
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }

  &__arrow {
    color: var(--outline);
    font-size: 18px;
    margin-left: 6px;
    transition: transform 0.2s ease;
  }

  &--open &__arrow {
    transform: rotate(180deg);
  }

  /* Dropdown Window */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    border-radius: var(--r-xl);
    background: color-mix(in srgb, var(--surface-container-lowest) 92%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-hi);
    overflow: hidden;
    width: 440px;
  }

  &__body {
    display: flex;
  }

  &__date-panel {
    padding: 16px;
    width: 270px;
    border-right: 1px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__month-label {
    font-weight: 700;
    font-size: var(--font-size-sm);
    color: var(--on-surface);
  }

  &__nav-btn {
    border: none;
    background: transparent;
    color: var(--on-surface-variant);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-highest) 80%, transparent);
      color: var(--primary);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 8px;
  }

  &__weekday {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--outline);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  &__cell {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--on-surface);
    font-size: var(--font-size-xs);
    font-weight: 500;
    border-radius: var(--r-sm);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(.is-selected) {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }

    &.is-other-month {
      opacity: 0.3;
    }

    &.is-today {
      font-weight: 800;
      color: var(--primary);
    }

    &.is-selected {
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 700;
    }
  }

  /* Time column picker */
  &__time-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    background: color-mix(in srgb, var(--surface-container-low) 40%, transparent);
  }

  &__time-header {
    font-size: 11px;
    font-weight: 700;
    color: var(--outline);
    text-align: center;
    margin-bottom: 8px;
  }

  &__time-columns {
    display: flex;
    gap: 4px;
    height: 200px;
  }

  &__column {
    flex: 1;
    overflow-y: auto;
    padding: 2px;
    border-radius: var(--r-sm);

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--outline-variant) 50%, transparent);
      border-radius: 4px;
    }
  }

  &__time-item {
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--on-surface-variant);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }

    &.is-active {
      background: var(--primary);
      color: var(--on-primary);
      font-weight: 700;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid color-mix(in srgb, var(--outline-variant) 35%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
  }

  &__now-btn {
    border: none;
    background: transparent;
    color: var(--primary);
    font-size: var(--font-size-xs);
    font-weight: 700;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* Fade transition */
.ui-dt-fade-enter-active,
.ui-dt-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ui-dt-fade-enter-from,
.ui-dt-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
