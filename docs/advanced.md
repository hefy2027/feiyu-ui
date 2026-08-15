# 07 / 高阶与大数据交互组件 (Advanced)

本模块包含：`VirtualList`（万级虚拟滚动列表）、`DataTable` & `TableColumn`（多维数据表格与列定义）、`Tree` & `TreeSelect`（树形控件与树选择）、`Transfer`（穿梭框）、`AutoComplete`（自动补全）、`DynamicTags`（动态标签）、`Watermark`（毛玻璃防伪水印）。

---

## 1. VirtualList 高性能虚拟列表

专为 10,000+ 条大数据设计的轻量虚拟滚动容器，仅动态挂载可视区域内的 DOM 节点，大幅降低渲染开销与浏览器内存。

### 代码用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VirtualList, type VirtualListInstance } from 'feiyu-ui'

const listRef = ref<VirtualListInstance | null>(null)

// 模拟 10,000 条大数据
const bigData = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  title: `协同任务工单 #${i + 1}`,
  user: `Developer_${(i % 10) + 1}`
}))

function jumpTo(index: number) {
  listRef.value?.scrollToIndex(index)
}
</script>

<template>
  <button @click="jumpTo(4999)">直达第 5000 条</button>

  <VirtualList
    ref="listRef"
    :items="bigData"
    :item-size="44"
    :height="300"
    :buffer="6"
    key-field="id"
  >
    <template #default="{ item, index }">
      <div class="row">
        <span>#{{ index + 1 }}</span>
        <span>{{ item.title }}</span>
        <span>{{ item.user }}</span>
      </div>
    </template>
  </VirtualList>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `items` | `any[]` | `[]` | 待渲染的完整数据项列表 |
| `itemSize` | `number` | `44` | 每条行项目的预设固定高度（单位 px） |
| `height` | `number \| string` | `320` | 虚拟列表容器视口高度 |
| `buffer` | `number` | `6` | 视口上下预渲染的缓冲节点数量，防止快速滑动时产生白屏 |
| `keyField` | `string` | `'id'` | 每一项的唯一 key 字段名 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `default` | `{ item: any, index: number }` | 自定义单行内容渲染 |
| `empty` | `()` | 数据为空时的占位内容 |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `scroll` | `(event: Event, scrollTop: number)` | 滚动触发 |
| `reachTop` | `()` | 滚动至顶部 |
| `reachBottom` | `()` | 滚动至底部 |

### Expose 暴露方法

| 方法名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `scrollToIndex(index)` | `(index: number)` | 精准瞬时滚动到指定索引项 |
| `scrollToTop()` | `()` | 一键滚动至顶部 |
| `scrollToBottom()` | `()` | 一键滚动至底部 |
| `getScrollTop()` | `()` | 获取当前滚动位置 |

---

## 2. DataTable 多维数据表格

