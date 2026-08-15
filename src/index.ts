// Base Styles & Design Tokens
import '../styles/tokens.scss'
import '../styles/base.scss'
import type { App, Plugin } from 'vue'

// Base
import Button from './button/Button.vue'
import ButtonGroup from './button/ButtonGroup.vue'
import FloatButton from './button/FloatButton.vue'
import FloatButtonGroup from './button/FloatButtonGroup.vue'
import Link from './button/Link.vue'

export { Button, Button as FyButton }
export type { ButtonType, ButtonVariant, ButtonSize } from './button/Button.vue'
export { ButtonGroup, ButtonGroup as FyButtonGroup }
export { FloatButton, FloatButton as FyFloatButton }
export type { FloatButtonShape, FloatButtonType } from './button/FloatButton.vue'
export { FloatButtonGroup, FloatButtonGroup as FyFloatButtonGroup }
export { Link, Link as FyLink }
export type { LinkType } from './button/Link.vue'

// Layout
import Flex from './layout/Flex.vue'
import Space from './layout/Space.vue'
import Divider from './layout/Divider.vue'
import Grid from './layout/Grid.vue'
import GridItem from './layout/GridItem.vue'
import Row from './layout/Row.vue'
import Col from './layout/Col.vue'
import Layout from './layout/Layout.vue'
import LayoutHeader from './layout/LayoutHeader.vue'
import LayoutSider from './layout/LayoutSider.vue'
import LayoutContent from './layout/LayoutContent.vue'
import LayoutFooter from './layout/LayoutFooter.vue'
import Split from './layout/Split.vue'
import Scrollbar from './layout/Scrollbar.vue'

export { Flex, Flex as FyFlex }
export type { FlexJustify, FlexAlign } from './layout/Flex.vue'
export { Space, Space as FySpace }
export type { SpaceSize, SpaceAlign, SpaceJustify } from './layout/Space.vue'
export { Divider, Divider as FyDivider }
export type { DividerTitlePlacement } from './layout/Divider.vue'
export { Grid, Grid as FyGrid }
export type { GridContext } from './layout/Grid.vue'
export { GridItem, GridItem as FyGridItem, GridItem as Gi, GridItem as FyGi }
export { Row, Row as FyRow }
export type { RowJustify, RowAlign, RowContext } from './layout/Row.vue'
export { Col, Col as FyCol }
export type { ColResponsiveSize } from './layout/Col.vue'
export { Layout, Layout as FyLayout }
export { LayoutHeader, LayoutHeader as FyLayoutHeader }
export { LayoutSider, LayoutSider as FyLayoutSider }
export { LayoutContent, LayoutContent as FyLayoutContent }
export { LayoutFooter, LayoutFooter as FyLayoutFooter }
export { Split, Split as FySplit }
export { Scrollbar, Scrollbar as FyScrollbar }

// Form & Input
import Input from './form/Input.vue'
import InputPassword from './form/InputPassword.vue'
import InputNumber from './form/InputNumber.vue'
import PinInput from './form/PinInput.vue'
import Textarea from './form/Textarea.vue'
import DynamicInput from './form/DynamicInput.vue'
import Option from './form/Option.vue'
import OptionGroup from './form/OptionGroup.vue'
import Select from './form/Select.vue'
import Radio from './form/Radio.vue'
import RadioGroup from './form/RadioGroup.vue'
import Checkbox from './form/Checkbox.vue'
import CheckboxGroup from './form/CheckboxGroup.vue'
import RadioButton from './form/RadioButton.vue'
import CheckboxButton from './form/CheckboxButton.vue'
import Switch from './form/Switch.vue'
import Upload from './form/Upload.vue'
import Form from './form/Form.vue'
import FormItem from './form/FormItem.vue'
import DatePicker from './form/DatePicker.vue'
import DateTimePicker from './form/DateTimePicker.vue'
import TimePicker from './form/TimePicker.vue'
import TimeSelect from './form/TimeSelect.vue'
import Slider from './form/Slider.vue'
import ColorPicker from './form/ColorPicker.vue'
import Rate from './form/Rate.vue'
import Cascader from './form/Cascader.vue'
import Mentions from './form/Mentions.vue'

