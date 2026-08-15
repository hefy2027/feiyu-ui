<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

export type FlexJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

interface Props {
  vertical?: boolean
  justify?: FlexJustify
  align?: FlexAlign
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: number | string | [number | string, number | string]
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
  justify: 'start',
  align: 'start',
  wrap: false,
  gap: 0,
  inline: false
})

const flexStyle = computed<CSSProperties>(() => {
  const styleObj: CSSProperties = {
    display: props.inline ? 'inline-flex' : 'flex',
    flexDirection: props.vertical ? 'column' : 'row'
  }

  const justifyMap: Record<FlexJustify, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    'space-around': 'space-around',
    'space-between': 'space-between',
    'space-evenly': 'space-evenly'
  }
  styleObj.justifyContent = justifyMap[props.justify] || props.justify

  const alignMap: Record<FlexAlign, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    baseline: 'baseline',
    stretch: 'stretch'
  }
  styleObj.alignItems = alignMap[props.align] || props.align

  if (typeof props.wrap === 'boolean') {
    styleObj.flexWrap = props.wrap ? 'wrap' : 'nowrap'
  } else if (props.wrap) {
    styleObj.flexWrap = props.wrap
  }

  if (Array.isArray(props.gap)) {
    const rowGap = typeof props.gap[0] === 'number' ? `${props.gap[0]}px` : props.gap[0]
    const colGap = typeof props.gap[1] === 'number' ? `${props.gap[1]}px` : props.gap[1]
    styleObj.gap = `${rowGap} ${colGap}`
  } else if (props.gap) {
    styleObj.gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
  }

  return styleObj
})
</script>

<template>
  <div class="fy-flex" :style="flexStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-flex {
  width: 100%;
  box-sizing: border-box;
}
</style>
