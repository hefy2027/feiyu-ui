<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, type CSSProperties } from 'vue'
import type { GridContext } from './Grid.vue'

interface Props {
  span?: number | string
  offset?: number | string
  suffix?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  span: 1,
  offset: 0,
  suffix: false
})

const gridContext = inject<GridContext | null>('fy-grid', null)

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const parsedSpan = computed<number>(() => {
  if (typeof props.span === 'number') return props.span
  const raw = String(props.span).trim()
  if (!raw.includes(':') && !raw.includes(' ')) {
    const parsed = parseInt(raw, 10)
    return isNaN(parsed) ? 1 : parsed
  }

  const segments = raw.split(/\s+/)
  let defaultSpan = 1
  const breakpoints: { minWidth: number; span: number }[] = []

  for (const seg of segments) {
    if (seg.includes(':')) {
      const [w, s] = seg.split(':')
      const minWidth = parseInt(w, 10)
      const spanCount = parseInt(s, 10)
      if (!isNaN(minWidth) && !isNaN(spanCount)) {
        breakpoints.push({ minWidth, span: spanCount })
      }
    } else {
      const s = parseInt(seg, 10)
      if (!isNaN(s)) defaultSpan = s
    }
  }

  breakpoints.sort((a, b) => b.minWidth - a.minWidth)
  for (const bp of breakpoints) {
    if (windowWidth.value >= bp.minWidth) {
      return bp.span
    }
  }
  return defaultSpan
})

const parsedOffset = computed<number>(() => {
  if (typeof props.offset === 'number') return props.offset
  const p = parseInt(String(props.offset), 10)
  return isNaN(p) ? 0 : p
})

const itemStyle = computed<CSSProperties>(() => {
  const span = parsedSpan.value
  const offset = parsedOffset.value
  const styles: CSSProperties = {}

  if (props.suffix) {
    styles.gridColumn = '-1 / span 1'
    return styles
  }

  if (span > 0) {
    styles.gridColumn = `span ${span} / span ${span}`
  }

  if (offset > 0) {
    styles.gridColumnStart = `calc(var(--grid-col-start, auto) + ${offset})`
    styles.marginLeft = `calc(${offset} * (100% + ${gridContext?.xGap.value ?? 0}px))`
  }

  return styles
})
</script>

<template>
  <div
    :class="[
      'fy-grid-item',
      { 'fy-grid-item--suffix': suffix }
    ]"
    :style="itemStyle"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-grid-item {
  box-sizing: border-box;
  min-width: 0;
}
</style>
