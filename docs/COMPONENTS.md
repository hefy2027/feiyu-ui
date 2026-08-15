# 非与 UI (Feiyu UI)开发指南与全景文档 (Luminous UI)

> 基于 Vue 3 + TypeScript 5 + Vite 8 构建的现代、高性能、自托管毛玻璃微质感（Luminous Productivity）企业级组件库。  
> 拥有 80+ 个纯自研组件，全面对齐 Element Plus 常用组件族，零外部 CDN 依赖，100% 离线可用，开箱即用支持亮色/暗色主题自适应。

---

## 1. 快速上手

### 1.1 安装与全局引用

所有基础与高级组件均收口于 `feiyu-ui`（或 `src/components/ui/index.ts`），支持按需解构引入：

```vue
<script setup lang="ts">
import { Button, Input, Modal, DataTable, VirtualList } from 'feiyu-ui'
</script>

<template>
  <Button variant="primary" icon="check">确认提交</Button>
</template>
```

### 1.2 设计系统与 Token 规范

组件样式严格遵从 `src/styles/tokens.scss` 与 `src/styles/base.scss`，统一采用 CSS 自定义属性与 `color-mix()` 实现高斯毛玻璃自适应。

- **表面色阶**：`--surface`、`--surface-container-low`、`--surface-container-high`、`--surface-container-highest`
- **语义色彩**：`--primary`、`--success`、`--warning`、`--danger`、`--info`
- **圆角体系**：`--r-xs (4px)`、`--r-sm (6px)`、`--r-md (10px)`、`--r-lg (16px)`、`--r-xl (22px)`、`--r-full (9999px)`
- **毛玻璃质感**：`backdrop-filter: blur(14px) saturate(1.4);`

---

## 2. 组件分类全景索引

```
src/components/ui/
├── button/     (按钮体系)  Button, ButtonGroup, FloatButton, FloatButtonGroup, Link
├── layout/     (空间排版)  Space, Flex, Grid, GridItem(Gi), Row, Col, Divider, Split, Scrollbar, Layout 全套
├── form/       (数据录入)  Form, FormItem, Input, InputPassword, InputNumber, PinInput, Textarea,
                            DynamicInput, Select, Option, OptionGroup, Radio, RadioGroup, RadioButton,
                            Checkbox, CheckboxGroup, CheckboxButton, Switch, DatePicker, DateTimePicker, TimePicker, TimeSelect, Slider, ColorPicker,
                            Rate, Cascader, Mentions, Upload
├── display/    (数据展示)  Text, GradientText, Ellipsis, Highlight, Kbd, Code, Equation, Icon,
                            Tag, Chip, CheckTag, Badge, Card, Thing, Avatar, AvatarGroup, List, ListItem,
                            Descriptions, DescriptionsItem, Timeline, TimelineItem, Collapse,
                            CollapseItem, Statistic, NumberAnimation, CountDown, Time, QRCode,
                            Image, ImageGroup, ImageViewer, Carousel, CarouselItem, Skeleton, ProgressBar, Empty,
                            InfiniteScroll, Log, Calendar, Segmented
├── navigation/ (导航联动)  Menu, MenuItem, SubMenu, MenuGroup, DropdownMenu, DropdownItem,
                            Tabs, TabPane, Breadcrumb, BreadcrumbItem, PageHeader, Steps, Step,
                            Pagination, Anchor, AnchorLink, Affix, BackTop
├── feedback/   (反馈弹层)  Modal, Drawer, ConfirmDialog, ToastHost, Notice, Tooltip, Popover,
                            Popconfirm, Popselect, Alert, Spin, LoadingBar, Progress, Result, Tour
└── advanced/   (重型交互)  DataTable, TableColumn, VirtualList, Tree, TreeSelect, Transfer, AutoComplete,
                            DynamicTags, Watermark
```

---

## 3. 核心组件 API 与使用参考

### 3.1 按钮类 (Button)

#### `Button`

```vue
<Button variant="primary" icon="add" :loading="isLoading" @click="handleClick">
  新建任务
</Button>
```

