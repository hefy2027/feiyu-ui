# 02 / 空间与布局组件 (Layout)

本模块包含：`Space`（间距容器）、`Flex`（弹性布局）、`Divider`（分割线）、`Grid` & `GridItem (Gi)`（响应式断点栅格）、`Row` & `Col`（24 栅格）、`Split`（拖拽分栏）、`Scrollbar`（平滑滚动条）、`Layout` 全家桶（应用级框架）。

---

## 1. Space 间距容器

避免组件间手动编写 margin 缝隙，提供标准化的弹性流式间距。

### 代码用法

```vue
<script setup lang="ts">
import { Space, Button } from 'feiyu-ui'
</script>

<template>
  <!-- 水平间距 + 自动换行 -->
  <Space :size="12" wrap align="center">
    <Button>按钮 1</Button>
    <Button>按钮 2</Button>
    <Button>按钮 3</Button>
  </Space>

  <!-- 纵向间距 -->
  <Space vertical :size="16">
    <div>卡片 A</div>
    <div>卡片 B</div>
  </Space>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `size` | `'sm' \| 'md' \| 'lg' \| number \| [number, number]` | `'md'` | 间距尺寸，支持预设字符串、数字（像素）或数组 `[行间距, 列间距]` |
| `vertical` | `boolean` | `false` | 是否纵向垂直排列 |
| `wrap` | `boolean` | `true` | 是否允许子元素自动换行 |
| `align` | `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch'` | `'center'` | 交叉轴对齐方式 |
| `justify` | `'start' \| 'center' \| 'end' \| 'space-between' \| 'space-around'` | `'start'` | 主轴对齐方式 |
| `inline` | `boolean` | `false` | 是否为 `inline-flex` 行内弹性盒子 |

---

## 2. Flex 弹性容器

对齐原生 Flexbox 的布局原子组件。

### 代码用法

```vue
<script setup lang="ts">
import { Flex, Button } from 'feiyu-ui'
</script>

<template>
  <Flex justify="space-between" align="center" gap="16px" wrap>
    <h2>项目看板</h2>
    <Flex gap="8px">
      <Button variant="ghost">导出</Button>
      <Button variant="primary">新建</Button>
    </Flex>
  </Flex>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `vertical` | `boolean` | `false` | 是否纵向排列 (`flex-direction: column`) |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | `'start'` | 主轴对齐方式 |
| `align` | `'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'` | `'start'` | 侧轴对齐方式 |
| `wrap` | `boolean \| 'nowrap' \| 'wrap' \| 'wrap-reverse'` | `false` | 换行规则 |
| `gap` | `number \| string \| [number \| string, number \| string]` | `0` | 间隙间距（支持数字、css单位或数组） |
| `inline` | `boolean` | `false` | 是否为行内元素 |

---

## 3. Divider 分割线

区隔内容的线条，支持文字标题与虚线样式。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `dashed` | `boolean` | `false` | 是否为虚线 |
| `titlePlacement` | `'left' \| 'center' \| 'right'` | `'center'` | 分割线文字标题的位置 |
| `vertical` | `boolean` | `false` | 是否为垂直分割线 |

---

## 4. Grid & GridItem (Gi) 响应式断点栅格

基于 CSS Grid 的高级响应式栅格系统，支持自由断点与间距定义。

### 代码用法

```vue
<script setup lang="ts">
import { Grid, Gi, Card } from 'feiyu-ui'
</script>

<template>
  <!-- 手机 1 列，平板 2 列，桌面 4 列 -->
  <Grid :cols="'1 640:2 1024:4'" :x-gap="16" :y-gap="16">
    <Gi><Card title="卡片 1" /></Gi>
    <Gi><Card title="卡片 2" /></Gi>
    <Gi :span="2"><Card title="占两列卡片" /></Gi>
  </Grid>
</template>
```

### Grid Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `cols` | `number \| string` | `24` | 栅格列数或响应式断点字符（如 `'1 640:2 1024:4'`） |
| `xGap` | `number \| string` | `0` | 水平列间距 (px) |
| `yGap` | `number \| string` | `0` | 垂直行间距 (px) |

---

## 5. Split 拖拽分栏面板

支持鼠标在左右/上下分栏中间拖拽调节比例的弹性面板。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `size` | `number` | `0.5` | 分栏比例 (0 ~ 1 之间的浮点数) |
| `min` | `number` | `0.1` | 允许调节的最小比例限制 |
| `max` | `number` | `0.9` | 允许调节的最大比例限制 |
| `disabled` | `boolean` | `false` | 是否禁用拖拽调节 |

---

## 6. Scrollbar 平滑滚动条 (对应 ElScrollbar)

微质感毛玻璃平滑滚动条容器，支持拖拽滑块、`scrollTo` 编程式滚动与原生滚动条隐藏。

### 代码用法

```vue
<script setup lang="ts">
import { Scrollbar } from 'feiyu-ui'
</script>

<template>
  <Scrollbar height="240px">
    <div v-for="item in 20" :key="item" class="row">
      内容行 #{{ item }}
    </div>
  </Scrollbar>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `height` | `string \| number` | `undefined` | 滚动容器固定高度 |
| `maxHeight` | `string \| number` | `undefined` | 滚动容器最大高度 |
| `always` | `boolean` | `false` | 是否一直常驻显示滚动条滑块（默认 hover 时显现） |
| `minSize` | `number` | `20` | 滑块最小高度/宽度像素 |
| `tag` | `string` | `'div'` | 视图内部包裹容器的 HTML 标签 |
| `noresize` | `boolean` | `false` | 是否不监听容器尺寸变化 ResizeObserver |
