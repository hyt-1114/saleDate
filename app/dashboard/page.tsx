"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Target, DollarSign, Users, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ExcelTable from "@/components/excel-table"
import EnhancedCharts from "@/components/enhanced-charts"
import TrendChart from "@/components/trend-chart"
import SalesSummaryTable from "@/components/sales-summary-table"
import {
  getDashboardData,
  calculateTotals,
  calculateYoyGrowth,
  calculateAchievementRate,
  type DashboardData,
} from "@/lib/data-service"

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("今月")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("データの読み込みに失敗しました:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">データの読み込みに失敗しました</p>
        </div>
      </div>
    )
  }

  const { salesData, summaryData, monthlyTrend } = dashboardData
  const totals = calculateTotals(salesData)
  const totalYoyGrowth = calculateYoyGrowth(totals.actual, totals.lastYear)
  const totalAchievementRate = calculateAchievementRate(totals.actual, totals.target)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">売上ダッシュボード</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option>今月</option>
              <option>先月</option>
              <option>今四半期</option>
            </select>
            <Link href="/insight">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Brain className="h-4 w-4 mr-2" />
                AI分析
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">前年売上</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.lastYear)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">目標売上</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.target)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">実績売上</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.actual)}</div>
              <p className={`text-xs ${getGrowthColor(totalYoyGrowth)}`}>
                前年比 {totalYoyGrowth > 0 ? "+" : ""}
                {totalYoyGrowth.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">客数前年比率</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.ratio.customers}%</div>
              <p className={`text-xs ${summaryData.ratio.customers >= 100 ? "text-green-600" : "text-red-600"}`}>
                {summaryData.ratio.customers >= 100 ? "前年超え" : "前年割れ"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <ExcelTable data={salesData} />
        </div>

        {/* 売上サマリーテーブル */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>売上サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesSummaryTable data={summaryData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* 上部：月別売上推移と売上構成比を2列で配置 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart data={monthlyTrend} />
            <EnhancedCharts data={salesData} showOnlyPieChart={true} />
          </div>

          {/* 下部：売上比較を単独で大きく表示 */}
          <EnhancedCharts data={salesData} showOnlyComparison={true} />
        </div>
      </div>
    </div>
  )
}