| 属性 (Prop) | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'dashed' \| 'danger' \| 'success' \| 'warning' \| 'info' \| 'icon'` | `'secondary'` | 按钮色彩风格变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `round` | `boolean` | `false` | 是否为半圆角胶囊形态 |
| `circle` | `boolean` | `false` | 是否为正圆形（常用于单图标） |
| `icon` | `string` | `undefined` | Material Symbols 图标名 |
| `loading` | `boolean` | `false` | 是否处于加载中状态 |
| `disabled` | `boolean` | `false` | 是否禁用 |

#### `ButtonGroup`

将多个按钮贴合组合，自动消除中间接缝圆角。

```vue
<ButtonGroup size="sm">
  <Button variant="outline" icon="format_align_left">居左</Button>
  <Button variant="outline" icon="format_align_center">居中</Button>
  <Button variant="outline" icon="format_align_right">居右</Button>
</ButtonGroup>
```

#### `FloatButton` & `FloatButtonGroup`

固定于右下角的操作按钮或可展开菜单。

```vue
<FloatButtonGroup trigger="hover" icon="bolt" active-icon="close">
  <FloatButton icon="arrow_upward" tooltip="回到顶部" @click="scrollToTop" />
  <FloatButton icon="palette" tooltip="切换主题" type="warning" @click="ui.toggleTheme()" />
</FloatButtonGroup>
```

#### `Link` (对应 ElLink)

带下划线动画与语义色彩的文字超链接。

```vue
<Link type="primary" href="https://vuejs.org" target="_blank" icon="open_in_new">
  Vue 3 官方文档
</Link>
<Link type="danger" disabled>禁用链接</Link>
```

---

### 3.2 布局类 (Layout)

#### `Space` & `Flex`

```vue
<Flex justify="space-between" align="center" wrap gap="12px">
  <span>左侧标题</span>
  <Space :size="8">
    <Button variant="ghost">取消</Button>
    <Button variant="primary">提交</Button>
  </Space>
</Flex>
```

#### `Grid` & `GridItem (Gi)`

支持响应式断点字符（如 `'1 640:2 1024:4'`）。

```vue
<Grid :cols="'1 640:2 1024:4'" :x-gap="16" :y-gap="16">
  <Gi><Card title="卡片 1" /></Gi>
  <Gi :span="2"><Card title="占两列卡片" /></Gi>
</Grid>
```

#### `Split`

支持鼠标拖拽改变比例的水平分栏。

```vue
<Split v-model:size="splitSize" :min="0.2" :max="0.8">
  <template #left>左侧内容面板</template>
  <template #right>右侧内容面板</template>
</Split>
```

#### `Scrollbar` (对应 ElScrollbar)

优雅的毛玻璃极简滚动条容器，支持鼠标拖拽滚动块、平滑滚动定位与原生滚动条隐藏。

```vue
<Scrollbar height="200px">
  <div v-for="i in 20" :key="i" class="scroll-row">
    滚动内容行 #{{ i }}
  </div>
</Scrollbar>
```

---

### 3.3 数据录入类 (Form & Inputs)

#### `Input` / `InputPassword` / `InputNumber` / `PinInput`

```vue
<!-- 基础输入 -->
<Input v-model="text" placeholder="搜索任务..." prefix-icon="search" kbd="⌘K" clearable />

<!-- 密码显隐 -->
<InputPassword v-model="password" placeholder="请输入密码..." />

<!-- 数字步进 (支持两侧控制 both-sides 或右侧堆叠 right) -->
<InputNumber v-model="count" :min="0" :max="100" :step="5" controls-position="both-sides" />

<!-- 分格验证码/PIN -->
<PinInput v-model="pinCode" :length="4" @complete="handlePinComplete" />
```

#### `RadioGroup` / `RadioButton` & `CheckboxGroup` / `CheckboxButton`

```vue
<!-- 按钮风格单选 -->
<RadioGroup v-model="viewMode">
  <RadioButton value="day">日视图</RadioButton>
  <RadioButton value="week">周视图</RadioButton>
  <RadioButton value="month">月视图</RadioButton>
</RadioGroup>
```

#### `Textarea`

```vue
<Textarea
  v-model="description"
  placeholder="请输入详细描述..."
  :rows="3"
  :maxlength="200"
  show-count
  :auto-size="{ minRows: 2, maxRows: 6 }"
  clearable
/>
```

#### `DatePicker` & `DateTimePicker` & `TimePicker` & `TimeSelect`

```vue
<!-- 单日期 / 日期范围 -->
<DatePicker v-model="date" placeholder="选择截止日期" />
<DatePicker v-model="dateRange" type="daterange" />

<!-- 日期时间复合选择 -->
<DateTimePicker v-model="publishTime" placeholder="选择发版时刻" />

<!-- 时间选择 -->
<TimePicker v-model="meetingTime" placeholder="选择开会时间" />

