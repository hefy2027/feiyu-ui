# 04 / 数据展示与可视化组件 (Data Display)

本模块包含：`Text`（语义排版）、`GradientText`（渐变文字）、`Ellipsis`（文本省略）、`Highlight`（高亮搜索）、`Kbd`（快捷键）、`Code`（代码块）、`Equation`（公式）、`Icon`（图标）、`Tag` & `Chip` & `CheckTag`（标签、胶囊与可选标签）、`Badge`（徽标）、`Card`（卡片）、`Thing`（事物复合卡片）、`Avatar` & `AvatarGroup`（头像）、`List` & `ListItem`（列表）、`Descriptions` & `DescriptionsItem`（描述列表）、`Timeline` & `TimelineItem`（时间线）、`Collapse` & `CollapseItem`（折叠面板）、`Statistic` & `NumberAnimation`（统计指标）、`CountDown`（倒计时）、`Time`（相对时间）、`QRCode`（二维码）、`Image` & `ImageGroup` & `ImageViewer`（图片相册与全屏画廊预览）、`Carousel` & `CarouselItem`（走马灯与轮播子项）、`Skeleton`（骨架屏）、`InfiniteScroll`（无限滚动）、`Log`（日志流）、`Calendar`（排班日历）、`Segmented`（分段控制器）。

---

## 1. Segmented 分段控制器

iOS 风格滑动胶囊分段控制器，带有弹簧物理位移动画。

### 代码用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Segmented } from 'feiyu-ui'

const activeTab = ref('board')
</script>

<template>
  <Segmented
    v-model="activeTab"
    :options="[
      { label: '看板视图', value: 'board', icon: 'view_kanban' },
      { label: '多维表格', value: 'table', icon: 'table_chart' },
      { label: '排班日历', value: 'calendar', icon: 'calendar_month' }
    ]"
    size="md"
  />
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number` | `undefined` | 选中项绑定的值 |
| `options` | `Array<string \| SegmentedOption>` | `[]` | 选项列表（支持简单字符串数组或含 icon/disabled 的对象数组） |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `block` | `boolean` | `false` | 是否撑满容器 100% 宽度等分 |
| `disabled` | `boolean` | `false` | 是否全局禁用 |

---

## 2. Ellipsis 文本省略截断

### 代码用法

```vue
<!-- 单行截断，鼠标悬停 Tooltip 预览全文 -->
<Ellipsis text="这是一段很长很长的文本..." :line-clamp="1" />

<!-- 多行截断 + 点击“展开 / 收起” -->
<Ellipsis :text="articleText" :line-clamp="2" expandable expand-text="展开全文" />
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `text` | `string` | `''` | 文本内容 |
| `lineClamp` | `number \| string` | `1` | 最大展示行数 |
| `tooltip` | `boolean` | `true` | 是否在未展开时启用 Tooltip 悬停完整预览 |
| `expandable` | `boolean` | `false` | 是否显示“展开/收起”操作按钮 |
| `expandText` | `string` | `'展开'` | 展开按钮文字 |
| `collapseText` | `string` | `'收起'` | 收起按钮文字 |

---

## 3. Highlight 关键词高亮

### 代码用法

```vue
<Highlight
  text="Vue 3 Composition API 让代码复用和类型推导更优雅。"
  :keyword="['Vue 3', '优雅']"
/>
```

---

## 4. Time 相对时间

自动将时间戳/Date 计算为 “刚刚”、“5分钟前”、“3天前” 等。

### 代码用法

```vue
<Time :time="Date.now() - 1000 * 120" type="relative" />
<Time :time="new Date()" type="datetime" format="YYYY-MM-DD HH:mm:ss" />
```

---

## 5. Skeleton 骨架屏

提供微质感流光掠过（Shimmer）动画占位。

### 代码用法

```vue
<template>
  <div v-if="loading" style="display: flex; gap: 12px;">
    <!-- 圆形头像占位 -->
    <Skeleton circle width="44" height="44" />
    <div style="flex: 1;">
      <!-- 胶囊占位 -->
      <Skeleton width="40%" height="18" round />
      <!-- 段落文本占位 (末行自动缩短) -->
      <Skeleton text :repeat="2" />
    </div>
  </div>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `text` | `boolean` | `false` | 是否为段落文字模式（高度为 14px，多行时末行自动 60% 宽度） |
| `round` | `boolean` | `false` | 是否为圆角胶囊形态 |
| `circle` | `boolean` | `false` | 是否为圆形头像形态 |
| `width` | `string \| number` | `undefined` | 宽度（px 或 css 单位） |
| `height` | `string \| number` | `undefined` | 高度（px 或 css 单位） |
| `repeat` | `number` | `1` | 连续重复生成骨架行数 |
| `animated` | `boolean` | `true` | 是否启用流光流动过渡动画 |

---

## 6. Code 代码块 & Log 实时日志

```vue
<!-- 代码块 -->
<Code
  language="typescript"
  code="const msg: string = 'Hello Luminous UI'"
  show-line-numbers
  copyable
/>

<!-- 实时日志流 (支持自动触底) -->
<Log :logs="runtimeLogs" height="180px" auto-scroll />
```

---

## 7. Calendar 月度看板日历

```vue
<Calendar v-model="selectedDate">
  <template #date-cell="{ cell }">
    <Tag v-if="cell.day === 14" theme="purple">发版冲刺</Tag>
  </template>
</Calendar>
```

---

## 8. CheckTag 可选中标签 (对应 ElCheckTag)

```vue
<template>
  <CheckTag v-model:checked="checked1" type="primary">Vue 3</CheckTag>
  <CheckTag v-model:checked="checked2" type="success">TypeScript 5</CheckTag>
</template>
```

---

## 9. ImageViewer 全屏画廊图片预览器 (对应 ElImageViewer)

```vue
<template>
  <ImageViewer
    v-model:show="isViewerOpen"
    :url-list="['https://example.com/1.jpg', 'https://example.com/2.jpg']"
  />
</template>
```
