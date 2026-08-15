# 05 / 导航与位置联动组件 (Navigation)

本模块包含：`Menu` 全套（菜单系统）、`DropdownMenu` & `DropdownItem`（下拉菜单）、`Tabs` & `TabPane`（标签页）、`Breadcrumb` & `BreadcrumbItem`（面包屑）、`PageHeader`（页头）、`Steps` & `Step`（步骤条）、`Pagination`（分页器）、`Anchor` & `AnchorLink`（锚点目录）、`Affix`（固钉）、`BackTop`（回到顶部）。

---

## 1. Menu 菜单导航全家桶

支持单选激活、内嵌子菜单（`SubMenu`）、分组（`MenuGroup`）与纯受控/非受控模式。

### 代码用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu, MenuGroup } from 'feiyu-ui'

const activeKey = ref('kanban')
</script>

<template>
  <div style="width: 220px;">
    <Menu v-model:value="activeKey">
      <MenuGroup label="核心视图">
        <MenuItem key="kanban" icon="view_kanban">敏捷看板</MenuItem>
        <MenuItem key="table" icon="table_chart">多维表格</MenuItem>
      </MenuGroup>
      <SubMenu key="settings" label="系统配置" icon="settings">
        <MenuItem key="team" icon="group">团队成员</MenuItem>
        <MenuItem key="audit" icon="security">安全日志</MenuItem>
      </SubMenu>
    </Menu>
  </div>
</template>
```

---

## 2. DropdownMenu 下拉菜单

支持点击/悬浮触发弹出式菜单。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `items` | `DropdownMenuItem[]` | `[]` | 下拉菜单列表（支持 key, label, icon, danger, divider） |
| `placement` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | 弹出位置 |
| `width` | `string` | `'180px'` | 菜单面板宽度 |

---

## 3. Tabs & TabPane 标签页

提供 `'line'`（下划线型）、`'card'`（卡片型）、`'pill'`（胶囊药丸型）三种现代视觉风格。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number` | `''` | 当前激活的标签 key |
| `type` | `'line' \| 'card' \| 'pill'` | `'line'` | 风格形态 |
| `closable` | `boolean` | `false` | 是否允许关闭标签 |

---

## 4. Breadcrumb 面包屑导航

```vue
<Breadcrumb separator-icon="chevron_right">
  <BreadcrumbItem to="/board">首页看板</BreadcrumbItem>
  <BreadcrumbItem to="/projects">企业项目</BreadcrumbItem>
  <BreadcrumbItem>任务详情</BreadcrumbItem>
</Breadcrumb>
```

---

## 5. PageHeader 页头 (对应 ElPageHeader)

常用于从列表页下钻至详情页或编辑页时的头部指示条，支持返回箭头、标题、面包屑及自定义标签。

### 代码用法

```vue
<template>
  <PageHeader
    title="返回"
    content="任务详情 · YL-20260814"
    @back="handleBack"
  >
    <template #tags>
      <Tag theme="blue">进行中</Tag>
    </template>
    <template #extra>
      <Button size="sm" variant="primary">编辑任务</Button>
    </template>
  </PageHeader>
</template>
```
