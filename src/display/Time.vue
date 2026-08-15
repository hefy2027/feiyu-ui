<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  time?: number | string | Date
  type?: 'relative' | 'date' | 'datetime'
  to?: number | string | Date
  format?: string
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  time: () => Date.now(),
  type: 'relative',
  to: undefined,
  format: 'YYYY-MM-DD HH:mm:ss',
  interval: 30000
})

const nowTime = ref(Date.now())
let timerId: number | null = null

function parseTimestamp(val: number | string | Date | undefined): number {
  if (val === undefined || val === null) return Date.now()
  if (typeof val === 'number') return val
  if (val instanceof Date) return val.getTime()
  return new Date(val).getTime()
}

function getRelativeTimeString(targetTs: number, baseTs: number): string {
  const diff = baseTs - targetTs
  const absDiff = Math.abs(diff)
  const isFuture = diff < 0

  const sec = Math.floor(absDiff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  const month = Math.floor(day / 30)
  const year = Math.floor(month / 12)

  if (sec < 45) {
    return '刚刚'
  } else if (sec < 90) {
    return isFuture ? '1 分钟后' : '1 分钟前'
  } else if (min < 45) {
    return isFuture ? `${min} 分钟后` : `${min} 分钟前`
  } else if (min < 90) {
    return isFuture ? '1 小时后' : '1 小时前'
  } else if (hour < 24) {
    return isFuture ? `${hour} 小时后` : `${hour} 小时前`
  } else if (hour < 42) {
    return isFuture ? '明天' : '昨天'
  } else if (day < 30) {
    return isFuture ? `${day} 天后` : `${day} 天前`
  } else if (month < 12) {
    return isFuture ? `${month} 个月后` : `${month} 个月前`
  }
  return isFuture ? `${year} 年后` : `${year} 年前`
}

function formatDateString(d: Date, fmt: string): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const min = pad(d.getMinutes())
  const s = pad(d.getSeconds())

  return fmt
    .replace(/YYYY/g, String(y))
    .replace(/MM/g, m)
    .replace(/DD/g, day)
    .replace(/HH/g, h)
    .replace(/mm/g, min)
    .replace(/ss/g, s)
}

const displayTime = computed(() => {
  const targetTs = parseTimestamp(props.time)
  if (props.type === 'relative') {
    const baseTs = props.to !== undefined ? parseTimestamp(props.to) : nowTime.value
    return getRelativeTimeString(targetTs, baseTs)
  }
  const d = new Date(targetTs)
  if (props.type === 'date') {
    return formatDateString(d, 'YYYY-MM-DD')
  }
  return formatDateString(d, props.format)
})

onMounted(() => {
  if (props.type === 'relative' && props.to === undefined) {
    timerId = window.setInterval(() => {
      nowTime.value = Date.now()
    }, props.interval)
  }
})

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
})
</script>

<template>
  <time :datetime="new Date(parseTimestamp(time)).toISOString()" class="ui-time">
    <slot :formatted="displayTime">{{ displayTime }}</slot>
  </time>
</template>

<style scoped lang="scss">
.ui-time {
  font-family: inherit;
  color: inherit;
}
</style>
