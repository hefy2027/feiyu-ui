<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject, nextTick } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export type DatePickerType = 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year'

export interface DatePreset {
  label: string
  value: string | [string, string] | (() => string | [string, string])
}

interface Props {
  modelValue?: string | [string, string] | null
  type?: DatePickerType
  placeholder?: string
  startPlaceholder?: string
  endPlaceholder?: string
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  presets?: DatePreset[]
  format?: string
  showSeconds?: boolean
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'date',
  placeholder: '请选择日期',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  clearable: true,
  disabled: false,
  size: 'md',
  block: false,
  presets: undefined,
  format: undefined,
  showSeconds: true,
  disabledDate: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string]]
  change: [value: string | [string, string]]
  clear: []
  confirm: [value: string | [string, string]]
}>()

const formItem = inject<FormItemContext | null>('fy-form-item', null)
const pickerContainerRef = ref<HTMLElement | null>(null)

const leftTimeColHourRef = ref<HTMLElement | null>(null)
const leftTimeColMinRef = ref<HTMLElement | null>(null)
const leftTimeColSecRef = ref<HTMLElement | null>(null)

const rightTimeColHourRef = ref<HTMLElement | null>(null)
const rightTimeColMinRef = ref<HTMLElement | null>(null)
const rightTimeColSecRef = ref<HTMLElement | null>(null)

const isOpen = ref(false)

const today = new Date()

// Left panel navigation & view
const leftYear = ref(today.getFullYear())
const leftMonth = ref(today.getMonth()) // 0-11
const leftViewMode = ref<'date' | 'month' | 'year' | 'time'>('date')
const leftDecadeStart = ref(Math.floor(today.getFullYear() / 10) * 10)

// Right panel navigation & view (for range modes)
const rightYear = ref(today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear())
const rightMonth = ref(today.getMonth() === 11 ? 0 : today.getMonth() + 1)
const rightViewMode = ref<'date' | 'month' | 'year' | 'time'>('date')
const rightDecadeStart = ref(Math.floor(rightYear.value / 10) * 10)

// Start time parts
const startHour = ref('00')
const startMinute = ref('00')
const startSecond = ref('00')

// End time parts
const endHour = ref('23')
const endMinute = ref('59')
const endSecond = ref('59')

// Temporary selections in range mode
const tempStartDate = ref('')
const tempEndDate = ref('')
const hoverRangeDate = ref('')

const isRangeType = computed(() => props.type === 'daterange' || props.type === 'datetimerange')
const isDatetimeType = computed(() => props.type === 'datetime' || props.type === 'datetimerange')

function pad(num: number): string {
  return String(num).padStart(2, '0')
}

function formatDateToIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatMonthToIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

function formatYearToIso(d: Date): string {
  return `${d.getFullYear()}`
}