<!-- 时刻下拉点选择 (对应 ElTimeSelect) -->
<TimeSelect v-model="slotTime" start="08:30" step="00:30" end="18:30" placeholder="固定时间片" />
```

#### `DynamicInput`

用于动态增减任意行数的需求或配置项列表。

```vue
<DynamicInput
  v-model="requirementList"
  placeholder="输入需求要点..."
  create-button-text="添加新要点"
/>
```

#### `Form` & `FormItem` & `Select` (`Option` / `OptionGroup`)

```vue
<Form ref="formRef" :model="formModel" :rules="formRules">
  <FormItem label="任务名称" path="title" required>
    <Input v-model="formModel.title" placeholder="请输入任务标题" />
  </FormItem>
  <FormItem label="负责人" path="assignee">
    <Select v-model="formModel.assignee">
      <Option v-for="user in userOptions" :key="user.value" :value="user.value" :label="user.label" />
    </Select>
  </FormItem>
  <Button variant="primary" @click="submitForm">提交</Button>
</Form>
```

---

### 3.4 数据展示与可视化类 (Data Display)

#### `Segmented`

iOS 风格滑动胶囊分段控制器，带有弹簧物理位移动画。

```vue
<Segmented
  v-model="currentView"
  :options="[
    { label: '看板视图', value: 'board', icon: 'view_kanban' },
    { label: '多维表格', value: 'table', icon: 'table_chart' },
    { label: '排班日历', value: 'calendar', icon: 'calendar_month' }
  ]"
/>
```

#### `CheckTag` (对应 ElCheckTag)

```vue
<CheckTag v-model:checked="isVueChecked" type="primary">Vue 3</CheckTag>
<CheckTag v-model:checked="isTsChecked" type="success">TypeScript</CheckTag>
```

#### `ImageViewer` (对应 ElImageViewer) & `CarouselItem`

```vue
<!-- 大图全屏画廊预览器 -->
<ImageViewer
  v-model:show="isViewerOpen"
  :url-list="['https://example.com/1.png', 'https://example.com/2.png']"
  :initial-index="0"
/>

<!-- 走马灯轮播子项 -->
<Carousel autoplay>
  <CarouselItem><div>幻灯片 1</div></CarouselItem>
  <CarouselItem><div>幻灯片 2</div></CarouselItem>
</Carousel>
```

#### `Ellipsis` & `Highlight` & `Text` & `GradientText`

```vue
<!-- 文本省略与展开 -->
<Ellipsis :text="longArticleText" :line-clamp="2" expandable />

<!-- 关键词高亮 -->
<Highlight text="一览 UI 组件库已全面适配暗色模式" keyword="组件" />

<!-- 语义排版文本 -->
<Text type="success" strong>构建成功</Text>
<Text code>npm run build</Text>

<!-- 糖果渐变文字 -->
<GradientText type="candy" size="24">Luminous Productivity</GradientText>
```

#### `Time` & `CountDown`

```vue
<!-- 相对时间（自动显示为“刚刚”、“3分钟前”等） -->
<Time :time="lastUpdatedTime" type="relative" />

<!-- 毫秒级倒计时 -->
<CountDown :duration="3600 * 1000 * 24" format="DD天 HH:mm:ss" />
```

#### `Skeleton` (骨架屏)

```vue
<div v-if="loading" style="display: flex; gap: 12px;">
  <Skeleton circle height="44" width="44" />
  <div style="flex: 1;">
    <Skeleton height="18" width="40%" round />
    <Skeleton text :repeat="2" />
  </div>
</div>
```

#### `Code` & `Log` & `Thing` & `Equation`

```vue
<!-- 代码块展示 -->
<Code language="typescript" :code="codeString" show-line-numbers copyable />

<!-- 实时终端日志流 -->
<Log :logs="runtimeLogs" height="160px" auto-scroll />

<!-- 事物复合实体卡片 -->
<Thing avatar-text="YL" title="架构评审" description="负责人: 张三">
  <p>内容主体描述...</p>
</Thing>

<!-- 数学公式排版 -->
<Equation block>E = mc^2</Equation>
```

#### `Calendar` (月度排班日历)

```vue
<Calendar v-model="selectedDate">
  <template #date-cell="{ cell }">
    <Tag v-if="cell.day === 14" theme="purple">发版日</Tag>
  </template>
