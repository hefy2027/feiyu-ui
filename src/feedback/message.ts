import { createVNode, render, type AppContext } from 'vue'
import MessageComponent, { type MessageType, type MessageProps } from './Message.vue'

export interface MessageOptions extends Omit<MessageProps, 'id'> {
  content: string
  appContext?: AppContext | null
}

export interface MessageInstance {
  id: string
  close: () => void
}

let containerElement: HTMLElement | null = null
const messageInstances: { id: string; vnode: any; container: HTMLElement }[] = []
let messageSeed = 0

function getOrCreateContainer(): HTMLElement {
  if (!containerElement && typeof document !== 'undefined') {
    containerElement = document.createElement('div')
    containerElement.className = 'ui-message-container'
    containerElement.style.position = 'fixed'
    containerElement.style.top = '24px'
    containerElement.style.left = '50%'
    containerElement.style.transform = 'translateX(-50%)'
    containerElement.style.zIndex = '9999'
    containerElement.style.display = 'flex'
    containerElement.style.flexDirection = 'column'
    containerElement.style.alignItems = 'center'
    containerElement.style.gap = '12px'
    containerElement.style.pointerEvents = 'none'
    document.body.appendChild(containerElement)
  }
  return containerElement!
}

function createMessage(options: MessageOptions): MessageInstance {
  if (typeof document === 'undefined') {
    return { id: '', close: () => {} }
  }

  const parentContainer = getOrCreateContainer()
  const itemContainer = document.createElement('div')
  parentContainer.appendChild(itemContainer)

  const id = `ui-message-${++messageSeed}`

  function handleClose() {
    const index = messageInstances.findIndex((inst) => inst.id === id)
    if (index !== -1) {
      messageInstances.splice(index, 1)
    }
    render(null, itemContainer)
    if (itemContainer.parentNode) {
      itemContainer.parentNode.removeChild(itemContainer)
    }
    if (messageInstances.length === 0 && containerElement && containerElement.parentNode) {
      containerElement.parentNode.removeChild(containerElement)
      containerElement = null
    }
  }

  const props: MessageProps = {
    ...options,
    id,
    onClose: () => {
      options.onClose?.()
      handleClose()
    }
  }

  const vnode = createVNode(MessageComponent, props as Record<string, unknown>)
  if (options.appContext) {
    vnode.appContext = options.appContext
  }

  render(vnode, itemContainer)

  const instance: MessageInstance = {
    id,
    close: () => {
      if (vnode.component?.exposed?.close) {
        vnode.component.exposed.close()
      } else {
        handleClose()
      }
    }
  }

  messageInstances.push({ id, vnode, container: itemContainer })
  return instance
}

export const message = (contentOrOptions: string | MessageOptions, type: MessageType = 'info'): MessageInstance => {
  const options: MessageOptions = typeof contentOrOptions === 'string'
    ? { content: contentOrOptions, type }
    : { ...contentOrOptions, type: contentOrOptions.type || type }
  return createMessage(options)
}

message.info = (content: string, options?: Partial<MessageOptions>): MessageInstance => {
  return createMessage({ ...options, content, type: 'info' })
}

message.success = (content: string, options?: Partial<MessageOptions>): MessageInstance => {
  return createMessage({ ...options, content, type: 'success' })
}

message.warning = (content: string, options?: Partial<MessageOptions>): MessageInstance => {
  return createMessage({ ...options, content, type: 'warning' })
}

message.error = (content: string, options?: Partial<MessageOptions>): MessageInstance => {
  return createMessage({ ...options, content, type: 'error' })
}

message.loading = (content: string, options?: Partial<MessageOptions>): MessageInstance => {
  return createMessage({ duration: 0, ...options, content, type: 'loading' })
}

message.destroyAll = () => {
  const instances = [...messageInstances]
  instances.forEach((inst) => {
    render(null, inst.container)
    if (inst.container.parentNode) {
      inst.container.parentNode.removeChild(inst.container)
    }
  })
  messageInstances.length = 0
  if (containerElement && containerElement.parentNode) {
    containerElement.parentNode.removeChild(containerElement)
    containerElement = null
  }
}

export default message
