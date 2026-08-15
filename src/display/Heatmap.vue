<script setup lang="ts">
import { computed } from 'vue'
import Tooltip from '../feedback/Tooltip.vue'

export interface HeatmapItem {
  date?: string
  key?: string | number
  value: number
  label?: string
  extra?: any
}

interface Props {
  data: HeatmapItem[]
  colors?: string[]
  max?: number
  cellSize?: number
  cellRadius?: number
  gap?: number
  showLegend?: boolean
  showTooltip?: boolean
  legendText?: [string, string]
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => [
    'color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent)',
    'color-mix(in srgb, var(--fy-primary) 28%, transparent)',
    'color-mix(in srgb, var(--fy-primary) 55%, transparent)',
    'color-mix(in srgb, var(--fy-primary) 80%, transparent)',
    'var(--fy-primary)'
  ],
  max: undefined,
  cellSize: 14,
  cellRadius: 3,
  gap: 4,
  showLegend: true,
  showTooltip: true,
  legendText: () => ['少', '多'],
  rows: 7
})

const emit = defineEmits<{
  cellClick: [item: HeatmapItem, index: number]
}>()

const computedMax = computed(() => {
  if (props.max !== undefined && props.max > 0) return props.max
  const maxVal = Math.max(...props.data.map((d) => d.value), 0)
  return maxVal > 0 ? maxVal : 4
})

function getCellColor(value: number): string {
  if (value <= 0) return props.colors[0]
  const ratio = Math.min(1, value / computedMax.value)
  const colorLevels = props.colors.length - 1
  const level = Math.ceil(ratio * colorLevels)
  return props.colors[level] || props.colors[colorLevels]
}

function getCellTooltip(item: HeatmapItem): string {
  if (item.label) return `${item.label}: ${item.value}`
  if (item.date) return `${item.date}: ${item.value} 项任务贡献`
  return `数值: ${item.value}`
}
</script>

<template>
  <div class="fy-heatmap">
    <div
      class="fy-heatmap__grid"
      :style="{
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gridAutoColumns: `${cellSize}px`,
        gap: `${gap}px`
      }"
    >
      <template v-for="(item, idx) in data" :key="item.date || item.key || idx">
        <Tooltip
          v-if="showTooltip"
          :content="getCellTooltip(item)"
          placement="top"
        >
          <div
            class="fy-heatmap__cell"
            :style="{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              borderRadius: `${cellRadius}px`,
              backgroundColor: getCellColor(item.value)
            }"
            @click="emit('cellClick', item, idx)"
          >
            <slot name="cell" :item="item" :index="idx" />
          </div>
        </Tooltip>

        <div
          v-else
          class="fy-heatmap__cell"
          :style="{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            borderRadius: `${cellRadius}px`,
            backgroundColor: getCellColor(item.value)
          }"
          @click="emit('cellClick', item, idx)"
        >
          <slot name="cell" :item="item" :index="idx" />
        </div>
      </template>
    </div>

    <!-- Legend -->
    <div v-if="showLegend" class="fy-heatmap__legend">
      <span class="fy-heatmap__legend-text">{{ legendText[0] }}</span>
      <div class="fy-heatmap__legend-colors" :style="{ gap: `${gap}px` }">
        <div
          v-for="(c, cIdx) in colors"
          :key="cIdx"
          class="fy-heatmap__legend-item"
          :style="{
            width: `${cellSize - 2}px`,
            height: `${cellSize - 2}px`,
            borderRadius: `${cellRadius}px`,
            backgroundColor: c
          }"
        />
      </div>
      <span class="fy-heatmap__legend-text">{{ legendText[1] }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-heatmap {
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  user-select: none;
  padding: 12px;
  border-radius: var(--fy-r-lg);
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 70%, transparent);
  border: 1px solid var(--fy-glass-border);
  box-shadow: var(--fy-shadow-sm);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  &__grid {
    display: grid;
    grid-auto-flow: column;
    padding: 6px;
  }

  &__cell {
    cursor: pointer;
    transition: transform 0.15s var(--fy-ease-soft), box-shadow 0.15s ease, outline 0.15s ease;
    outline: 1px solid transparent;

    &:hover {
      transform: scale(1.15);
      z-index: 3;
      box-shadow: 0 0 0 2px var(--fy-primary);
    }
  }

  &__legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    font-size: var(--fy-font-size-xs);
    color: var(--fy-on-surface-variant);
  }

  &__legend-colors {
    display: flex;
    align-items: center;
  }

  &__legend-item {
    flex-shrink: 0;
  }

  &__legend-text {
    font-size: 11px;
    font-weight: 600;
  }
}
</style>
