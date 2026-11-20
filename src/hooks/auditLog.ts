import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

const PUBLIC_STATUSES = ['published', 'scheduled']

const titleOf = (doc: Record<string, unknown>): string =>
  String(
    doc.title ?? doc.name ?? doc.projectName ?? doc.summary ?? doc.email ?? doc.id ?? '',
  ).slice(0, 200)

const afterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  const from = previousDoc?.status as string | undefined
  const to = doc?.status as string | undefined
  let action: string = operation
  if (operation === 'update' && from !== to) {
    if (to && PUBLIC_STATUSES.includes(to) && !PUBLIC_STATUSES.includes(from ?? ''))
      action = 'publish'
    else if (from && PUBLIC_STATUSES.includes(from) && !PUBLIC_STATUSES.includes(to ?? ''))
      action = 'unpublish'
    else action = 'status-change'
  }
  await req.payload.create({
    collection: 'audit-log',
    data: {
      user: req.user?.collection === 'users' ? req.user.id : undefined,
      action: action as never,
      collectionSlug: collection.slug,
      docId: String(doc.id),
      summary: titleOf(doc),
      statusFrom: operation === 'update' ? from : undefined,
      statusTo: to,
    },
    overrideAccess: true,
    req,
  })
  return doc
}

const afterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  await req.payload.create({
    collection: 'audit-log',
    data: {
      user: req.user?.collection === 'users' ? req.user.id : undefined,
      action: 'delete',
      collectionSlug: collection.slug,
      docId: String(doc.id),
      summary: titleOf(doc),
    },
    overrideAccess: true,
    req,
  })
  return doc
}

/** Подключает журнал действий к коллекции. */
export const withAuditLog = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  hooks: {
    ...config.hooks,
    afterChange: [...(config.hooks?.afterChange ?? []), afterChange],
    afterDelete: [...(config.hooks?.afterDelete ?? []), afterDelete],
  },
})