export { Input, Input as FyInput }
export { InputPassword, InputPassword as FyInputPassword }
export { InputNumber, InputNumber as FyInputNumber }
export { PinInput, PinInput as FyPinInput }
export type { PinInputProps, PinInputSize, PinInputType, PinInputStatus } from './form/PinInput.vue'
export { Textarea, Textarea as FyTextarea }
export type { AutoSizeType } from './form/Textarea.vue'
export { DynamicInput, DynamicInput as FyDynamicInput }
export { Option, Option as FyOption }
export { OptionGroup, OptionGroup as FyOptionGroup }
export { Select, Select as FySelect }
export type { SelectOption } from './form/Select.vue'
export { Radio, Radio as FyRadio }
export { RadioGroup, RadioGroup as FyRadioGroup }
export type { RadioOption } from './form/RadioGroup.vue'
export { Checkbox, Checkbox as FyCheckbox }
export { CheckboxGroup, CheckboxGroup as FyCheckboxGroup }
export type { CheckboxOption } from './form/CheckboxGroup.vue'
export { RadioButton, RadioButton as FyRadioButton }
export { CheckboxButton, CheckboxButton as FyCheckboxButton }
export { Switch, Switch as FySwitch }
export { Upload, Upload as FyUpload }
export type { UploadFile } from './form/Upload.vue'
export { Form, Form as FyForm }
export type { FormRule, FormContext, FormItemInstance } from './form/Form.vue'
export { FormItem, FormItem as FyFormItem }
export type { FormItemContext } from './form/FormItem.vue'
export { DatePicker, DatePicker as FyDatePicker }
export type { DatePickerType, DatePreset } from './form/DatePicker.vue'
export { DateTimePicker, DateTimePicker as FyDateTimePicker }
export type { DateTimePreset } from './form/DateTimePicker.vue'
export { TimePicker, TimePicker as FyTimePicker }
export { TimeSelect, TimeSelect as FyTimeSelect }
export { Slider, Slider as FySlider }
export { ColorPicker, ColorPicker as FyColorPicker }
export { Rate, Rate as FyRate }
export { Cascader, Cascader as FyCascader }
export type { CascaderOption } from './form/Cascader.vue'
export { Mentions, Mentions as FyMentions }
export type { MentionOption } from './form/Mentions.vue'

// Feedback & Overlays
import Modal from './feedback/Modal.vue'
import Dialog from './feedback/Dialog.vue'
import Drawer from './feedback/Drawer.vue'
import ConfirmDialog from './feedback/ConfirmDialog.vue'
import Tooltip from './feedback/Tooltip.vue'
import Popover from './feedback/Popover.vue'
import Popconfirm from './feedback/Popconfirm.vue'
import Popselect from './feedback/Popselect.vue'
import Alert from './feedback/Alert.vue'
import Spin from './feedback/Spin.vue'
import Result from './feedback/Result.vue'
import Notice from './feedback/Notice.vue'
import LoadingBar from './feedback/LoadingBar.vue'
import Tour from './feedback/Tour.vue'
import Progress from './feedback/Progress.vue'
import Message from './feedback/Message.vue'
import ToastHost from './feedback/ToastHost.vue'

export { Modal, Modal as FyModal }
export { Dialog, Dialog as FyDialog }
export type { DialogProps } from './feedback/Dialog.vue'
export { Drawer, Drawer as FyDrawer }
export { ConfirmDialog, ConfirmDialog as FyConfirmDialog }
export { Tooltip, Tooltip as FyTooltip }
export { Popover, Popover as FyPopover }
export type { PopoverPlacement, PopoverTrigger } from './feedback/Popover.vue'
export { Popconfirm, Popconfirm as FyPopconfirm }
export type { PopconfirmPlacement } from './feedback/Popconfirm.vue'
export { Popselect, Popselect as FyPopselect }
export type { PopselectOption } from './feedback/Popselect.vue'
export { Alert, Alert as FyAlert }
export type { AlertType } from './feedback/Alert.vue'
export { Spin, Spin as FySpin }
export { Result, Result as FyResult }
export type { ResultStatus } from './feedback/Result.vue'
export { Notice, Notice as FyNotice }
export type { NoticeType } from './feedback/Notice.vue'
export { LoadingBar, LoadingBar as FyLoadingBar }
export { Tour, Tour as FyTour }
export type { TourStep } from './feedback/Tour.vue'
export { Progress, Progress as FyProgress }
export type { ProgressType, ProgressStatus } from './feedback/Progress.vue'
export { Message, Message as FyMessage }
export { message } from './feedback/message'
export type { MessageType, MessageProps } from './feedback/Message.vue'
export type { MessageOptions, MessageInstance } from './feedback/message'
export { ToastHost, ToastHost as FyToastHost }

