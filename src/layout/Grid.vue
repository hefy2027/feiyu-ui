<script setup lang="ts">
import { computed, provide, ref, onMounted, onUnmounted, type Ref, type CSSProperties } from 'vue'

export interface GridContext {
  cols: Ref<number>
  xGap: Ref<number>
  yGap: Ref<number>
  overflow: Ref<boolean>
}

interface Props {
  cols?: number | string
  xGap?: number | string
  yGap?: number | string
  collapsed?: boolean
  collapsedRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  cols: 24,
  xGap: 0,
  yGap: 0,
  collapsed: false,
  collapsedRows: 1
})

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

// Parse responsive string like "2 600:3 900:4 1200:6" or single number
const parsedCols = computed<number>(() => {
  if (typeof props.cols === 'number') return props.cols
  const raw = String(props.cols).trim()
  if (!raw.includes(':') && !raw.includes(' ')) {
    const parsed = parseInt(raw, 10)
    return isNaN(parsed) ? 24 : parsed
  }

  // Responsive breakpoints parser
  const segments = raw.split(/\s+/)
  let defaultCol = 24
  const breakpoints: { minWidth: number; cols: number }[] = []

  for (const seg of segments) {
    if (seg.includes(':')) {
      const [w, c] = seg.split(':')
      const minWidth = parseInt(w, 10)
      const colsCount = parseInt(c, 10)
      if (!isNaN(minWidth) && !isNaN(colsCount)) {
        breakpoints.push({ minWidth, cols: colsCount })
      }
    } else {
      const c = parseInt(seg, 10)
      if (!isNaN(c)) defaultCol = c
    }
  }

  // Sort descending by minWidth
  breakpoints.sort((a, b) => b.minWidth - a.minWidth)
  for (const bp of breakpoints) {
    if (windowWidth.value >= bp.minWidth) {
      return bp.cols
    }
  }
  return defaultCol
})

const parsedXGap = computed<number>(() => {
  if (typeof props.xGap === 'number') return props.xGap
  const p = parseInt(String(props.xGap), 10)
  return isNaN(p) ? 0 : p
})

const parsedYGap = computed<number>(() => {
  if (typeof props.yGap === 'number') return props.yGap
  const p = parseInt(String(props.yGap), 10)
  return isNaN(p) ? parsedXGap.value : p
})

const isOverflow = ref(false)

provide<GridContext>('ui-grid', {
  cols: parsedCols,
  xGap: parsedXGap,
  yGap: parsedYGap,
  overflow: isOverflow
})

const gridStyle = computed<CSSProperties>(() => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${parsedCols.value}, minmax(0, 1fr))`,
    columnGap: `${parsedXGap.value}px`,
    rowGap: `${parsedYGap.value}px`
  }
})
</script>

<template>
  <div class="ui-grid" :style="gridStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-grid {
  box-sizing: border-box;
  width: 100%;
}
</style>
