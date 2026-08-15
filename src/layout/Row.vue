<script setup lang="ts">
import { computed, provide, type Ref, type CSSProperties } from 'vue'

export type RowJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'

export interface RowContext {
  gutter: Ref<number | [number, number]>
}

interface Props {
  gutter?: number | [number, number]
  justify?: RowJustify
  align?: RowAlign
  wrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gutter: 0,
  justify: 'start',
  align: 'top',
  wrap: true
})

const gutterRef = computed(() => props.gutter)

provide<RowContext>('ui-row', {
  gutter: gutterRef
})

const justifyMap: Record<RowJustify, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  'space-around': 'space-around',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly'
}

const alignMap: Record<RowAlign, string> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
  stretch: 'stretch'
}

const rowStyle = computed<CSSProperties>(() => {
  let horizontalGutter = 0
  let verticalGutter = 0

  if (typeof props.gutter === 'number') {
    horizontalGutter = props.gutter
  } else if (Array.isArray(props.gutter)) {
    horizontalGutter = props.gutter[0] || 0
    verticalGutter = props.gutter[1] || 0
  }

  const halfHorizontal = horizontalGutter / 2
  const halfVertical = verticalGutter / 2

  const styles: CSSProperties = {
    display: 'flex',
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
    justifyContent: justifyMap[props.justify] || 'flex-start',
    alignItems: alignMap[props.align] || 'flex-start'
  }

  if (horizontalGutter > 0) {
    styles.marginLeft = `-${halfHorizontal}px`
    styles.marginRight = `-${halfHorizontal}px`
  }

  if (verticalGutter > 0) {
    styles.marginTop = `-${halfVertical}px`
    styles.marginBottom = `-${halfVertical}px`
  }

  return styles
})
</script>

<template>
  <div class="ui-row" :style="rowStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-row {
  box-sizing: border-box;
  position: relative;
  width: auto;
}
</style>
