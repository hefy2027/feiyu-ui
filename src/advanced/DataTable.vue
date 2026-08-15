<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import Checkbox from '../form/Checkbox.vue'
import Spin from '../feedback/Spin.vue'
import Empty from '../display/Empty.vue'
import Pagination from '../navigation/Pagination.vue'

export type TableSortOrder = 'ascend' | 'descend' | false

export interface TableColumnProps<T = any> {
  key?: string
  prop?: string
  title?: string
  label?: string
  type?: 'selection' | 'expand' | 'index'
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  ellipsis?: boolean
  sorter?: boolean | ((a: any, b: any) => number)
  sortable?: boolean | ((a: any, b: any) => number)
  sortOrder?: TableSortOrder
  fixed?: 'left' | 'right'
  render?: (row: T, index: number) => any
  children?: TableColumnProps<T>[]
  className?: string
}

export type TableColumn<T = any> = TableColumnProps<T>

export type SpanMethodResult = [number, number] | { rowspan: number; colspan: number } | undefined

export type TableSpanMethod = (param: {
  row: any
  column: TableColumnProps
  rowIndex: number
  columnIndex: number
}) => SpanMethodResult

export type TableSummaryMethod = (param: {
  columns: TableColumnProps[]
  data: any[]
}) => (string | number)[]

export interface TablePaginationConfig {
  page: number
  pageSize: number | string
  total?: number
  pageSizes?: (number | string)[]
  showTotal?: boolean
  showSizePicker?: boolean
  showQuickJumper?: boolean
  simple?: boolean
  disabled?: boolean
}

export interface DataTableProps {
  columns?: TableColumnProps[]
  data?: Record<string, any>[]
  rowKey?: string | ((row: any) => string | number)
  loading?: boolean
  checkedRowKeys?: (string | number)[]
  expandedRowKeys?: (string | number)[]
  defaultExpandAll?: boolean
  expandRowByClick?: boolean
  striped?: boolean
  bordered?: boolean
  size?: 'sm' | 'md' | 'lg'
  height?: string | number
  minHeight?: string | number
  flexHeight?: boolean
  maxHeight?: string | number
  pagination?: TablePaginationConfig | false
  emptyText?: string
  showSummary?: boolean
  sumText?: string
  summaryMethod?: TableSummaryMethod
  spanMethod?: TableSpanMethod
}

const props = withDefaults(defineProps<DataTableProps>(), {
  columns: () => [],
  data: () => [],
  rowKey: 'id',
  loading: false,
  checkedRowKeys: () => [],
  striped: false,
  bordered: true,
  size: 'md',
  height: undefined,
  minHeight: undefined,
  flexHeight: false,
  maxHeight: undefined,
  pagination: false,
  emptyText: '暂无表格数据'
})

const emit = defineEmits<{
  'update:checkedRowKeys': [keys: (string | number)[]]
  'update:expandedRowKeys': [keys: (string | number)[]]
  expandChange: [row: any, expanded: boolean, expandedKeys: (string | number)[]]
  'update:page': [page: number]
  'update:currentPage': [page: number]
  'update:pageSize': [size: number | string]
  'update:page-size': [size: number | string]
  selectionChange: [selectedRows: any[], selectedKeys: (string | number)[]]
  sortChange: [key: string, order: TableSortOrder]
  rowClick: [row: any, index: number, event: MouseEvent]
  rowDblclick: [row: any, index: number, event: MouseEvent]
}>()

const activeSortKey = ref<string | null>(null)
const activeSortOrder = ref<TableSortOrder>(false)

const registeredColumns = ref<TableColumn[]>([])

function registerColumn(col: TableColumn) {
  registeredColumns.value.push(col)
}

function unregisterColumn(col: TableColumn) {
  const idx = registeredColumns.value.indexOf(col)
  if (idx > -1) registeredColumns.value.splice(idx, 1)
}

provide('fy-data-table', {
  registerColumn,
  unregisterColumn
})

function normalizeColumn(c: TableColumnProps): TableColumnProps {
  const norm: TableColumnProps = {
    ...c,
    key: c.key || c.prop,
    title: c.title || c.label,
    sorter: c.sorter ?? (typeof c.sortable === 'function' ? c.sortable : (c.sortable ? true : undefined))
  }
  if (c.children && c.children.length > 0) {
    norm.children = c.children.map(normalizeColumn)
  }
  return norm
}

