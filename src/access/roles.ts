import type { Access, FieldAccess, PayloadRequest } from 'payload'

/**
 * Роли редакции (ТЗ, раздел 6).
 */
export const ROLES = {
  admin: 'admin',
  chiefEditor: 'chief-editor',
  editor: 'editor',
  author: 'author',
  adManager: 'ad-manager',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const roleOptions = [
  { value: ROLES.admin, label: { uk: 'Адміністратор', en: 'Administrator' } },
  { value: ROLES.chiefEditor, label: { uk: 'Головний редактор', en: 'Editor-in-chief' } },
  { value: ROLES.editor, label: { uk: 'Редактор', en: 'Editor' } },
  { value: ROLES.author, label: { uk: 'Автор', en: 'Author' } },
  { value: ROLES.adManager, label: { uk: 'Рекламний менеджер', en: 'Ad manager' } },
]

type MaybeUser = PayloadRequest['user']

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user && 'role' in user && roles.includes(user.role as Role))

export const isAdmin = (user: MaybeUser) => hasRole(user, ROLES.admin)

/** Админ или главный редактор. */
export const isChief = (user: MaybeUser) => hasRole(user, ROLES.admin, ROLES.chiefEditor)

/** Админ, главный редактор или редактор. */
export const isEditorial = (user: MaybeUser) =>
  hasRole(user, ROLES.admin, ROLES.chiefEditor, ROLES.editor)

/** Любой сотрудник, вошедший в админку. */
export const isStaff = (user: MaybeUser) => Boolean(user)

// Готовые функции доступа для коллекций
export const anyone: Access = () => true
export const staffOnly: Access = ({ req }) => isStaff(req.user)
export const editorialOnly: Access = ({ req }) => isEditorial(req.user)
export const chiefOnly: Access = ({ req }) => isChief(req.user)
export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const nobody: Access = () => false

// Доступ к отдельным полям
export const chiefOnlyField: FieldAccess = ({ req }) => isChief(req.user)
export const adminOnlyField: FieldAccess = ({ req }) => isAdmin(req.user)