支持单列/多列排序、Checkbox 行多选、**父容器自适应高度与最大化 (flexHeight / height)**、**表头吸顶 (Sticky Header)**、**多级合并表头**、**单元格合并 (spanMethod)**、**子行展开 (Expand)**、**底部合计汇总行 (Summary)**、自定义插槽单元格渲染与分页联动。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `columns` | `TableColumnProps[]` | `[]` | 列定义数组（包含 key/prop, title/label, width, minWidth, sorter/sortable, ellipsis, type, children 嵌套表头等） |
| `data` | `any[]` | `[]` | 数据源数组 |
| `rowKey` | `string \| ((row: any) => string \| number)` | `'id'` | 行唯一标识字段名或提取函数 |
| `checkedRowKeys` | `(string \| number)[]` | `[]` | 多选勾选中的行的 key 列表 |
| `expandedRowKeys` | `(string \| number)[]` | `[]` | 当前展开的行 key 列表 |
| `defaultExpandAll` | `boolean` | `false` | 是否默认展开全部子行 |
| `expandRowByClick` | `boolean` | `false` | 点击整行是否触发展开/折叠 |
| `loading` | `boolean` | `false` | 是否显示加载遮罩 |
| `striped` | `boolean` | `false` | 是否显示斑马纹隔行变色 |
| `bordered` | `boolean` | `true` | 是否显示内外边框 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 表格尺寸 |
| `height` | `string \| number` | `undefined` | 表格固定或百分比高度（如 `'100%'`, `'480px'`, `400`） |
| `minHeight` | `string \| number` | `undefined` | 表格最小高度 |
| `flexHeight` | `boolean` | `false` | 是否自动自适应填满父级 Flex / 绝对高度容器（超出滚动、不足留白） |
| `maxHeight` | `string \| number` | `undefined` | 表格最大滚动高度 |
| `pagination` | `TablePaginationConfig \| false` | `false` | 分页配置对象 |
| `emptyText` | `string` | `'暂无表格数据'` | 空状态文案 |
| `showSummary` | `boolean` | `false` | 是否在表格底部显示合计汇总行 |
| `sumText` | `string` | `'合计'` | 合计行的第一列文本标题 |
| `summaryMethod` | `(param: { columns, data }) => (string \| number)[]` | `undefined` | 自定义底部汇总计算函数 |
| `spanMethod` | `(param: { row, column, rowIndex, columnIndex }) => [number, number]` | `undefined` | 单元格合并函数，返回 `[rowspan, colspan]` |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:checkedRowKeys` | `(keys: (string \| number)[])` | 勾选行变更 |
| `selectionChange` | `(selectedRows: any[], keys: (string \| number)[])` | 选中行对象与 keys 列表变更 |
| `update:expandedRowKeys` | `(keys: (string \| number)[])` | 展开行 keys 变更 |
| `expandChange` | `(row: any, expanded: boolean, keys: (string \| number)[])` | 单行展开/折叠状态切换 |
| `update:page` | `(page: number)` | 分页页码变更 |
| `update:pageSize` | `(size: number)` | 分页每页条数变更 |
| `sortChange` | `(key: string, order: TableSortOrder)` | 排序规则变更 |
| `rowClick` | `(row: any, index: number, event: MouseEvent)` | 单击行 |
| `rowDblclick` | `(row: any, index: number, event: MouseEvent)` | 双击行 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `[column.key / prop]` | `{ row: any, index: number, column: TableColumnProps }` | 自定义对应列单元格内容 |
| `expand` / `expanded-row` | `{ row: any, index: number }` | 自定义展开行的子内容 |
| `summary` | `{ columns, data, sums }` | 自定义表格底部汇总行渲染 |
| `empty` | `()` | 自定义表格空状态 |
| `pagination` / `footer` | `()` | 自定义底部分页区域 |

---

## 3. TableColumn 表格列声明

用于配合 `DataTable` 使用的声明式列定义组件，支持嵌套 `<TableColumn>` 实现多级表头。

### 代码用法
```vue
<DataTable :data="tableData">
  <TableColumn type="selection" width="50" />
  <TableColumn prop="name" label="任务名称" min-width="140" />
  <TableColumn prop="status" label="状态" width="100" />
  <TableColumn prop="score" label="评分" sortable width="120" />
  <TableColumn label="财务指标">
    <TableColumn prop="budget" label="预算 (万元)" width="120" />
    <TableColumn prop="cost" label="花费 (万元)" width="120" />
  </TableColumn>
  <TableColumn type="expand" width="48" />
</DataTable>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `prop` / `key` | `string` | `undefined` | 对应数据项字段名 |
| `label` / `title` | `string` | `undefined` | 列标题文案 |
| `type` | `'selection' \| 'expand'` | `undefined` | 特殊列类型（多选列 / 展开列） |
| `width` | `number \| string` | `undefined` | 列固定宽度 |
| `minWidth` | `number \| string` | `undefined` | 列最小宽度 |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 文本对齐方式 |
| `sortable` | `boolean \| ((a: any, b: any) => number)` | `undefined` | 是否支持排序或自定义排序函数 |
| `ellipsis` | `boolean` | `false` | 超出是否单行省略 |
| `fixed` | `'left' \| 'right'` | `undefined` | 列固定位置 |

