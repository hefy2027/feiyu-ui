# 03 / 表单与数据录入组件 (Form & Inputs)

本模块包含：`Form` & `FormItem`（规则校验表单）、`Input`（文本框）、`InputPassword`（密码框）、`InputNumber`（数字步进）、`PinInput`（验证码格）、`Textarea`（多行文本域）、`DynamicInput`（动态行输入）、`Select` & `Option` & `OptionGroup`（下拉选项与分组）、`Radio` & `RadioGroup` & `RadioButton`（单选胶囊与按钮）、`Checkbox` & `CheckboxGroup` & `CheckboxButton`（多选框与按钮）、`Switch`（开关）、`DatePicker`（日期选择）、`DateTimePicker`（日期时间选择）、`TimePicker`（时间选择）、`TimeSelect`（固定时间点选择）、`Slider`（滑块）、`ColorPicker`（拾色器）、`Rate`（评分）、`Cascader`（级联选择）、`Mentions`（提及）、`Upload`（上传）。

---

## 1. Input 基础文本框

### 代码用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Input } from 'feiyu-ui'

const keyword = ref('')
</script>

<template>
  <Input
    v-model="keyword"
    placeholder="搜索任务..."
    prefix-icon="search"
    kbd="⌘K"
    clearable
    block
  />
</template>
```

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string \| number` | `''` | 绑定输入值 |
| `type` | `string` | `'text'` | 原生 input 类型（如 text, number 等） |
| `placeholder` | `string` | `''` | 占位文本 |
| `prefixIcon` | `string` | `undefined` | 前缀图标名称 |
| `suffixIcon` | `string` | `undefined` | 后缀图标名称 |
| `clearable` | `boolean` | `false` | 是否显示一键清空按钮 |
| `kbd` | `string` | `undefined` | 右侧快捷键徽标文案（如 `⌘K`） |
| `disabled` | `boolean` | `false` | 是否禁用输入 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 控件尺寸 |
| `block` | `boolean` | `false` | 是否宽度撑满 100% |

---

## 2. InputNumber 数字输入器

支持步进加减、小数精度控制以及两侧对称或右侧堆叠两种控制布局。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `number \| null` | `null` | 当前绑定的数值 |
| `min` | `number` | `-Infinity` | 允许输入的最小值 |
| `max` | `number` | `Infinity` | 允许输入的最大值 |
| `step` | `number` | `1` | 每次加减步进值 |
| `precision` | `number` | `undefined` | 限制保留的小数位数 |
| `controlsPosition` | `'both-sides' \| 'right'` | `'right'` | 控制按钮布局方式 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |

---

## 3. PinInput 验证码 / PIN 输入格

分格式验证码方格输入组件，支持自动聚焦下一格、退格自动回退、剪贴板一键粘贴拆分填充。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string` | `''` | 绑定字符值 |
| `length` | `number` | `6` | 方格位数（常用 4 或 6 位验证码） |
| `type` | `'text' \| 'number' \| 'password' \| 'alphanumeric'` | `'number'` | 字符类型过滤 |
| `inputmode` | `'text' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'` | `undefined` | 虚拟键盘输入模式（默认根据 type 自动识别） |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `autoFocus` / `autofocus` | `boolean` | `false` | 是否挂载时自动聚焦第一格 |
| `mask` | `boolean \| string` | `false` | 掩码模式（`true` 显示密码点，也可传入自定义字符如 `•` 或 `*`） |
| `placeholder` | `string` | `'○'` | 空白占位符 |
| `uppercase` | `boolean` | `false` | 字母是否自动转大写 |
| `separator` | `string` | `''` | 分组分隔符（如 `-`） |
| `groupSize` | `number` | `undefined` | 每几位插入一次分隔符（如 3 代表 3-3 分组） |
| `separatorIndex` | `number \| number[]` | `undefined` | 指定在第几格后插入分隔符 |
| `gap` | `number \| string` | `undefined` | 方格之间的自定义间距 |
| `status` | `'error' \| 'warning' \| 'success'` | `undefined` | 校验状态边框色彩 |
| `block` | `boolean` | `false` | 是否撑满父容器宽度 |