// Navigation
import Menu from './navigation/Menu.vue'
import MenuItem from './navigation/MenuItem.vue'
import SubMenu from './navigation/SubMenu.vue'
import MenuGroup from './navigation/MenuGroup.vue'
import DropdownMenu from './navigation/DropdownMenu.vue'
import DropdownItem from './navigation/DropdownItem.vue'
import Tabs from './navigation/Tabs.vue'
import TabPane from './navigation/TabPane.vue'
import Breadcrumb from './navigation/Breadcrumb.vue'
import BreadcrumbItem from './navigation/BreadcrumbItem.vue'
import Steps from './navigation/Steps.vue'
import Step from './navigation/Step.vue'
import Affix from './navigation/Affix.vue'
import BackTop from './navigation/BackTop.vue'
import Anchor from './navigation/Anchor.vue'
import AnchorLink from './navigation/AnchorLink.vue'
import PageHeader from './navigation/PageHeader.vue'
import Pagination from './navigation/Pagination.vue'

export { Menu, Menu as FyMenu }
export type { MenuContext } from './navigation/Menu.vue'
export { MenuItem, MenuItem as FyMenuItem }
export { SubMenu, SubMenu as FySubMenu }
export { MenuGroup, MenuGroup as FyMenuGroup }
export { DropdownMenu, DropdownMenu as FyDropdownMenu }
export type { DropdownMenuItem } from './navigation/DropdownMenu.vue'
export { DropdownItem, DropdownItem as FyDropdownItem }
export { Tabs, Tabs as FyTabs }
export type { TabItem } from './navigation/Tabs.vue'
export { TabPane, TabPane as FyTabPane }
export { Breadcrumb, Breadcrumb as FyBreadcrumb }
export type { BreadcrumbContext } from './navigation/Breadcrumb.vue'
export { BreadcrumbItem, BreadcrumbItem as FyBreadcrumbItem }
export { Steps, Steps as FySteps }
export type { StepsStatus, StepsContext } from './navigation/Steps.vue'
export { Step, Step as FyStep }
export { Affix, Affix as FyAffix }
export { BackTop, BackTop as FyBackTop }
export { Anchor, Anchor as FyAnchor }
export type { AnchorContext } from './navigation/Anchor.vue'
export { AnchorLink, AnchorLink as FyAnchorLink }
export { PageHeader, PageHeader as FyPageHeader }
export { Pagination, Pagination as FyPagination }

// Data Display
import Card from './display/Card.vue'
import Avatar from './display/Avatar.vue'
import AvatarGroup from './display/AvatarGroup.vue'
import Tag from './display/Tag.vue'
import Chip from './display/Chip.vue'
import CheckTag from './display/CheckTag.vue'
import ProgressBar from './display/ProgressBar.vue'
import Badge from './display/Badge.vue'
import Empty from './display/Empty.vue'
import Timeline from './display/Timeline.vue'
import TimelineItem from './display/TimelineItem.vue'
import Statistic from './display/Statistic.vue'
import Collapse from './display/Collapse.vue'
import CollapseItem from './display/CollapseItem.vue'
import Descriptions from './display/Descriptions.vue'
import DescriptionsItem from './display/DescriptionsItem.vue'
import List from './display/List.vue'
import ListItem from './display/ListItem.vue'
import NumberAnimation from './display/NumberAnimation.vue'
import GradientText from './display/GradientText.vue'
import QRCode from './display/QRCode.vue'
import ImageViewer from './display/ImageViewer.vue'
import CarouselItem from './display/CarouselItem.vue'
import Carousel from './display/Carousel.vue'
import Skeleton from './display/Skeleton.vue'
import Image from './display/Image.vue'
import ImageGroup from './display/ImageGroup.vue'
import Segmented from './display/Segmented.vue'
import Text from './display/Text.vue'
import Time from './display/Time.vue'
import Code from './display/Code.vue'
import Thing from './display/Thing.vue'
import InfiniteScroll from './display/InfiniteScroll.vue'
import Log from './display/Log.vue'
import Equation from './display/Equation.vue'
import Ellipsis from './display/Ellipsis.vue'
import Icon from './display/Icon.vue'
import CountDown from './display/CountDown.vue'
import Highlight from './display/Highlight.vue'
import Kbd from './display/Kbd.vue'
import Calendar from './display/Calendar.vue'
import Marquee from './display/Marquee.vue'
import Heatmap from './display/Heatmap.vue'

