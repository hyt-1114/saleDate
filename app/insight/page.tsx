"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Send, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function InsightPage() {
  const [question, setQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState("")

  // サンプルAI分析結果
  const sampleInsights = [
    {
      type: "success",
      icon: TrendingUp,
      title: "好調商品",
      content: "チョコレートケーキとモンブランが前年比20%以上の成長を記録。季節商品の需要が高まっています。",
      recommendation: "これらの商品の在庫を増やし、関連商品の展開を検討してください。",
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "改善が必要",
      content: "ショートケーキの売上が前年比6.1%減少。競合他社の影響が考えられます。",
      recommendation: "価格戦略の見直しや、新しいフレーバーの導入を検討してください。",
    },
    {
      type: "info",
      icon: Lightbulb,
      title: "機会",
      content: "フルーツタルトは目標にわずかに届かないものの、安定した需要があります。",
      recommendation: "マーケティング強化により目標達成が期待できます。",
    },
  ]

  const handleAnalyze = async () => {
    if (!question.trim()) return

    setIsAnalyzing(true)

    // サンプル分析結果（実際のAI APIの代わり）
    setTimeout(() => {
      const sampleResponse = `
【分析結果】

ご質問「${question}」について分析いたします。

現在の売上データを基に以下の点が確認できます：

1. **全体的な傾向**
   - 総売上は前年比+11.2%と好調
   - 目標達成率は105.4%で目標を上回る

2. **商品別の特徴**
   - チョコレートケーキ：+20.8%の大幅成長
   - モンブラン：+24.1%で最も好調
   - ショートケーキ：-6.1%で唯一のマイナス成長

3. **改善提案**
   - 好調商品（チョコ系）の生産能力向上
   - ショートケーキの商品リニューアル検討
   - 季節商品の展開強化

4. **次のアクション**
   - 競合分析の実施
   - 顧客満足度調査
   - 新商品開発の検討

この分析結果を基に、具体的な改善策を実行することをお勧めします。
      `
      setAnalysis(sampleResponse)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">AI売上分析</h1>
        </div>

        {/* 自動分析結果 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            自動分析結果
          </h2>
          <div className="space-y-4">
            {sampleInsights.map((insight, index) => {
              const IconComponent = insight.icon
              return (
                <Card key={index} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconComponent className={`h-5 w-5 ${getIconColor(insight.type)}`} />
                      {insight.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{insight.content}</p>
                    <div className="bg-white p-3 rounded border-l-2 border-gray-300">
                      <p className="text-sm font-medium text-gray-800">💡 推奨アクション: {insight.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* 質問入力エリア */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              詳細分析を依頼
            </CardTitle>
            <CardDescription>
              売上データについて具体的な質問をしてください。AIが詳細な分析と改善提案を行います。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="例：ショートケーキの売上が下がった原因は何ですか？
例：来月の売上を向上させるにはどうすればよいですか？
例：競合に負けないための戦略を教えてください。"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!question.trim() || isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    分析中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    分析を実行
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 分析結果表示 */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                AI分析結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{analysis}</pre>
              </div>
              <div className="mt-4 flex gap-2">
                <Badge variant="outline" className="text-purple-600">
                  AI生成
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  データ分析
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* サンプル質問 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">よくある質問例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "どの商品の売上が最も伸びていますか？",
                "目標未達の商品の改善策は？",
                "来月の売上予測を教えてください",
                "競合対策はどうすればよいですか？",
                "季節商品の戦略を教えてください",
                "コスト削減のアドバイスをください",
              ].map((q, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start h-auto p-3 text-sm"
                  onClick={() => setQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