### Events 事件与 Slots 插槽

- **Events**:
  - `@complete="(val: string) => void"`: 全部格子填满时触发
  - `@change="(val: string) => void"` / `@input="(val: string) => void"` / `@update:modelValue`: 值变动时触发
  - `@focus="(e, index) => void"` / `@blur="(e, index) => void"`: 单个格子的聚焦/失焦
  - `@clear="() => void"`: 清空时触发
- **Slots**:
  - `#separator="{ index }"`: 自定义分隔符插槽

---

## 4. Textarea 多行文本域

支持 `auto-size` 自适应高度与 `maxlength` 实时字数限制统计。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string` | `''` | 绑定的文本内容 |
| `placeholder` | `string` | `''` | 占位描述 |
| `rows` | `number` | `3` | 默认初始行数 |
| `maxlength` | `number` | `undefined` | 允许输入的最大字符数 |
| `showCount` | `boolean` | `false` | 是否显示右下角字数统计 |
| `autoSize` | `boolean \| { minRows?: number, maxRows?: number }` | `false` | 自适应高度配置 |
| `clearable` | `boolean` | `false` | 是否允许一键清空 |

---

## 5. DynamicInput 动态输入列表

用于动态增减任意行数的需求或配置项列表。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string[]` | `['']` | 绑定的字符串列表 |
| `min` | `number` | `1` | 允许的最少项数 |
| `max` | `number` | `Infinity` | 允许的最大项数 |
| `createButtonText` | `string` | `'添加一项'` | 底部新增按钮文案 |

---

## 6. DateTimePicker 日期时间复合选择器

支持日历网格选择与时分秒独立列协同联动选择。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string` | `''` | 绑定的日期时间字符串 (格式如 `YYYY-MM-DD HH:mm:ss`) |
| `placeholder` | `string` | `'选择日期与时间'` | 占位文案 |
| `showSeconds` | `boolean` | `true` | 是否展示秒钟列 |
| `clearable` | `boolean` | `true` | 是否允许一键清空 |
| `disabled` | `boolean` | `false` | 是否禁用选择 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |

---

## 7. Form & FormItem 表单容器与校验

通过 `rules` 传入异步校验规则，支持 `validate()` 方法触发整表校验。

---

## 8. TimeSelect 固定时间点下拉选择 (对应 ElTimeSelect)

按设定固定时间步长生成下拉时刻候选项（如 08:30 到 18:30 每 30 分钟一个选项）。

### Props 属性

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `modelValue` | `string` | `''` | 绑定时间字符串 |
| `start` | `string` | `'09:00'` | 起始时刻 |
| `end` | `string` | `'18:00'` | 结束时刻 |
| `step` | `string` | `'00:30'` | 间隔步长 |
| `minTime` | `string` | `undefined` | 最小可选时刻限制 |
| `maxTime` | `string` | `undefined` | 最大可选时刻限制 |
| `clearable` | `boolean` | `true` | 是否支持一键清空 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |

---

## 9. RadioButton & CheckboxButton (单选/多选按钮组)

融入 `RadioGroup` 或 `CheckboxGroup` 容器中使用的按钮外观交互组件。

### 代码用法

```vue
<template>
  <!-- 单选按钮 -->
  <RadioGroup v-model="tabView">
    <RadioButton value="day">日视图</RadioButton>
    <RadioButton value="week">周视图</RadioButton>
    <RadioButton value="month">月视图</RadioButton>
  </RadioGroup>

  <!-- 多选按钮 -->
  <CheckboxGroup v-model="selectedTools">
    <CheckboxButton value="vue">Vue 3</CheckboxButton>
    <CheckboxButton value="vite">Vite 8</CheckboxButton>
  </CheckboxGroup>
</template>
```
