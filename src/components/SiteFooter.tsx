import type { Dictionary } from '@/lib/dictionary'

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="footer">
      <div className="container">
        <p>{dict.footerNote}</p>
        <p>© {new Date().getFullYear()} [НАЗВА]</p>
      </div>
    </footer>
  )
}
