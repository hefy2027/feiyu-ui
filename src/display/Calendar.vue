<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: string | Date
  year?: number
  month?: number // 1-12
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  year: undefined,
  month: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [value: string]
  panelChange: [year: number, month: number]
}>()

const today = new Date()
const currentYear = ref(props.year ?? today.getFullYear())
const currentMonth = ref(props.month ?? today.getMonth() + 1) // 1-12

function formatDateStr(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

const selectedDate = ref<string>(
  props.modelValue
    ? typeof props.modelValue === 'string'
      ? props.modelValue
      : formatDateStr(props.modelValue.getFullYear(), props.modelValue.getMonth() + 1, props.modelValue.getDate())
    : formatDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
)

watch(() => props.modelValue, (val) => {
  if (val) {
    selectedDate.value = typeof val === 'string'
      ? val
      : formatDateStr(val.getFullYear(), val.getMonth() + 1, val.getDate())
  }
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

interface CalendarCell {
  dateStr: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  year: number
  month: number
}

const calendarCells = computed<CalendarCell[]>(() => {
  const y = currentYear.value
  const m = currentMonth.value // 1-12
  const firstDayOfWeek = new Date(y, m - 1, 1).getDay() // 0 is Sunday
  const adjustedFirstDay = firstDayOfWeek === 0 ? 7 : firstDayOfWeek // 1 is Monday
  
  const daysInMonth = new Date(y, m, 0).getDate()
  const daysInPrevMonth = new Date(y, m - 1, 0).getDate()
  
  const cells: CalendarCell[] = []
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())

  // Prev month filler
  for (let i = adjustedFirstDay - 1; i > 0; i--) {
    const d = daysInPrevMonth - i + 1
    const prevYear = m === 1 ? y - 1 : y
    const prevMonth = m === 1 ? 12 : m - 1
    const dStr = formatDateStr(prevYear, prevMonth, d)
    cells.push({
      dateStr: dStr,
      day: d,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDate.value,
      year: prevYear,
      month: prevMonth
    })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = formatDateStr(y, m, d)
    cells.push({
      dateStr: dStr,
      day: d,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDate.value,
      year: y,
      month: m
    })
  }

  // Next month filler
  const remaining = 42 - cells.length // 6 rows * 7 cols
  for (let d = 1; d <= remaining; d++) {
    const nextYear = m === 12 ? y + 1 : y
    const nextMonth = m === 12 ? 1 : m + 1
    const dStr = formatDateStr(nextYear, nextMonth, d)
    cells.push({
      dateStr: dStr,
      day: d,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDate.value,
      year: nextYear,
      month: nextMonth
    })
  }

  return cells
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
  emit('panelChange', currentYear.value, currentMonth.value)
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
  emit('panelChange', currentYear.value, currentMonth.value)
}

function goToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth() + 1
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate())
  handleCellClick({
    dateStr: todayStr,
    day: today.getDate(),
    isCurrentMonth: true,
    isToday: true,
    isSelected: true,
    year: currentYear.value,
    month: currentMonth.value
  })
  emit('panelChange', currentYear.value, currentMonth.value)
}

function handleCellClick(cell: CalendarCell) {
  selectedDate.value = cell.dateStr
  if (!cell.isCurrentMonth) {
    currentYear.value = cell.year
    currentMonth.value = cell.month
    emit('panelChange', currentYear.value, currentMonth.value)
  }
  emit('update:modelValue', cell.dateStr)
  emit('select', cell.dateStr)
}
</script>

<template>
  <div class="ui-calendar">
    <!-- Header -->
    <div class="ui-calendar__header">
      <div class="ui-calendar__title">
        <span class="ui-calendar__year-month">
          {{ currentYear }} 年 {{ currentMonth }} 月
        </span>
      </div>
      <div class="ui-calendar__actions">
        <button type="button" class="ui-calendar__btn" aria-label="上个月" @click="prevMonth">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button type="button" class="ui-calendar__btn ui-calendar__btn--today" @click="goToday">
          今天
        </button>
        <button type="button" class="ui-calendar__btn" aria-label="下个月" @click="nextMonth">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Week days header -->
    <div class="ui-calendar__weekdays">
      <div v-for="w in weekDays" :key="w" class="ui-calendar__weekday">
        周{{ w }}
      </div>
    </div>

    <!-- Days Grid -->
    <div class="ui-calendar__grid">
      <div
        v-for="cell in calendarCells"
        :key="cell.dateStr"
        :class="[
          'ui-calendar__cell',
          {
            'is-other-month': !cell.isCurrentMonth,
            'is-today': cell.isToday,
            'is-selected': cell.isSelected
          }
        ]"
        @click="handleCellClick(cell)"
      >
        <div class="ui-calendar__cell-head">
          <span class="ui-calendar__day-num">{{ cell.day }}</span>
          <span v-if="cell.isToday" class="ui-calendar__today-badge">今</span>
        </div>
        <div class="ui-calendar__cell-content">
          <slot name="date-cell" :cell="cell" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-calendar {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: color-mix(in srgb, var(--surface-container-low) 60%, transparent);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
  border-radius: var(--r-xl);
  padding: 16px;
  user-select: none;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  &__year-month {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--on-surface);
    letter-spacing: -0.01em;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 8px;
    border: 1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent);
    background: color-mix(in srgb, var(--surface-container-high) 50%, transparent);
    border-radius: var(--r-md);
    color: var(--on-surface);
    cursor: pointer;
    font-size: var(--font-size-xs);
    font-weight: 600;
    transition: all 0.2s var(--ease-soft);

    &:hover {
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      border-color: color-mix(in srgb, var(--primary) 40%, transparent);
      color: var(--primary);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }

    &--today {
      padding: 0 12px;
    }
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    padding: 8px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 30%, transparent);
    margin-bottom: 6px;
  }

  &__weekday {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--outline);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  &__cell {
    min-height: 72px;
    padding: 6px;
    border-radius: var(--r-md);
    border: 1px solid transparent;
    background: color-mix(in srgb, var(--surface-container-high) 25%, transparent);
    transition: all 0.15s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;

    &:hover {
      background: color-mix(in srgb, var(--surface-container-highest) 50%, transparent);
      border-color: color-mix(in srgb, var(--outline-variant) 45%, transparent);
    }

    &.is-other-month {
      opacity: 0.38;
    }

    &.is-today {
      border-color: color-mix(in srgb, var(--primary) 50%, transparent);
      background: color-mix(in srgb, var(--primary) 8%, transparent);
    }

    &.is-selected {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent);
      background: color-mix(in srgb, var(--primary) 12%, transparent);
    }
  }

  &__cell-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__day-num {
    font-size: var(--font-size-sm);
    font-weight: 700;
    color: var(--on-surface);
  }

  &__today-badge {
    font-size: 10px;
    font-weight: 800;
    color: var(--on-primary);
    background: var(--primary);
    padding: 1px 4px;
    border-radius: 4px;
    line-height: 1.2;
  }

  &__cell-content {
    flex: 1;
    font-size: 11px;
    overflow: hidden;
  }
}
</style>