const rootColumns = computed<TableColumnProps[]>(() => {
  if (props.columns && props.columns.length > 0) {
    return props.columns.map(normalizeColumn)
  }
  return registeredColumns.value.map(normalizeColumn)
})

function getMaxDepth(cols: TableColumnProps[]): number {
  let max = 1
  for (const col of cols) {
    if (col.children && col.children.length > 0) {
      max = Math.max(max, 1 + getMaxDepth(col.children))
    }
  }
  return max
}

function getLeafColumns(cols: TableColumnProps[]): TableColumnProps[] {
  const leaves: TableColumnProps[] = []
  for (const col of cols) {
    if (col.children && col.children.length > 0) {
      leaves.push(...getLeafColumns(col.children))
    } else {
      leaves.push(col)
    }
  }
  return leaves
}

function countLeaves(col: TableColumnProps): number {
  if (!col.children || col.children.length === 0) return 1
  return col.children.reduce((sum, child) => sum + countLeaves(child), 0)
}

interface HeaderCellInfo {
  column: TableColumnProps
  colSpan: number
  rowSpan: number
}

const headerRows = computed<HeaderCellInfo[][]>(() => {
  const cols = rootColumns.value
  if (cols.length === 0) return []
  const maxDepth = getMaxDepth(cols)
  const rows: HeaderCellInfo[][] = Array.from({ length: maxDepth }, () => [])

  function traverse(list: TableColumnProps[], depth: number) {
    for (const col of list) {
      const hasChildren = !!(col.children && col.children.length > 0)
      const colSpan = countLeaves(col)
      const rowSpan = hasChildren ? 1 : maxDepth - depth
      rows[depth].push({
        column: col,
        colSpan,
        rowSpan
      })
      if (hasChildren) {
        traverse(col.children!, depth + 1)
      }
    }
  }

  traverse(cols, 0)
  return rows
})

const effectiveColumns = computed<TableColumnProps[]>(() => {
  return getLeafColumns(rootColumns.value)
})

function getRowId(row: any, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row)
  return row?.[props.rowKey] ?? index
}

function handleSort(col: TableColumnProps) {
  const sortKey = col.key || col.prop
  if (!col.sorter || !sortKey) return
  if (activeSortKey.value !== sortKey) {
    activeSortKey.value = sortKey
    activeSortOrder.value = 'ascend'
  } else if (activeSortOrder.value === 'ascend') {
    activeSortOrder.value = 'descend'
  } else {
    activeSortKey.value = null
    activeSortOrder.value = false
  }
  emit('sortChange', sortKey, activeSortOrder.value)
}

const processedData = computed(() => {
  let list = [...(props.data || [])]
  if (activeSortKey.value && activeSortOrder.value) {
    const col = effectiveColumns.value.find((c) => (c.key || c.prop || c.type) === activeSortKey.value)
    if (col && typeof col.sorter === 'function') {
      const sorterFn = col.sorter
      list.sort((a, b) => (activeSortOrder.value === 'ascend' ? sorterFn(a, b) : sorterFn(b, a)))
    } else if (col && (col.key || col.prop)) {
      const key = (col.key || col.prop) as string
      list.sort((a, b) => {
        const av = a[key] ?? ''
        const bv = b[key] ?? ''
        if (av === bv) return 0
        const res = av > bv ? 1 : -1
        return activeSortOrder.value === 'ascend' ? res : -res
      })
    }
  }
  return list
})

const displayData = computed(() => {
  const list = processedData.value
  if (!props.pagination) return list

  const page = props.pagination.page ?? 1
  const size = props.pagination.pageSize ?? 10

  if (size === 'all') return list
  const numSize = Number(size)
  if (!numSize || numSize <= 0) return list

  const startIndex = Math.max(0, (page - 1) * numSize)
  return list.slice(startIndex, startIndex + numSize)
})

const safeData = computed(() => props.data || [])

const isAllChecked = computed(() => {
  if (safeData.value.length === 0) return false
  return safeData.value.every((row, idx) => props.checkedRowKeys.includes(getRowId(row, idx)))
})

