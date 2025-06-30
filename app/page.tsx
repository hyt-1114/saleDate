"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Brain, Upload, TrendingUp, FileSpreadsheet, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// SpreadsheetImportコンポーネントを追加
import SpreadsheetImport from "@/components/spreadsheet-import"

export default function HomePage() {
  const router = useRouter()

  // useState を追加してデータ管理
  const [importedData, setImportedData] = useState(null)

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* ヘッダーセクション */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">売上管理ダッシュボード</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              スプレッドシートデータを簡単アップロードして、AI分析による改善提案まで。
              <br />
              フランチャイズ店舗の売上向上をサポートします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={goToDashboard}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                デモを見る
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
              >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                ファイルをアップロード
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* 特徴セクション */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">なぜ選ばれるのか</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            複雑な売上分析を簡単に。AI技術で店舗運営の課題を解決します。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">簡単アップロード</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                既存のスプレッドシートファイルをドラッグ&ドロップするだけ。 複雑な設定は一切不要です。
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">自動分析</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                前年比・達成率を自動計算。 美しいグラフで一目で状況を把握できます。
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">AI改善提案</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">売上データをAIが分析し、 具体的な改善策を提案します。</p>
            </CardContent>
          </Card>
        </div>

        {/* アップロードエリア */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">今すぐ始める</h2>
            <p className="text-lg text-gray-600">
              売上データファイルをアップロードして、詳細な分析結果を確認しましょう
            </p>
          </div>
          <SpreadsheetImport
            onDataImported={(data) => {
              setImportedData(data)
              setTimeout(() => {
                router.push("/dashboard")
              }, 1000)
            }}
          />
        </div>

        {/* 機能詳細 */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              データ分析機能
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">前年比・目標達成率の自動計算</h4>
                  <p className="text-gray-600 text-sm">複雑な計算を自動化し、重要な指標を瞬時に表示</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">商品別売上の色分け表示</h4>
                  <p className="text-gray-600 text-sm">パフォーマンスに応じた直感的な色分けで状況を把握</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">多様なグラフ表示</h4>
                  <p className="text-gray-600 text-sm">棒グラフ・円グラフ・折れ線グラフで多角的に分析</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">KPI分析</h4>
                  <p className="text-gray-600 text-sm">客数・客単価などの重要指標を詳細分析</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              AI改善提案
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">売上データのAI分析</h4>
                  <p className="text-gray-600 text-sm">機械学習による高度な売上パターン分析</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">改善点の自動提案</h4>
                  <p className="text-gray-600 text-sm">データに基づいた具体的で実行可能な改善策</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">商品別戦略アドバイス</h4>
                  <p className="text-gray-600 text-sm">各商品の特性に応じたカスタマイズされた戦略</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">質問形式での詳細分析</h4>
                  <p className="text-gray-600 text-sm">自然言語で質問して、詳細な分析結果を取得</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA セクション */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">今すぐ始めませんか？</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            サンプルデータでデモをご覧いただくか、実際のデータをアップロードして分析を開始できます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={goToDashboard}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              サンプルデータでデモを見る
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg backdrop-blur-sm"
              onClick={() => {
                document.querySelector('[data-testid="upload-area"]')?.scrollIntoView({
                  behavior: "smooth",
                })
              }}
            >
              <Upload className="h-5 w-5 mr-2" />
              ファイルをアップロード
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">ファイルをアップロードしなくてもデモをご覧いただけます</p>
        </div>
      </div>
    </div>
  )
}
