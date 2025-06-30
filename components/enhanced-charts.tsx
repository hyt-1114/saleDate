"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface SalesData {
  product: string
  lastYear?: number
  target: number
  actual: number
  yoyGrowth: number
  achievementRate: number
}

interface EnhancedChartsProps {
  data: SalesData[]
  showOnlyComparison?: boolean
  showOnlyPieChart?: boolean
}

export default function EnhancedCharts({
  data,
  showOnlyComparison = false,
  showOnlyPieChart = false,
}: EnhancedChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>売上比較（前年・予定・実績）</CardTitle>
            <CardDescription>データがありません</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500">
              グラフを表示するデータがありません
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 棒グラフ用データ（全商品を表示）
  const barChartData = data.filter((item) => item.actual > 0 || item.target > 0 || (item.lastYear && item.lastYear > 0))

  // 最大値を計算
  const maxValue = Math.max(...barChartData.flatMap((item) => [item.lastYear || 0, item.target, item.actual]))

  // 円グラフ用データ（全商品を含める）
  const pieChartData = data.filter((item) => item.actual > 0)

  const totalSales = pieChartData.reduce((acc, item) => acc + item.actual, 0)

  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#84cc16",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f43f5e",
  ]

  // 売上比較のみ表示
  if (showOnlyComparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>売上比較（前年・予定・実績）</CardTitle>
          <CardDescription>商品別の売上データ比較 - 全{barChartData.length}商品</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full p-4">
            <div className="h-full flex flex-col">
              {/* Y軸ラベル */}
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0</span>
                <span>{Math.round(maxValue / 2).toLocaleString()}</span>
                <span>{maxValue.toLocaleString()}</span>
              </div>

              {/* グラフエリア */}
              <div className="flex-1 overflow-x-auto border border-gray-200 rounded-lg bg-white">
                <div
                  className="flex items-end justify-start gap-2 min-w-max px-4 py-4 h-full"
                  style={{ minWidth: `${barChartData.length * 80}px` }}
                >
                  {barChartData.map((item, index) => {
                    const lastYearHeight = ((item.lastYear || 0) / maxValue) * 85
                    const targetHeight = (item.target / maxValue) * 85
                    const actualHeight = (item.actual / maxValue) * 85

                    return (
                      <div key={index} className="flex flex-col items-center gap-2" style={{ minWidth: "70px" }}>
                        <div className="w-full flex justify-center gap-1 h-72">
                          {/* 前年 */}
                          <div className="flex flex-col justify-end w-5">
                            <div
                              className="bg-gray-400 rounded-t transition-all duration-300 hover:bg-gray-500 relative group"
                              style={{ height: `${lastYearHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                前年: {(item.lastYear || 0).toLocaleString()}円
                              </div>
                            </div>
                          </div>

                          {/* 予定 */}
                          <div className="flex flex-col justify-end w-5">
                            <div
                              className="bg-amber-500 rounded-t transition-all duration-300 hover:bg-amber-600 relative group"
                              style={{ height: `${targetHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                予定: {item.target.toLocaleString()}円
                              </div>
                            </div>
                          </div>

                          {/* 実績 */}
                          <div className="flex flex-col justify-end w-5">
                            <div
                              className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 relative group"
                              style={{ height: `${actualHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                実績: {item.actual.toLocaleString()}円
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 商品名 */}
                        <div className="text-xs text-center text-gray-700 w-full font-medium">
                          <div className="leading-tight">
                            {item.product.length > 8 ? item.product.substring(0, 8) + "..." : item.product}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 凡例 */}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="font-medium">前年</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="font-medium">予定</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">実績</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            売上データの比較分析
          </div>
          <p className="text-sm text-gray-500 mt-1">前年・予定・実績の3つの指標を比較表示</p>
        </div>
      </Card>
    )
  }

  // 売上構成比のみ表示
  if (showOnlyPieChart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>売上構成比</CardTitle>
          <CardDescription>商品別の売上シェア（実績ベース）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full p-4">
            <div className="flex items-start justify-between h-full gap-4">
              {/* 円グラフ */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48">
                  {/* 円グラフの背景 */}
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                  {/* 各セクション */}
                  {pieChartData.map((item, index) => {
                    const percentage = (item.actual / totalSales) * 100
                    const startAngle = pieChartData.slice(0, index).reduce((acc, prevItem) => {
                      return acc + (prevItem.actual / totalSales) * 360
                    }, 0)
                    const endAngle = startAngle + (percentage / 100) * 360

                    // SVGパスを生成
                    const radius = 88 // 円の半径
                    const centerX = 96
                    const centerY = 96

                    const startX = centerX + radius * Math.cos(((startAngle - 90) * Math.PI) / 180)
                    const startY = centerY + radius * Math.sin(((startAngle - 90) * Math.PI) / 180)
                    const endX = centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180)
                    const endY = centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180)

                    const largeArcFlag = percentage > 50 ? 1 : 0

                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${startX} ${startY}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      "Z",
                    ].join(" ")

                    return (
                      <svg
                        key={index}
                        className="absolute inset-0 w-full h-full transition-all duration-300 hover:scale-105"
                        viewBox="0 0 192 192"
                      >
                        <path
                          d={pathData}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                        >
                          <title>{`${item.product}: ${percentage.toFixed(1)}%`}</title>
                        </path>
                      </svg>
                    )
                  })}

                  {/* 中央の円 */}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center border-4 border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-800">総売上</div>
                      <div className="text-xs text-gray-600">{(totalSales / 1000).toFixed(0)}千円</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 凡例（右側に配置） */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  {pieChartData.map((item, index) => {
                    const percentage = (item.actual / totalSales) * 100
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs py-0.5">
                        <div
                          className="w-3 h-3 rounded flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-gray-800 font-medium" title={item.product}>
                              {item.product.length > 12 ? item.product.substring(0, 12) + "..." : item.product}
                            </span>
                            <span className="text-gray-600 font-medium whitespace-nowrap">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            総売上: {totalSales.toLocaleString()}円
          </div>
          <p className="text-sm text-gray-500 mt-1">全商品の売上構成比を表示</p>
        </div>
      </Card>
    )
  }

  // デフォルト（両方表示）
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 売上比較グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>売上比較（前年・予定・実績）</CardTitle>
          <CardDescription>商品別の売上データ比較</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full p-4">
            <div className="h-full flex flex-col">
              {/* Y軸ラベル */}
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>0</span>
                <span>{Math.round(maxValue / 2).toLocaleString()}</span>
                <span>{maxValue.toLocaleString()}</span>
              </div>

              {/* グラフエリア */}
              <div className="flex-1 overflow-x-auto">
                <div
                  className="flex items-end justify-between gap-1 min-w-max px-2"
                  style={{ minWidth: `${barChartData.length * 60}px` }}
                >
                  {barChartData.map((item, index) => {
                    const lastYearHeight = ((item.lastYear || 0) / maxValue) * 100
                    const targetHeight = (item.target / maxValue) * 100
                    const actualHeight = (item.actual / maxValue) * 100

                    return (
                      <div key={index} className="flex flex-col items-center gap-1" style={{ minWidth: "50px" }}>
                        <div className="w-full flex justify-center gap-0.5 h-48">
                          {/* 前年 */}
                          <div className="flex flex-col justify-end w-3">
                            <div
                              className="bg-gray-400 rounded-t transition-all duration-500 hover:bg-gray-500 relative group"
                              style={{ height: `${lastYearHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                前年: {(item.lastYear || 0).toLocaleString()}円
                              </div>
                            </div>
                          </div>

                          {/* 予定 */}
                          <div className="flex flex-col justify-end w-3">
                            <div
                              className="bg-yellow-500 rounded-t transition-all duration-500 hover:bg-yellow-600 relative group"
                              style={{ height: `${targetHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                予定: {item.target.toLocaleString()}円
                              </div>
                            </div>
                          </div>

                          {/* 実績 */}
                          <div className="flex flex-col justify-end w-3">
                            <div
                              className="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 relative group"
                              style={{ height: `${actualHeight}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                実績: {item.actual.toLocaleString()}円
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 商品名 */}
                        <div
                          className="text-xs text-center text-gray-600 w-full transform -rotate-45 origin-center mt-2"
                          style={{ minHeight: "40px" }}
                        >
                          <span className="block" title={item.product}>
                            {item.product.length > 6 ? item.product.substring(0, 6) + "..." : item.product}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 凡例 */}
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>前年</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>予定</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>実績</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            売上データの比較分析
          </div>
          <p className="text-sm text-gray-500 mt-1">前年・予定・実績の3つの指標を比較表示</p>
        </div>
      </Card>

      {/* 売上構成比（ドーナツチャート風） */}
      <Card>
        <CardHeader>
          <CardTitle>売上構成比</CardTitle>
          <CardDescription>商品別の売上シェア（実績ベース）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full p-4">
            <div className="flex items-start justify-between h-full gap-4">
              {/* 円グラフ */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48">
                  {/* 円グラフの背景 */}
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                  {/* 各セクション */}
                  {pieChartData.map((item, index) => {
                    const percentage = (item.actual / totalSales) * 100
                    const startAngle = pieChartData.slice(0, index).reduce((acc, prevItem) => {
                      return acc + (prevItem.actual / totalSales) * 360
                    }, 0)
                    const endAngle = startAngle + (percentage / 100) * 360

                    // SVGパスを生成
                    const radius = 88 // 円の半径
                    const centerX = 96
                    const centerY = 96

                    const startX = centerX + radius * Math.cos(((startAngle - 90) * Math.PI) / 180)
                    const startY = centerY + radius * Math.sin(((startAngle - 90) * Math.PI) / 180)
                    const endX = centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180)
                    const endY = centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180)

                    const largeArcFlag = percentage > 50 ? 1 : 0

                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${startX} ${startY}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                      "Z",
                    ].join(" ")

                    return (
                      <svg
                        key={index}
                        className="absolute inset-0 w-full h-full transition-all duration-300 hover:scale-105"
                        viewBox="0 0 192 192"
                      >
                        <path
                          d={pathData}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                        >
                          <title>{`${item.product}: ${percentage.toFixed(1)}%`}</title>
                        </path>
                      </svg>
                    )
                  })}

                  {/* 中央の円 */}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center border-4 border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-800">総売上</div>
                      <div className="text-xs text-gray-600">{(totalSales / 1000).toFixed(0)}千円</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 凡例（右側に配置） */}
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  {pieChartData.map((item, index) => {
                    const percentage = (item.actual / totalSales) * 100
                    return (
                      <div key={index} className="flex items-center gap-2 text-xs py-0.5">
                        <div
                          className="w-3 h-3 rounded flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-gray-800 font-medium" title={item.product}>
                              {item.product.length > 12 ? item.product.substring(0, 12) + "..." : item.product}
                            </span>
                            <span className="text-gray-600 font-medium whitespace-nowrap">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            総売上: {totalSales.toLocaleString()}円
          </div>
          <p className="text-sm text-gray-500 mt-1">全商品の売上構成比を表示</p>
        </div>
      </Card>
    </div>
  )
}
