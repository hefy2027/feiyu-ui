<script setup lang="ts">
import { computed, inject, type CSSProperties } from 'vue'
import type { RowContext } from './Row.vue'

export type ColResponsiveSize = number | { span?: number; offset?: number; push?: number; pull?: number }

interface Props {
  span?: number
  offset?: number
  push?: number
  pull?: number
  xs?: ColResponsiveSize
  sm?: ColResponsiveSize
  md?: ColResponsiveSize
  lg?: ColResponsiveSize
  xl?: ColResponsiveSize
  xxl?: ColResponsiveSize
}

const props = withDefaults(defineProps<Props>(), {
  span: 24,
  offset: 0,
  push: 0,
  pull: 0,
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined
})

const rowContext = inject<RowContext | null>('fy-row', null)

const colStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {}
  const gutter = rowContext?.gutter.value ?? 0
  let horizontalGutter = 0
  let verticalGutter = 0

  if (typeof gutter === 'number') {
    horizontalGutter = gutter
  } else if (Array.isArray(gutter)) {
    horizontalGutter = gutter[0] || 0
    verticalGutter = gutter[1] || 0
  }

  if (horizontalGutter > 0) {
    styles.paddingLeft = `${horizontalGutter / 2}px`
    styles.paddingRight = `${horizontalGutter / 2}px`
  }
  if (verticalGutter > 0) {
    styles.paddingTop = `${verticalGutter / 2}px`
    styles.paddingBottom = `${verticalGutter / 2}px`
  }

  return styles
})

const colClasses = computed(() => {
  const classes: string[] = ['fy-col']

  if (props.span !== undefined) {
    classes.push(`fy-col-${props.span}`)
  }
  if (props.offset > 0) {
    classes.push(`fy-col-offset-${props.offset}`)
  }
  if (props.push > 0) {
    classes.push(`fy-col-push-${props.push}`)
  }
  if (props.pull > 0) {
    classes.push(`fy-col-pull-${props.pull}`)
  }

  // Responsive breakpoints
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const
  breakpoints.forEach((bp) => {
    const val = props[bp]
    if (typeof val === 'number') {
      classes.push(`fy-col-${bp}-${val}`)
    } else if (typeof val === 'object' && val !== null) {
      if (val.span !== undefined) classes.push(`fy-col-${bp}-${val.span}`)
      if (val.offset !== undefined) classes.push(`fy-col-${bp}-offset-${val.offset}`)
      if (val.push !== undefined) classes.push(`fy-col-${bp}-push-${val.push}`)
      if (val.pull !== undefined) classes.push(`fy-col-${bp}-pull-${val.pull}`)
    }
  })

  return classes
})
</script>

<template>
  <div :class="colClasses" :style="colStyle">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.fy-col {
  box-sizing: border-box;
  position: relative;
  min-height: 1px;
}

@for $i from 0 through 24 {
  .fy-col-#{$i} {
    @if $i == 0 {
      display: none;
    } @else {
      flex: 0 0 calc($i / 24 * 100%);
      max-width: calc($i / 24 * 100%);
    }
  }
  .fy-col-offset-#{$i} {
    margin-left: calc($i / 24 * 100%);
  }
  .fy-col-push-#{$i} {
    left: calc($i / 24 * 100%);
  }
  .fy-col-pull-#{$i} {
    right: calc($i / 24 * 100%);
  }
}

@media (max-width: 576px) {
  @for $i from 0 through 24 {
    .fy-col-xs-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-xs-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-xs-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-xs-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}

@media (min-width: 576px) {
  @for $i from 0 through 24 {
    .fy-col-sm-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-sm-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-sm-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-sm-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}

@media (min-width: 768px) {
  @for $i from 0 through 24 {
    .fy-col-md-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-md-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-md-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-md-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}

@media (min-width: 992px) {
  @for $i from 0 through 24 {
    .fy-col-lg-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-lg-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-lg-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-lg-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}

@media (min-width: 1200px) {
  @for $i from 0 through 24 {
    .fy-col-xl-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-xl-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-xl-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-xl-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}

@media (min-width: 1400px) {
  @for $i from 0 through 24 {
    .fy-col-xxl-#{$i} {
      @if $i == 0 {
        display: none;
      } @else {
        flex: 0 0 calc($i / 24 * 100%);
        max-width: calc($i / 24 * 100%);
      }
    }
    .fy-col-xxl-offset-#{$i} {
      margin-left: calc($i / 24 * 100%);
    }
    .fy-col-xxl-push-#{$i} {
      left: calc($i / 24 * 100%);
    }
    .fy-col-xxl-pull-#{$i} {
      right: calc($i / 24 * 100%);
    }
  }
}
</style>
