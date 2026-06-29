export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export type Theme = 'light' | 'dark'

export interface Member {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