export { Card, Card as FyCard }
export { Avatar, Avatar as FyAvatar }
export { AvatarGroup, AvatarGroup as FyAvatarGroup }
export { Tag, Tag as FyTag }
export { Chip, Chip as FyChip }
export { CheckTag, CheckTag as FyCheckTag }
export type { CheckTagType } from './display/CheckTag.vue'
export { ProgressBar, ProgressBar as FyProgressBar }
export type { ProgressBarStatus } from './display/ProgressBar.vue'
export { Badge, Badge as FyBadge }
export type { BadgeType } from './display/Badge.vue'
export { Empty, Empty as FyEmpty }
export { Timeline, Timeline as FyTimeline }
export type { TimelineContext } from './display/Timeline.vue'
export { TimelineItem, TimelineItem as FyTimelineItem }
export type { TimelineItemType } from './display/TimelineItem.vue'
export { Statistic, Statistic as FyStatistic }
export { Collapse, Collapse as FyCollapse }
export type { CollapseContext } from './display/Collapse.vue'
export { CollapseItem, CollapseItem as FyCollapseItem }
export { Descriptions, Descriptions as FyDescriptions }
export type { DescriptionsContext } from './display/Descriptions.vue'
export { DescriptionsItem, DescriptionsItem as FyDescriptionsItem }
export { List, List as FyList }
export { ListItem, ListItem as FyListItem }
export { NumberAnimation, NumberAnimation as FyNumberAnimation }
export { GradientText, GradientText as FyGradientText }
export type { GradientType } from './display/GradientText.vue'
export { QRCode, QRCode as FyQRCode }
export { ImageViewer, ImageViewer as FyImageViewer }
export { CarouselItem, CarouselItem as FyCarouselItem }
export { Carousel, Carousel as FyCarousel }
export { Skeleton, Skeleton as FySkeleton }
export { Image, Image as FyImage }
export { ImageGroup, ImageGroup as FyImageGroup }
export type { ImageItem, ImageGroupContext } from './display/ImageGroup.vue'
export { Segmented, Segmented as FySegmented }
export type { SegmentedOption } from './display/Segmented.vue'
export { Text, Text as FyText }
export type { TextType, TextDepth } from './display/Text.vue'
export { Time, Time as FyTime }
export { Code, Code as FyCode }
export { Thing, Thing as FyThing }
export { InfiniteScroll, InfiniteScroll as FyInfiniteScroll }
export { Log, Log as FyLog }
export type { LogLevel, LogItem } from './display/Log.vue'
export { Equation, Equation as FyEquation }
export { Ellipsis, Ellipsis as FyEllipsis }
export { Icon, Icon as FyIcon }
export { CountDown, CountDown as FyCountDown }
export { Highlight, Highlight as FyHighlight }
export { Kbd, Kbd as FyKbd }
export { Calendar, Calendar as FyCalendar }
export { Marquee, Marquee as FyMarquee }
export type { MarqueeDirection } from './display/Marquee.vue'
export { Heatmap, Heatmap as FyHeatmap }
export type { HeatmapItem } from './display/Heatmap.vue'

// Advanced Components
import Transfer from './advanced/Transfer.vue'
import DataTable from './advanced/DataTable.vue'
import TableColumn from './advanced/TableColumn.vue'
import Tree from './advanced/Tree.vue'
import TreeSelect from './advanced/TreeSelect.vue'
import AutoComplete from './advanced/AutoComplete.vue'
import DynamicTags from './advanced/DynamicTags.vue'
import Watermark from './advanced/Watermark.vue'
import VirtualList from './advanced/VirtualList.vue'