</Calendar>
```

---

### 3.5 反馈与弹层类 (Feedback)

#### `Modal` & `Drawer` & `ConfirmDialog`

```vue
<!-- 模态弹窗 -->
<Modal v-model="isModalOpen" title="编辑任务属性">
  <p>模态弹窗内容...</p>
  <template #footer>
    <Button variant="ghost" @click="isModalOpen = false">取消</Button>
    <Button variant="primary" @click="handleConfirm">保存</Button>
  </template>
</Modal>

<!-- 侧滑抽屉 -->
<Drawer v-model="isDrawerOpen" title="配置选项" placement="right" width="400px">
  抽屉内容...
</Drawer>
```

#### `Notice` (浮动通知卡片)

```vue
<Notice
  v-model:visible="isNoticeVisible"
  type="success"
  title="数据同步成功"
  description="看板任务已实时更新至本地离线存储。"
/>
```

#### `Popselect` (气泡选择)

```vue
<Popselect v-model="selectedEnv" :options="['开发环境', '预发测试', '生产部署']" filterable>
  <Button variant="secondary" icon="arrow_drop_down">切换环境</Button>
</Popselect>
```

#### `Tour` (新手漫游步骤引导)

```vue
<Tour
  v-model:visible="isTourActive"
  :steps="[
    { title: '看板工作区', description: '支持跨列自由拖拽流转。', target: '#kanban-board' },
    { title: '新建任务', description: '点击此按钮快速创建卡片。', target: '#create-btn' }
  ]"
  @finish="handleTourFinish"
/>
```

---

### 3.6 高级大数据交互组件 (Advanced)

#### `VirtualList` (高性能虚拟列表)

支持 10,000+ 条大数据毫秒级流畅渲染，按需计算 DOM，大幅降低内存消耗。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VirtualList, type VirtualListInstance } from 'feiyu-ui'

const listRef = ref<VirtualListInstance | null>(null)
const bigDataList = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, text: `Item #${i + 1}` }))

function jumpTo5000() {
  listRef.value?.scrollToIndex(4999)
}
</script>

<template>
  <VirtualList
    ref="listRef"
    :items="bigDataList"
    :item-size="44"
    :height="300"
    :buffer="6"
  >
    <template #default="{ item, index }">
      <div class="virtual-row">
        <span>#{{ index + 1 }}</span>
        <span>{{ item.text }}</span>
      </div>
    </template>
  </VirtualList>
</template>
```

#### `DataTable` (高级多维数据表格)

```vue
<DataTable
  :columns="[
    { type: 'selection', width: 48 },
    { key: 'name', title: '任务名称', minWidth: 160 },
    { key: 'status', title: '状态', width: 120 },
    { key: 'progress', title: '完成度', width: 140, sorter: true }
  ]"
  :data="tableData"
  v-model:checked-row-keys="selectedIds"
  :pagination="{ page: 1, pageSize: 10, total: 100 }"
>
  <template #status="{ row }">
    <Tag theme="green">{{ row.status }}</Tag>
  </template>
</DataTable>
```

#### `PageHeader` (对应 ElPageHeader)

```vue
<PageHeader
  title="返回"
  content="任务详情 · YL-2026"
  @back="router.back()"
/>
```

#### `Tree` & `TreeSelect` & `Transfer` & `Watermark`

```vue
<!-- 树形控件与树选择 -->
<Tree :data="treeData" checkable />
<TreeSelect v-model="selectedNode" :options="treeData" placeholder="选择关联节点" />

<!-- 穿梭框 -->
<Transfer v-model="selectedUsers" :options="allUsers" :titles="['待选人员', '已指派人员']" />

<!-- 水印防伪保护 -->
<Watermark content="YILAN-CONFIDENTIAL-2026">
  <div class="protected-content">安全内容区域</div>
</Watermark>
```

---

## 4. 本地离线运行保障

一览 (Yilan) 遵循纯本地无外部网络强依赖规则：
- **字体包**：`@fontsource/plus-jakarta-sans` 与 `@fontsource/noto-sans-sc`。
- **图标包**：`@fontsource-variable/material-symbols-outlined`。
- **无外网请求**：所有 CSS 字体与矢量字形均编译打包进本地产物中，在纯断网/内部隔离网络环境下均可 100% 渲染。

---

## 5. 组件工坊体验中心

运行本地开发服务器：
```bash
npm run dev
```
在浏览器中访问路由 `/components`（或通过导航栏「组件工坊」进入），即可实时操作、测试全套 70+ 组件在亮色/暗色模式下的各种形态与事件联动。
