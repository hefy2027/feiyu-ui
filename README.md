# Feiyu UI (非与 UI)

> 现代、糖果色调、微质感毛玻璃与现代极简风格的 Vue 3 组件库。

[![npm version](https://img.shields.io/npm/v/feiyu-ui.svg)](https://www.npmjs.com/package/feiyu-ui)
[![license](https://img.shields.io/npm/l/feiyu-ui.svg)](https://github.com/hefy2027/feiyu-ui/blob/main/LICENSE)

---

## ✨ 特性

- 🍬 **Luminous Productivity 设计语言**：糖果柔和色调、微质感毛玻璃、极简现代。
- ⚡ **Vue 3 + TypeScript**：全面采用 `<script setup lang="ts">` 和严格类型声明。
- 🌲 **极致 Tree-shaking**：支持按需引入组件，零冗余开销。
- 🎨 **设计 Token 深度定制**：所有色彩与表面层级基于 CSS 自定义变量，轻松支持亮暗色模式和一键换肤。
- 📦 **开箱即用**：包含 60+ 丰富组件（基础按钮、表单录入、弹窗反馈、导航布局、数据展示、高级表格树形控件等）。

---

## 📦 安装

```bash
# npm
npm install feiyu-ui

# pnpm
pnpm add feiyu-ui

# yarn
yarn add feiyu-ui
```

---

## 🚀 快速上手

### 1. 引入样式与组件

```ts
import { createApp } from 'vue'
import App from './App.vue'

// 引入样式
import 'feiyu-ui/styles'

const app = createApp(App)
app.mount('#app')
```

### 2. 在组件中直接使用

```vue
<script setup lang="ts">
import { Button, Input, Card, Modal, message } from 'feiyu-ui'

function handleClick() {
  message.success('操作成功！')
}
</script>

<template>
  <Card title="欢迎使用 Feiyu UI" hoverable>
    <Input placeholder="请输入内容..." />
    <Button variant="primary" @click="handleClick">提交</Button>
  </Card>
</template>
```

---

## 📄 开源协议

[MIT License](LICENSE) © 2026 [Feiyu (hefy2027)](https://github.com/hefy2027)