---

## 4. Tree 树形控件

支持多层级嵌套展开/收起、Checkbox 级联勾选、节点关键词搜索过滤与高亮、自定义插槽。

### 代码用法
```vue
<Tree
  :data="treeData"
  v-model:checked-keys="checkedKeys"
  checkable
  default-expand-all
/>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `data` | `TreeOption[]` | `[]` | 树形结构数据源 |
| `checkedKeys` | `(string \| number)[]` | `[]` | 勾选中的节点 key 列表 |
| `selectedKeys` | `(string \| number)[]` | `[]` | 选中的高亮节点 key 列表 |
| `expandedKeys` | `(string \| number)[]` | `[]` | 展开的节点 key 列表 |
| `defaultExpandAll` | `boolean` | `false` | 初始化时是否默认展开所有节点 |
| `checkable` | `boolean` | `false` | 是否显示多选 Checkbox |
| `selectable` | `boolean` | `true` | 是否支持单选高亮节点 |
| `multiple` | `boolean` | `false` | 是否支持多选选中 |
| `cascade` | `boolean` | `true` | 勾选时是否父子级联联动 |
| `pattern` | `string` | `''` | 节点搜索过滤关键词 |
| `blockNode` | `boolean` | `true` | 节点整行是否填满并响应点击 |
| `showLine` | `boolean` | `true` | 是否显示虚线层级连接线 |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:checkedKeys` | `(keys: (string \| number)[])` | 勾选节点 key 变更 |
| `update:selectedKeys` | `(keys: (string \| number)[])` | 选中节点 key 变更 |
| `update:expandedKeys` | `(keys: (string \| number)[])` | 展开节点 key 变更 |
| `nodeClick` | `(node: TreeOption)` | 点击节点行触发 |
| `check` | `(keys: (string \| number)[], node: TreeOption)` | 勾选事件触发 |
| `select` | `(keys: (string \| number)[], node: TreeOption)` | 选中事件触发 |
| `expand` | `(keys: (string \| number)[], node: TreeOption, expanded: boolean)` | 展开/收起事件触发 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `label` | `{ node: TreeOption }` | 自定义节点标题文本 |
| `prefix` | `{ node: TreeOption }` | 自定义节点前缀图标/内容 |
| `suffix` | `{ node: TreeOption }` | 自定义节点后缀操作或标签 |

---

## 5. TreeSelect 下拉树选择器

将树形层级交互嵌入下拉选择框，支持单选/多选 Tag 展示、搜索过滤、清空、级联勾选。

### 代码用法
```vue
<TreeSelect
  v-model="selectedKey"
  :options="treeData"
  placeholder="选择归属分类..."
  clearable
  block
/>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number \| (string \| number)[]` | `undefined` | 选中节点的 key（单选为单一值，多选为数组） |
| `options` | `TreeOption[]` | `[]` | 树形选项数据源 |
| `placeholder` | `string` | `'请选择'` | 占位提示文案 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `checkable` | `boolean` | `false` | 是否启用树节点 Checkbox 勾选模式 |
| `cascade` | `boolean` | `true` | 是否父子节点级联关联 |
| `clearable` | `boolean` | `true` | 是否支持一键清空 |
| `filterable` | `boolean` | `true` | 是否在下拉面板内提供搜索框 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `block` | `boolean` | `false` | 是否 100% 宽度 |
| `defaultExpandAll` | `boolean` | `false` | 是否默认展开树节点 |
| `maxTagCount` | `number` | `undefined` | 多选时最多展示的 Tag 数量（超出显示 +N） |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:modelValue` | `(val: any)` | 绑定值更新 |
| `change` | `(val: any, node?: TreeOption \| TreeOption[])` | 选中项变更 |
| `clear` | `()` | 清空触发 |
| `focus` | `(event: FocusEvent)` | 聚焦触发 |
| `blur` | `(event: FocusEvent)` | 失焦触发 |

---

## 6. Transfer 穿梭框

双栏穿梭转移组件，支持穿梭项过滤搜索、自定义标题、自定义列表插槽及响应式移动端自适应。

### 代码用法
```vue
<Transfer
  v-model="targetKeys"
  :options="transferUsers"
  :titles="['可选团队成员', '已指派协同人']"
  filterable
