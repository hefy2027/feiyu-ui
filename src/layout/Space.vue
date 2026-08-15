<script setup lang="ts">
import { computed, type CSSProperties, type StyleValue } from 'vue'

export type SpaceSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large' | number | [number, number]
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'
export type SpaceJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'

interface Props {
  align?: SpaceAlign
  justify?: SpaceJustify
  size?: SpaceSize
  vertical?: boolean
  wrap?: boolean
  inline?: boolean
  itemClass?: string
  itemStyle?: StyleValue
}

const props = withDefaults(defineProps<Props>(), {
  align: undefined,
  justify: 'start',
  size: 'md',
  vertical: false,
  wrap: true,
  inline: false,
  itemClass: undefined,
  itemStyle: undefined
})

const sizeMap: Record<string, number> = {
  sm: 8,
  small: 8,
  md: 12,
  medium: 12,
  lg: 20,
  large: 20
}

const gapStyle = computed<CSSProperties>(() => {
  let horizontalGap = 12
  let verticalGap = 12

  if (typeof props.size === 'number') {
    horizontalGap = props.size
    verticalGap = props.size
  } else if (Array.isArray(props.size)) {
    const [rowGapValue, colGapValue] = props.size
    verticalGap = rowGapValue
    horizontalGap = colGapValue !== undefined ? colGapValue : rowGapValue
  } else if (typeof props.size === 'string' && props.size in sizeMap) {
    const presetValue = sizeMap[props.size]
    horizontalGap = presetValue
    verticalGap = presetValue
  }

  const alignMap: Record<SpaceAlign, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    baseline: 'baseline',
    stretch: 'stretch'
  }

  const justifyMap: Record<SpaceJustify, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'space-around': 'space-around',
    'space-between': 'space-between',
    'space-evenly': 'space-evenly'
  }

  return {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.vertical ? 'column' : 'row',
    flexWrap: props.wrap && !props.vertical ? 'wrap' : 'nowrap',
    gap: `${verticalGap}px ${horizontalGap}px`,
    alignItems: props.align ? alignMap[props.align] : props.vertical ? 'stretch' : 'center',
    justifyContent: justifyMap[props.justify] || 'flex-start'
  }
})
</script>

<template>
  <div class="ui-space" :style="gapStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-space {
  box-sizing: border-box;
  width: 100%;

  &[style*="inline-flex"] {
    width: auto;
  }
}
</style>
