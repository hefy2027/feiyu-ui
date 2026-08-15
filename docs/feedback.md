# 06 / 反馈、弹层与引导组件 (Feedback)

本模块包含：`Message` / `message`（全局顶部消息）、`Modal`（模态弹窗）、`Drawer`（抽屉）、`ConfirmDialog`（确认弹窗）、`ToastHost`（全局轻提示）、`Notice`（浮动通知卡片）、`Tooltip`（文字提示）、`Popover`（弹出卡片）、`Popconfirm`（气泡确认）、`Popselect`（气泡选择）、`Alert`（警告提示）、`Spin`（加载遮罩）、`LoadingBar`（顶部加载条）、`Progress`（环形/仪表盘进度）、`Result`（结果页）、`Tour`（漫游引导）。

---

## 0. Message 全局顶部消息提示

常用于页面顶部的轻量级操作反馈（成功、提示、警告、失败、加载中），支持声明式标签与编程式单例调用（`message.success` 等）。

### 编程式调用用法

```ts
import { message } from 'feiyu-ui'

// 基础调用
message.info('普通信息提示')
message.success('操作执行成功！')
message.warning('请注意检查表单项')
message.error('网络连接超时')

// 加载中状态与关闭
const hide = message.loading('正在同步远程数据...', { duration: 0 })
setTimeout(() => {
  hide.close()
  message.success('同步完成！')
}, 2000)
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `type` | `'info' \| 'success' \| 'warning' \| 'error' \| 'loading'` | `'info'` | 消息类型 |
| `content` | `string` | `''` | 消息文本内容 |
| `duration` | `number` | `3000` | 显示时长（毫秒），设为 `0` 则不自动关闭 |
| `closable` | `boolean` | `false` | 是否显示右侧手动关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否显示类型前缀图标 |
| `icon` | `string` | `undefined` | 自定义 Material 图标名称 |
| `onClose` | `() => void` | `undefined` | 消息关闭时的回调函数 |

---

## 1. Modal 模态弹窗

提供高斯毛玻璃遮罩、ESC 键监听、入场弹跳动效的对话框。

### 代码用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button } from 'feiyu-ui'

const isModalOpen = ref(false)
</script>

<template>
  <Button variant="primary" @click="isModalOpen = true">打开弹窗</Button>

  <Modal
    v-model="isModalOpen"
    title="新建项目工单"
    width="520px"
    @close="isModalOpen = false"
  >
    <p>弹窗主体内容...</p>
    <template #footer>
      <Button variant="ghost" @click="isModalOpen = false">取消</Button>
      <Button variant="primary" @click="isModalOpen = false">确定</Button>
    </template>
  </Modal>
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `boolean` | `false` | 控制弹窗显示与隐藏 |
| `title` | `string` | `''` | 弹窗标题 |
| `width` | `string` | `'520px'` | 弹窗宽度 |
| `maskClosable` | `boolean` | `true` | 点击遮罩层是否允许关闭 |
| `closable` | `boolean` | `true` | 是否显示右上角关闭 X 按钮 |

---

## 2. Notice 浮动通知卡片

常驻于屏幕右上角的微质感通知浮层，支持标题、多行描述、倒计时自动关闭与操作插槽。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `visible` | `boolean` | `true` | 是否显示 |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 通知类型与左侧饰条颜色 |
| `title` | `string` | `''` | 标题 |
| `description` | `string` | `''` | 描述文案 |
| `duration` | `number` | `4500` | 自动关闭延时毫秒（0 代表不自动关闭） |
| `closable` | `boolean` | `true` | 是否显示关闭叉号 |

---

## 3. Popselect 气泡快捷选择器

基于 Popover 实现的快捷小巧下拉选项卡。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number \| (string \| number)[]` | `undefined` | 当前选中值 |
| `options` | `Array<string \| number \| PopselectOption>` | `[]` | 选项列表 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `filterable` | `boolean` | `false` | 是否支持关键词过滤搜索 |

---

## 4. Tour 沉浸式新手引导漫游

对目标 DOM 元素进行 Spotlight 聚光灯聚焦，按步骤指引用户上手。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `visible` | `boolean` | `false` | 是否开启引导 |
| `steps` | `TourStep[]` | `[]` | 步骤数组（包含 title, description, target） |
| `current` | `number` | `0` | 当前步骤索引 |

---

## 5. LoadingBar 顶部微进度条

用于路由跳转或异步大任务期间在屏幕最顶端展示的发光极细进度条。

### Expose 暴露方法

| 方法名 | 说明 |
| :--- | :--- |
| `start()` | 开启平滑加载进度动画 |
| `finish()` | 进度达到 100% 并渐隐 |
| `error()` | 变红显示错误并消失 |

---

## 6. Spin 加载遮罩

支持局部容器包裹加载或整页 Loading 遮罩。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `show` | `boolean` | `false` | 是否开启加载遮罩 |
| `description` | `string` | `''` | 加载提示文本 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 旋转图标尺寸 |

---

## 7. Drawer 侧滑抽屉 (对应 ElDrawer)

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `boolean` | `false` | 控制抽屉开启/关闭 |
| `title` | `string` | `''` | 抽屉标题 |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 滑出方位 |
| `width` | `string` | `'400px'` | 抽屉宽度（左右滑出时生效） |
| `maskClosable` | `boolean` | `true` | 是否允许点击遮罩关闭 |

---

## 8. ConfirmDialog 二次确认对话框 (对应 ElMessageBox.confirm)

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `boolean` | `false` | 是否显示确认弹窗 |
| `title` | `string` | `'请确认'` | 提示标题 |
| `content` | `string` | `''` | 提示正文描述 |
| `type` | `'warning' \| 'danger' \| 'info'` | `'warning'` | 警示类型与图标色彩 |
| `confirmText` | `string` | `'确定'` | 确认按钮文案 |
| `cancelText` | `string` | `'取消'` | 取消按钮文案 |

---

## 9. Popconfirm 气泡确认框 (对应 ElPopconfirm)

```vue
<template>
  <Popconfirm
    title="确定删除此项任务吗？"
    positive-text="确认删除"
    negative-text="取消"
    @positive-click="handleDelete"
  >
    <Button variant="danger">删除</Button>
  </Popconfirm>
</template>
```
