import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guardia HQ',
  description: 'Guardia Command Center',
  manifest: '/manifest-hq.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Guardia HQ',
  },
}

export default function HQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
