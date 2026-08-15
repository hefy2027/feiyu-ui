<script setup lang="ts">
import { ref, computed } from 'vue'
import Tooltip from '../feedback/Tooltip.vue'

interface Props {
  text?: string
  lineClamp?: number | string
  tooltip?: boolean
  expandable?: boolean
  expandText?: string
  collapseText?: string
  tooltipPlacement?: any
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  lineClamp: 1,
  tooltip: true,
  expandable: false,
  expandText: '展开',
  collapseText: '收起',
  tooltipPlacement: 'top'
})

const emit = defineEmits<{
  expandChange: [expanded: boolean]
}>()

const isExpanded = ref(false)

const clampNum = computed(() => {
  const n = Number(props.lineClamp)
  return isNaN(n) || n < 1 ? 1 : n
})

const clampStyle = computed(() => {
  if (isExpanded.value) return {}
  if (clampNum.value === 1) {
    return {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'block'
    }
  }
  return {
    display: '-webkit-box',
    webkitLineClamp: clampNum.value,
    webkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="fy-ellipsis-container">
    <component
      :is="tooltip && !expandable && text ? Tooltip : 'div'"
      :content="text"
      class="fy-ellipsis-wrap"
    >
      <div class="fy-ellipsis" :style="clampStyle">
        <slot>{{ text }}</slot>
      </div>
    </component>

    <button
      v-if="expandable"
      type="button"
      class="fy-ellipsis__expand-btn"
      @click="toggleExpand"
    >
      {{ isExpanded ? collapseText : expandText }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.fy-ellipsis-container {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  max-width: 100%;
  width: 100%;
}

.fy-ellipsis-wrap {
  min-width: 0;
  flex: 1;
  display: block;
}

.fy-ellipsis {
  word-break: break-all;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.fy-ellipsis__expand-btn {
  border: none;
  background: transparent;
  color: var(--fy-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 0;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}
</style>
