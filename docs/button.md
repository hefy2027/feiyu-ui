# 01 / 按钮体系组件 (Button)

本模块包含：`Button`（基础按钮）、`ButtonGroup`（按钮组）、`FloatButton`（悬浮按钮）、`FloatButtonGroup`（悬浮按钮菜单组）、`Link`（文字链接）。

---

## 1. Button 基础按钮

通用操作触发器，支持多种色彩变体、尺寸、圆角胶囊形态、正圆形、加载状态与前缀图标。

### 代码用法

```vue
<script setup lang="ts">
import { Button } from 'feiyu-ui'
</script>

<template>
  <!-- 基础风格变体 -->
  <Button variant="primary" icon="add">新建任务</Button>
  <Button variant="secondary">次要操作</Button>
  <Button variant="ghost" icon="tune">幽灵按钮</Button>
  <Button variant="outline">边框按钮</Button>
  <Button variant="dashed" icon="border_style">虚线按钮</Button>
  <Button variant="danger" icon="delete">危险删除</Button>

  <!-- 尺寸与形态 -->
  <Button size="sm" variant="primary">小尺寸</Button>
  <Button size="lg" variant="primary">大尺寸</Button>
  <Button round variant="primary">圆角胶囊</Button>
  <Button circle icon="done" variant="success" />

  <!-- 加载状态与禁用 -->
  <Button :loading="true" variant="primary">提交中</Button>
  <Button :disabled="true" variant="primary">已禁用</Button>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'dashed' \| 'danger' \| 'success' \| 'warning' \| 'info' \| 'icon'` | `'secondary'` | 按钮视觉色彩风格变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸大小 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 HTML 按钮类型 |
| `disabled` | `boolean` | `false` | 是否禁用按钮 |
| `loading` | `boolean` | `false` | 是否处于异步加载中状态（显示微旋转指示器） |
| `round` | `boolean` | `false` | 是否为半圆角胶囊形态 |
| `circle` | `boolean` | `false` | 是否为正圆形图标按钮 |
| `icon` | `string` | `undefined` | 按钮前缀图标（Material Symbols 图标名称） |
| `ariaLabel` | `string` | `undefined` | 无障碍 ARIA 标签描述（纯图标按钮建议提供） |

### Emits 事件

| 事件名 | 参数 | 触发时机 |
| :--- | :--- | :--- |
| `click` | `(event: MouseEvent)` | 点击按钮时触发（禁用或 loading 状态时不触发） |

### Slots 插槽

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 按钮主体文本内容 |
| `icon` | 自定义前缀图标内容（若不需要默认 icon 渲染） |

---

## 2. ButtonGroup 按钮组

将多个相连的 `Button` 拼接组合在一起，自动消除中间多余边框与内侧圆角。

### 代码用法

```vue
<script setup lang="ts">
import { ButtonGroup, Button } from 'feiyu-ui'
</script>

<template>
  <!-- 水平对齐工具栏 -->
  <ButtonGroup size="sm">
    <Button variant="outline" icon="format_align_left">居左</Button>
    <Button variant="outline" icon="format_align_center">居中</Button>
    <Button variant="outline" icon="format_align_right">居右</Button>
    <Button variant="outline" icon="format_align_justify">两端对齐</Button>
  </ButtonGroup>

  <!-- 纵向排列 -->
  <ButtonGroup vertical>
    <Button variant="secondary">顶部动作</Button>
    <Button variant="secondary">中间动作</Button>
    <Button variant="secondary">底部动作</Button>
  </ButtonGroup>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `size` | `'sm' \| 'md' \| 'lg'` | `undefined` | 统一注入组内所有子按钮的尺寸大小 |
| `vertical` | `boolean` | `false` | 是否为垂直纵向排列模式 |

### Slots 插槽

| 插槽名 | 说明 |
| :--- | :--- |
| `default` | 放置多个 `Button` 组件 |

---

## 3. FloatButton 悬浮按钮

固定于屏幕右下角或局部容器边缘的微质感悬浮操作球。

### 代码用法

```vue
<script setup lang="ts">
import { FloatButton } from 'feiyu-ui'
</script>

<template>
  <FloatButton
    icon="arrow_upward"
    type="primary"
    tooltip="回到顶部"
    :badge="3"
    @click="scrollToTop"
  />
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `icon` | `string` | `'add'` | Material Symbols 图标名 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 按钮外形形状（圆形或圆角矩形） |
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 悬浮球主题色彩变体 |
| `badge` | `number \| string` | `undefined` | 右上角角标数字或文字 |
| `badgeDot` | `boolean` | `false` | 是否仅显示为小红点徽标 |
| `tooltip` | `string` | `''` | 悬浮提示文案 |
| `disabled` | `boolean` | `false` | 是否禁用点击 |
| `ariaLabel` | `string` | `'悬浮操作'` | ARIA 无障碍标签 |

---

## 4. FloatButtonGroup 悬浮按钮组

支持悬浮/点击展开的悬浮折叠快捷操作菜单。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `trigger` | `'click' \| 'hover'` | `'click'` | 展开子菜单的交互触发方式 |
| `icon` | `string` | `'apps'` | 默认主按钮图标 |
| `activeIcon` | `string` | `'close'` | 菜单展开后主按钮变为的图标 |
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 主悬浮球色彩 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 主悬浮球外形形状 |
| `tooltip` | `string` | `'快捷操作'` | 主悬浮球悬停提示 |

---

## 5. Link 文字链接 (对应 ElLink)

带有下划线动效、语义色彩与图标支持的文字超链接。

### 代码用法

```vue
<script setup lang="ts">
import { Link } from 'feiyu-ui'
</script>

<template>
  <Link type="primary" href="https://vuejs.org" target="_blank" icon="open_in_new">
    Vue 3 官网
  </Link>
  <Link type="success" underline>成功提示链接</Link>
  <Link type="danger" disabled>禁用链接</Link>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 链接色彩类型 |
| `underline` | `boolean` | `true` | 是否在悬停时展示下划线动画 |
| `disabled` | `boolean` | `false` | 是否禁用链接 |
| `href` | `string` | `undefined` | 原生超链接地址 |
| `target` | `string` | `'_self'` | 目标打开窗口（如 `_blank`） |
| `icon` | `string` | `undefined` | 图标名称 |
| `iconPlacement` | `'left' \| 'right'` | `'left'` | 图标放置方位 |