/>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `(string \| number)[]` | `[]` | 目标列表（右侧）中的选项 value 数组 |
| `options` | `TransferOption[]` | `[]` | 完整待穿梭数据源列表（包含 label, value, disabled, description, icon 等） |
| `titles` | `[string, string]` | `['源列表', '目标列表']` | 左右两栏面板标题 |
| `sourceTitle` | `string` | `undefined` | 左侧源列表标题（优先于 titles[0]） |
| `targetTitle` | `string` | `undefined` | 右侧目标列表标题（优先于 titles[1]） |
| `filterable` | `boolean` | `true` | 是否显示搜索过滤框 |
| `filterPlaceholder` | `string` | `'搜索选项...'` | 搜索过滤输入框占位符 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 穿梭框尺寸 |
| `disabled` | `boolean` | `false` | 是否整体禁用 |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:modelValue` | `(value: (string \| number)[])` | 目标列表更新 |
| `change` | `(value: (string \| number)[], direction: 'left' \| 'right', movedKeys: (string \| number)[])` | 穿梭移动触发 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `left-header` | `()` | 自定义左侧面板头部 |
| `right-header` | `()` | 自定义右侧面板头部 |
| `item` | `{ item: TransferOption, checked: boolean, disabled: boolean, direction: 'left' \| 'right' }` | 自定义左右项通用渲染 |
| `left-item` | `{ item: TransferOption, checked: boolean, disabled: boolean }` | 自定义左侧单项渲染 |
| `right-item` | `{ item: TransferOption, checked: boolean, disabled: boolean }` | 自定义右侧单项渲染 |
| `left-empty` | `()` | 左侧空数据占位 |
| `right-empty` | `()` | 右侧空数据占位 |

---

## 7. AutoComplete 智能输入补全

输入时智能下拉匹配建议项，支持上下按键导航、回车确认、自定义过滤函数与选项插槽。

### 代码用法
```vue
<AutoComplete
  v-model="inputQuery"
  :options="suggestions"
  placeholder="输入关键词匹配..."
  block
/>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string` | `''` | 绑定输入框文本 |
| `options` | `(string \| AutoCompleteOption)[]` | `[]` | 补全候选选项列表 |
| `placeholder` | `string` | `'请输入...'` | 输入框占位文案 |
| `clearable` | `boolean` | `true` | 是否支持清空 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入框尺寸 |
| `block` | `boolean` | `false` | 是否 100% 宽度 |
| `prefixIcon` | `string` | `undefined` | 前缀图标名 |
| `suffixIcon` | `string` | `undefined` | 后缀图标名 |
| `filterMethod` | `(query: string, option: AutoCompleteOption) => boolean` | `undefined` | 自定义选项过滤函数 |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:modelValue` | `(val: string)` | 输入文本更新 |
| `select` | `(val: string, option: AutoCompleteOption)` | 选中候选建议项 |
| `change` | `(val: string)` | 文本变更 |
| `clear` | `()` | 点击清空 |
| `focus` | `(event: FocusEvent)` | 输入框聚焦 |
| `blur` | `(event: FocusEvent)` | 输入框失焦 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `prefix` | `()` | 自定义前缀插槽 |
| `suffix` | `()` | 自定义后缀插槽 |
| `option` | `{ option: AutoCompleteOption, index: number, active: boolean }` | 自定义下拉建议单项渲染 |
| `empty` | `()` | 无匹配项时的占位插槽 |

