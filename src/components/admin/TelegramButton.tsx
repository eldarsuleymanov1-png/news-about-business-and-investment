'use client'

import { Button, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** Кнопка «Надіслати в Telegram» в карточке материала (ТЗ, 6 и 8). */
export function TelegramButton() {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const postedAt = useFormFields(
    ([fields]) => fields['distribution.telegramPostedAt']?.value as string | undefined,
  )
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined)
  const [state, setState] = useState<{ busy: boolean; msg?: string; ok?: boolean }>({ busy: false })

  if (!id) return null
  const live = status === 'published' || status === 'scheduled'

  const send = async () => {
    if (postedAt && !window.confirm('Матеріал уже надсилали в Telegram. Надіслати ще раз?')) return
    setState({ busy: true })
    const res = await fetch(`/api/materials/${id}/telegram${postedAt ? '?force=1' : ''}`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => null)
    const data = (await res?.json().catch(() => null)) as {
      error?: string
      messageUrl?: string
    } | null
    if (res?.ok) {
      setState({
        busy: false,
        ok: true,
        msg: data?.messageUrl ? `Надіслано: ${data.messageUrl}` : 'Надіслано',
      })
      router.refresh()
    } else {
      setState({ busy: false, ok: false, msg: data?.error ?? 'Не вдалося надіслати' })
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Button
        buttonStyle="secondary"
        size="medium"
        margin={false}
        onClick={send}
        disabled={state.busy || !live}
        tooltip={!live ? 'Доступно після публікації' : undefined}
      >
        {state.busy
          ? 'Надсилаємо…'
          : postedAt
            ? 'Надіслати в Telegram ще раз'
            : 'Надіслати в Telegram'}
      </Button>
      {state.msg && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: 13,
            maxWidth: 260,
            color: state.ok ? 'var(--theme-success-500)' : 'var(--theme-error-500)',
          }}
        >
          {state.msg}
        </p>
      )}
    </div>
  )
}
