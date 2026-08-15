# 非与 UI (Feiyu UI)全景文档中心 (Luminous UI)

> 欢迎查阅 **Luminous UI** 完整组件开发与 API 参考手册。  
> 本组件库基于 **Vue 3 (`<script setup lang="ts">`) + TypeScript 5 + Vite 8** 构建，遵循 **Luminous Productivity** 极简微质感毛玻璃设计系统，包含 70+ 个纯自研组件，零外部 CDN 依赖，纯离线可用。

---

## 📚 分模块开发文档索引

| 模块分类 | 包含组件 | 文档链接 |
| :--- | :--- | :---: |
| **01 按钮体系 (Button)** | `Button`, `ButtonGroup`, `FloatButton`, `FloatButtonGroup` | [01 按钮体系文档](./button.md) |
| **02 布局排版 (Layout)** | `Space`, `Flex`, `Divider`, `Grid`, `GridItem(Gi)`, `Row`, `Col`, `Split`, `Layout` (Header/Sider/Content/Footer) | [02 布局排版文档](./layout.md) |
| **03 表单录入 (Form)** | `Input`, `InputPassword`, `InputNumber`, `PinInput`, `Textarea`, `DynamicInput`, `Select`, `Radio`, `Checkbox`, `Switch`, `DatePicker`, `DateTimePicker`, `TimePicker`, `Slider`, `ColorPicker`, `Rate`, `Cascader`, `Mentions`, `Upload`, `Form`, `FormItem` | [03 表单录入文档](./form.md) |
| **04 数据展示 (Display)** | `Text`, `GradientText`, `Ellipsis`, `Highlight`, `Kbd`, `Code`, `Equation`, `Icon`, `Tag`, `Chip`, `Badge`, `Card`, `Thing`, `Avatar`, `AvatarGroup`, `List`, `ListItem`, `Descriptions`, `DescriptionsItem`, `Timeline`, `TimelineItem`, `Collapse`, `CollapseItem`, `Statistic`, `NumberAnimation`, `CountDown`, `Time`, `QRCode`, `Image`, `ImageGroup`, `Carousel`, `Skeleton`, `ProgressBar`, `Empty`, `InfiniteScroll`, `Log`, `Calendar`, `Segmented` | [04 数据展示文档](./display.md) |
| **05 导航联动 (Navigation)** | `Menu`, `MenuItem`, `SubMenu`, `MenuGroup`, `DropdownMenu`, `DropdownItem`, `Tabs`, `TabPane`, `Breadcrumb`, `BreadcrumbItem`, `Steps`, `Step`, `Pagination`, `Anchor`, `AnchorLink`, `Affix`, `BackTop` | [05 导航联动文档](./navigation.md) |
| **06 反馈弹层 (Feedback)** | `Modal`, `Drawer`, `ConfirmDialog`, `ToastHost`, `Notice`, `Tooltip`, `Popover`, `Popconfirm`, `Popselect`, `Alert`, `Spin`, `LoadingBar`, `Progress`, `Result`, `Tour` | [06 反馈弹层文档](./feedback.md) |
| **07 高级交互 (Advanced)** | `DataTable`, `VirtualList`, `Tree`, `TreeSelect`, `Transfer`, `AutoComplete`, `DynamicTags`, `Watermark` | [07 高级交互文档](./advanced.md) |

---

## 🚀 全局引入规范

所有组件统一从 `feiyu-ui` 收口引入，并自动导出对应的 TypeScript 类型：

```vue
<script setup lang="ts">
import {
  Button,
  Input,
  Modal,
  DataTable,
  VirtualList,
  type TableColumn,
  type VirtualListInstance
} from 'feiyu-ui'
</script>
```