export { Transfer, Transfer as FyTransfer }
export type { TransferOption, TransferProps } from './advanced/Transfer.vue'
export { DataTable, DataTable as FyDataTable }
export type { DataTableProps, TableColumn as DataTableColumn, TableColumnProps, TablePaginationConfig, TableSortOrder, TableSpanMethod, TableSummaryMethod, SpanMethodResult } from './advanced/DataTable.vue'
export { TableColumn, TableColumn as FyTableColumn }
export type { TableColumnProps as TableColumnItemProps } from './advanced/TableColumn.vue'
export { Tree, Tree as FyTree }
export type { TreeOption, TreeProps } from './advanced/Tree.vue'
export { TreeSelect, TreeSelect as FyTreeSelect }
export type { TreeSelectProps } from './advanced/TreeSelect.vue'
export { AutoComplete, AutoComplete as FyAutoComplete }
export type { AutoCompleteOption, AutoCompleteProps } from './advanced/AutoComplete.vue'
export { DynamicTags, DynamicTags as FyDynamicTags }
export type { DynamicTagsProps } from './advanced/DynamicTags.vue'
export { Watermark, Watermark as FyWatermark }
export type { WatermarkProps } from './advanced/Watermark.vue'
export { VirtualList, VirtualList as FyVirtualList }
export type { VirtualListInstance, VirtualListProps } from './advanced/VirtualList.vue'

const components: Record<string, any> = {
  Button,
  ButtonGroup,
  FloatButton,
  FloatButtonGroup,
  Link,
  Flex,
  Space,
  Divider,
  Grid,
  GridItem,
  Row,
  Col,
  Layout,
  LayoutHeader,
  LayoutSider,
  LayoutContent,
  LayoutFooter,
  Split,
  Scrollbar,
  Input,
  InputPassword,
  InputNumber,
  PinInput,
  Textarea,
  DynamicInput,
  Option,
  OptionGroup,
  Select,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  RadioButton,
  CheckboxButton,
  Switch,
  Upload,
  Form,
  FormItem,
  DatePicker,
  DateTimePicker,
  TimePicker,
  TimeSelect,
  Slider,
  ColorPicker,
  Rate,
  Cascader,
  Mentions,
  Modal,
  Dialog,
  Drawer,
  ConfirmDialog,
  Tooltip,
  Popover,
  Popconfirm,
  Popselect,
  Alert,
  Spin,
  Result,
  Notice,
  LoadingBar,
  Tour,
  Progress,
  Message,
  ToastHost,
  Menu,
  MenuItem,
  SubMenu,
  MenuGroup,
  DropdownMenu,
  DropdownItem,
  Tabs,
  TabPane,
  Breadcrumb,
  BreadcrumbItem,
  Steps,
  Step,
  Affix,
  BackTop,
  Anchor,
  AnchorLink,
  PageHeader,
  Pagination,
  Card,
  Avatar,
  AvatarGroup,
  Tag,
  Chip,
  CheckTag,
  ProgressBar,
  Badge,
  Empty,
  Timeline,
  TimelineItem,
  Statistic,
  Collapse,
  CollapseItem,
  Descriptions,
  DescriptionsItem,
  List,
  ListItem,
  NumberAnimation,
  GradientText,
  QRCode,
  ImageViewer,
  CarouselItem,
  Carousel,
  Skeleton,
  Image,
  ImageGroup,
  Segmented,
  Text,
  Time,
  Code,
  Thing,
  InfiniteScroll,
  Log,
  Equation,
  Ellipsis,
  Icon,
  CountDown,
  Highlight,
  Kbd,
  Calendar,
  Marquee,
  Heatmap,
  Transfer,
  DataTable,
  TableColumn,
  Tree,
  TreeSelect,
  AutoComplete,
  DynamicTags,
  Watermark,
  VirtualList
}

export const installer: Plugin = {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
      app.component(`Fy${name}`, component)
    })
  }
}

export default installer

// Types
export * from './types'