const isIndeterminate = computed(() => {
  if (isAllChecked.value || safeData.value.length === 0 || props.checkedRowKeys.length === 0) return false
  return safeData.value.some((row, idx) => props.checkedRowKeys.includes(getRowId(row, idx)))
})

function handleToggleAll() {
  let nextKeys: (string | number)[] = []
  let nextRows: any[] = []
  if (isAllChecked.value) {
    nextKeys = []
    nextRows = []
  } else {
    nextKeys = safeData.value.map((row, idx) => getRowId(row, idx))
    nextRows = [...safeData.value]
  }
  emit('update:checkedRowKeys', nextKeys)
  emit('selectionChange', nextRows, nextKeys)
}

function toggleRowCheck(row: any, idx: number) {
  const key = getRowId(row, idx)
  const current = [...props.checkedRowKeys]
  const i = current.indexOf(key)
  if (i > -1) {
    current.splice(i, 1)
  } else {
    current.push(key)
  }
  const selectedRows = safeData.value.filter((r, rIdx) => current.includes(getRowId(r, rIdx)))
  emit('update:checkedRowKeys', current)
  emit('selectionChange', selectedRows, current)
}

/* Expanded rows logic */
const innerExpandedKeys = ref<(string | number)[]>([])

watch(
  () => props.expandedRowKeys,
  (val) => {
    if (val !== undefined) {
      innerExpandedKeys.value = [...val]
    }
  },
  { immediate: true }
)

watch(
  () => safeData.value,
  (data) => {
    if (props.defaultExpandAll && (!props.expandedRowKeys || props.expandedRowKeys.length === 0)) {
      innerExpandedKeys.value = data.map((r, i) => getRowId(r, i))
    }
  },
  { immediate: true }
)

function isRowExpanded(row: any, index: number): boolean {
  const key = getRowId(row, index)
  return innerExpandedKeys.value.includes(key)
}

function toggleRowExpand(row: any, index: number, event?: MouseEvent) {
  if (event) event.stopPropagation()
  const key = getRowId(row, index)
  const keys = [...innerExpandedKeys.value]
  const idx = keys.indexOf(key)
  let expanded = false
  if (idx > -1) {
    keys.splice(idx, 1)
    expanded = false
  } else {
    keys.push(key)
    expanded = true
  }
  innerExpandedKeys.value = keys
  emit('update:expandedRowKeys', keys)
  emit('expandChange', row, expanded, keys)
}

/* Span calculation */
function getCellSpan(row: any, column: TableColumnProps, rowIndex: number, columnIndex: number): { rowspan: number; colspan: number } {
  if (!props.spanMethod) return { rowspan: 1, colspan: 1 }
  const result = props.spanMethod({ row, column, rowIndex, columnIndex })
  if (Array.isArray(result)) {
    return { rowspan: result[0] ?? 1, colspan: result[1] ?? 1 }
  } else if (result && typeof result === 'object') {
    return { rowspan: result.rowspan ?? 1, colspan: result.colspan ?? 1 }
  }
  return { rowspan: 1, colspan: 1 }
}

/* Summary calculation */
const summaryData = computed<(string | number)[]>(() => {
  if (!props.showSummary) return []
  if (props.summaryMethod) {
    return props.summaryMethod({
      columns: effectiveColumns.value,
      data: props.data || []
    })
  }
  const sums: (string | number)[] = []
  const rawData = props.data || []
  effectiveColumns.value.forEach((col, index) => {
    if (index === 0) {
      sums[index] = props.sumText ?? '合计'
      return
    }
    if (col.type === 'selection' || col.type === 'expand') {
      sums[index] = ''
      return
    }
    const propKey = col.key || col.prop
    if (!propKey) {
      sums[index] = ''
      return
    }
    const values = rawData.map((row) => Number(row[propKey]))
    const isAllNumeric = values.length > 0 && values.every((v) => !Number.isNaN(v))
    if (isAllNumeric) {
      const sum = values.reduce((prev, curr) => prev + curr, 0)
      const hasDecimals = values.some((v) => v % 1 !== 0)
      sums[index] = hasDecimals ? Number(sum.toFixed(2)) : sum
    } else {
      sums[index] = ''
    }
  })
  return sums
})