function formatDateTimeToIso(d: Date, withSeconds = true): string {
  const dateStr = formatDateToIso(d)
  const timeStr = withSeconds
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${dateStr} ${timeStr}`
}

function formatDisplayString(val?: string | null): string {
  if (!val) return ''
  const trimmed = String(val).trim()
  const gluedMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}(?::\d{2})?)$/)
  if (gluedMatch) {
    return `${gluedMatch[1]} ${gluedMatch[2]}`
  }
  return trimmed
}

function extractDatePart(str?: string | null): string {
  if (!str) return ''
  const match = String(str).match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

function extractTimeParts(str?: string | null): { h: string; m: string; s: string } {
  if (!str) {
    const now = new Date()
    return { h: pad(now.getHours()), m: pad(now.getMinutes()), s: pad(now.getSeconds()) }
  }
  const match = String(str).match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
  if (match) {
    return {
      h: pad(Number(match[1])),
      m: pad(Number(match[2])),
      s: pad(Number(match[3] || 0))
    }
  }
  return { h: '00', m: '00', s: '00' }
}

function parseDateString(str: string): Date | null {
  if (!str) return null
  const normalized = formatDisplayString(str)
  const cleaned = normalized.replace(' ', 'T')
  const dateObj = new Date(cleaned)
  if (isNaN(dateObj.getTime())) {
    const parts = normalized.split(/[- :]/).map(Number)
    if (parts.length >= 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0)
    }
    return null
  }
  return dateObj
}

// Top inputs display in popover
const topStartDateDisplay = computed(() => {
  if (isRangeType.value) {
    return tempStartDate.value || extractDatePart(Array.isArray(props.modelValue) ? props.modelValue[0] : '') || formatDateToIso(today)
  }
  return extractDatePart(typeof props.modelValue === 'string' ? props.modelValue : '') || formatDateToIso(today)
})

const topStartTimeDisplay = computed(() => {
  return props.showSeconds
    ? `${startHour.value}:${startMinute.value}:${startSecond.value}`
    : `${startHour.value}:${startMinute.value}`
})

const topEndDateDisplay = computed(() => {
  return tempEndDate.value || extractDatePart(Array.isArray(props.modelValue) ? props.modelValue[1] : '') || formatDateToIso(today)
})

const topEndTimeDisplay = computed(() => {
  return props.showSeconds
    ? `${endHour.value}:${endMinute.value}:${endSecond.value}`
    : `${endHour.value}:${endMinute.value}`
})

// Sync internal states from modelValue
function syncFromModelValue() {
  if (isRangeType.value) {
    if (Array.isArray(props.modelValue) && props.modelValue[0]) {
      const rawStart = formatDisplayString(props.modelValue[0])
      const rawEnd = formatDisplayString(props.modelValue[1] || '')
      tempStartDate.value = extractDatePart(rawStart)
      tempEndDate.value = extractDatePart(rawEnd)

      const parsedStart = parseDateString(rawStart)
      if (parsedStart) {
        leftYear.value = parsedStart.getFullYear()
        leftMonth.value = parsedStart.getMonth()
        leftDecadeStart.value = Math.floor(parsedStart.getFullYear() / 10) * 10
        const startT = extractTimeParts(rawStart)
        startHour.value = startT.h
        startMinute.value = startT.m
        startSecond.value = startT.s
      }
      if (rawEnd) {
        const parsedEnd = parseDateString(rawEnd)
        if (parsedEnd) {
          rightYear.value = parsedEnd.getFullYear()
          rightMonth.value = parsedEnd.getMonth()
          rightDecadeStart.value = Math.floor(parsedEnd.getFullYear() / 10) * 10
          const endT = extractTimeParts(rawEnd)
          endHour.value = endT.h
          endMinute.value = endT.m
          endSecond.value = endT.s
        }
      } else if (parsedStart) {
        rightYear.value = parsedStart.getMonth() === 11 ? parsedStart.getFullYear() + 1 : parsedStart.getFullYear()
        rightMonth.value = parsedStart.getMonth() === 11 ? 0 : parsedStart.getMonth() + 1
        rightDecadeStart.value = Math.floor(rightYear.value / 10) * 10
      }
    } else {
      tempStartDate.value = ''
      tempEndDate.value = ''
    }
  } else if (typeof props.modelValue === 'string' && props.modelValue) {
    const normalized = formatDisplayString(props.modelValue)
    const parsed = parseDateString(normalized)
    if (parsed) {
      leftYear.value = parsed.getFullYear()
      leftMonth.value = parsed.getMonth()
      leftDecadeStart.value = Math.floor(parsed.getFullYear() / 10) * 10
      const t = extractTimeParts(normalized)
      startHour.value = t.h
      startMinute.value = t.m
      startSecond.value = t.s
    }
  }
}

watch(
  () => [props.modelValue, props.type],
  () => {
    syncFromModelValue()
  },
  { immediate: true }
)

const displayValue = computed(() => {
  if (isRangeType.value) {
    if (Array.isArray(props.modelValue) && props.modelValue[0]) {
      const s = formatDisplayString(props.modelValue[0])
      const e = formatDisplayString(props.modelValue[1])
      return e ? `${s} 至 ${e}` : s
    }
    return ''
  }
  return typeof props.modelValue === 'string' ? formatDisplayString(props.modelValue) : ''
})

const rangeStartDisplay = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue[0]) {
    return formatDisplayString(props.modelValue[0])
  }
  return tempStartDate.value ? (props.type === 'datetimerange' ? `${tempStartDate.value} ${topStartTimeDisplay.value}` : tempStartDate.value) : ''
})

const rangeEndDisplay = computed(() => {
  if (Array.isArray(props.modelValue) && props.modelValue[1]) {
    return formatDisplayString(props.modelValue[1])
  }
  return tempEndDate.value ? (props.type === 'datetimerange' ? `${tempEndDate.value} ${topEndTimeDisplay.value}` : tempEndDate.value) : ''
})

// Weekdays header: Starting from Monday (一, 二, 三, 四, 五, 六, 日)
const weekDays = ['一', '二', '三', '四', '五', '六', '日']

interface CalendarCell {
  date: Date
  dateString: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isDisabled: boolean
}

function buildCalendarMonth(year: number, month: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Convert Sunday (0) to 7 so Monday is 1
  const rawWeekday = firstDayOfMonth.getDay()
  const startWeekday = rawWeekday === 0 ? 7 : rawWeekday

  const todayString = formatDateToIso(today)
  const singleSelected = typeof props.modelValue === 'string' ? extractDatePart(props.modelValue) : ''

  // Effective range endpoints for visual highlighting
  const rStart = isRangeType.value ? tempStartDate.value : ''
  let rEnd = isRangeType.value ? tempEndDate.value : ''

  if (rStart && !rEnd && hoverRangeDate.value) {
    rEnd = hoverRangeDate.value
  }

  const normalizedStart = rStart && rEnd ? (rStart < rEnd ? rStart : rEnd) : rStart
  const normalizedEnd = rStart && rEnd ? (rStart < rEnd ? rEnd : rStart) : rEnd

  const cells: CalendarCell[] = []

  // Prev month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 1; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i + 1)
    const dStr = formatDateToIso(d)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    cells.push({
      date: d,
      dateString: dStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dStr === todayString,
      isSelected: props.type === 'date' || props.type === 'datetime'
        ? dStr === singleSelected
        : dStr === normalizedStart || dStr === normalizedEnd,
      isInRange: Boolean(normalizedStart && normalizedEnd && dStr > normalizedStart && dStr < normalizedEnd),
      isRangeStart: Boolean(normalizedStart && dStr === normalizedStart),
      isRangeEnd: Boolean(normalizedEnd && dStr === normalizedEnd),
      isDisabled
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    const dStr = formatDateToIso(d)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    cells.push({
      date: d,
      dateString: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dStr === todayString,
      isSelected: props.type === 'date' || props.type === 'datetime'
        ? dStr === singleSelected
        : dStr === normalizedStart || dStr === normalizedEnd,
      isInRange: Boolean(normalizedStart && normalizedEnd && dStr > normalizedStart && dStr < normalizedEnd),
      isRangeStart: Boolean(normalizedStart && dStr === normalizedStart),
      isRangeEnd: Boolean(normalizedEnd && dStr === normalizedEnd),
      isDisabled
    })
  }

  // Next month leading days (fill up to 42 cells = 6 rows)
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const dStr = formatDateToIso(d)
    const isDisabled = props.disabledDate ? props.disabledDate(d) : false
    cells.push({
      date: d,
      dateString: dStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dStr === todayString,
      isSelected: props.type === 'date' || props.type === 'datetime'
        ? dStr === singleSelected
        : dStr === normalizedStart || dStr === normalizedEnd,
      isInRange: Boolean(normalizedStart && normalizedEnd && dStr > normalizedStart && dStr < normalizedEnd),
      isRangeStart: Boolean(normalizedStart && dStr === normalizedStart),
      isRangeEnd: Boolean(normalizedEnd && dStr === normalizedEnd),
      isDisabled
    })
  }

  return cells
}

const leftCalendarDays = computed(() => buildCalendarMonth(leftYear.value, leftMonth.value))
const rightCalendarDays = computed(() => buildCalendarMonth(rightYear.value, rightMonth.value))

// Left navigation
function prevLeftYear() {
  if (leftViewMode.value === 'year') {
    leftDecadeStart.value -= 10
  } else {
    leftYear.value -= 1
  }
}
function nextLeftYear() {
  if (leftViewMode.value === 'year') {
    leftDecadeStart.value += 10
  } else {
    leftYear.value += 1
  }
}
function prevLeftMonth() {
  if (leftMonth.value === 0) {
    leftMonth.value = 11
    leftYear.value -= 1
  } else {
    leftMonth.value -= 1
  }
}
function nextLeftMonth() {
  if (leftMonth.value === 11) {
    leftMonth.value = 0
    leftYear.value += 1
  } else {
    leftMonth.value += 1
  }
}

// Right navigation
function prevRightYear() {
  if (rightViewMode.value === 'year') {
    rightDecadeStart.value -= 10
  } else {
    rightYear.value -= 1
  }
}
function nextRightYear() {
  if (rightViewMode.value === 'year') {
    rightDecadeStart.value += 10
  } else {
    rightYear.value += 1
  }
}
function prevRightMonth() {
  if (rightMonth.value === 0) {
    rightMonth.value = 11
    rightYear.value -= 1
  } else {
    rightMonth.value -= 1
  }
}
function nextRightMonth() {
  if (rightMonth.value === 11) {
    rightMonth.value = 0
    rightYear.value += 1
  } else {
    rightMonth.value += 1
  }
}

// Time list
const hoursList = Array.from({ length: 24 }, (_, i) => pad(i))
const minutesList = Array.from({ length: 60 }, (_, i) => pad(i))
const secondsList = Array.from({ length: 60 }, (_, i) => pad(i))

function scrollToTimeColumn(container: HTMLElement | null, index: number) {
  if (!container) return
  const itemHeight = 30
  container.scrollTop = Math.max(0, index * itemHeight - itemHeight)
}

function syncLeftTimeScroll() {
  nextTick(() => {
    scrollToTimeColumn(leftTimeColHourRef.value, Number(startHour.value))
    scrollToTimeColumn(leftTimeColMinRef.value, Number(startMinute.value))
    if (props.showSeconds) {
      scrollToTimeColumn(leftTimeColSecRef.value, Number(startSecond.value))
    }
  })
}

function syncRightTimeScroll() {
  nextTick(() => {
    scrollToTimeColumn(rightTimeColHourRef.value, Number(endHour.value))
    scrollToTimeColumn(rightTimeColMinRef.value, Number(endMinute.value))
    if (props.showSeconds) {
      scrollToTimeColumn(rightTimeColSecRef.value, Number(endSecond.value))
    }
  })
}

function selectStartHour(h: string) {
  startHour.value = h
  emitTimeChange()
}
function selectStartMinute(m: string) {
  startMinute.value = m
  emitTimeChange()
}
function selectStartSecond(s: string) {
  startSecond.value = s
  emitTimeChange()
}

function selectEndHour(h: string) {
  endHour.value = h
  emitTimeChange()
}
function selectEndMinute(m: string) {
  endMinute.value = m
  emitTimeChange()
}
function selectEndSecond(s: string) {
  endSecond.value = s
  emitTimeChange()
}

function emitTimeChange() {
  if (props.type === 'datetime') {
    const date = tempStartDate.value || extractDatePart(typeof props.modelValue === 'string' ? props.modelValue : '') || formatDateToIso(today)
    const finalVal = `${date} ${topStartTimeDisplay.value}`
    emit('update:modelValue', finalVal)
    emit('change', finalVal)
    formItem?.validate('change')
  } else if (props.type === 'datetimerange' && tempStartDate.value && tempEndDate.value) {
    const sVal = `${tempStartDate.value} ${topStartTimeDisplay.value}`
    const eVal = `${tempEndDate.value} ${topEndTimeDisplay.value}`
    emit('update:modelValue', [sVal, eVal])
    emit('change', [sVal, eVal])
    formItem?.validate('change')
  }
}

// Date cell click
function handleSelectDay(day: CalendarCell) {
  if (day.isDisabled) return

  if (props.type === 'date') {
    emit('update:modelValue', day.dateString)
    emit('change', day.dateString)
    isOpen.value = false
    formItem?.validate('change')
    return
  }

  if (props.type === 'datetime') {
    tempStartDate.value = day.dateString
    const finalVal = `${day.dateString} ${topStartTimeDisplay.value}`
    emit('update:modelValue', finalVal)
    emit('change', finalVal)
    formItem?.validate('change')
    return
  }

  if (isRangeType.value) {
    if (!tempStartDate.value || (tempStartDate.value && tempEndDate.value)) {
      // First selection click
      tempStartDate.value = day.dateString
      tempEndDate.value = ''
      hoverRangeDate.value = ''
    } else {
      // Second selection click
      let start = tempStartDate.value
      let end = day.dateString
      if (end < start) {
        const t = start
        start = end
        end = t
      }
      tempStartDate.value = start
      tempEndDate.value = end
      hoverRangeDate.value = ''

      if (props.type === 'daterange') {
        emit('update:modelValue', [start, end])
        emit('change', [start, end])
        isOpen.value = false
        formItem?.validate('change')
      } else {
        const sVal = `${start} ${topStartTimeDisplay.value}`
        const eVal = `${end} ${topEndTimeDisplay.value}`
        emit('update:modelValue', [sVal, eVal])
        emit('change', [sVal, eVal])
        formItem?.validate('change')
      }
    }
  }
}

function handleDayHover(day: CalendarCell) {
  if (!tempStartDate.value || tempEndDate.value || !isRangeType.value) {
    hoverRangeDate.value = ''
    return
  }
  hoverRangeDate.value = day.dateString
}

// Month & Year picker view handling
const monthsGrid = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const leftYearsGrid = computed(() => {
  return Array.from({ length: 12 }, (_, i) => leftDecadeStart.value + i)
})
const rightYearsGrid = computed(() => {
  return Array.from({ length: 12 }, (_, i) => rightDecadeStart.value + i)
})

function handleLeftMonthClick(mIdx: number) {
  leftMonth.value = mIdx
  if (props.type === 'month') {
    const val = `${leftYear.value}-${pad(mIdx + 1)}`
    emit('update:modelValue', val)
    emit('change', val)
    isOpen.value = false
    formItem?.validate('change')
  } else {
    leftViewMode.value = 'date'
  }
}

function handleLeftYearClick(y: number) {
  leftYear.value = y
  if (props.type === 'year') {
    const val = `${y}`
    emit('update:modelValue', val)
    emit('change', val)
    isOpen.value = false
    formItem?.validate('change')
  } else {
    leftViewMode.value = 'month'
  }
}

function handleRightMonthClick(mIdx: number) {
  rightMonth.value = mIdx
  rightViewMode.value = 'date'
}

function handleRightYearClick(y: number) {
  rightYear.value = y
  rightViewMode.value = 'month'
}

function setLeftView(view: 'date' | 'time' | 'month' | 'year') {
  leftViewMode.value = view
  if (view === 'time') {
    syncLeftTimeScroll()
  }
}

function setRightView(view: 'date' | 'time' | 'month' | 'year') {
  rightViewMode.value = view
  if (view === 'time') {
    syncRightTimeScroll()
  }
}

// Presets
const effectivePresets = computed<DatePreset[]>(() => {
  if (props.presets !== undefined) return props.presets

  const now = new Date()
  if (props.type === 'daterange' || props.type === 'datetimerange') {
    const todayStr = formatDateToIso(now)
    const yesterday = new Date(now.getTime() - 86400000)
    const last7Days = new Date(now.getTime() - 6 * 86400000)
    const last30Days = new Date(now.getTime() - 29 * 86400000)

    if (props.type === 'daterange') {
      return [
        { label: '今天', value: [todayStr, todayStr] },
        { label: '昨天', value: [formatDateToIso(yesterday), formatDateToIso(yesterday)] },
        { label: '近 7 天', value: [formatDateToIso(last7Days), todayStr] },
        { label: '近 30 天', value: [formatDateToIso(last30Days), todayStr] }
      ]
    } else {
      return [
        { label: '今天', value: [`${todayStr} 00:00:00`, `${todayStr} 23:59:59`] },
        { label: '近 7 天', value: [`${formatDateToIso(last7Days)} 00:00:00`, `${todayStr} 23:59:59`] },
        { label: '近 30 天', value: [`${formatDateToIso(last30Days)} 00:00:00`, `${todayStr} 23:59:59`] }
      ]
    }
  }

  if (props.type === 'datetime') {
    return [
      { label: '此刻', value: () => formatDateTimeToIso(new Date(), props.showSeconds) },
    ]
  }

  const tomorrow = new Date(now.getTime() + 86400000)
  const nextWeek = new Date(now.getTime() + 7 * 86400000)
  return [
    { label: '今天', value: formatDateToIso(now) },
    { label: '明天', value: formatDateToIso(tomorrow) },
    { label: '下周', value: formatDateToIso(nextWeek) }
  ]
})

function handlePresetClick(preset: DatePreset) {
  const rawVal = typeof preset.value === 'function' ? preset.value() : preset.value
  if (Array.isArray(rawVal)) {
    const s = formatDisplayString(rawVal[0])
    const e = formatDisplayString(rawVal[1])
    tempStartDate.value = extractDatePart(s)
    tempEndDate.value = extractDatePart(e)
    const startT = extractTimeParts(s)
    startHour.value = startT.h
    startMinute.value = startT.m
    startSecond.value = startT.s
    const endT = extractTimeParts(e)
    endHour.value = endT.h
    endMinute.value = endT.m
    endSecond.value = endT.s
    emit('update:modelValue', [s, e])
    emit('change', [s, e])
  } else {
    const s = formatDisplayString(rawVal)
    tempStartDate.value = extractDatePart(s)
    const t = extractTimeParts(s)
    startHour.value = t.h
    startMinute.value = t.m
    startSecond.value = t.s
    emit('update:modelValue', s)
    emit('change', s)
  }
  if (props.type !== 'datetimerange') {
    isOpen.value = false
  }
  formItem?.validate('change')
}

function handleConfirm() {
  if (isRangeType.value) {
    if (tempStartDate.value && tempEndDate.value) {
      const sVal = props.type === 'datetimerange' ? `${tempStartDate.value} ${topStartTimeDisplay.value}` : tempStartDate.value
      const eVal = props.type === 'datetimerange' ? `${tempEndDate.value} ${topEndTimeDisplay.value}` : tempEndDate.value
      emit('confirm', [sVal, eVal])
    }
  } else if (props.modelValue) {
    emit('confirm', props.modelValue)
  }
  isOpen.value = false
  formItem?.validate('change')
}

function handleClear(event?: MouseEvent) {
  event?.stopPropagation()
  tempStartDate.value = ''
  tempEndDate.value = ''
  hoverRangeDate.value = ''
  if (isRangeType.value) {
    emit('update:modelValue', ['', ''])
    emit('change', ['', ''])
  } else {
    emit('update:modelValue', '')
    emit('change', '')
  }
  emit('clear')
  formItem?.validate('change')
}

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    leftViewMode.value = props.type === 'month' ? 'month' : props.type === 'year' ? 'year' : 'date'
    rightViewMode.value = 'date'
    syncFromModelValue()
  }
}

function handleClickOutside(event: MouseEvent) {
  if (pickerContainerRef.value && !pickerContainerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="pickerContainerRef"
    :class="[
      'fy-date-picker',
      `fy-date-picker--${size}`,
      {
        'fy-date-picker--open': isOpen,
        'fy-date-picker--disabled': disabled,
        'fy-date-picker--block': block,
        'fy-date-picker--range': isRangeType
      }
    ]"
  >
    <!-- Trigger Box -->
    <div class="fy-date-picker__input-box" @click="toggleDropdown">
      <span class="material-symbols-outlined fy-date-picker__icon">
        {{ isDatetimeType ? 'calendar_clock' : 'calendar_today' }}
      </span>

      <!-- Single Mode Input Content -->
      <template v-if="!isRangeType">
        <span v-if="displayValue" class="fy-date-picker__text">
          {{ displayValue }}
        </span>
        <span v-else class="fy-date-picker__placeholder">
          {{ placeholder }}
        </span>
      </template>

      <!-- Range Mode Input Content -->
      <template v-else>
        <div class="fy-date-picker__range-inputs">
          <span :class="['fy-date-picker__range-item', { 'is-empty': !rangeStartDisplay }]">
            {{ rangeStartDisplay || startPlaceholder }}
          </span>
          <span class="material-symbols-outlined fy-date-picker__range-arrow">
            arrow_right_alt
          </span>
          <span :class="['fy-date-picker__range-item', { 'is-empty': !rangeEndDisplay }]">
            {{ rangeEndDisplay || endPlaceholder }}
          </span>
        </div>
      </template>

      <!-- Clear Button / Chevron Arrow -->
      <button
        v-if="clearable && (displayValue || rangeStartDisplay) && !disabled"
        type="button"
        class="fy-date-picker__clear"
        aria-label="清空"
        @click.stop="handleClear"
      >
        <span class="material-symbols-outlined">cancel</span>
      </button>
      <span v-else class="material-symbols-outlined fy-date-picker__arrow">
        expand_more
      </span>
    </div>

    <!-- Dropdown Popover Panel -->
    <transition name="fy-date-picker-fade">
      <div
        v-if="isOpen"
        :class="[
          'fy-date-picker__dropdown',
          {
            'is-range-panel': isRangeType,
            'is-datetime-panel': isDatetimeType
          }
        ]"
        @click.stop
      >
        <!-- Top Input Pills for DateTime & DateTimeRange -->
        <div v-if="isDatetimeType" class="fy-date-picker__top-inputs">
          <!-- Left / Start Input Pills -->
          <div class="fy-date-picker__top-group">
            <button
              type="button"
              :class="['fy-date-picker__pill-btn', { 'is-active': leftViewMode !== 'time' }]"
              @click="setLeftView('date')"
            >
              {{ topStartDateDisplay }}
            </button>
            <button
              type="button"
              :class="['fy-date-picker__pill-btn', { 'is-active': leftViewMode === 'time' }]"
              @click="setLeftView('time')"
            >
              {{ topStartTimeDisplay }}
            </button>
          </div>

          <!-- Right / End Input Pills (datetimerange only) -->
          <div v-if="props.type === 'datetimerange'" class="fy-date-picker__top-group">
            <button
              type="button"
              :class="['fy-date-picker__pill-btn', { 'is-active': rightViewMode !== 'time' }]"
              @click="setRightView('date')"
            >
              {{ topEndDateDisplay }}
            </button>
            <button
              type="button"
              :class="['fy-date-picker__pill-btn', { 'is-active': rightViewMode === 'time' }]"
              @click="setRightView('time')"
            >
              {{ topEndTimeDisplay }}
            </button>
          </div>
        </div>

        <!-- Main Calendar & Time Body -->
        <div class="fy-date-picker__body">
          <!-- Left Panel -->
          <div class="fy-date-picker__panel fy-date-picker__panel--left">
            <!-- Date View Mode -->
            <template v-if="leftViewMode === 'date'">
              <div class="fy-date-picker__header">
                <button type="button" class="fy-date-picker__nav-btn" title="上一年" @click="prevLeftYear">
                  <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
                </button>
                <button type="button" class="fy-date-picker__nav-btn" title="上一月" @click="prevLeftMonth">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="fy-date-picker__header-title">
                  <span class="fy-date-picker__title-btn" @click="setLeftView('year')">{{ leftYear }}年</span>
                  <span class="fy-date-picker__title-btn" @click="setLeftView('month')">{{ leftMonth + 1 }}月</span>
                </div>
                <button type="button" class="fy-date-picker__nav-btn" title="下一月" @click="nextLeftMonth">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
                <button type="button" class="fy-date-picker__nav-btn" title="下一年" @click="nextLeftYear">
                  <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
                </button>
              </div>

              <div class="fy-date-picker__weekdays">
                <span v-for="w in weekDays" :key="w" class="fy-date-picker__weekday">{{ w }}</span>
              </div>

              <div class="fy-date-picker__grid">
                <button
                  v-for="(d, idx) in leftCalendarDays"
                  :key="idx"
                  type="button"
                  :class="[
                    'fy-date-picker__cell',
                    {
                      'is-other-month': !d.isCurrentMonth,
                      'is-row-start': idx % 7 === 0,
                      'is-row-end': idx % 7 === 6,
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
                  @mouseenter="handleDayHover(d)"
                >
                  <span class="fy-date-picker__cell-inner">
                    {{ d.dayNumber }}
                  </span>
                </button>
              </div>
            </template>

            <!-- Time Picker Mode (Inside Left Panel) -->
            <template v-else-if="leftViewMode === 'time'">
              <div class="fy-date-picker__time-panel-inner">
                <div class="fy-date-picker__time-col-header">
                  <span>时</span>
                  <span>分</span>
                  <span v-if="showSeconds">秒</span>
                </div>
                <div class="fy-date-picker__time-body">
                  <div ref="leftTimeColHourRef" class="fy-date-picker__time-column">
                    <button
                      v-for="h in hoursList"
                      :key="h"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': h === startHour }]"
                      @click="selectStartHour(h)"
                    >
                      {{ h }}
                    </button>
                  </div>
                  <div ref="leftTimeColMinRef" class="fy-date-picker__time-column">
                    <button
                      v-for="m in minutesList"
                      :key="m"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': m === startMinute }]"
                      @click="selectStartMinute(m)"
                    >
                      {{ m }}
                    </button>
                  </div>
                  <div v-if="showSeconds" ref="leftTimeColSecRef" class="fy-date-picker__time-column">
                    <button
                      v-for="s in secondsList"
                      :key="s"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': s === startSecond }]"
                      @click="selectStartSecond(s)"
                    >
                      {{ s }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Month Mode -->
            <template v-else-if="leftViewMode === 'month'">
              <div class="fy-date-picker__month-grid">
                <button
                  v-for="(mName, mIdx) in monthsGrid"
                  :key="mName"
                  type="button"
                  :class="['fy-date-picker__month-cell', { 'is-selected': leftMonth === mIdx }]"
                  @click="handleLeftMonthClick(mIdx)"
                >
                  {{ mName }}
                </button>
              </div>
            </template>

            <!-- Year Mode -->
            <template v-else-if="leftViewMode === 'year'">
              <div class="fy-date-picker__year-grid">
                <button
                  v-for="y in leftYearsGrid"
                  :key="y"
                  type="button"
                  :class="['fy-date-picker__year-cell', { 'is-selected': leftYear === y }]"
                  @click="handleLeftYearClick(y)"
                >
                  {{ y }}
                </button>
              </div>
            </template>
          </div>

          <!-- Right Panel (For daterange & datetimerange) -->
          <div v-if="isRangeType" class="fy-date-picker__panel fy-date-picker__panel--right">
            <!-- Right Date View -->
            <template v-if="rightViewMode === 'date'">
              <div class="fy-date-picker__header">
                <button type="button" class="fy-date-picker__nav-btn" title="上一年" @click="prevRightYear">
                  <span class="material-symbols-outlined">keyboard_double_arrow_left</span>
                </button>
                <button type="button" class="fy-date-picker__nav-btn" title="上一月" @click="prevRightMonth">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="fy-date-picker__header-title">
                  <span class="fy-date-picker__title-btn" @click="setRightView('year')">{{ rightYear }}年</span>
                  <span class="fy-date-picker__title-btn" @click="setRightView('month')">{{ rightMonth + 1 }}月</span>
                </div>
                <button type="button" class="fy-date-picker__nav-btn" title="下一月" @click="nextRightMonth">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
                <button type="button" class="fy-date-picker__nav-btn" title="下一年" @click="nextRightYear">
                  <span class="material-symbols-outlined">keyboard_double_arrow_right</span>
                </button>
              </div>

              <div class="fy-date-picker__weekdays">
                <span v-for="w in weekDays" :key="w" class="fy-date-picker__weekday">{{ w }}</span>
              </div>

              <div class="fy-date-picker__grid">
                <button
                  v-for="(d, idx) in rightCalendarDays"
                  :key="idx"
                  type="button"
                  :class="[
                    'fy-date-picker__cell',
                    {
                      'is-other-month': !d.isCurrentMonth,
                      'is-row-start': idx % 7 === 0,
                      'is-row-end': idx % 7 === 6,
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
                  @mouseenter="handleDayHover(d)"
                >
                  <span class="fy-date-picker__cell-inner">
                    {{ d.dayNumber }}
                  </span>
                </button>
              </div>
            </template>

            <!-- Right Time Picker Mode -->
            <template v-else-if="rightViewMode === 'time'">
              <div class="fy-date-picker__time-panel-inner">
                <div class="fy-date-picker__time-col-header">
                  <span>时</span>
                  <span>分</span>
                  <span v-if="showSeconds">秒</span>
                </div>
                <div class="fy-date-picker__time-body">
                  <div ref="rightTimeColHourRef" class="fy-date-picker__time-column">
                    <button
                      v-for="h in hoursList"
                      :key="h"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': h === endHour }]"
                      @click="selectEndHour(h)"
                    >
                      {{ h }}
                    </button>
                  </div>
                  <div ref="rightTimeColMinRef" class="fy-date-picker__time-column">
                    <button
                      v-for="m in minutesList"
                      :key="m"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': m === endMinute }]"
                      @click="selectEndMinute(m)"
                    >
                      {{ m }}
                    </button>
                  </div>
                  <div v-if="showSeconds" ref="rightTimeColSecRef" class="fy-date-picker__time-column">
                    <button
                      v-for="s in secondsList"
                      :key="s"
                      type="button"
                      :class="['fy-date-picker__time-cell', { 'is-active': s === endSecond }]"
                      @click="selectEndSecond(s)"
                    >
                      {{ s }}
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Right Month Mode -->
            <template v-else-if="rightViewMode === 'month'">
              <div class="fy-date-picker__month-grid">
                <button
                  v-for="(mName, mIdx) in monthsGrid"
                  :key="mName"
                  type="button"
                  :class="['fy-date-picker__month-cell', { 'is-selected': rightMonth === mIdx }]"
                  @click="handleRightMonthClick(mIdx)"
                >
                  {{ mName }}
                </button>
              </div>
            </template>

            <!-- Right Year Mode -->
            <template v-else-if="rightViewMode === 'year'">
              <div class="fy-date-picker__year-grid">
                <button
                  v-for="y in rightYearsGrid"
                  :key="y"
                  type="button"
                  :class="['fy-date-picker__year-cell', { 'is-selected': rightYear === y }]"
                  @click="handleRightYearClick(y)"
                >
                  {{ y }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- Footer Actions Bar -->
        <div class="fy-date-picker__footer">
          <div class="fy-date-picker__footer-left">
            <!-- Presets Horizontal Pills -->
            <template v-if="effectivePresets && effectivePresets.length > 0">
              <button
                v-for="p in effectivePresets"
                :key="p.label"
                type="button"
                class="fy-date-picker__preset-btn"
                @click="handlePresetClick(p)"
              >
                {{ p.label }}
              </button>
            </template>
          </div>

          <div class="fy-date-picker__footer-actions">
            <button
              type="button"
              class="fy-date-picker__btn-ghost"
              @click="handleClear"
            >
              清除
            </button>
            <button
              type="button"
              class="fy-date-picker__btn-primary"
              @click="handleConfirm"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.fy-date-picker {
  position: relative;
  display: inline-flex;
  font-family: inherit;
  user-select: none;
  width: max-content;

  &--open {
    z-index: 50;
  }

  &--block {
    display: flex;
    width: 100%;
  }

  /* Input Trigger Box */
  &__input-box {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 220px;
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

  &--range &__input-box {
    min-width: 320px;
  }

  &--open &__input-box {
    border-color: color-mix(in srgb, var(--fy-primary) 70%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--fy-primary) 20%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 80%, transparent);
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;

    .fy-date-picker__input-box {
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
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__placeholder {
    flex: 1;
    color: var(--fy-outline);
    font-weight: 400;
  }

  /* Range inputs inside trigger */
  &__range-inputs {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
    overflow: hidden;
  }

  &__range-item {
    flex: 1;
    color: var(--fy-on-surface);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.is-empty {
      color: var(--fy-outline);
      font-weight: 400;
    }
  }

  &__range-arrow {
    font-size: 18px;
    color: var(--fy-outline);
    flex-shrink: 0;
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
    transition: color 0.15s ease;

    &:hover {
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Dropdown Calendar Popover */
  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 250;
    border-radius: var(--fy-r-lg);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 96%, transparent);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid var(--fy-glass-border);
    box-shadow: var(--fy-shadow-pop), inset 0 1px 0 var(--fy-glass-hi);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Top Input Pills (Naive UI style) */
  &__top-inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-low) 40%, transparent);
  }

  &__top-group {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  &__pill-btn {
    flex: 1;
    height: 28px;
    padding: 0 10px;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 35%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 80%, transparent);
    color: var(--fy-on-surface);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;

    &:hover {
      border-color: color-mix(in srgb, var(--fy-primary) 50%, transparent);
    }

    &.is-active {
      border-color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 10%, transparent);
      color: var(--fy-primary);
      font-weight: 700;
      box-shadow: 0 0 0 1px var(--fy-primary);
    }
  }

  /* Main Body Panels */
  &__body {
    display: flex;
    width: 100%;
  }

  &__panel {
    padding: 12px 14px;
    flex: 1;
    min-width: 260px;
    box-sizing: border-box;

    &--right {
      border-left: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    }
  }

  /* Header Navigation */
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
    margin-bottom: 8px;
  }

  &__header-title {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__title-btn {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--fy-on-surface);
    cursor: pointer;
    padding: 2px 5px;
    border-radius: var(--fy-r-sm);
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      color: var(--fy-primary);
    }
  }

  &__nav-btn {
    border: none;
    background: transparent;
    color: var(--fy-outline);
    cursor: pointer;
    padding: 3px;
    border-radius: var(--fy-r-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
      color: var(--fy-on-surface);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Weekdays (Monday to Sunday) */
  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--fy-outline);
    padding: 4px 0 6px;
  }

  /* Calendar Grid */
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 2px;
  }

  &__cell {
    height: 30px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--fy-on-surface);
    cursor: pointer;
    position: relative;

    &::before {
      position: absolute;
      top: 1px;
      bottom: 1px;
      pointer-events: none;
      z-index: 1;
    }

    &-inner {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      position: relative;
      z-index: 2;
    }

    &:hover:not(.is-selected):not(.is-disabled) .fy-date-picker__cell-inner {
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
      color: var(--fy-primary);
    }

    &.is-other-month {
      color: color-mix(in srgb, var(--fy-outline) 40%, transparent);
      font-weight: 400;
    }

    &.is-today .fy-date-picker__cell-inner {
      color: var(--fy-primary);
      font-weight: 700;
      border: 1px solid var(--fy-primary);
    }

    &.is-selected .fy-date-picker__cell-inner {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      font-weight: 700;
      border-radius: 4px;
    }

    /* Continuous Range Ribbon covering all in-range, start, and end cells */
    &.is-in-range::before {
      content: '';
      left: 0;
      right: 0;
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
    }

    &.is-in-range.is-row-start::before {
      left: 2px;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    &.is-in-range.is-row-end::before {
      right: 2px;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    /* Range Start: Full cell coverage with rounded left edge */
    &.is-range-start::before {
      content: '';
      left: 2px;
      right: 0;
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    /* Range End: Full cell coverage with rounded right edge */
    &.is-range-end::before {
      content: '';
      left: 0;
      right: 2px;
      background: color-mix(in srgb, var(--fy-primary) 15%, transparent);
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    /* If range start and end fall on the exact same cell */
    &.is-range-start.is-range-end::before {
      left: 2px;
      right: 2px;
      border-radius: 6px;
    }

    &.is-disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  /* Embedded Time Column Mode inside panel */
  &__time-panel-inner {
    display: flex;
    flex-direction: column;
    height: 224px;
  }

  &__time-col-header {
    display: flex;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--fy-outline);
    padding: 6px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 20%, transparent);

    span {
      flex: 1;
    }
  }

  &__time-body {
    display: flex;
    flex: 1;
    height: 190px;
    overflow: hidden;
  }

  &__time-column {
    flex: 1;
    overflow-y: auto;
    padding: 4px 2px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    scroll-behavior: smooth;

    &:not(:last-child) {
      border-right: 1px solid color-mix(in srgb, var(--fy-outline-variant) 15%, transparent);
    }

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
      border-radius: 3px;
    }
  }

  &__time-cell {
    width: 100%;
    height: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    font-size: 12px;
    color: var(--fy-on-surface-variant);
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;

    &:hover:not(.is-active) {
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      color: var(--fy-primary);
    }

    &.is-active {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      font-weight: 700;
    }
  }

  /* Month & Year Grids */
  &__month-grid,
  &__year-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 8px 2px;
    height: 224px;
    align-content: center;
  }

  &__month-cell,
  &__year-cell {
    height: 42px;
    border: none;
    background: transparent;
    border-radius: var(--fy-r-sm);
    color: var(--fy-on-surface);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-primary) 14%, transparent);
      color: var(--fy-primary);
    }

    &.is-selected {
      background: var(--fy-primary);
      color: var(--fy-on-primary);
      font-weight: 700;
    }
  }

  /* Footer Actions */
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-low) 30%, transparent);
    gap: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  &__footer-left {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
    overflow-x: auto;
  }

  &__preset-btn {
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-lowest) 70%, transparent);
    color: var(--fy-on-surface);
    font-size: 11.5px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: var(--fy-r-sm);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      border-color: var(--fy-primary);
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 8%, transparent);
    }
  }

  &__footer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  &__btn-ghost {
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 40%, transparent);
    background: transparent;
    color: var(--fy-on-surface-variant);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 3px 12px;
    border-radius: var(--fy-r-sm);
    transition: all 0.15s ease;

    &:hover {
      color: var(--fy-on-surface);
      border-color: var(--fy-outline);
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    }
  }

  &__btn-primary {
    border: none;
    background: var(--fy-primary);
    color: var(--fy-on-primary);
    font-size: 12px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: var(--fy-r-sm);
    cursor: pointer;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--fy-primary) 30%, transparent);
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}

.fy-date-picker-fade-enter-active,
.fy-date-picker-fade-leave-active {
  transition: opacity 0.18s var(--fy-ease-soft), transform 0.18s var(--fy-ease-out);
}
.fy-date-picker-fade-enter-from,
.fy-date-picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