---

## 8. DynamicTags 动态标签增删

用于标签列表的动态添加、键盘回车确认、删除与上限控制。

### 代码用法
```vue
<DynamicTags v-model="tagList" theme="purple" :max="8" />
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string[]` | `[]` | 标签字符串数组 |
| `max` | `number` | `undefined` | 允许创建的最大标签数量 |
| `closable` | `boolean` | `true` | 标签是否可删除 |
| `theme` | `TaskTheme \| 'default'` | `'blue'` | 标签色彩主题 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 标签尺寸大小 |
| `disabled` | `boolean` | `false` | 是否禁用编辑与新增 |
| `inputPlaceholder` | `string` | `'标签名'` | 新增输入框占位文案 |
| `addText` | `string` | `'新建标签'` | 新建按钮文案 |

### Emits 事件

| 事件名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `update:modelValue` | `(tags: string[])` | 标签列表更新 |
| `change` | `(tags: string[])` | 标签变动触发 |
| `add` | `(tag: string)` | 添加新标签时触发 |
| `remove` | `(tag: string, index: number)` | 移除标签时触发 |

### Slots 插槽

| 插槽名 | 参数 | 说明 |
| :--- | :--- | :--- |
| `tag` | `{ tag: string, index: number, handleClose: () => void }` | 自定义标签单项 |
| `add-icon` | `()` | 自定义新建按钮图标 |
| `add-text` | `()` | 自定义新建按钮文案 |

---

## 9. Watermark 容器防伪水印

为容器或全屏页面注入安全防伪水印背景，支持文本/图片水印、高分辨率 Retina 屏幕适配、透明度、旋转角、全屏覆盖与 DOM 防篡改监听。

### 代码用法
```vue
<Watermark content="YILAN PRODUCTIVITY · 内部机密" :rotate="-20" :opacity="0.15">
  <div class="secure-container">
    <h4>重要业务数据</h4>
  </div>
</Watermark>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `content` | `string \| string[]` | `'一览 Yilan'` | 水印文本内容（多行传数组） |
| `image` | `string` | `undefined` | 水印图片 URL（若提供优先渲染图片水印） |
| `width` | `number` | `32` | 水印图片宽度 |
| `height` | `number` | `32` | 水印图片高度 |
| `rotate` | `number` | `-22` | 水印旋转角度（单位 deg） |
| `zIndex` | `number` | `9` | 水印层级 z-index |
| `xGap` | `number` | `48` | 水印横向间距（px） |
| `yGap` | `number` | `48` | 水印纵向间距（px） |
| `fontColor` | `string` | `'rgba(120, 117, 136, 0.14)'` | 水印字体颜色 |
| `fontSize` | `number` | `14` | 水印字体大小（px） |
| `fontFamily` | `string` | `Plus Jakarta Sans, Noto Sans SC...` | 水印字体系列 |
| `fontWeight` | `string \| number` | `'normal'` | 水印字重 |
| `opacity` | `number` | `1` | 水印不透明度 (0 ~ 1) |
| `cross` | `boolean` | `true` | 是否交叉排列 |
| `fullscreen` | `boolean` | `false` | 是否全屏覆盖模式 |
| `antiTamper` | `boolean` | `true` | 是否开启 MutationObserver 防篡改自动重绘 |
```

---

## 4. Transfer 穿梭框

双栏穿梭转移组件，支持穿梭项过滤搜索、自定义标题。

```vue
<Transfer
  v-model="targetKeys"
  :options="transferUsers"
  :titles="['可选团队成员', '已指派协同人']"
  filterable
/>
```

---

## 5. Watermark 容器防伪水印