function getRowIndexDisplay(rowIdx: number): number {
  if (props.pagination) {
    const page = props.pagination.page ?? 1
    const size = Number(props.pagination.pageSize) || 10
    return (page - 1) * size + rowIdx + 1
  }
  return rowIdx + 1
}

function formatDimension(val?: string | number): string | undefined {
  if (val === undefined || val === null || val === '') return undefined
  if (typeof val === 'number') return `${val}px`
  const str = String(val).trim()
  if (/^\d+$/.test(str)) return `${str}px`
  return str
}

const tableStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.flexHeight) {
    style.height = '100%'
    style.flex = '1'
    style.minHeight = '0'
  } else if (props.height !== undefined) {
    const h = formatDimension(props.height)
    if (h) style.height = h
  }
  if (props.maxHeight !== undefined) {
    const maxh = formatDimension(props.maxHeight)
    if (maxh) style.maxHeight = maxh
  }
  if (props.minHeight !== undefined) {
    const mh = formatDimension(props.minHeight)
    if (mh) style.minHeight = mh
  }
  return style
})

function handleRowClick(row: any, index: number, event: MouseEvent) {
  if (props.expandRowByClick) {
    toggleRowExpand(row, index, event)
  }
  emit('rowClick', row, index, event)
}

function handleRowDblclick(row: any, index: number, event: MouseEvent) {
  emit('rowDblclick', row, index, event)
}
</script>

