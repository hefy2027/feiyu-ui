<script setup lang="ts">
import { onMounted, onUnmounted, inject, provide, useSlots, watch, reactive } from 'vue'
import type { TableColumn } from './DataTable.vue'

export interface TableColumnProps {
  prop?: string
  key?: string
  label?: string
  title?: string
  type?: 'selection' | 'expand' | 'index'
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  sortable?: boolean | ((a: any, b: any) => number)
  ellipsis?: boolean
  fixed?: 'left' | 'right'
}

const props = defineProps<TableColumnProps>()
defineSlots<{
  default?: (props: { row?: any; index?: number }) => any
}>()
const slots = useSlots()

const parentColumnContext = inject<{
  registerChild: (col: TableColumn) => void
  unregisterChild: (col: TableColumn) => void
} | null>('fy-table-column', null)

const tableContext = inject<{
  registerColumn: (col: TableColumn) => void
  unregisterColumn: (col: TableColumn) => void
} | null>('fy-data-table', null)

const children = reactive<TableColumn[]>([])

const columnDef = reactive<TableColumn>({
  key: props.prop || props.key,
  title: props.label || props.title,
  type: props.type,
  width: props.width,
  minWidth: props.minWidth,
  align: props.align,
  headerAlign: props.headerAlign,
  sorter: typeof props.sortable === 'function' ? props.sortable : (props.sortable ? true : undefined),
  ellipsis: props.ellipsis,
  fixed: props.fixed,
  children,
  render: slots.default ? (row: any, index: number) => slots.default!({ row, index }) : undefined
})

function registerChild(col: TableColumn) {
  children.push(col)
}

function unregisterChild(col: TableColumn) {
  const idx = children.indexOf(col)
  if (idx > -1) children.splice(idx, 1)
}

provide('fy-table-column', {
  registerChild,
  unregisterChild
})

watch(
  () => [props.prop, props.key, props.label, props.title, props.type, props.width, props.minWidth, props.align, props.headerAlign, props.sortable, props.ellipsis, props.fixed],
  () => {
    columnDef.key = props.prop || props.key
    columnDef.title = props.label || props.title
    columnDef.type = props.type
    columnDef.width = props.width
    columnDef.minWidth = props.minWidth
    columnDef.align = props.align
    columnDef.headerAlign = props.headerAlign
    columnDef.sorter = typeof props.sortable === 'function' ? props.sortable : (props.sortable ? true : undefined)
    columnDef.ellipsis = props.ellipsis
    columnDef.fixed = props.fixed
  }
)

onMounted(() => {
  if (parentColumnContext) {
    parentColumnContext.registerChild(columnDef)
  } else {
    tableContext?.registerColumn(columnDef)
  }
})

onUnmounted(() => {
  if (parentColumnContext) {
    parentColumnContext.unregisterChild(columnDef)
  } else {
    tableContext?.unregisterColumn(columnDef)
  }
})
</script>

<template><slot :row="{}" :index="0" /></template>
