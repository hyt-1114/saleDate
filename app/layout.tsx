import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "売上管理ダッシュボード | 菓子業界フランチャイズ向け",
  description: "Excelデータをアップロードして売上分析・AI改善提案を行う菓子業界フランチャイズ店舗向けダッシュボード",
  keywords: "売上管理, ダッシュボード, 菓子業界, フランチャイズ, Excel, AI分析",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