<template>
  <div
    :class="[
      'fy-data-table',
      `fy-data-table--${size}`,
      {
        'fy-data-table--bordered': bordered,
        'fy-data-table--striped': striped,
        'fy-data-table--adaptive': flexHeight || height !== undefined || maxHeight !== undefined
      }
    ]"
    :style="tableStyle"
  >
    <!-- Hidden slot container for declarative TableColumn components -->
    <div style="display: none;">
      <slot />
    </div>

    <Spin :show="loading" description="加载中..." class="fy-data-table__spin">
      <div class="fy-data-table__scroll">
        <table class="fy-data-table__table">
          <thead class="fy-data-table__thead">
            <tr v-for="(rowCells, rIdx) in headerRows" :key="rIdx">
              <th
                v-for="(cell, cIdx) in rowCells"
                :key="cell.column.key || cell.column.prop || cell.column.type || cIdx"
                :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
                :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
                :class="[
                  'fy-data-table__th',
                  `is-align-${cell.column.headerAlign || cell.column.align || 'left'}`,
                  {
                    'is-sortable': !!cell.column.sorter,
                    'is-selection': cell.column.type === 'selection',
                    'is-expand': cell.column.type === 'expand'
                  }
                ]"
                :style="{
                  width: typeof cell.column.width === 'number' ? `${cell.column.width}px` : cell.column.width,
                  minWidth: typeof cell.column.minWidth === 'number' ? `${cell.column.minWidth}px` : cell.column.minWidth
                }"
                @click="handleSort(cell.column)"
              >
                <template v-if="cell.column.type === 'selection'">
                  <Checkbox
                    :model-value="isAllChecked"
                    :indeterminate="isIndeterminate"
                    @change="handleToggleAll"
                  />
                </template>

                <template v-else-if="cell.column.type === 'expand'">
                  <span class="material-symbols-outlined" style="font-size: 16px; opacity: 0.7;">unfold_more</span>
                </template>

                <template v-else>
                  <div class="fy-data-table__th-content">
                    <span>{{ cell.column.title || cell.column.label }}</span>
                    <span v-if="cell.column.sorter" class="material-symbols-outlined fy-data-table__sorter-icon">
                      {{
                        activeSortKey === (cell.column.key || cell.column.prop)
                          ? (activeSortOrder === 'ascend' ? 'arrow_upward' : 'arrow_downward')
                          : 'unfold_more'
                      }}
                    </span>
                  </div>
                </template>
              </th>
            </tr>
          </thead>

          <tbody class="fy-data-table__tbody">
            <template v-if="displayData.length > 0">
              <template
                v-for="(row, rowIdx) in displayData"
                :key="getRowId(row, rowIdx)"
              >
                <tr
                  :class="[
                    'fy-data-table__tr',
                    {
                      'is-checked': checkedRowKeys.includes(getRowId(row, rowIdx)),
                      'is-expanded': isRowExpanded(row, rowIdx)
                    }
                  ]"
                  @click="handleRowClick(row, rowIdx, $event)"
                  @dblclick="handleRowDblclick(row, rowIdx, $event)"
                >
                  <template
                    v-for="(col, colIdx) in effectiveColumns"
                    :key="col.key || col.prop || col.type || colIdx"
                  >
                    <td
                      v-if="getCellSpan(row, col, rowIdx, colIdx).rowspan > 0 && getCellSpan(row, col, rowIdx, colIdx).colspan > 0"
                      :rowspan="getCellSpan(row, col, rowIdx, colIdx).rowspan > 1 ? getCellSpan(row, col, rowIdx, colIdx).rowspan : undefined"
                      :colspan="getCellSpan(row, col, rowIdx, colIdx).colspan > 1 ? getCellSpan(row, col, rowIdx, colIdx).colspan : undefined"
                      :class="[
                        'fy-data-table__td',
                        `is-align-${col.align || 'left'}`,
                        { 'is-ellipsis': col.ellipsis }
                      ]"
                    >
                      <template v-if="col.type === 'selection'">
                        <Checkbox
                          :model-value="checkedRowKeys.includes(getRowId(row, rowIdx))"
                          @click.stop
                          @change="toggleRowCheck(row, rowIdx)"
                        />
                      </template>

                      <template v-else-if="col.type === 'expand'">
                        <button
                          type="button"
                          :class="['fy-data-table__expand-btn', { 'is-expanded': isRowExpanded(row, rowIdx) }]"
                          aria-label="展开行"
                          @click="toggleRowExpand(row, rowIdx, $event)"
                        >
                          <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                      </template>

                      <template v-else-if="col.type === 'index'">
                        {{ getRowIndexDisplay(rowIdx) }}
                      </template>

                      <template v-else-if="(col.key || col.prop) && $slots[(col.key || col.prop)!]">
                        <slot :name="(col.key || col.prop)!" :row="row" :index="rowIdx" :column="col" />
                      </template>

                      <template v-else-if="col.render">
                        <component :is="() => col.render!(row, rowIdx)" />
                      </template>

                      <template v-else-if="col.key || col.prop">
                        {{ row[(col.key || col.prop)!] }}
                      </template>
                    </td>
                  </template>
                </tr>

                <!-- Expanded Child Row -->
                <tr
                  v-if="isRowExpanded(row, rowIdx)"
                  class="fy-data-table__expanded-tr"
                >
                  <td :colspan="effectiveColumns.length || 1" class="fy-data-table__expanded-cell">
                    <slot name="expand" :row="row" :index="rowIdx">
                      <slot name="expanded-row" :row="row" :index="rowIdx">
                        <pre style="margin: 0; font-size: 12px; color: var(--fy-on-surface-variant);">{{ JSON.stringify(row, null, 2) }}</pre>
                      </slot>
                    </slot>
                  </td>
                </tr>
              </template>
            </template>

            <tr v-else>
              <td :colspan="effectiveColumns.length || 1" class="fy-data-table__empty-cell">
                <slot name="empty">
                  <Empty size="md" :description="emptyText" />
                </slot>
              </td>
            </tr>
          </tbody>

          <!-- Summary / Footer Row -->
          <tfoot v-if="showSummary || $slots.summary" class="fy-data-table__tfoot">
            <slot name="summary" :columns="effectiveColumns" :data="data" :sums="summaryData">
              <tr class="fy-data-table__summary-tr">
                <td
                  v-for="(col, colIdx) in effectiveColumns"
                  :key="col.key || col.prop || col.type || colIdx"
                  :class="[
                    'fy-data-table__td',
                    'fy-data-table__summary-td',
                    `is-align-${col.align || 'left'}`
                  ]"
                >
                  <slot
                    :name="`summary-${col.key || col.prop || colIdx}`"
                    :value="summaryData[colIdx]"
                    :column="col"
                    :index="colIdx"
                  >
                    {{ summaryData[colIdx] }}
                  </slot>
                </td>
              </tr>
            </slot>
          </tfoot>
        </table>
      </div>
    </Spin>

    <!-- Pagination footer -->
    <div v-if="pagination || $slots.pagination || $slots.footer" class="fy-data-table__footer">
      <slot name="pagination">
        <slot name="footer">
          <Pagination
            v-if="pagination"
            :page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total ?? (data?.length || 0)"
            :page-sizes="pagination.pageSizes"
            :show-total="pagination.showTotal"
            :show-size-picker="pagination.showSizePicker"
            :show-quick-jumper="pagination.showQuickJumper"
            :simple="pagination.simple"
            :disabled="pagination.disabled || loading"
            @update:page="emit('update:page', $event); emit('update:currentPage', $event)"
            @update:pageSize="(s: number | string) => { emit('update:pageSize', s); emit('update:page-size', s); }"
          />
        </slot>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-data-table {
  position: relative;
  width: 100%;
  border-radius: var(--fy-r-xl);
  background: color-mix(in srgb, var(--fy-surface-container-lowest) 82%, transparent);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  box-shadow: var(--fy-shadow-card), inset 0 1px 0 var(--fy-glass-hi);
  overflow: hidden;
  box-sizing: border-box;

  &--adaptive {
    display: flex;
    flex-direction: column;

    :deep(.fy-spin-container) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .fy-data-table__scroll {
      flex: 1;
      min-height: 0;
      height: 100%;
      overflow-y: auto;
      overflow-x: auto;
    }

    .fy-data-table__footer {
      flex-shrink: 0;
    }
  }

  &--bordered {
    border: 1px solid var(--fy-glass-border);
  }

  &--bordered &__th {
    border-right: 1px solid color-mix(in srgb, var(--fy-outline-variant) 20%, transparent);
    &:last-child {
      border-right: none;
    }
  }

  &--bordered &__td {
    border-right: 1px solid color-mix(in srgb, var(--fy-outline-variant) 15%, transparent);
    &:last-child {
      border-right: none;
    }
  }

  &__scroll {
    width: 100%;
    overflow: auto;
  }

  &__thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__expand-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--fy-outline);
    cursor: pointer;
    border-radius: var(--fy-r-xs);
    transition: transform 0.2s var(--fy-ease-soft), color 0.15s ease, background 0.15s ease;

    &:hover {
      color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
    }

    &.is-expanded {
      transform: rotate(90deg);
      color: var(--fy-primary);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  &__expanded-tr {
    background: color-mix(in srgb, var(--fy-surface-container-high) 25%, transparent);
  }

  &__expanded-cell {
    padding: 16px 20px;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
  }

  /* Summary Footer */
  &__tfoot {
    position: sticky;
    bottom: 0;
    z-index: 9;
    border-top: 2px solid color-mix(in srgb, var(--fy-outline-variant) 35%, transparent);
  }

  &__summary-td {
    font-weight: 700;
    color: var(--fy-on-surface);
    background: color-mix(in srgb, var(--fy-surface-container-high) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: var(--fy-font-size-sm);
  }

  &__th {
    padding: 14px 16px;
    font-weight: 800;
    font-size: var(--fy-font-size-xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--fy-outline);
    background: color-mix(in srgb, var(--fy-surface-container-high) 88%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    user-select: none;
    white-space: nowrap;

    &.is-sortable {
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease;

      &:hover {
        color: var(--fy-on-surface);
        background: color-mix(in srgb, var(--fy-surface-container-high) 65%, transparent);
      }
    }
  }

  &__th-content {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__sorter-icon {
    font-size: 16px;
    color: var(--fy-outline);
  }

  &__td {
    padding: 14px 16px;
    color: var(--fy-on-surface);
    font-weight: 500;
    border-bottom: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    transition: background 0.15s ease;

    &.is-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__tr {
    transition: background 0.15s var(--fy-ease-soft);

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
    }

    &.is-checked {
      background: color-mix(in srgb, var(--fy-primary) 8%, transparent);
    }
  }

  &--striped &__tr:nth-child(even) {
    background: color-mix(in srgb, var(--fy-surface-container-low) 40%, transparent);
  }

  &__empty-cell {
    padding: 40px 16px;
    text-align: center;
  }

  &__footer {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid color-mix(in srgb, var(--fy-outline-variant) 25%, transparent);
    background: color-mix(in srgb, var(--fy-surface-container-low) 75%, transparent);
    flex-shrink: 0;
  }

  /* Alignments */
  .is-align-left { text-align: left; }
  .is-align-center { text-align: center; }
  .is-align-right { text-align: right; }
}
</style>
