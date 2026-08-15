<script setup lang="ts">
import Modal from './Modal.vue'
import Button from '../button/Button.vue'

interface Props {
  modelValue: boolean
  title?: string
  content?: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  loading?: boolean
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  content: '',
  type: 'warning',
  confirmText: '确认',
  cancelText: '取消',
  loading: false,
  width: '420px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:modelValue', false)
  emit('cancel')
  emit('close')
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    :title="title || '提示'"
    :width="width"
    @update:model-value="emit('update:modelValue', $event)"
    @close="handleCancel"
  >
    <div class="ui-confirm">
      <div :class="['ui-confirm__icon-wrap', `ui-confirm__icon-wrap--${type}`]">
        <span class="material-symbols-outlined">
          {{
            type === 'danger'
              ? 'error'
              : type === 'warning'
                ? 'warning'
                : type === 'success'
                  ? 'check_circle'
                  : 'info'
          }}
        </span>
      </div>

      <div class="ui-confirm__message">
        <slot>{{ content }}</slot>
      </div>
    </div>

    <template #footer>
      <Button variant="ghost" :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </Button>
      <Button
        :variant="type === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </Button>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.ui-confirm {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 4px 0 8px;

  &__icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: var(--r-md);
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--danger {
      background: color-mix(in srgb, var(--error) 15%, transparent);
      color: var(--error);
    }

    &--warning {
      background: color-mix(in srgb, var(--status-review) 15%, transparent);
      color: var(--status-review);
    }

    &--info {
      background: color-mix(in srgb, var(--primary) 15%, transparent);
      color: var(--primary);
    }

    &--success {
      background: color-mix(in srgb, var(--theme-green, #10b981) 15%, transparent);
      color: var(--theme-green, #10b981);
    }

    .material-symbols-outlined {
      font-size: 24px;
    }
  }

  &__message {
    font-size: var(--font-size-base);
    color: var(--on-surface-variant);
    line-height: 1.5;
    font-weight: 500;
  }
}
</style>
