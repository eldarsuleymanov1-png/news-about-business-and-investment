import type { CollectionConfig } from 'payload'
import { ROLES, adminOnly, adminOnlyField, isAdmin, roleOptions } from '@/access/roles'

/**
 * Сотрудники редакции — учётные записи для входа в админку.
 * Публичный профиль автора — отдельная коллекция `authors`.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { uk: 'Користувач', en: 'User' },
    plural: { uk: 'Користувачі', en: 'Users' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    group: { uk: 'Налаштування', en: 'Settings' },
  },
  auth: {
    // Защита от перебора паролей (ТЗ, 7)
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
  },
  access: {
    // Список пользователей видят все сотрудники (нужно для назначения исполнителей),
    // управляет — только администратор. Свой профиль может править каждый.
    read: ({ req }) => Boolean(req.user),
    create: adminOnly,
    update: ({ req }) => (isAdmin(req.user) ? true : { id: { equals: req.user?.id } }),
    delete: adminOnly,
    unlock: adminOnly,
  },
  fields: [
    { name: 'name', type: 'text', label: { uk: "Ім'я", en: 'Name' } },
    {
      name: 'role',
      type: 'select',
      label: { uk: 'Роль', en: 'Role' },
      required: true,
      defaultValue: ROLES.author,
      options: roleOptions,
      saveToJWT: true,
      access: {
        // Свою роль повысить нельзя
        update: adminOnlyField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorProfile',
      type: 'relationship',
      relationTo: 'authors',
      label: { uk: 'Публічний профіль автора', en: 'Public author profile' },
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      // Первый пользователь системы всегда администратор
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = ROLES.admin
        }
        return data
      },
    ],
  },
}
