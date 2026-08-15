<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

export interface LogItem {
  time?: string
  level?: LogLevel
  message: string
}

interface Props {
  logs: Array<string | LogItem>
  height?: string | number
  autoScroll?: boolean
  showTimestamp?: boolean
  showLevel?: boolean
  filter?: string
  fontSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: '240px',
  autoScroll: true,
  showTimestamp: true,
  showLevel: true,
  filter: '',
  fontSize: 12
})

const logBoxRef = ref<HTMLElement | null>(null)

const normalizedLogs = computed<LogItem[]>(() => {
  return props.logs.map((item) => {
    if (typeof item === 'string') {
      return { message: item, level: 'info' as LogLevel }
    }
    return item
  })
})

const filteredLogs = computed<LogItem[]>(() => {
  if (!props.filter) return normalizedLogs.value
  const q = props.filter.toLowerCase()
  return normalizedLogs.value.filter((l) => l.message.toLowerCase().includes(q))
})

function scrollToBottom() {
  if (props.autoScroll && logBoxRef.value) {
    logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight
  }
}

watch(
  () => props.logs,
  () => {
    nextTick(scrollToBottom)
  },
  { deep: true }
)

onMounted(() => {
  scrollToBottom()
})

defineExpose({
  scrollToBottom
})
</script>

<template>
  <div
    ref="logBoxRef"
    class="ui-log"
    :style="{
      height: typeof height === 'number' ? `${height}px` : height,
      fontSize: `${fontSize}px`
    }"
  >
    <div v-for="(log, idx) in filteredLogs" :key="idx" :class="['ui-log__row', `ui-log__row--${log.level || 'info'}`]">
      <span v-if="showTimestamp && log.time" class="ui-log__time">[{{ log.time }}]</span>
      <span v-if="showLevel" class="ui-log__level">
        {{ (log.level || 'INFO').toUpperCase() }}
      </span>
      <span class="ui-log__msg">{{ log.message }}</span>
    </div>
    <div v-if="filteredLogs.length === 0" class="ui-log__empty">
      <slot name="empty">暂无日志输出</slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-log {
  width: 100%;
  overflow-y: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  border-radius: var(--r-lg);
  background: color-mix(in srgb, var(--surface-container-lowest) 82%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card), inset 0 1px 0 var(--glass-hi);
  color: var(--on-surface);
  padding: 12px 14px;
  line-height: 1.6;
  box-sizing: border-box;
  user-select: text;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--outline-variant) 50%, transparent);
    border-radius: 4px;
  }

  &__row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    word-break: break-all;
    padding: 1px 0;
  }

  &__time {
    color: var(--outline);
    flex-shrink: 0;
  }

  &__level {
    font-weight: 700;
    font-size: 0.9em;
    padding: 0 4px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  &__row--info &__level { color: #58a6ff; background: rgba(56, 139, 253, 0.15); }
  &__row--success &__level { color: #3fb950; background: rgba(46, 160, 67, 0.15); }
  &__row--warn &__level { color: #d29922; background: rgba(187, 128, 9, 0.15); }
  &__row--error &__level { color: #f85149; background: rgba(248, 81, 73, 0.15); }
  &__row--debug &__level { color: #bc8cff; background: rgba(188, 140, 255, 0.15); }

  &__msg {
    flex: 1;
  }

  &__empty {
    color: var(--outline);
    text-align: center;
    padding: 20px 0;
  }
}
</style>
