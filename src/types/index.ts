export type ComponentTheme = 'blue' | 'purple' | 'red' | 'yellow' | 'green' | 'pink' | 'cyan'
export type TaskTheme = ComponentTheme

export interface AssigneeItem {
  id: string
  name: string
  initials: string
  avatar?: string
}

export type Assignee = AssigneeItem
