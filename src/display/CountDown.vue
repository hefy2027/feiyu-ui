<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  targetTime?: number | string | Date
  duration?: number
  time?: number
  format?: string
  autoStart?: boolean
  millisecond?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  targetTime: undefined,
  duration: undefined,
  time: undefined,
  format: 'HH:mm:ss',
  autoStart: true,
  millisecond: false
})

const emit = defineEmits<{
  finish: []
  change: [remainingMs: number]
}>()

const remainingMs = ref(0)
let timerId: number | null = null

function computeInitialRemaining(): number {
  const dur = props.duration !== undefined ? props.duration : props.time
  if (dur !== undefined) {
    return Math.max(0, dur)
  }
  if (props.targetTime !== undefined) {
    const target = new Date(props.targetTime).getTime()
    const now = Date.now()
    return Math.max(0, target - now)
  }
  return 0
}

function parseTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = ms % 1000

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  }
}

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds, milliseconds } = parseTime(remainingMs.value)
  let fmt = props.format

  if (fmt.includes('DD')) {
    fmt = fmt.replace(/DD/g, String(days).padStart(2, '0'))
  }
  if (fmt.includes('HH')) {
    fmt = fmt.replace(/HH/g, String(hours).padStart(2, '0'))
  }
  if (fmt.includes('mm')) {
    fmt = fmt.replace(/mm/g, String(minutes).padStart(2, '0'))
  }
  if (fmt.includes('ss')) {
    fmt = fmt.replace(/ss/g, String(seconds).padStart(2, '0'))
  }
  if (fmt.includes('SSS')) {
    fmt = fmt.replace(/SSS/g, String(milliseconds).padStart(3, '0'))
  }

  return fmt
})

function tick() {
  if (remainingMs.value <= 0) {
    stop()
    remainingMs.value = 0
    emit('finish')
    return
  }

  const step = props.millisecond ? 50 : 1000
  remainingMs.value = Math.max(0, remainingMs.value - step)
  emit('change', remainingMs.value)

  if (remainingMs.value === 0) {
    stop()
    emit('finish')
  }
}

function start() {
  stop()
  const interval = props.millisecond ? 50 : 1000
  timerId = window.setInterval(tick, interval)
}

function stop() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

function reset() {
  stop()
  remainingMs.value = computeInitialRemaining()
  if (props.autoStart) {
    start()
  }
}

watch(() => [props.targetTime, props.duration, props.time], () => {
  reset()
})

onMounted(() => {
  remainingMs.value = computeInitialRemaining()
  if (props.autoStart && remainingMs.value > 0) {
    start()
  }
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({
  start,
  stop,
  reset
})
</script>

<template>
  <span class="ui-countdown">
    <slot :formatted="formattedTime" :remaining="remainingMs">
      {{ formattedTime }}
    </slot>
  </span>
</template>

<style scoped lang="scss">
.ui-countdown {
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--on-surface);
  display: inline-flex;
  align-items: center;
}
</style>
