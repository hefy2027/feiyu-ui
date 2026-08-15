<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { FormItemContext } from './FormItem.vue'

export interface UploadFile {
  id: string
  name: string
  size?: number
  type?: string
  url?: string
  raw?: File
  status?: 'ready' | 'uploading' | 'success' | 'error'
  progress?: number
}

interface Props {
  modelValue?: UploadFile[]
  fileList?: UploadFile[]
  accept?: string
  multiple?: boolean
  drag?: boolean
  maxSize?: number // in MB
  maxCount?: number
  disabled?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  showFileList?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  fileList: undefined,
  accept: undefined,
  multiple: false,
  drag: false,
  maxSize: undefined,
  maxCount: undefined,
  disabled: false,
  listType: 'text',
  showFileList: true
})

const emit = defineEmits<{
  'update:modelValue': [files: UploadFile[]]
  'update:fileList': [files: UploadFile[]]
  'update:file-list': [files: UploadFile[]]
  change: [files: UploadFile[]]
  remove: [file: UploadFile]
  exceed: [files: File[]]
  error: [message: string]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const formItem = inject<FormItemContext | null>('fy-form-item', null)

const effectiveFiles = computed<UploadFile[]>(() => {
  return props.fileList !== undefined ? props.fileList : (props.modelValue || [])
})

function triggerUpload() {
  if (props.disabled) return
  fileInputRef.value?.click()
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  processFiles(Array.from(target.files))
  target.value = ''
}

function handleDrop(event: DragEvent) {
  if (props.disabled || !props.drag) return
  isDragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFiles(Array.from(event.dataTransfer.files))
  }
}

function handleDragOver(event: DragEvent) {
  if (props.disabled || !props.drag) return
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function processFiles(files: File[]) {
  if (props.maxCount && effectiveFiles.value.length + files.length > props.maxCount) {
    emit('exceed', files)
    emit('error', `最多只允许上传 ${props.maxCount} 个文件`)
    return
  }

  const newFiles: UploadFile[] = []

  for (const file of files) {
    if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
      emit('error', `文件「${file.name}」超出大小限制 (${props.maxSize} MB)`)
      continue
    }

    const id = 'f_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined

    newFiles.push({
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
      url,
      status: 'success',
      progress: 100
    })
  }

  const merged = props.multiple ? [...effectiveFiles.value, ...newFiles] : newFiles
  emit('update:modelValue', merged)
  emit('update:fileList', merged)
  emit('update:file-list', merged)
  emit('change', merged)
  formItem?.validate('change')
}

function removeFile(file: UploadFile) {
  if (props.disabled) return
  const updated = effectiveFiles.value.filter((f) => f.id !== file.id)
  if (file.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
  emit('update:modelValue', updated)
  emit('update:fileList', updated)
  emit('update:file-list', updated)
  emit('remove', file)
  emit('change', updated)
  formItem?.validate('change')
}
</script>

<template>
  <div :class="['fy-upload', { 'is-disabled': disabled }]">
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="fy-upload__native-input"
      @change="handleFileChange"
    />

    <!-- Drag & Drop Zone -->
    <div
      v-if="drag"
      :class="[
        'fy-upload__drag-area',
        {
          'is-dragover': isDragOver,
          'is-disabled': disabled
        }
      ]"
      @click="triggerUpload"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <slot name="drag">
        <div class="fy-upload__drag-content">
          <span class="material-symbols-outlined fy-upload__drag-icon">cloud_upload</span>
          <div class="fy-upload__drag-text">
            <span>点击或将文件拖拽到这里上传</span>
            <p v-if="accept || maxSize" class="fy-upload__drag-tip">
              <template v-if="accept">支持 {{ accept }} 格式</template>
              <template v-if="maxSize">，大小不超过 {{ maxSize }}MB</template>
            </p>
          </div>
        </div>
      </slot>
    </div>

    <!-- Default Trigger Slot -->
    <div v-else class="fy-upload__trigger" @click="triggerUpload">
      <slot>
        <button type="button" class="fy-upload__default-btn">
          <span class="material-symbols-outlined">attach_file</span>
          <span>选择文件</span>
        </button>
      </slot>
    </div>

    <!-- Uploaded File List -->
    <div v-if="showFileList && effectiveFiles.length > 0" class="fy-upload__file-list" :class="`fy-upload__file-list--${listType}`">
      <div
        v-for="file in effectiveFiles"
        :key="file.id"
        class="fy-upload__file-item"
      >
        <div class="fy-upload__file-info">
          <img
            v-if="file.url && file.type?.startsWith('image/')"
            :src="file.url"
            :alt="file.name"
            class="fy-upload__file-thumb"
          />
          <span v-else class="material-symbols-outlined fy-upload__file-icon">
            description
          </span>

          <div class="fy-upload__file-meta">
            <span class="fy-upload__file-name" :title="file.name">{{ file.name }}</span>
            <span v-if="file.size" class="fy-upload__file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>

        <button
          v-if="!disabled"
          type="button"
          class="fy-upload__file-remove"
          aria-label="删除文件"
          @click.stop="removeFile(file)"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fy-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  &__native-input {
    display: none;
  }

  &__trigger {
    display: inline-flex;
    cursor: pointer;
  }

  &__default-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 45%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 45%, transparent);
    color: var(--fy-on-surface);
    font-size: var(--fy-font-size-sm);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s var(--fy-ease-soft);

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 75%, transparent);
      border-color: color-mix(in srgb, var(--fy-primary) 50%, transparent);
    }

    .material-symbols-outlined {
      font-size: 18px;
    }
  }

  /* Drag & Drop Area */
  &__drag-area {
    border: 2px dashed color-mix(in srgb, var(--fy-outline-variant) 60%, transparent);
    border-radius: var(--fy-r-lg);
    padding: 28px 20px;
    background: color-mix(in srgb, var(--fy-surface-container-low) 50%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.22s var(--fy-ease-soft);

    &:hover:not(.is-disabled) {
      border-color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 6%, transparent);
    }

    &.is-dragover {
      border-color: var(--fy-primary);
      background: color-mix(in srgb, var(--fy-primary) 12%, transparent);
      transform: scale(0.99);
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__drag-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  &__drag-icon {
    font-size: 38px;
    color: var(--fy-primary);
  }

  &__drag-text {
    font-size: var(--fy-font-size-sm);
    font-weight: 700;
    color: var(--fy-on-surface);
  }

  &__drag-tip {
    font-size: var(--fy-font-size-xs);
    font-weight: 500;
    color: var(--fy-outline);
    margin-top: 4px;
  }

  /* File List */
  &__file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: var(--fy-r-md);
    background: color-mix(in srgb, var(--fy-surface-container-high) 35%, transparent);
    border: 1px solid color-mix(in srgb, var(--fy-outline-variant) 30%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: background 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-surface-container-high) 60%, transparent);
    }
  }

  &__file-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  &__file-thumb {
    width: 32px;
    height: 32px;
    border-radius: var(--fy-r-sm);
    object-fit: cover;
    flex-shrink: 0;
  }

  &__file-icon {
    font-size: 22px;
    color: var(--fy-outline);
    flex-shrink: 0;
  }

  &__file-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__file-name {
    font-size: var(--fy-font-size-sm);
    font-weight: 600;
    color: var(--fy-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__file-size {
    font-size: 11px;
    color: var(--fy-outline);
    font-weight: 500;
  }

  &__file-remove {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: none;
    background: transparent;
    color: var(--fy-outline);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--fy-error) 15%, transparent);
      color: var(--fy-error);
    }

    .material-symbols-outlined {
      font-size: 16px;
    }
  }
}
</style>
