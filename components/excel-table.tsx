"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SalesData {
  product: string
  lastYear?: number
  target: number
  actual: number
  yoyGrowth: number
  achievementRate: number
}

interface ExcelTableProps {
  data: SalesData[]
}

export default function ExcelTable({ data }: ExcelTableProps) {
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === 0) return "-"
    return new Intl.NumberFormat("ja-JP").format(num)
  }

  const formatPercentage = (num: number) => {
    if (num === 0) return "-"
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`
  }

  const getAchievementColor = (rate: number) => {
    if (rate === 0) return "bg-gray-100 text-gray-500"
    if (rate >= 100) return "bg-green-100 text-green-800"
    if (rate >= 90) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getGrowthColor = (growth: number) => {
    if (growth === 0) return "bg-gray-100 text-gray-500"
    if (growth > 0) return "bg-green-100 text-green-800"
    return "bg-red-100 text-red-800"
  }

  const getCellBackgroundColor = (achievementRate: number, yoyGrowth: number) => {
    if (achievementRate === 0) return ""
    if (achievementRate >= 100 && yoyGrowth > 0) return "bg-green-50"
    if (achievementRate < 90 || yoyGrowth < -20) return "bg-red-50"
    if (achievementRate < 100) return "bg-yellow-50"
    return ""
  }

  // 合計値の計算
  const totals = data.reduce(
    (acc, item) => ({
      lastYear: acc.lastYear + (item.lastYear || 0),
      target: acc.target + item.target,
      actual: acc.actual + item.actual,
    }),
    { lastYear: 0, target: 0, actual: 0 },
  )

  const totalYoyGrowth = totals.lastYear > 0 ? ((totals.actual - totals.lastYear) / totals.lastYear) * 100 : 0
  const totalAchievementRate = totals.target > 0 ? (totals.actual / totals.target) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>売上データ詳細</CardTitle>
        <CardDescription>商品別の前年・予定・実績データ（Excel風表示）</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 p-3 text-left font-bold text-gray-800">主力商品名</th>
                <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">前年</th>
                <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">予定</th>
                <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">実績</th>
                <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">前年比</th>
                <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">予定比</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${getCellBackgroundColor(item.achievementRate, item.yoyGrowth)}`}
                >
                  <td className="border border-gray-300 p-3 font-medium">{item.product}</td>
                  <td className="border border-gray-300 p-3 text-right">{formatNumber(item.lastYear)}</td>
                  <td className="border border-gray-300 p-3 text-right">{formatNumber(item.target)}</td>
                  <td className="border border-gray-300 p-3 text-right font-semibold">{formatNumber(item.actual)}</td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Badge variant="outline" className={getGrowthColor(item.yoyGrowth)}>
                      {formatPercentage(item.yoyGrowth)}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Badge variant="outline" className={getAchievementColor(item.achievementRate)}>
                      {item.achievementRate === 0 ? "-" : `${item.achievementRate.toFixed(1)}%`}
                    </Badge>
                  </td>
                </tr>
              ))}
              {/* 合計行 */}
              <tr className="bg-blue-200 font-bold">
                <td className="border border-gray-300 p-3">合計</td>
                <td className="border border-gray-300 p-3 text-right">{formatNumber(totals.lastYear)}</td>
                <td className="border border-gray-300 p-3 text-right">{formatNumber(totals.target)}</td>
                <td className="border border-gray-300 p-3 text-right">{formatNumber(totals.actual)}</td>
                <td className="border border-gray-300 p-3 text-center">
                  <Badge variant="outline" className={getGrowthColor(totalYoyGrowth)}>
                    {formatPercentage(totalYoyGrowth)}
                  </Badge>
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  <Badge variant="outline" className={getAchievementColor(totalAchievementRate)}>
                    {totalAchievementRate.toFixed(1)}%
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
